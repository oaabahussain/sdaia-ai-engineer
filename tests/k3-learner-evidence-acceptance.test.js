import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('..',import.meta.url);
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const exists=path=>fs.existsSync(new URL('../'+path,import.meta.url));

const criteria=[
  {id:1,status:'PINNED',evidence:['tests/k3-contract-schemas.test.js','tests/k3-event-vocabulary.test.js','tests/k3-release-boundary.test.js']},
  {id:2,status:'PINNED',evidence:['tests/k3-evidence-recorder.test.js','tests/k3-local-capture.test.js']},
  {id:3,status:'PINNED',evidence:['tests/k3-evidence-integrity.test.js']},
  {id:4,status:'PINNED',evidence:['tests/k3-evidence-integrity.test.js','tests/k3-repair-store-validation.test.js']},
  {id:5,status:'PINNED',evidence:['tests/k3-repair-origin.test.js','tests/k3-local-capture.test.js']},
  {id:6,status:'PINNED',evidence:['tests/k3-assessment-revision.test.js']},
  {id:7,status:'PINNED',evidence:['tests/k3-indexeddb-evidence-store.test.js','tests/k3-app-evidence-integration.test.js']},
  {id:8,status:'PINNED',evidence:['tests/k3-evidence-sync.test.js','tests/k3-storage-sync-capability.test.js']},
  {id:9,status:'PINNED',evidence:['tests/k3-store-conformance.test.js','tests/k3-assessment-revision.test.js']},
  {id:10,status:'PINNED',evidence:['tests/k3-assessment-revision.test.js']},
  {id:11,status:'PINNED',evidence:['tests/k3-attempt-projection.test.js','tests/k3-event-vocabulary.test.js']},
  {id:12,status:'PINNED',evidence:['tests/k3-evidence-corrections.test.js']},
  {id:13,status:'PINNED',evidence:['tests/k3-runtime-assessment-context.test.js','tests/k3-app-evidence-integration.test.js']},
  {id:14,status:'PINNED',evidence:['tests/k3-privacy-lifecycle.test.js']},
  {id:15,status:'PINNED',evidence:['tests/k3-analytics-bridge.test.js','tests/observability-ports.test.js']},
  {id:16,status:'PINNED',evidence:['tests/k3-store-conformance.test.js']},
  {id:17,status:'PINNED',evidence:['tests/k3-legacy-learner-event.test.js','tests/k3-state-transition.test.js']},
  {id:18,status:'PINNED',evidence:['tests/k3-activity-projection.test.js','tests/k3-attempt-projection.test.js','tests/k3-evidence-replay.test.js']},
  {id:19,status:'PINNED',evidence:['tests/k3-xapi-adapter.test.js','tests/k3-caliper-adapter.test.js','tests/k3-learning-event-exchange.test.js']},
  {id:20,status:'PINNED',evidence:['tests/k3-xapi-adapter.test.js','tests/k3-caliper-adapter.test.js']},
  {id:21,status:'FUTURE_GATE',owner_task:37},
  {id:22,status:'FUTURE_GATE',owner_task:38},
  {id:23,status:'FUTURE_GATE',owner_task:39},
  {id:24,status:'FUTURE_GATE',owner_task:40},
  {id:25,status:'FUTURE_GATE',owner_task:41}
];

test('Task 36 covers spec section 47 one-for-one without declaring future gates complete',()=>{
  assert.deepEqual(criteria.map(x=>x.id),Array.from({length:25},(_,i)=>i+1));
  for(const row of criteria.filter(x=>x.status==='PINNED')){
    assert.equal(row.status,'PINNED');
    assert.ok(Array.isArray(row.evidence)&&row.evidence.length,row.id);
    for(const path of row.evidence) assert.equal(exists(path),true,`criterion ${row.id} missing executable evidence file: ${path}`);
  }
  assert.deepEqual(criteria.slice(20).map(x=>({id:x.id,status:x.status,owner_task:x.owner_task})),[
    {id:21,status:'FUTURE_GATE',owner_task:37},
    {id:22,status:'FUTURE_GATE',owner_task:38},
    {id:23,status:'FUTURE_GATE',owner_task:39},
    {id:24,status:'FUTURE_GATE',owner_task:40},
    {id:25,status:'FUTURE_GATE',owner_task:41}
  ]);
});

test('Task 36 acceptance evidence files are all executed by the repository Node test contract',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.test,'node --test tests/*.test.js');
  for(const row of criteria.filter(x=>x.status==='PINNED')){
    for(const path of row.evidence){
      assert.match(path,/^tests\/.*\.test\.js$/);
    }
  }
});

test('Task 36 protects the exact learner-visible question payload digest',()=>{
  const runtime=JSON.parse(read('data/evidence/sdaia-ai-engineer.runtime-v1.json'));
  assert.equal(runtime.question_payload_sha256,'5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9');
});

test('Task 36 does not use analytics or derived learner scores as K3 acceptance evidence',()=>{
  const claims=JSON.stringify(criteria);
  const forbidden=[
    'engagement'+'_score',
    'mastery'+'_score',
    'readiness'+'_score',
    'irt'+'_ability'
  ];
  for(const name of forbidden) assert.equal(claims.includes(name),false,name);
});

test('Task 36 browser acceptance keeps bilingual, full-exam, offline, and evidence-runtime coverage explicit',()=>{
  const smoke=read('scripts/browser_smoke.py');
  assert.match(smoke,/EXPECTED_FULL/);
  assert.match(smoke,/EXPECTED_BANK/);
  assert.match(smoke,/first new-version navigation offline/);
  assert.match(smoke,/offline cached home reload/);
  assert.match(smoke,/evidence|learner/i);
  assert.match(smoke,/document\.documentElement\.dir/);
});

test('Task 36 repository state must not claim K3 complete before Tasks 37-41',()=>{
  const state=JSON.parse(read('docs/superpowers/state/CURRENT-STATE.json'));
  assert.notEqual(state.status,'COMPLETE');
  assert.ok(state.next_task<=37,'Task 36 cannot skip documentation/review/finalization gates');
});


test('Task 36 browser acceptance observes fine-grained learner evidence durably stored in IndexedDB',()=>{
  const smoke=read('scripts/browser_smoke.py');
  assert.match(smoke,/learning-platform\.evidence\.v1\./,'browser smoke must open the governed K3 evidence database');
  assert.match(smoke,/objectStore\(['"]events['"]\).*getAll|objectStore\(['"]events['"]\)[\s\S]*getAll/,'browser smoke must read durable evidence rows');
  for(const definition of [
    'learner.activity.started@1',
    'learner.item.presented@1',
    'learner.response.recorded@1',
    'learner.confidence.recorded@1'
  ]) assert.ok(smoke.includes(definition),definition);
  assert.match(smoke,/durable learner evidence/i);
});


test('Wave review: documentation acceptance remains a Task 37 future gate',()=>{
  const row=criteria.find(x=>x.id===21);
  assert.deepEqual(row,{id:21,status:'FUTURE_GATE',owner_task:37});
});
