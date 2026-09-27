const K1_ACCEPTANCE=process.env.K1_ACCEPTANCE==='1';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exists=p=>fs.existsSync(new URL('../'+p,import.meta.url));
const required=[
  'data/schema/learning-objective-v1.schema.json',
  'data/schema/evidence-source-v1.schema.json',
  'data/schema/question-family-v2.schema.json',
  'data/schema/item-version-v1.schema.json',
  'data/schema/quality-report-v1.schema.json',
  'data/schema/provenance-record-v1.schema.json',
  'data/schema/review-decision-v1.schema.json',
  'data/schema/source-policy-v1.schema.json',
  'data/schema/quality-policy-v1.schema.json',
  'data/schema/review-policy-v1.schema.json',
  'data/schema/factory-run-v1.schema.json',
  'data/schema/provider-result-v1.schema.json',
  'data/schema/provider-evaluation-v1.schema.json',
  'data/schema/coverage-gap-v1.schema.json',
  'data/schema/content-release-manifest-v1.schema.json',
  'data/schema/assessment-form-snapshot-v1.schema.json',
  'data/schema/learner-event-v1.schema.json',
  'src/platform-kernel/factory/stateMachine.js',
  'data/factory/migrations/sdaia-current-bank-v1.json',
  'data/factory/releases/sdaia-bootstrap-v1.manifest.json'
];

(K1_ACCEPTANCE?test:test.skip)('K1 required contracts and bootstrap artifacts exist',()=>{
  const missing=required.filter(p=>!exists(p));
  assert.deepEqual(missing,[]);
});

(K1_ACCEPTANCE?test:test.skip)('K1 state machine forbids GENERATED to ACTIVE',async()=>{
  const mod=await import('../src/platform-kernel/factory/stateMachine.js');
  assert.equal(mod.canTransitionFactoryState('GENERATED','activate'),false);
});

(K1_ACCEPTANCE?test:test.skip)('public release workflows do not copy private factory governance artifacts',()=>{
  for(const p of ['.github/workflows/ci.yml','.github/workflows/pages.yml']){
    const src=fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
    assert.doesNotMatch(src,/cp\s+-r\s+data\/factory|_site\/data\/factory/);
  }
});
