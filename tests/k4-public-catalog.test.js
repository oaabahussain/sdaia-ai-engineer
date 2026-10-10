import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
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

test('AC-09 live factory RELEASE manifest has precisely the 1120 approved public IDs',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../data/factory/releases/sdaia-bootstrap-v1.manifest.json',import.meta.url),'utf8'));
  const catalog=JSON.parse(readFileSync(new URL('../data/recommendations/k4-public-catalog-v1.json',import.meta.url),'utf8'));
  assert.equal(manifest.release_id,catalog.content_release_id);
  assert.equal(manifest.track_id,catalog.track_id);
  assert.equal(manifest.item_version_ids.length,1120);
  assert.equal(new Set(manifest.item_version_ids).size,1120);
  assert.deepEqual([...manifest.item_version_ids].sort(),catalog.items.map(i=>i.item_version_id).sort());
  assert.ok(catalog.items.every(i=>i.visibility==='PUBLIC'&&i.lifecycle==='ACTIVE'));
  assert.equal(manifest.origin,'migrated-grandfathered');
  // Not a real private/holdout corpus inventory: this release manifest is only the public migration.
});
test('AC-09 assembled Pages output excludes factory, legacy and protected governance trees',()=>{
  const root=mkdtempSync(join(tmpdir(),'k4-public-boundary-'));
  const site=join(root,'site');
  try{
    const built=spawnSync(process.execPath,['scripts/build_pages_artifact.js',site],{
      cwd:process.cwd(),encoding:'utf8',timeout:45000
    });
    assert.equal(built.status,0,built.stderr||built.stdout);
    for(const privatePath of ['data/factory','data/legacy','src/platform-kernel','.git','node_modules'])
      assert.equal(existsSync(join(site,privatePath)),false,'Forbidden Pages subtree: '+privatePath);
    const paths=[];
    function walk(dir,rel=''){
      for(const ent of readdirSync(dir,{withFileTypes:true})){
        const child=join(rel,ent.name),target=join(dir,ent.name);
        assert.equal(ent.isSymbolicLink(),false,'Pages cannot contain symlink: '+child);
        if(ent.isDirectory())walk(target,child);
        else{
          assert.equal(ent.isFile(),true);
          assert.ok(statSync(target).size>=0);
          paths.push(child.replaceAll('\\','/'));
        }
      }
    }
    walk(site);
    assert.ok(paths.length>40,'real assembled output inspected');
    assert.ok(paths.every(path=>!/(^|\/)(factory|legacy|platform-kernel|holdout)(\/|$)/i.test(path)));
    assert.ok(paths.every(path=>!path.endsWith('.ndjson')),'factory NDJSON may not enter Pages');
    const shipped=JSON.parse(readFileSync(join(site,'data/recommendations/k4-public-catalog-v1.json'),'utf8'));
    assert.equal(shipped.items.length,1120);
    assert.ok(shipped.items.every(x=>x.visibility==='PUBLIC'));
  }finally{rmSync(root,{recursive:true,force:true})}
});
