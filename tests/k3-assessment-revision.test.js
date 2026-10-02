import test from 'node:test';
import assert from 'node:assert/strict';

async function loadApi() {
  try { return await import('../src/evidence/assessmentRevision.js'); }
  catch { return {}; }
}

const A='123e4567-e89b-42d3-a456-426614174000';
const B='223e4567-e89b-42d3-a456-426614174001';
const ATTEMPT='323e4567-e89b-42d3-a456-426614174002';
const ACTIVITY='423e4567-e89b-42d3-a456-426614174003';

function candidate(eventId, base, occurredAt) {
  return {
    event_id:eventId,
    definition_id:'learner.assessment.submitted@1',
    learner_id:'learner:p1',
    activity_id:ACTIVITY,
    assessment_attempt_id:ATTEMPT,
    occurred_at:occurredAt,
    base_attempt_revision:base,
    payload:{exam_profile_ref:'exam:1',scoring_policy_ref:'policy:1'}
  };
}

test('matching base revision is APPLIED and increments authoritative revision', async()=>{
  const { resolveAssessmentMutation }=await loadApi();
  assert.equal(typeof resolveAssessmentMutation,'function','resolveAssessmentMutation behavior is missing');
  const raw=candidate(A,3,'2026-10-02T22:50:00Z');
  const before=structuredClone(raw);
  const resolved=resolveAssessmentMutation({candidateEvent:raw,currentRevision:3,storeSeq:20,authorityRef:'authority:assessment'});
  assert.deepEqual(raw,before,'resolver must not mutate candidate raw evidence');
  assert.equal(resolved.definition_id,'learner.assessment.mutation.resolved@1');
  assert.equal(resolved.store_seq,20);
  assert.equal(resolved.authority_ref,'authority:assessment');
  assert.deepEqual(resolved.payload,{
    candidate_event_id:A,
    assessment_attempt_id:ATTEMPT,
    base_attempt_revision:3,
    authoritative_revision_before:3,
    decision:'APPLIED',
    authoritative_revision_after:4,
    reason_code:'BASE_REVISION_MATCH'
  });
});

test('stale base revision remains raw evidence and does not advance revision', async()=>{
  const { resolveAssessmentMutation }=await loadApi();
  const raw=candidate(A,2,'2026-10-02T23:59:59Z');
  const before=structuredClone(raw);
  const resolved=resolveAssessmentMutation({candidateEvent:raw,currentRevision:3,storeSeq:21,authorityRef:'authority:assessment'});
  assert.deepEqual(raw,before);
  assert.equal(resolved.payload.decision,'STALE');
  assert.equal(resolved.payload.authoritative_revision_before,3);
  assert.equal('authoritative_revision_after' in resolved.payload,false);
  assert.equal(resolved.payload.reason_code,'BASE_REVISION_STALE');
});

test('two-device same-base branch is decided by current authoritative revision, not occurred_at', async()=>{
  const { resolveAssessmentMutation }=await loadApi();
  const early=candidate(A,5,'2026-10-02T22:00:00Z');
  const late=candidate(B,5,'2026-10-02T23:00:00Z');

  const first=resolveAssessmentMutation({candidateEvent:late,currentRevision:5,storeSeq:30,authorityRef:'authority:assessment'});
  const second=resolveAssessmentMutation({candidateEvent:early,currentRevision:6,storeSeq:31,authorityRef:'authority:assessment'});
  assert.equal(first.payload.decision,'APPLIED');
  assert.equal(second.payload.decision,'STALE');

  const lateWithEarlyTime={...late,occurred_at:'2020-01-01T00:00:00Z'};
  const earlyWithLateTime={...early,occurred_at:'2030-01-01T00:00:00Z'};
  const swappedFirst=resolveAssessmentMutation({candidateEvent:lateWithEarlyTime,currentRevision:5,storeSeq:30,authorityRef:'authority:assessment'});
  const swappedSecond=resolveAssessmentMutation({candidateEvent:earlyWithLateTime,currentRevision:6,storeSeq:31,authorityRef:'authority:assessment'});
  assert.equal(swappedFirst.payload.decision,first.payload.decision);
  assert.equal(swappedSecond.payload.decision,second.payload.decision);
});

test('missing authority or invalid revision is REJECTED without choosing by time', async()=>{
  const { resolveAssessmentMutation }=await loadApi();
  const noAuthority=resolveAssessmentMutation({candidateEvent:candidate(A,1,'2035-01-01T00:00:00Z'),currentRevision:1,storeSeq:40,authorityRef:''});
  assert.equal(noAuthority.payload.decision,'REJECTED');
  assert.equal(noAuthority.payload.reason_code,'AUTHORITY_REQUIRED');

  const invalid=resolveAssessmentMutation({candidateEvent:candidate(B,-1,'2010-01-01T00:00:00Z'),currentRevision:1,storeSeq:41,authorityRef:'authority:assessment'});
  assert.equal(invalid.payload.decision,'REJECTED');
  assert.equal(invalid.payload.reason_code,'INVALID_BASE_REVISION');
});
