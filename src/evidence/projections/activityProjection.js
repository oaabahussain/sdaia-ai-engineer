import { resolveCurrentEvidence } from '../corrections.js';

const ITEM_BUCKETS = new Map([
  ['learner.item.presented@1', 'presented_event_ids'],
  ['learner.item.skipped@1', 'skipped_event_ids'],
  ['learner.response.recorded@1', 'response_event_ids'],
  ['learner.confidence.recorded@1', 'confidence_event_ids'],
  ['learner.hint.requested@1', 'hint_event_ids'],
  ['learner.explanation.opened@1', 'explanation_event_ids'],
  ['learner.response.evaluated@1', 'evaluation_event_ids']
]);

function byStoreSeq(a, b) {
  const aSeq = Number.isInteger(a?.store_seq) ? a.store_seq : Number.MAX_SAFE_INTEGER;
  const bSeq = Number.isInteger(b?.store_seq) ? b.store_seq : Number.MAX_SAFE_INTEGER;
  if (aSeq !== bSeq) return aSeq - bSeq;
  return String(a?.event_id ?? '').localeCompare(String(b?.event_id ?? ''));
}

function generationTime(events) {
  const values = events
    .map((event) => event.accepted_at ?? event.occurred_at)
    .filter((value) => typeof value === 'string' && Number.isFinite(Date.parse(value)))
    .sort();
  return values.at(-1) ?? null;
}

function newInteraction(event) {
  return {
    item_interaction_id: event.item_interaction_id ?? null,
    item_version_id: event.item_version_id ?? null,
    presented_event_ids: [],
    skipped_event_ids: [],
    response_event_ids: [],
    confidence_event_ids: [],
    hint_event_ids: [],
    explanation_event_ids: [],
    evaluation_event_ids: []
  };
}

export function projectActivity(events, {
  throughStoreSeq,
  policyVersion,
  identityResolutionVersion
} = {}) {
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  if (!Number.isInteger(throughStoreSeq) || throughStoreSeq < 0) {
    throw new TypeError('throughStoreSeq must be a non-negative integer');
  }
  if (typeof policyVersion !== 'string' || !policyVersion) throw new TypeError('policyVersion is required');
  if (typeof identityResolutionVersion !== 'string' || !identityResolutionVersion) {
    throw new TypeError('identityResolutionVersion is required');
  }

  const window = events
    .filter((event) => Number.isInteger(event?.store_seq) && event.store_seq <= throughStoreSeq)
    .sort(byStoreSeq);
  const resolved = resolveCurrentEvidence(window);
  const active = resolved.activeEvents.sort(byStoreSeq);
  const first = active[0] ?? window.find((event) => event?.definition_id !== 'learner.evidence.correction.recorded@1') ?? null;
  const started = active.find((event) => event.definition_id === 'learner.activity.started@1') ?? null;
  const completed = [...active].reverse().find((event) => event.definition_id === 'learner.activity.completed@1') ?? null;

  const interactions = new Map();
  for (const event of active) {
    const bucket = ITEM_BUCKETS.get(event.definition_id);
    if (!bucket || !event.item_interaction_id) continue;
    const key = event.item_interaction_id;
    const item = interactions.get(key) ?? newInteraction(event);
    if (!item.item_version_id && event.item_version_id) item.item_version_id = event.item_version_id;
    item[bucket].push(event.event_id);
    interactions.set(key, item);
  }

  const integrityStatus = resolved.conflicts.length > 0
    ? 'CONFLICTED'
    : resolved.unresolved.length > 0 ? 'INCOMPLETE' : 'COMPLETE';

  return {
    projection_type: 'ActivityProjectionV1',
    schema_version: 1,
    source_store_id: first?.store_id ?? null,
    through_store_seq: throughStoreSeq,
    policy_version: policyVersion,
    identity_resolution_version: identityResolutionVersion,
    generated_at: generationTime(window),
    activity_id: first?.activity_id ?? null,
    learner_id: first?.learner_id ?? null,
    content_release_id: first?.content_release_id ?? null,
    mode: first?.mode ?? null,
    started_event_id: started?.event_id ?? null,
    completed_event_id: completed?.event_id ?? null,
    item_interactions: [...interactions.values()],
    integrity_status: integrityStatus,
    unresolved_reference_count: resolved.unresolved.length,
    conflict_count: resolved.conflicts.length,
    unresolved: resolved.unresolved,
    conflicts: resolved.conflicts
  };
}
