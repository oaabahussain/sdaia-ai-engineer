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
  const bReceipt=await presentPracticeItem({recorder:b.recorder,session:b.session,expectedSourceHead:revalidatedByA});
  assert.equal(bReceipt.receipt.disposition,'ACCEPTED');
  await assert.rejects(
    ()=>presentPracticeItem({recorder:a.recorder,session:a.session,expectedSourceHead:revalidatedByA}),
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
