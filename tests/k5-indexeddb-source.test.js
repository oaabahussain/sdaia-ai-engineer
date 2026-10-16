import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createIndexedDbEvidenceStore} from '../src/evidence/indexedDbStore.js';
import {readK5Source} from '../src/mastery/source.js';
const ID='sdaia-ai-engineer',LEARNER='learner:opaque',STORE='k5-integrated-store';
let serial=0;
function fixture(release='release-old',sequence=1){
 const hex=n=>String(n).padStart(12,'0');
 return {
  schema_version:2,event_id:'123e4567-e89b-42d3-a456-'+hex(200+sequence),
  definition_id:'learner.response.recorded@1',learner_id:LEARNER,
  origin_id:'223e4567-e89b-42d3-a456-426614174001',origin_seq:sequence,
  activity_id:'323e4567-e89b-42d3-a456-426614174002',
  track_id:ID,content_release_id:release,mode:'practice',locale:'en',
  occurred_at:'2026-10-12T10:00:00.000Z',
  item_interaction_id:'523e4567-e89b-42d3-a456-426614174004',
  item_version_id:'item-v1',payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}}
 };
}
const store=()=>createIndexedDbEvidenceStore({dbName:'k5-source-real-'+(++serial),storeId:STORE,indexedDB});
test('real IndexedDB K3 replay returns accepted events and genuine fingerprints',async()=>{
 const s=store();const receipt=await s.accept(fixture());
 assert.equal(receipt.disposition,'ACCEPTED');
 const r=await readK5Source({store:s,learnerId:LEARNER,trackId:ID,releaseId:'release-current',throughStoreSeq:1});
 assert.equal(r.events.length,1);
 assert.equal(r.events[0].content_release_id,'release-old');
 assert.match(r.events[0].event_fingerprint,/^[0-9a-f]{64}$/);
 assert.match(r.source_fingerprint,/^[0-9a-f]{64}$/);
 assert.equal(r.source_store_id,STORE);
});
test('real accepted two-release learner history retained in K5 read scope',async()=>{
 const s=store();await s.accept(fixture('release-old',1));await s.accept(fixture('release-current',2));
 const v=await readK5Source({store:s,learnerId:LEARNER,trackId:ID,releaseId:'release-current',throughStoreSeq:2});
 assert.deepEqual(v.events.map(e=>e.content_release_id),['release-old','release-current']);
 assert.deepEqual(v.events.map(e=>e.store_seq),[1,2]);
});
test('reading wrong learner never adopts someone else evidence',async()=>{
 const s=store();await s.accept(fixture());
 const v=await readK5Source({store:s,learnerId:'other',trackId:ID,releaseId:'release-old',throughStoreSeq:1});
 assert.deepEqual(v.events,[]);
 assert.equal(v.through_store_seq,1);
});
