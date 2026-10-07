import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

async function loadBridge(){
  try{return await import('../src/evidence/appBridge.js');}
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND'&&String(error?.message).includes('/src/evidence/appBridge.js'))return {};
    throw error;
  }
}

function snapshot(){
  return {
    schema_version:1,
    form_id:'form:task29-clean-wave',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    exam_profile_id:'sdaia-ai-engineer.project-reference.v1',
    exam_profile_version:'1',
    scoring_policy_version:'sdaia-ai-engineer.scoring.v1',
    item_version_ids:['sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1'],
    option_orders:{'sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1':[2,0,1,3]},
    locale:'en',
    started_at:'2026-10-06T18:20:00.000Z'
  };
}

function exam(){
  return {
    id:'exam-clean-wave',
    mode:'full',
    evidence_mode:'mock',
    track_id:'sdaia-ai-engineer',
    exam_profile_id:'sdaia-ai-engineer.project-reference.v1',
    exam_profile_version:1,
    questionIds:['sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1'],
    answers:{},
    confidence:{},
    flags:{},
    optionOrders:{'sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1':[2,0,1,3]},
    assessment_snapshot:snapshot(),
    started_at:'2026-10-06T18:20:00.000Z',
    submitted:false
  };
}

function question(){
  return {
    id:'sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1',
    family_id:'sdaia-ai-engineer.core-ai.activation-function.definition.best-description',
    track_id:'sdaia-ai-engineer',
    domain_id:'core-ai',
    answer:2
  };
}

function objectiveCatalog(){
  return {
    schema_version:1,
    track_id:'sdaia-ai-engineer',
    objectives:[{
      schema_version:1,
      objective_id:'sdaia-ai-engineer.objective.core-ai.activation-function.v1',
      track_id:'sdaia-ai-engineer',
      domain_id:'core-ai',
      concept_ids:['core-ai.activation-function'],
      version:1,status:'provisional',origin:'migration-derived'
    }]
  };
}

function recorderSpy(){
  const calls=[];
  const recorder={
    calls,
    async startActivity(input){
      calls.push(['startActivity',structuredClone(input)]);
      return {event:{activity_id:'11111111-1111-4111-8111-111111111111',assessment_attempt_id:'22222222-2222-4222-8222-222222222222'}};
    },
    async presentItem(input){
      calls.push(['presentItem',structuredClone(input)]);
      return {event:{item_interaction_id:input.item_interaction_id??'33333333-3333-4333-8333-333333333333'}};
    },
    async recordResponse(input){
      calls.push(['recordResponse',structuredClone(input)]);
      return {event:{event_id:'44444444-4444-4444-8444-444444444444'}};
    },
    async recordConfidence(input){calls.push(['recordConfidence',structuredClone(input)]);return {event:{}};},
    async submitAssessment(input){calls.push(['submitAssessment',structuredClone(input)]);return {event:{}};},
    async recordEvaluation(input){calls.push(['recordEvaluation',structuredClone(input)]);throw new Error('Trusted SYSTEM producer authority is required');}
  };
  return recorder;
}

function baseContext(overrides={}){
  return {
    learner_id:'learner:clean-wave',
    locale:'en',
    objective_catalog:objectiveCatalog(),
    evidence_runtime:{
      activity_id:'11111111-1111-4111-8111-111111111111',
      assessment_attempt_id:'22222222-2222-4222-8222-222222222222',
      attempt_revision:0,
      interactions:{}
    },
    ...overrides
  };
}

test('Task 29 exposes pure bridge functions without DOM coupling',async()=>{
  const bridge=await loadBridge();
  for(const name of [
    'beginExamEvidence','presentExamItemEvidence','recordExamAnswerEvidence',
    'recordExamConfidenceEvidence','submitExamEvidence'
  ]) assert.equal(typeof bridge[name],'function',name+' behavior is missing');
});

test('Task 29 starts full UI exams as mock evidence under the exact frozen snapshot',async()=>{
  const {beginExamEvidence}=await loadBridge();
  assert.equal(typeof beginExamEvidence,'function','beginExamEvidence behavior is missing');
  const recorder=recorderSpy();
  const current=exam();
  const result=await beginExamEvidence(recorder,current,{learner_id:'learner:clean-wave',locale:'en'});
  const [name,input]=recorder.calls[0];
  assert.equal(name,'startActivity');
  assert.equal(input.mode,'mock');
  assert.equal(input.learner_id,'learner:clean-wave');
  assert.deepEqual(input.assessment_snapshot,current.assessment_snapshot);
  assert.equal(result.event.activity_id,'11111111-1111-4111-8111-111111111111');
});

test('Task 29 presentation uses canonical objective registry and does not duplicate DOM rerenders',async()=>{
  const {presentExamItemEvidence}=await loadBridge();
  assert.equal(typeof presentExamItemEvidence,'function','presentExamItemEvidence behavior is missing');
  const recorder=recorderSpy();
  const current=exam();
  const q=question();
  const context=baseContext();
  const first=await presentExamItemEvidence(recorder,current,q,context);
  context.evidence_runtime.interactions[q.id]={
    item_interaction_id:first.event.item_interaction_id,
    presented:true
  };
  await presentExamItemEvidence(recorder,current,q,context);
  const calls=recorder.calls.filter(([name])=>name==='presentItem');
  assert.equal(calls.length,1,'rerender must not create duplicate item.presented evidence');
  assert.equal(calls[0][1].question_family_id,q.family_id);
  assert.equal(calls[0][1].item_version_id,q.id);
  assert.equal(calls[0][1].domain_id,'core-ai');
  assert.equal(calls[0][1].objective_id,'sdaia-ai-engineer.objective.core-ai.activation-function.v1');
});

test('Task 29 answer bridge records only committed canonical changes and advances local revision input',async()=>{
  const {recordExamAnswerEvidence}=await loadBridge();
  assert.equal(typeof recordExamAnswerEvidence,'function','recordExamAnswerEvidence behavior is missing');
  const recorder=recorderSpy();
  const current=exam();
  const q=question();
  const runtime={
    activity_id:'11111111-1111-4111-8111-111111111111',
    assessment_attempt_id:'22222222-2222-4222-8222-222222222222',
    attempt_revision:0,
    interactions:{[q.id]:{item_interaction_id:'33333333-3333-4333-8333-333333333333',presented:true}}
  };
  await recordExamAnswerEvidence(recorder,current,q,2,baseContext({previous_answer:undefined,evidence_runtime:runtime}));
  runtime.attempt_revision=1;
  await recordExamAnswerEvidence(recorder,current,q,2,baseContext({previous_answer:2,evidence_runtime:runtime}));
  const calls=recorder.calls.filter(([name])=>name==='recordResponse');
  assert.equal(calls.length,1,'selecting the same canonical answer twice must not invent a change event');
  assert.deepEqual(calls[0][1].response,{response_version:1,response_kind:'OPTION',response:{option_index:2}});
  assert.equal(calls[0][1].base_attempt_revision,0);
  assert.equal(calls[0][1].proposed_attempt_revision,1);
});

test('Task 29 confidence emits only explicit committed confidence evidence',async()=>{
  const {recordExamConfidenceEvidence}=await loadBridge();
  assert.equal(typeof recordExamConfidenceEvidence,'function','recordExamConfidenceEvidence behavior is missing');
  const recorder=recorderSpy();
  const q=question();
  const current=exam();
  const runtime={...baseContext().evidence_runtime,interactions:{[q.id]:{item_interaction_id:'33333333-3333-4333-8333-333333333333',presented:true}}};
  await recordExamConfidenceEvidence(recorder,current,q,'high',baseContext({previous_confidence:undefined,evidence_runtime:runtime}));
  await recordExamConfidenceEvidence(recorder,current,q,'high',baseContext({previous_confidence:'high',evidence_runtime:runtime}));
  assert.equal(recorder.calls.filter(([name])=>name==='recordConfidence').length,1);
});

test('Task 29 submission records learner submission but never fabricates browser SYSTEM authority',async()=>{
  const {submitExamEvidence}=await loadBridge();
  assert.equal(typeof submitExamEvidence,'function','submitExamEvidence behavior is missing');
  const recorder=recorderSpy();
  const current=exam();
  const result={percent:100,correct:1,total:1,answered:1,unanswered:0,perDomain:{'core-ai':{correct:1,total:1}}};
  const before=structuredClone(result);
  await submitExamEvidence(recorder,current,result,[question()],baseContext());
  assert.deepEqual(result,before,'evidence instrumentation must not mutate scoring results');
  assert.equal(recorder.calls.filter(([name])=>name==='submitAssessment').length,1);
  assert.equal(recorder.calls.filter(([name])=>name==='recordEvaluation').length,0,'browser must not invent trusted SYSTEM evaluation authority');
});

test('Task 29 browser wiring persists evidence runtime for resume and seeds the first offline new-version navigation',()=>{
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const smoke=readFileSync(new URL('../scripts/browser_smoke.py',import.meta.url),'utf8');
  assert.match(app,/evidence\/appBridge\.js/);
  assert.match(app,/evidence_runtime/,'active exam must persist K3 runtime IDs for resume');
  assert.match(app,/data\/evidence\/sdaia-ai-engineer\.objectives-v1\.json/,'browser integration must use the governed public objective projection');
  for(const asset of [
    './src/evidence/appBridge.js',
    './src/evidence/recorder.js',
    './src/evidence/localCapture.js',
    './data/evidence/sdaia-ai-engineer.objectives-v1.json'
  ]) assert.ok(sw.includes(asset),'service worker must pre-cache '+asset);
  assert.match(smoke,/first new-version navigation|update-before-offline|service worker update/i);
});


test('Task 29 publishes an exact public objective projection without exposing factory paths',()=>{
  const canonical=JSON.parse(readFileSync(new URL('../data/factory/knowledge/objectives.json',import.meta.url),'utf8'));
  const runtime=JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8'));
  assert.deepEqual(runtime,canonical,'public objective projection must stay byte-semantically aligned with the canonical registry');
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const builder=readFileSync(new URL('../scripts/build_pages_artifact.js',import.meta.url),'utf8');
  assert.match(app,/data\/evidence\/sdaia-ai-engineer\.objectives-v1\.json/);
  assert.match(sw,/\.\/data\/evidence\/sdaia-ai-engineer\.objectives-v1\.json/);
  assert.doesNotMatch(sw,/\.\/data\/factory\/knowledge\/objectives\.json/);
  assert.match(builder,/data\/evidence\/sdaia-ai-engineer\.objectives-v1\.json/);
  assert.doesNotMatch(builder,/['"]data\/factory\/knowledge\/objectives\.json['"]/);
});
