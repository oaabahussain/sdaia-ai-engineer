import { canonicalizeJson } from '../../evidence/jcs.js';

const DIRECT_PII = [/@/, /^\+?\d[\d\s().-]{6,}$/];

function assertPrincipal(value, field = 'learner principal') {
  if (typeof value !== 'string' || !value || DIRECT_PII.some((pattern) => pattern.test(value))) {
    throw new TypeError(`${field} must be a pseudonymous learner principal and must not contain direct PII`);
  }
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
  // Resolve a graph of immutable transitions, never a timestamp winner.
  const byId = new Map(), byLink = new Map(), conflictedSources = new Set();
  for (const record of records) {
    assertIdentityLinkRecord(record);
    const previous = byId.get(record.identity_link_record_id);
    if (previous) {
      if (canonicalizeJson(previous) !== canonicalizeJson(record)) {
        conflictedSources.add(previous.source_learner_id);
        conflictedSources.add(record.source_learner_id);
      }
      continue;
    }
    byId.set(record.identity_link_record_id, record);
    const group = byLink.get(record.link_id) ?? [];
    group.push(record); byLink.set(record.link_id, group);
  }
  const active = [];
  for (const group of byLink.values()) {
    const roots = group.filter(record => record.action === 'LINK' && !record.predecessor_record_id);
    const root = roots[0];
    const unlink = group.filter(record => record.action === 'UNLINK');
    const valid = roots.length === 1 && group.length === 1 + unlink.length && unlink.length <= 1
      && group.every(record => record.source_learner_id === root.source_learner_id && record.target_learner_id === root.target_learner_id)
      && unlink.every(record => record.predecessor_record_id === root.identity_link_record_id);
    if (!valid) {
      for (const record of group) conflictedSources.add(record.source_learner_id);
    } else if (unlink.length === 0) active.push(root);
  }

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
    if (conflictedSources.has(current)) return { principal: null, chain, status: 'CONFLICT' };
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
