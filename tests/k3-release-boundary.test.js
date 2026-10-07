import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

async function loadValidator(){
  return import('../scripts/validate.js?task35='+Date.now()+'-'+Math.random());
}

function fixtureRoot(){
  const root=mkdtempSync(join(tmpdir(),'k3-release-boundary-'));
  cpSync(fileURLToPath(new URL('../data/schema',import.meta.url)),join(root,'data/schema'),{recursive:true});
  cpSync(fileURLToPath(new URL('../data/evidence',import.meta.url)),join(root,'data/evidence'),{recursive:true});
  return root;
}

test('Task 35 exports a focused K3 release-artifact validator and current governed artifacts pass',async()=>{
  const api=await loadValidator();
  assert.equal(typeof api.validateK3ReleaseArtifacts,'function','K3 release artifact validator is missing');
  assert.equal(api.validateK3ReleaseArtifacts(fileURLToPath(new URL('..',import.meta.url))),true);
});

test('Task 35 validator fails closed on a corrupted xAPI mapping version',async()=>{
  const api=await loadValidator();
  assert.equal(typeof api.validateK3ReleaseArtifacts,'function','K3 release artifact validator is missing');
  const root=fixtureRoot();
  try{
    const p=join(root,'data/evidence/mappings/xapi-v1.json');
    const value=JSON.parse(readFileSync(p,'utf8'));
    value.mapping_version='unversioned-bad';
    writeFileSync(p,JSON.stringify(value));
    assert.throws(()=>api.validateK3ReleaseArtifacts(root),/xAPI|mapping|version/i);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('Task 35 validator fails closed when an EventDefinitionV2 payload schema reference is missing',async()=>{
  const api=await loadValidator();
  assert.equal(typeof api.validateK3ReleaseArtifacts,'function','K3 release artifact validator is missing');
  const root=fixtureRoot();
  try{
    const p=join(root,'data/evidence/event-definitions-v1.json');
    const defs=JSON.parse(readFileSync(p,'utf8'));
    defs[0].payload_schema_ref='data/evidence/payload-schemas/missing.schema.json';
    writeFileSync(p,JSON.stringify(defs));
    assert.throws(()=>api.validateK3ReleaseArtifacts(root),/payload|schema|missing/i);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('Task 35 assembled Pages artifact contains runtime evidence but excludes private K3/factory/server data',()=>{
  const out=mkdtempSync(join(tmpdir(),'k3-pages-boundary-'));
  try{
    execFileSync(process.execPath,['scripts/build_pages_artifact.js',out],{cwd:fileURLToPath(new URL('..',import.meta.url)),stdio:'pipe'});
    for(const required of [
      'data/evidence/sdaia-ai-engineer.runtime-v1.json',
      'data/evidence/event-definitions-v1.json',
      'data/evidence/payload-schemas'
    ]) assert.doesNotThrow(()=>readFileSync(join(out,required)));
    for(const forbidden of [
      'data/evidence/mappings/xapi-v1.json',
      'data/evidence/mappings/caliper-v1.json',
      'data/factory/knowledge/objectives.json',
      'server/app/main.py',
      'src/platform-kernel/interoperability/xapi.js'
    ]) assert.throws(()=>readFileSync(join(out,forbidden)));
  }finally{rmSync(out,{recursive:true,force:true});}
});
