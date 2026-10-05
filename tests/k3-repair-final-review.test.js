import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture,input,storage } from './helpers/k3AtomicCapture.js';
import { event,fileStore } from './helpers/k3-repair-fixtures.js';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';
import { captureLocalEvidence } from '../src/evidence/localCapture.js';
import { assertEvidenceBatchResult } from '../src/evidence/storePort.js';

test('review F01 separate databases cannot reuse one origin and origin_seq pair',async()=>{
 const originStorage=storage(),a=fixture({originStorage}),b=fixture({originStorage});
 const [one,two]=await Promise.all([a,b].map(f=>captureLocalEvidence({...f,eventInput:input(),outbox:f.store.outbox})));
 assert.notEqual(one.event.origin_id,two.event.origin_id);
 assert.equal(one.event.origin_seq,1);assert.equal(two.event.origin_seq,1);
});
for (const adapter of ['jsonl','indexeddb']) {
 test(`review F06 ${adapter} batch keeps rejected identity and valid siblings`,async t=>{
  const store=adapter==='jsonl'?(await fileStore(t)).store:createIndexedDbEvidenceStore({dbName:crypto.randomUUID(),storeId:'review:test',indexedDB});
  const values=[event(1),event(2,{schema_version:999,mastery:1}),event(3)];
  let result;try { result=await store.acceptBatch(values); } catch(e){result={error:e.message};}
  assert.deepEqual(result.receipts?.map(r=>r.disposition),['ACCEPTED','REJECTED','ACCEPTED']);
  assert.deepEqual(result.receipts.map(r=>r.event_id),values.map(e=>e.event_id));assertEvidenceBatchResult(result);
  assert.deepEqual((await store.read('learner:a')).map(e=>e.event_id),[values[0].event_id,values[2].event_id]);
 });
 test(`review F06 ${adapter} malformed batch identity rejected before writing any sibling`,async t=>{
  const store=adapter==='jsonl'?(await fileStore(t)).store:createIndexedDbEvidenceStore({dbName:crypto.randomUUID(),storeId:'review:test',indexedDB});
  await assert.rejects(()=>store.acceptBatch([event(1),event(2,{event_id:'not-a-uuid'})]));
  assert.deepEqual(await store.read('learner:a'),[]);
 });
}
