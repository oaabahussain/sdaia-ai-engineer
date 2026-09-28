const SCOPE_TO_KEY = Object.freeze({
  release: 'release_ids',
  tranche: 'tranche_ids',
  family: 'family_ids',
  'item-version': 'item_version_ids'
});

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

export function createQuarantineEvent(input = {}) {
  const key = SCOPE_TO_KEY[input.scope];
  if (!key) throw new Error('Unsupported quarantine scope');
  if (typeof input.from_target_id !== 'string' || !input.from_target_id) {
    throw new Error('Quarantine from_target_id is required');
  }
  if (typeof input.reason !== 'string' || !input.reason) {
    throw new Error('Quarantine reason is required');
  }
  if (typeof input.actor !== 'string' || !input.actor) {
    throw new Error('Quarantine actor is required');
  }
  if (typeof input.at !== 'string' || !input.at) {
    throw new Error('Quarantine timestamp is required');
  }
  if (
    !Array.isArray(input.triggering_evidence_refs) ||
    input.triggering_evidence_refs.length === 0
  ) {
    throw new Error('Quarantine triggering evidence is required');
  }

  return deepFreeze({
    type: 'content_quarantine',
    scope: input.scope,
    from_target_id: input.from_target_id,
    to_target_id: input.to_target_id ?? null,
    reason: input.reason,
    actor: input.actor,
    at: input.at,
    triggering_evidence_refs: [...input.triggering_evidence_refs],
    follow_up_required: input.follow_up_required === true
  });
}

export function selectAfterQuarantine(selection = {}, event) {
  const key = SCOPE_TO_KEY[event?.scope];
  if (!key) throw new Error('Unsupported quarantine scope');

  const next = structuredClone(selection);
  for (const candidateKey of Object.values(SCOPE_TO_KEY)) {
    if (!Array.isArray(next[candidateKey])) next[candidateKey] = [];
  }

  next[key] = next[key].filter(id => id !== event.from_target_id);
  return deepFreeze(next);
}
