const DIRECT_PII = [/@/, /^\+?\d[\d\s().-]{6,}$/];

function assertPrincipal(value, field = 'learner principal') {
  if (typeof value !== 'string' || !value || DIRECT_PII.some((pattern) => pattern.test(value))) {
    throw new TypeError(`${field} must be a pseudonymous learner principal and must not contain direct PII`);
  }
}

function ordered(records) {
  return [...records].sort((a, b) => {
    const at = String(a?.created_at ?? '');
    const bt = String(b?.created_at ?? '');
    if (at !== bt) return at.localeCompare(bt);
    return String(a?.identity_link_record_id ?? '').localeCompare(String(b?.identity_link_record_id ?? ''));
  });
}

export function assertIdentityLinkRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new TypeError('identity link record must be an object');
  if (record.schema_version !== 1) throw new TypeError('identity link schema_version must equal 1');
  for (const field of ['identity_link_record_id','link_id','action','source_learner_id','target_learner_id','effective_at','authority_ref','reason_code','created_at']) {
    if (typeof record[field] !== 'string' || !record[field]) throw new TypeError(`${field} is required`);
  }
  if (!['LINK','UNLINK'].includes(record.action)) throw new TypeError('action must be LINK or UNLINK');
  assertPrincipal(record.source_learner_id, 'source_learner_id');
  assertPrincipal(record.target_learner_id, 'target_learner_id');
  return record;
}

export function resolveLearnerPrincipal(learnerId, records) {
  assertPrincipal(learnerId);
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const latestByLink = new Map();
  for (const record of ordered(records)) {
    assertIdentityLinkRecord(record);
    if (record.action === 'UNLINK' && record.predecessor_record_id) {
      const previous = latestByLink.get(record.link_id);
      if (!previous || previous.identity_link_record_id !== record.predecessor_record_id) continue;
    }
    latestByLink.set(record.link_id, record);
  }

  const active = [...latestByLink.values()].filter((record) => record.action === 'LINK');
  const outgoing = new Map();
  for (const record of active) {
    const entries = outgoing.get(record.source_learner_id) ?? [];
    entries.push(record);
    outgoing.set(record.source_learner_id, entries);
  }

  const chain = [learnerId];
  const visited = new Set([learnerId]);
  let current = learnerId;
  let linked = false;
  while (true) {
    const candidates = outgoing.get(current) ?? [];
    const targets = [...new Set(candidates.map((record) => record.target_learner_id))].sort();
    if (targets.length > 1) return { principal: null, chain, status: 'CONFLICT' };
    if (targets.length === 0) {
      return { principal: current, chain, status: linked ? 'LINKED' : 'UNLINKED' };
    }
    linked = true;
    const next = targets[0];
    chain.push(next);
    if (visited.has(next)) return { principal: null, chain, status: 'CYCLE' };
    visited.add(next);
    current = next;
  }
}
