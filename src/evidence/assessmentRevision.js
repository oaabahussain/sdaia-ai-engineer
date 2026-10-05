function baseRevisionOf(candidateEvent) {
  return candidateEvent?.base_attempt_revision ?? candidateEvent?.payload?.base_attempt_revision;
}

function resolutionPayload(candidateEvent, currentRevision, decision, reasonCode) {
  const payload = {
    candidate_event_id: candidateEvent.event_id,
    assessment_attempt_id: candidateEvent.assessment_attempt_id,
    base_attempt_revision: baseRevisionOf(candidateEvent),
    authoritative_revision_before: currentRevision,
    decision,
    reason_code: reasonCode
  };
  if (decision === 'APPLIED') payload.authoritative_revision_after = currentRevision + 1;
  return payload;
}

export function resolveAssessmentMutation({
  candidateEvent,
  currentRevision,
  storeSeq,
  authorityRef
}) {
  if (!candidateEvent || typeof candidateEvent !== 'object') throw new TypeError('candidateEvent is required');
  if (typeof candidateEvent.event_id !== 'string' || !candidateEvent.event_id) throw new TypeError('candidateEvent.event_id is required');
  if (typeof candidateEvent.assessment_attempt_id !== 'string' || !candidateEvent.assessment_attempt_id) {
    throw new TypeError('candidateEvent.assessment_attempt_id is required');
  }
  if (!Number.isSafeInteger(currentRevision) || currentRevision < 0) throw new TypeError('currentRevision must be a non-negative integer');
  if (!Number.isSafeInteger(storeSeq) || storeSeq < 1) throw new TypeError('storeSeq must be a positive integer');

  const base = baseRevisionOf(candidateEvent);
  let decision;
  let reasonCode;
  if (typeof authorityRef !== 'string' || !authorityRef) {
    decision = 'REJECTED';
    reasonCode = 'AUTHORITY_REQUIRED';
  } else if (!Number.isSafeInteger(base) || base < 0) {
    decision = 'REJECTED';
    reasonCode = 'INVALID_BASE_REVISION';
  } else if (!Number.isSafeInteger(candidateEvent.proposed_attempt_revision) || candidateEvent.proposed_attempt_revision !== base + 1) {
    decision = 'REJECTED';
    reasonCode = 'INVALID_PROPOSED_REVISION';
  } else if (base === currentRevision) {
    decision = 'APPLIED';
    reasonCode = 'BASE_REVISION_MATCH';
  } else {
    decision = 'STALE';
    reasonCode = 'BASE_REVISION_STALE';
  }

  return {
    schema_version: 2,
    definition_id: 'learner.assessment.mutation.resolved@1',
    activity_id: candidateEvent.activity_id,
    assessment_attempt_id: candidateEvent.assessment_attempt_id,
    authority_ref: authorityRef,
    store_seq: storeSeq,
    payload: resolutionPayload(candidateEvent, currentRevision, decision, reasonCode)
  };
}
