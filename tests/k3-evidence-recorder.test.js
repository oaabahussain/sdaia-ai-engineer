import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';

async function loadRecorderApi(){
  try{return await import('../src/evidence/recorder.js');}
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND'&&String(error?.message).includes('/src/evidence/recorder.js'))return {};
    throw error;
  }
}

const eventDefinitions=JSON.parse(readFileSync(new URL('../data/evidence/event-definitions-v1.json',import.meta.url),'utf8'));

class MemoryStorage{
  constructor(){this.map=new Map();}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}

function runtimeContext(originStorage=new MemoryStorage()){
  return {
    track:{id:'sdaia-ai-engineer',locales:['ar','en']},
    evidence:{content_release_id:'sdaia-ai-engineer.bootstrap.v1'},
    eventDefinitions,
    originStorage
  };
}

function snapshot(){
  return {
    schema_version:1,
    form_id:'form:clean-wave',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    exam_profile_id:'sdaia-ai-engineer.project-reference.v1',
    exam_profile_version:'1',
    scoring_policy_version:'sdaia-ai-engineer.scoring.v1',
    item_version_ids:['item-1.v1','item-2.v1'],
    option_orders:{'item-1.v1':[2,0,1,3],'item-2.v1':[1,2,3,0]},
    locale:'en',
    started_at:'2026-10-06T18:00:00.000Z'
  };
}

function deterministicCrypto(values=[
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
]){
  let index=0;
  return {randomUUID(){return values[index++]??'55555555-5555-4555-8555-555555555555';}};
}

function recordingStore({failOnCall=null}={}){
  const calls=[];
  return {
    calls,
    async captureLocal(args){
      if(failOnCall===calls.length+1)throw new Error('durable capture failed');
      calls.push(structuredClone(args));
      return {event:structuredClone(args.eventInput),receipt:{disposition:'ACCEPTED'}};
    }
  };
}

function activityContext(started,snap=snapshot()){
  return {
    learner_id:'learner:clean-wave',
    activity_id:started.event.activity_id,
    track_id:'sdaia-ai-engineer',
    content_release_id:snap.content_release_id,
    mode:'mock',
    locale:'en',
    assessment_attempt_id:started.event.assessment_attempt_id,
    form_id:snap.form_id,
    attempt_revision:0,
    assessment_snapshot:snap
  };
}

function itemContext(){
  return {
    question_family_id:'family-1',
    item_version_id:'item-1.v1',
    objective_id:'objective-1',
    domain_id:'domain-1'
  };
}

test('Task 28 recorder exposes the governed API and records learner events in order',async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','Task 28 recorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,outbox:null,runtimeContext:runtimeContext(),
    clock:()=>new Date('2026-10-06T18:01:00Z'),
    crypto:deterministicCrypto()
  });
  const snap=snapshot();
  const started=await recorder.startActivity({learner_id:'learner:clean-wave',mode:'mock',locale:'en',assessment_snapshot:snap,source:'browser'});
  const presented=await recorder.presentItem({
    activity_id:started.event.activity_id,
    question_family_id:'family-1',item_version_id:'item-1.v1',objective_id:'objective-1',domain_id:'domain-1'
  });
  const response=await recorder.recordResponse({
    activity_id:started.event.activity_id,
    item_interaction_id:presented.event.item_interaction_id,
    response:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
    base_attempt_revision:0,proposed_attempt_revision:1
  });
  await recorder.recordConfidence({activity_id:started.event.activity_id,item_interaction_id:presented.event.item_interaction_id,confidence:'high'});
  await recorder.requestHint({activity_id:started.event.activity_id,item_interaction_id:presented.event.item_interaction_id,hint_ref:'hint:item-1'});
  await recorder.openExplanation({activity_id:started.event.activity_id,item_interaction_id:presented.event.item_interaction_id,explanation_ref:'explanation:item-1'});
  await recorder.submitAssessment({activity_id:started.event.activity_id});

  assert.equal(response.event.payload.response.option_index,2);
  assert.equal('text' in response.event.payload.response,false);
  assert.deepEqual(store.calls.map(call=>call.eventInput.definition_id),[
    'learner.activity.started@1','learner.item.presented@1','learner.response.recorded@1',
    'learner.confidence.recorded@1','learner.hint.requested@1','learner.explanation.opened@1',
    'learner.assessment.submitted@1'
  ]);
  assert.equal(started.event.form_id,'form:clean-wave');
  assert.equal(started.event.content_release_id,'sdaia-ai-engineer.bootstrap.v1');
});

test('Task 28 surfaces durable persistence failures and does not advance strict revision on failure',async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','Task 28 recorder behavior is missing');
  let calls=0;
  const accepted=[];
  const store={
    async captureLocal(args){
      calls+=1;
      if(calls===3)throw new Error('durable capture failed');
      accepted.push(structuredClone(args));
      return {event:structuredClone(args.eventInput),receipt:{disposition:'ACCEPTED'}};
    }
  };
  const recorder=createEvidenceRecorder({store,runtimeContext:runtimeContext(),crypto:deterministicCrypto()});
  const started=await recorder.startActivity({learner_id:'learner:clean-wave',mode:'mock',locale:'en',assessment_snapshot:snapshot()});
  const presented=await recorder.presentItem({activity_id:started.event.activity_id,...itemContext()});
  const base={
    activity_id:started.event.activity_id,item_interaction_id:presented.event.item_interaction_id,
    response:{response_version:1,response_kind:'OPTION',response:{option_index:1}}
  };
  await assert.rejects(()=>recorder.recordResponse({...base,base_attempt_revision:0,proposed_attempt_revision:1}),/durable capture failed/);
  await recorder.recordResponse({...base,base_attempt_revision:0,proposed_attempt_revision:1});
  assert.equal(accepted.filter(x=>x.eventInput.definition_id==='learner.response.recorded@1').length,1);
});

test('Task 28 rejects inconsistent frozen form and resumed out-of-form interactions before capture',async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','Task 28 recorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({store,runtimeContext:runtimeContext(),crypto:deterministicCrypto()});
  await assert.rejects(
    ()=>recorder.startActivity({learner_id:'learner:clean-wave',mode:'mock',locale:'en',form_id:'form:wrong',assessment_snapshot:snapshot()}),
    /form|snapshot|frozen/i
  );
  const started=await recorder.startActivity({learner_id:'learner:clean-wave',mode:'mock',locale:'en',assessment_snapshot:snapshot()});
  await assert.rejects(()=>recorder.recordResponse({
    activity_id:started.event.activity_id,
    item_interaction_id:'99999999-9999-4999-8999-999999999999',
    item_context:{question_family_id:'outside',item_version_id:'outside.v1',objective_id:'outside',domain_id:'outside'},
    response:{response_version:1,response_kind:'OPTION',response:{option_index:0}},
    base_attempt_revision:0,proposed_attempt_revision:1
  }),/frozen|form|snapshot|item_version_id/i);
  assert.equal(store.calls.length,1);
});

test('Task 28 keeps SYSTEM evaluation fail-closed without a trusted producer boundary',async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','Task 28 recorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({store,runtimeContext:runtimeContext(),crypto:deterministicCrypto()});
  await assert.rejects(()=>recorder.recordEvaluation({
    learner_id:'learner:clean-wave',
    activity_id:'11111111-1111-4111-8111-111111111111',
    item_version_id:'item-1.v1',
    authority_ref:'browser-claim-is-not-authority',
    response_event_id:'66666666-6666-4666-8666-666666666666',
    scoring_policy_ref:'sdaia-ai-engineer.scoring.v1',
    evaluation_status:'GRADED',correct:true,score:1
  }),/trusted|authority|producer/i);
  assert.equal(store.calls.length,0);
});

test('Task 28 atomically coordinates one strict revision chain across two recorder/store instances',async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','Task 28 recorder behavior is missing');
  const originStorage=new MemoryStorage();
  const context=runtimeContext(originStorage);
  const name='k3-task28-clean-wave-'+Date.now()+'-'+Math.random();
  const storeA=createIndexedDbEvidenceStore({dbName:name,storeId:'browser-evidence',indexedDB});
  const storeB=createIndexedDbEvidenceStore({dbName:name,storeId:'browser-evidence',indexedDB});
  const recorderA=createEvidenceRecorder({store:storeA,runtimeContext:context,crypto:deterministicCrypto()});
  const recorderB=createEvidenceRecorder({store:storeB,runtimeContext:context,crypto:deterministicCrypto([
    '77777777-7777-4777-8777-777777777777',
    '88888888-8888-4888-8888-888888888888'
  ])});
  const snap=snapshot();
  const started=await recorderA.startActivity({learner_id:'learner:clean-wave',mode:'mock',locale:'en',assessment_snapshot:snap});
  const presented=await recorderA.presentItem({activity_id:started.event.activity_id,...itemContext()});
  const common={
    activity_id:started.event.activity_id,
    item_interaction_id:presented.event.item_interaction_id,
    response:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
    base_attempt_revision:0,proposed_attempt_revision:1
  };
  const resumed={
    ...common,
    activity_context:activityContext(started,snap),
    item_context:itemContext()
  };
  const results=await Promise.allSettled([
    recorderA.recordResponse(common),
    recorderB.recordResponse(resumed)
  ]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1,'only one 0 -> 1 mutation may commit for one browser origin/attempt');
  assert.equal(results.filter(result=>result.status==='rejected').length,1,'the competing same-base mutation must fail closed');
});
