import test from 'node:test';
import assert from 'node:assert/strict';

async function loadApi() {
  try { return await import('../src/evidence/corrections.js'); }
  catch { return {}; }
}

const A='123e4567-e89b-42d3-a456-426614174000';
const B='223e4567-e89b-42d3-a456-426614174001';
const D='323e4567-e89b-42d3-a456-426614174002';
const C1='423e4567-e89b-42d3-a456-426614174003';
const C2='523e4567-e89b-42d3-a456-426614174004';
const C3='623e4567-e89b-42d3-a456-426614174005';
const MISSING='723e4567-e89b-42d3-a456-426614174006';

function raw(id, storeSeq, extra={}) {
  return {event_id:id,definition_id:'learner.response.recorded@1',store_seq:storeSeq,payload:{value:id},...extra};
}
function correction(id, storeSeq, target, action, options={}) {
  return {
    event_id:id,
    definition_id:'learner.evidence.correction.recorded@1',
    store_seq:storeSeq,
    authority_ref: options.authorityRef === undefined ? 'authority:corrections' : options.authorityRef,
    payload:{
      target_event_id:target,
      action,
      reason_code:'ADMIN_CORRECTION',
      ...(options.supersedingEventId ? {superseding_event_id:options.supersedingEventId} : {})
    }
  };
}
function ids(events){ return events.map((event)=>event.event_id); }

test('VOID excludes target from current evidence without mutating raw bytes', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  assert.equal(typeof resolveCurrentEvidence,'function','resolveCurrentEvidence behavior is missing');
  const target=raw(A,1); const fix=correction(C1,2,A,'VOID');
  const before=structuredClone([target,fix]);
  const result=resolveCurrentEvidence([target,fix]);
  assert.deepEqual([target,fix],before);
  assert.deepEqual(result.activeEvents,[]);
  assert.deepEqual(result.unresolved,[]);
  assert.deepEqual(result.conflicts,[]);
});

test('SUPERSEDE activates replacement and correction-before-target resolves from complete graph', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const target=raw(A,2); const replacement=raw(B,3);
  const earlyCorrection=correction(C1,1,A,'SUPERSEDE',{supersedingEventId:B});
  const result=resolveCurrentEvidence([earlyCorrection,replacement,target]);
  assert.deepEqual(ids(result.activeEvents),[B]);
  assert.deepEqual(result.unresolved,[]);
  assert.deepEqual(result.conflicts,[]);
});

test('missing target or replacement stays explicit unresolved evidence', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const target=raw(A,1);
  const missingTarget=correction(C1,2,MISSING,'VOID');
  const missingReplacement=correction(C2,3,A,'SUPERSEDE',{supersedingEventId:MISSING});
  const result=resolveCurrentEvidence([target,missingTarget,missingReplacement]);
  assert.deepEqual(ids(result.activeEvents),[A]);
  assert.deepEqual(result.unresolved,[
    {code:'MISSING_TARGET',correction_event_id:C1,target_event_id:MISSING},
    {code:'MISSING_SUPERSEDING_EVENT',correction_event_id:C2,target_event_id:A,superseding_event_id:MISSING}
  ]);
  assert.deepEqual(result.conflicts,[]);
});

test('competing supersessions are a conflict and never select an arbitrary winner', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const result=resolveCurrentEvidence([
    raw(A,1),raw(B,2),raw(D,3),
    correction(C1,4,A,'SUPERSEDE',{supersedingEventId:B}),
    correction(C2,5,A,'SUPERSEDE',{supersedingEventId:D})
  ]);
  assert.deepEqual(ids(result.activeEvents),[A,B,D]);
  assert.deepEqual(result.unresolved,[]);
  assert.deepEqual(result.conflicts,[{
    code:'COMPETING_CORRECTIONS',
    target_event_id:A,
    correction_event_ids:[C1,C2]
  }]);
});

test('supersession cycles fail closed and keep cycle members active', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const result=resolveCurrentEvidence([
    raw(A,1),raw(B,2),
    correction(C1,3,A,'SUPERSEDE',{supersedingEventId:B}),
    correction(C2,4,B,'SUPERSEDE',{supersedingEventId:A})
  ]);
  assert.deepEqual(ids(result.activeEvents),[A,B]);
  assert.deepEqual(result.unresolved,[]);
  assert.equal(result.conflicts.length,1);
  assert.equal(result.conflicts[0].code,'SUPERSESSION_CYCLE');
  assert.deepEqual(result.conflicts[0].event_ids,[A,B]);
  assert.deepEqual(result.conflicts[0].correction_event_ids,[C1,C2]);
});

test('correction without explicit authority is rejected as conflict', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const result=resolveCurrentEvidence([raw(A,1),correction(C1,2,A,'VOID',{authorityRef:''})]);
  assert.deepEqual(ids(result.activeEvents),[A]);
  assert.deepEqual(result.conflicts,[{
    code:'UNAUTHORIZED_CORRECTION',
    correction_event_id:C1,
    target_event_id:A
  }]);
});

test('resolution is deterministic across input permutations', async()=>{
  const { resolveCurrentEvidence }=await loadApi();
  const events=[raw(A,1),raw(B,2),correction(C1,3,A,'SUPERSEDE',{supersedingEventId:B}),correction(C3,4,MISSING,'VOID')];
  const forward=resolveCurrentEvidence(events);
  const reverse=resolveCurrentEvidence([...events].reverse());
  assert.deepEqual(forward,reverse);
});
