import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePublicCatalog, eligiblePublicItems } from '../src/recommendations/publicCatalog.js';

const release = 'sdaia-ai-engineer.bootstrap.v1';
const digest = '5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const family = 'sdaia-ai-engineer.core-ai.reasoning.definition.best-description';
const version = family+'.v1';
const objective = 'sdaia-ai-engineer.objective.core-ai.reasoning.v1';
function fixture() {
  const entry={question_family_id:family,item_version_id:version,objective_id:objective,domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'};
  return {
    catalog:{schema_version:1,catalog_id:'sdaia-ai-engineer.public.bootstrap.v1',track_id:'sdaia-ai-engineer',content_release_id:release,question_payload_sha256:digest,source:'MIGRATED_GRANDFATHERED_PUBLIC',items:[entry]},
    trackManifest:{id:'sdaia-ai-engineer',status:'active'},
    evidenceContext:{content_release_id:release,question_payload_sha256:digest},
    publicQuestions:[{id:version,family_id:family,domain_id:'core-ai',answer:2,options:['a','b','c','d']}],
    objectives:{track_id:'sdaia-ai-engineer',objectives:[{objective_id:objective,track_id:'sdaia-ai-engineer',domain_id:'core-ai',concept_ids:['core-ai.reasoning'],status:'provisional'}]}
  };
}

test('K4 only emits published public item identifiers, no answers', () => {
  const x=fixture(), checked=validatePublicCatalog(x);
  const options=eligiblePublicItems({catalog:checked,releaseId:release,availableIds:[version]});
  assert.equal(options.length,1);
  assert.deepEqual(options[0],{question_family_id:family,item_version_id:version,objective_id:objective,domain_id:'core-ai'});
  assert.equal(JSON.stringify(options).includes('answer'),false);
});

test('K4 rejects invented or mismatched release, runtime and provenance', () => {
  const x=fixture();
  assert.throws(()=>validatePublicCatalog({...x,evidenceContext:{...x.evidenceContext,content_release_id:'other'}}));
  assert.throws(()=>validatePublicCatalog({...x,catalog:{...x.catalog,question_payload_sha256:'a'.repeat(64)}}));
  assert.throws(()=>validatePublicCatalog({...x,publicQuestions:[]}));
});

test('protected, holdout or duplicate candidates cannot be shipped as public', () => {
  for (const visibility of ['PROTECTED','HOLDOUT','FACTORY_ONLY']) {
    const x=fixture();
    x.catalog.items[0].visibility=visibility;
    assert.throws(()=>validatePublicCatalog(x));
  }
  const x=fixture();
  x.catalog.items.push({...x.catalog.items[0]});
  assert.throws(()=>validatePublicCatalog(x));
});

test('unavailable version and unknown release never yields a deep-link action', () => {
  const x=fixture(), catalog=validatePublicCatalog(x);
  assert.deepEqual(eligiblePublicItems({catalog,releaseId:release,availableIds:[]}),[]);
  assert.throws(()=>eligiblePublicItems({catalog,releaseId:'unknown',availableIds:[version]}));
});

test('exact frozen bootstrap list covers the current 1120 released public runtime IDs', () => {
  const catalog=JSON.parse(readFileSync(new URL('../data/recommendations/k4-public-catalog-v1.json',import.meta.url),'utf8'));
  const migration=JSON.parse(readFileSync(new URL('../data/migrations/sdaia-generated-v2-question-ids.json',import.meta.url),'utf8'));
  const objectives=JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8'));
  const evidence=JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.runtime-v1.json',import.meta.url),'utf8'));
  const track=JSON.parse(readFileSync(new URL('../tracks/sdaia-ai-engineer/manifest.json',import.meta.url),'utf8'));
  const ids=Object.values(migration);
  assert.equal(ids.length,1120);
  const questions=ids.map(id=>({id,family_id:id.slice(0,-3),domain_id:catalog.items.find(i=>i.item_version_id===id)?.domain_id}));
  const result=validatePublicCatalog({catalog,trackManifest:track,evidenceContext:evidence,publicQuestions:questions,objectives});
  assert.equal(result.items.length,1120);
  assert.deepEqual(result.items.map(i=>i.item_version_id).sort(),[...ids].sort());
  assert.equal(result.question_payload_sha256,digest);
  assert.equal(eligiblePublicItems({catalog:result,releaseId:release,availableIds:ids}).length,1120);
});

test('AC-09: a protected sibling version in availability cannot replace the public item', () => {
  const c=validatePublicCatalog(fixture());
  const holdout=family+'.v2';
  const result=eligiblePublicItems({
    catalog:c,releaseId:release,availableIds:[holdout,version]
  });
  assert.deepEqual(result.map(x=>x.item_version_id),[version]);
  assert.equal(JSON.stringify(result).includes(holdout),false);
  assert.deepEqual(eligiblePublicItems({
    catalog:c,releaseId:release,availableIds:[holdout]
  }),[],'never fall back to protected sibling when public version unavailable');
  const forbidden=fixture();
  forbidden.catalog.items[0].item_version_id=holdout;
  forbidden.catalog.items[0].visibility='HOLDOUT';
  forbidden.publicQuestions[0].id=holdout;
  assert.throws(()=>validatePublicCatalog(forbidden),
    /public|protected|malformed/i);
});
