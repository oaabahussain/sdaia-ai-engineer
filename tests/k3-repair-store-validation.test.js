import test from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB } from 'fake-indexeddb';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';
import { event, fileStore, uid } from './helpers/k3-repair-fixtures.js';
const invalid={
  schema:e=>({...e,schema_version:999,mastery:1}),
  definition:e=>({...e,definition_id:'learner.unknown@1'}),
  payload:e=>({...e,payload:{mastery:1}}),
  context:e=>({...e,definition_id:'learner.response.recorded@1',payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}}}),
  uuid:e=>({...e,origin_id:'bad'}),
  pii:e=>({...e,learner_id:'person@example.invalid'}),
  sequence:e=>({...e,origin_seq:Number.MAX_SAFE_INTEGER+1})
};
for(const adapter of ['jsonl','indexeddb']){
  for(const [name,change] of Object.entries(invalid))test(`F06 ${adapter} rejects ${name} before persistence`,async t=>{
    const s=adapter==='jsonl'?(await fileStore(t)).store:createIndexedDbEvidenceStore({dbName:crypto.randomUUID(),storeId:'repair:idb',indexedDB});
    const bad=change(event());let result,err;
    try{result=await s.accept(bad)}catch(e){err=e}
    assert.ok(err||result?.disposition==='REJECTED','unvalidated evidence was accepted');
    assert.equal(await s.getById(bad.event_id),null);
  });
  test(`F06 ${adapter} snapshots caller input before async work`,async t=>{
    const s=adapter==='jsonl'?(await fileStore(t)).store:createIndexedDbEvidenceStore({dbName:crypto.randomUUID(),storeId:'repair:idb',indexedDB});
    const input=event();const expected=structuredClone(input);const pending=s.accept(input);input.learner_id='learner:changed';input.payload.source='changed';
    await pending;
    assert.deepEqual(await s.getById(uid(1)),expected);
    assert.equal((await s.accept(expected)).disposition,'DUPLICATE');
  });
}
