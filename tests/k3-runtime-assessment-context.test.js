import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function loadSharedSnapshotApi(){
  try{return await import('../src/assessment/assessmentSnapshot.js');}
  catch{return {};}
}

function runtimeInput(uiMode='full'){
  return {
    form_id:'form:exam-1',
    ui_mode:uiMode,
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    exam_profile_id:'sdaia-ai-engineer.project-reference.v1',
    exam_profile_version:'1',
    scoring_policy_ref:'sdaia-ai-engineer.scoring.v1',
    item_version_ids:['item-1.v1','item-2.v1'],
    option_orders:{'item-1.v1':[2,0,1,3],'item-2.v1':[1,3,0,2]},
    locale:'ar',
    started_at:'2026-10-06T06:00:00.000Z'
  };
}

test('browser strict assessment freezes exact runtime context while full UI mode maps to mock evidence',async()=>{
  const {createBrowserAssessmentContext}=await loadSharedSnapshotApi();
  assert.equal(typeof createBrowserAssessmentContext,'function','browser assessment context behavior is missing');

  const input=runtimeInput('full');
  const context=createBrowserAssessmentContext(input);

  assert.equal(context.ui_mode,'full');
  assert.equal(context.evidence_mode,'mock');
  assert.equal(context.assessment_snapshot.content_release_id,input.content_release_id);
  assert.equal(context.assessment_snapshot.exam_profile_id,input.exam_profile_id);
  assert.equal(context.assessment_snapshot.exam_profile_version,input.exam_profile_version);
  assert.equal(context.assessment_snapshot.scoring_policy_version,input.scoring_policy_ref);
  assert.equal(context.assessment_snapshot.locale,'ar');
  assert.deepEqual(context.assessment_snapshot.item_version_ids,['item-1.v1','item-2.v1']);
  assert.deepEqual(context.assessment_snapshot.option_orders['item-1.v1'],[2,0,1,3]);

  input.item_version_ids[0]='mutated';
  input.option_orders['item-1.v1'][0]=9;
  assert.deepEqual(context.assessment_snapshot.item_version_ids,['item-1.v1','item-2.v1']);
  assert.deepEqual(context.assessment_snapshot.option_orders['item-1.v1'],[2,0,1,3]);
  assert.equal(Object.isFrozen(context.assessment_snapshot),true);
});

test('section UI mode remains section evidence mode',async()=>{
  const {createBrowserAssessmentContext}=await loadSharedSnapshotApi();
  assert.equal(typeof createBrowserAssessmentContext,'function','browser assessment context behavior is missing');
  const context=createBrowserAssessmentContext(runtimeInput('section'));
  assert.equal(context.ui_mode,'section');
  assert.equal(context.evidence_mode,'section');
});

test('platform kernel re-exports shared snapshot logic and browser createExam attaches frozen context',async()=>{
  const shared=await loadSharedSnapshotApi();
  assert.equal(typeof shared.createAssessmentFormSnapshot,'function','shared assessment snapshot export is missing');
  const platform=await import('../src/platform-kernel/release/assessmentSnapshot.js');
  assert.equal(platform.createAssessmentFormSnapshot,shared.createAssessmentFormSnapshot);

  const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/\.\/assessment\/assessmentSnapshot\.js/);
  assert.match(app,/assessment_snapshot/);
  assert.match(app,/evidence_mode/);
});


test('persisted assessment snapshot is rehydrated as an immutable snapshot',async()=>{
  const {createBrowserAssessmentContext,rehydrateAssessmentFormSnapshot}=await loadSharedSnapshotApi();
  assert.equal(typeof rehydrateAssessmentFormSnapshot,'function','snapshot rehydration behavior is missing');
  const original=createBrowserAssessmentContext(runtimeInput('full')).assessment_snapshot;
  const persisted=JSON.parse(JSON.stringify(original));
  assert.equal(Object.isFrozen(persisted),false);
  const restored=rehydrateAssessmentFormSnapshot(persisted);
  assert.equal(Object.isFrozen(restored),true);
  assert.equal(Object.isFrozen(restored.item_version_ids),true);
  assert.equal(Object.isFrozen(restored.option_orders),true);
  assert.deepEqual(restored,original);
});

test('fresh install seeds the browser assessment module for the first offline reload',async()=>{
  const {cacheAssessmentSnapshotModuleForOffline}=await loadSharedSnapshotApi();
  assert.equal(typeof cacheAssessmentSnapshotModuleForOffline,'function','offline assessment module cache behavior is missing');
  const calls=[];
  let readyResolved=false;
  const serviceWorker={ready:Promise.resolve().then(()=>{readyResolved=true;})};
  const cache={add:async url=>{calls.push(['add',url,readyResolved]);}};
  const cachesApi={open:async name=>{calls.push(['open',name,readyResolved]);return cache;}};
  const ok=await cacheAssessmentSnapshotModuleForOffline({
    serviceWorker,
    cachesApi,
    cacheName:'learning-platform-runtime-v1',
    moduleUrl:'/src/assessment/assessmentSnapshot.js'
  });
  assert.equal(ok,true);
  assert.deepEqual(calls,[
    ['open','learning-platform-runtime-v1',true],
    ['add','/src/assessment/assessmentSnapshot.js',true]
  ]);
});

test('browser app wires offline seeding and snapshot rehydration without changing learner mode labels',()=>{
  const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/cacheAssessmentSnapshotModuleForOffline/);
  assert.match(app,/rehydrateAssessmentFormSnapshot/);
  assert.match(app,/mode===['"]full['"]/);
});


test('browser init awaits offline assessment seeding before becoming ready',()=>{
  const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(app,/void\s+cacheAssessmentSnapshotModuleForOffline\(\)/);
  assert.match(app,/async function init\(\)\{try\{await cacheAssessmentSnapshotModuleForOffline\(\);/);
});
