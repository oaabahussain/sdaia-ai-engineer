import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';
import { readK4Evidence } from '../src/recommendations/sourceReader.js';

let count=0;
function store(label='source') {
  count+=1;
  return createIndexedDbEvidenceStore({dbName:'k4-source-'+label+'-'+count,storeId:'k4-store',indexedDB});
}
function event(changes={}) {
  return {
    schema_version:2,event_id:'123e4567-e89b-42d3-a456-426614174000',
    definition_id:'learner.response.recorded@1',learner_id:'learner:p1',
    origin_id:'223e4567-e89b-42d3-a456-426614174001',origin_seq:1,
    activity_id:'323e4567-e89b-42d3-a456-426614174002',
    track_id:'sdaia-ai-engineer',content_release_id:'release-1',
    mode:'practice',locale:'en',occurred_at:'2026-10-08T20:00:00.000Z',
    item_interaction_id:'523e4567-e89b-42d3-a456-426614174004',
    item_version_id:'item-v1',payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}},...changes
  };
}
const args={learnerId:'learner:p1',trackId:'sdaia-ai-engineer',releaseId:'release-1'};

test('empty source has head zero and cold-start never performs invalid replay',async()=>{
  const s=store('empty');
  assert.deepEqual(await s.getSourceHead(),{store_id:'k4-store',through_store_seq:0});
  const r=await readK4Evidence({store:s,...args,throughStoreSeq:0});
  assert.equal(r.source_store_id,'k4-store');
  assert.equal(r.through_store_seq,0);
  assert.deepEqual(r.events,[]);
});

test('local committed head is not the unrelated sync cursor',async()=>{
  const s=store('cursor');
  await s.accept(event());
  await s.commitSyncCursor({store_id:'k4-store',through_store_seq:0});
  assert.deepEqual(await s.getSourceHead(),{store_id:'k4-store',through_store_seq:1});
  const r=await readK4Evidence({store:s,...args,throughStoreSeq:1});
  assert.equal(r.events.length,1);
  assert.equal(r.events[0].definition_id,'learner.response.recorded@1');
  assert.equal(r.events[0].store_seq,1);
  assert.equal(typeof r.events[0].event_fingerprint,'string');
});

test('duplicate delivery does not increment local source watermark',async()=>{
  const s=store('duplicate');
  const one=await s.accept(event());
  const retry=await s.accept(event());
  assert.equal(one.disposition,'ACCEPTED');
  assert.equal(retry.disposition,'DUPLICATE');
  assert.equal((await s.getSourceHead()).through_store_seq,1);
});

test('source reader rejects invalid head, wrong releases and watermark',async()=>{
  const s=store('bad');
  await s.accept(event());
  await assert.rejects(()=>readK4Evidence({store:s,...args,throughStoreSeq:-1}));
  await assert.rejects(()=>readK4Evidence({store:s,...args,throughStoreSeq:2}));
  const older=await readK4Evidence({store:s,...args,releaseId:'different',throughStoreSeq:1});
  assert.deepEqual(older.events,[],'historical release must not poison active-release recommendations');
  assert.equal(older.through_store_seq,1,'global store watermark remains source-bound');
  await assert.rejects(()=>readK4Evidence({store:{...s,store_id:'foreign'},...args,throughStoreSeq:1}));
});

test('learner filter does not mix another learner on same store',async()=>{
  const s=store('multilearner');
  await s.accept(event());
  const second=event({event_id:'623e4567-e89b-42d3-a456-426614174005',origin_seq:2,
    learner_id:'learner:p2',item_interaction_id:'723e4567-e89b-42d3-a456-426614174006'});
  await s.accept(second);
  assert.equal((await s.getSourceHead()).through_store_seq,2);
  const r=await readK4Evidence({store:s,...args,throughStoreSeq:2});
  assert.equal(r.events.length,1);
  assert.equal(r.events[0].learner_id,'learner:p1');
});

test('AC-09 source upgrade reads only the active public release while preserving validated historic K3 events',async()=>{
  const s=store('release-upgrade');
  await s.accept(event());
  await s.accept(event({
    event_id:'723e4567-e89b-42d3-a456-426614174010',
    origin_seq:2,
    item_interaction_id:'823e4567-e89b-42d3-a456-426614174011',
    content_release_id:'release-2'
  }));
  const oldRelease=await readK4Evidence({store:s,...args,throughStoreSeq:2});
  assert.equal(oldRelease.events.length,1);
  assert.equal(oldRelease.events[0].content_release_id,'release-1');
  const newer=await readK4Evidence({store:s,...args,releaseId:'release-2',throughStoreSeq:2});
  assert.equal(newer.events.length,1);
  assert.equal(newer.events[0].content_release_id,'release-2');
  assert.equal(newer.events[0].store_seq,2);
  assert.equal(newer.through_store_seq,2);
});
