import test from 'node:test';
import assert from 'node:assert/strict';
import { event, uid, fileStore } from './helpers/k3-repair-fixtures.js';
import { fixture, input } from './helpers/k3AtomicCapture.js';
import { captureLocalEvidence } from '../src/evidence/localCapture.js';
import { resolveCurrentEvidence } from '../src/evidence/corrections.js';

for (const kind of ['IndexedDB', 'JSONL']) {
  for (const extra of [{access_token:'SYNTHETIC'}, {text:'unnecessary localized text'}, {nested:{session:'SYNTHETIC'}}]) {
    test(`${kind} rejects undeclared OPTION response fields before persistence: ${Object.keys(extra)}`, async t => {
      const store = kind === 'IndexedDB' ? fixture().store : (await fileStore(t)).store;
      const value = event(1,{definition_id:'learner.response.recorded@1',item_version_id:'item:a',item_interaction_id:uid(91),payload:{response_version:1,response_kind:'OPTION',response:{option_index:0,...extra}}});
      await assert.rejects(()=>store.accept(value), /response|privacy|payload|invalid/i);
      assert.equal(await store.getById(value.event_id), null);
    });
  }
}
for (const response of [{option_index:-1},{option_index:2**53},{option_index:true},{}]) {
  test(`native capture rejects invalid option representation ${JSON.stringify(response)}`, async()=>{
    const f=fixture();
    await assert.rejects(()=>captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:input({payload:{response_version:1,response_kind:'OPTION',response}})}),/response|privacy|payload|invalid/i);
    assert.equal((await f.store.read('learner:a')).length,0);
  });
}
test('ordinary capture still accepts stable option identity without text',async()=>{
  const f=fixture();const got=await captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:input()});
  assert.equal(got.receipt.disposition,'ACCEPTED');
});
test('ordinary local capture cannot originate administrative correction',async()=>{
  const f=fixture();const value=event(1,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'unverified',payload:{action:'VOID',target_event_id:uid(91),reason_code:'TEST'}});
  await assert.rejects(()=>captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:value}),/producer|authoriz|authority/i);
});
for (const action of ['VOID','SUPERSEDE'])test(`cross-principal ${action} does not remove or replace foreign evidence`,()=>{
  const target=event(1,{learner_id:'learner:b'});
  const replacement=event(2,{learner_id:'learner:c'});
  const correction=event(3,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'authority:a',payload:{target_event_id:target.event_id,action,reason_code:'TEST',...(action==='SUPERSEDE'?{superseding_event_id:replacement.event_id}:{})}});
  const result=resolveCurrentEvidence([target,replacement,correction]);
  assert.ok(result.activeEvents.some(e=>e.event_id===target.event_id));
  assert.ok(result.conflicts.length);
});
test('same learner correction cannot supersede using another learner replacement',()=>{
  const target=event(), replacement=event(2,{learner_id:'learner:b'});
  const correction=event(3,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'authority:a',payload:{target_event_id:target.event_id,action:'SUPERSEDE',superseding_event_id:replacement.event_id,reason_code:'TEST'}});
  const result=resolveCurrentEvidence([target,replacement,correction]);
  assert.ok(result.activeEvents.some(e=>e.event_id===target.event_id));assert.ok(result.conflicts.length);
});
