import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';
import { createEvidenceRecorder } from '../src/evidence/recorder.js';
import { createPracticeSession, presentPracticeItem } from '../src/recommendations/practiceSession.js';

const trackId='sdaia-ai-engineer';
const releaseId='sdaia-ai-engineer.bootstrap.v1';
const candidate={
  action_type:'PRACTICE_ONE',route_mode:'practice',track_id:trackId,release_id:releaseId,
  question_family_id:'sdaia-ai-engineer.core-ai.reasoning.definition.best-description',
  item_version_id:'sdaia-ai-engineer.core-ai.reasoning.definition.best-description.v1',
  objective_id:'sdaia-ai-engineer.objective.core-ai.reasoning.v1',domain_id:'core-ai'
};
const objectives={track_id:trackId,objectives:[{
  objective_id:candidate.objective_id,domain_id:'core-ai',track_id:trackId,concept_ids:['core-ai.reasoning']
}]};
const eventDefinitions=JSON.parse(readFileSync(new URL('../data/evidence/event-definitions-v1.json',import.meta.url),'utf8'));
let nextDatabase=0;
function tab(dbName) {
  const store=createIndexedDbEvidenceStore({dbName,storeId:'shared-evidence',indexedDB});
  const originStorage={getItem:()=>null,setItem:()=>{}};
  const recorder=createEvidenceRecorder({
    store,outbox:store.outbox,crypto:{randomUUID},
    runtimeContext:{track:{id:trackId,locales:['ar','en']},
      evidence:{content_release_id:releaseId},eventDefinitions,originStorage}
  });
  const session=createPracticeSession({
    recorder,learnerId:'learner:shared',trackId,releaseId,locale:'en',candidate,objectives
  });
  return {store,recorder,session};
}
test('K4 cross-tab stale recommendation cannot record an ineligible duplicate presentation',async()=>{
  const name='k4-cas-stale-'+(++nextDatabase);
  const a=tab(name),b=tab(name);
  const revalidatedByA=await a.store.getSourceHead();
  assert.equal(revalidatedByA.through_store_seq,0);
  const bReceipt=await presentPracticeItem({recorder:b.recorder,session:b.session,expectedSourceHead:revalidatedByA,expectedPreferencesRevision:0});
  assert.equal(bReceipt.receipt.disposition,'ACCEPTED');
  await assert.rejects(
    ()=>presentPracticeItem({recorder:a.recorder,session:a.session,expectedSourceHead:revalidatedByA,expectedPreferencesRevision:0}),
    /stale K4 practice source watermark/
  );
  assert.equal(a.session.start_receipt,null,'stale tab must not persist even a ghost activity start');
  assert.equal(a.session.presentation_receipt,null,'stale tab must not claim presentation success');
  const head=await a.store.getSourceHead();
  assert.equal(head.through_store_seq,2,'only winning start and presentation may persist');
  const rows=await a.store.readRange({fromSeq:1,toSeq:head.through_store_seq,learnerId:'learner:shared'});
  assert.deepEqual(rows.map(row=>row.definition_id),
    ['learner.activity.started@1','learner.item.presented@1']);
  assert.equal(rows[1].question_family_id,candidate.question_family_id);
});
test('K4 concurrent tabs compete under a single cross-connection source CAS',async()=>{
  const name='k4-cas-race-'+(++nextDatabase);
  const a=tab(name),b=tab(name);
  const head=await a.store.getSourceHead();
  const results=await Promise.allSettled([
    a.recorder.startActivity({learner_id:'learner:shared',mode:'practice',locale:'en',source:'browser',expectedSourceHead:head}),
    b.recorder.startActivity({learner_id:'learner:shared',mode:'practice',locale:'en',source:'browser',expectedSourceHead:head})
  ]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1,'one tab alone may claim the source head');
  assert.equal(results.filter(x=>x.status==='rejected').length,1,'losing tab fails closed');
  assert.match(String(results.find(x=>x.status==='rejected')?.reason),/stale K4 practice source watermark/);
  assert.equal((await a.store.getSourceHead()).through_store_seq,1);
});


test('K4 guarded practice start and item presentation rollback together if second event write fails',async()=>{
  const name='k4-atomic-pair-'+(++nextDatabase), a=tab(name);
  const head=await a.store.getSourceHead();
  const native=globalThis.IDBObjectStore.prototype.add;
  let attempted=0;
  try{
    globalThis.IDBObjectStore.prototype.add=function(...args){
      if(this.name==='events' && ++attempted===2)
        throw new DOMException('K4 second event denied','QuotaExceededError');
      return native.apply(this,args);
    };
    await assert.rejects(
      ()=>presentPracticeItem({recorder:a.recorder,session:a.session,
        expectedSourceHead:head,expectedPreferencesRevision:0}),
      e=>e?.name==='QuotaExceededError'
    );
  }finally{globalThis.IDBObjectStore.prototype.add=native}
  assert.equal(attempted,2,'must exercise failing second event after the first event was staged');
  assert.equal((await a.store.getSourceHead()).through_store_seq,0,
    'failed second event must rollback the first event in the same transaction');
  assert.equal(a.session.start_receipt,null,'no ghost activity receipt after atomic rollback');
  assert.equal(a.session.presentation_receipt,null,'no phantom presentation receipt');
});

test('K4 stale preference revision prevents practice presentation despite unchanged evidence watermark',async()=>{
  const {createSchedulingPreferencesStore,updateSchedulingPreferences}=
    await import('../src/recommendations/preferencesStore.js');
  const name='k4-pref-race-'+(++nextDatabase),a=tab(name),b=tab(name);
  const prefName=name+'-legacy';
  const prefA=createSchedulingPreferencesStore({indexedDB,dbName:prefName,evidenceStore:a.store});
  const prefB=createSchedulingPreferencesStore({indexedDB,dbName:prefName,evidenceStore:b.store});
  const seenHead=await a.store.getSourceHead();
  const before=await prefA.read('learner:shared');
  assert.equal(before.preferences.revision,0);
  const saved=await updateSchedulingPreferences({
    store:prefB,nowIso:'2026-10-10T10:00:00.000Z',
    request:{learnerId:'learner:shared',expectedRevision:0,
      action:'SNOOZE',familyId:candidate.question_family_id,untilAt:'2026-10-13T10:00:00.000Z'}
  });
  assert.equal(saved.persisted,true);
  assert.equal((await a.store.getSourceHead()).through_store_seq,0,
    'K4 user snooze must not invent a K3 learner evidence event');
  await assert.rejects(
    ()=>presentPracticeItem({recorder:a.recorder,session:a.session,
      expectedSourceHead:seenHead,expectedPreferencesRevision:before.preferences.revision}),
    /stale K4 practice preference revision/
  );
  assert.equal((await a.store.getSourceHead()).through_store_seq,0);
  assert.equal(a.session.start_receipt,null);
  const persisted=await prefA.read('learner:shared');
  assert.equal(persisted.preferences.revision,1);
  assert.equal(persisted.preferences.snoozed_families[0].question_family_id,candidate.question_family_id);
});

test('K4 atomic preference migration preserves already saved legacy snoozes',async()=>{
  const {createSchedulingPreferencesStore}=await import('../src/recommendations/preferencesStore.js');
  const name='k4-pref-migration-'+(++nextDatabase),a=tab(name),legacyName=name+'-legacy';
  const old=createSchedulingPreferencesStore({indexedDB,dbName:legacyName});
  const value={learner_id:'learner:shared',version:1,revision:0,
    snoozed_families:[{question_family_id:candidate.question_family_id,until_at:'2026-10-13T10:00:00.000Z'}],
    dismissed_families:[],preferred_domain_id:null};
  await old.save({learnerId:'learner:shared',expectedRevision:0,next:value});
  const backed=createSchedulingPreferencesStore({indexedDB,dbName:legacyName,evidenceStore:a.store});
  const read=await backed.read('learner:shared');
  assert.equal(read.persisted,true);
  assert.equal(read.preferences.revision,1);
  assert.deepEqual(read.preferences.snoozed_families,value.snoozed_families);
  const anotherTab=createSchedulingPreferencesStore({indexedDB,dbName:legacyName,evidenceStore:tab(name).store});
  const readAgain=await anotherTab.read('learner:shared');
  assert.deepEqual(readAgain,read);
  await new Promise((resolve,reject)=>{
    const request=indexedDB.deleteDatabase(legacyName);
    request.onsuccess=resolve;request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('legacy preference database still locked'));
  });
  assert.deepEqual(await anotherTab.read('learner:shared'),read,
    'the atomic source must retain migrated preferences even after the legacy database is deleted');
});
