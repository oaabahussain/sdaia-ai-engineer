import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const REQUIRED=[
  './src/recommendations/policy.js','./src/recommendations/publicCatalog.js',
  './src/recommendations/sourceReader.js','./src/recommendations/projection.js',
  './src/recommendations/clock.js','./src/recommendations/ranker.js',
  './src/recommendations/preferencesStore.js','./src/recommendations/practiceSession.js',
  './src/recommendations/browserController.js','./src/evidence/replay.js',
  './src/evidence/corrections.js',
  './data/recommendations/k4-public-catalog-v1.json',
  './data/recommendations/k4-rule-policy-v1.json'
];
test('K4 public shell precaches only allowed code and policies in new cache generation',()=>{
  const sw=readFileSync('sw.js','utf8');
  assert.match(sw,/learning-platform-shell-v2/);
  for(const item of REQUIRED)assert.ok(sw.includes("'"+item+"'"),item+' must be in install precache');
  assert.equal(sw.includes("'./data/factory"),false);
  assert.equal(sw.includes("'./src/platform-kernel"),false);
  assert.equal(sw.includes("'./data/concepts/"),false);
});
test('Pages artifact includes K4 code and public catalog, never private factory',()=>{
  const dir=mkdtempSync(join(tmpdir(),'k4-pages-'));
  const output=join(dir,'site');
  try {
    execFileSync(process.execPath,['scripts/build_pages_artifact.js',output],{stdio:'pipe'});
    for(const item of REQUIRED)assert.equal(existsSync(join(output,item.slice(2))),true,item);
    for(const item of ['data/factory','src/platform-kernel','data/schema/k4-rule-policy-v1.schema.json'])
      assert.equal(existsSync(join(output,item)),false,item);
    execFileSync(process.execPath,['scripts/verify_sw_assets.js',output],{stdio:'pipe'});
    unlinkSync(join(output,'src/recommendations/ranker.js'));
    assert.throws(()=>execFileSync(process.execPath,['scripts/verify_sw_assets.js',output],{stdio:'pipe'}),/Command failed/);
  } finally {rmSync(dir,{recursive:true,force:true})}
});
test('live release verifier checks the new K4 public release identity and assets',()=>{
  const verifier=readFileSync('scripts/verify_live_release.js','utf8');
  assert.match(verifier,/k4-public-catalog-v1.json/);
  assert.match(verifier,/k4-rule-policy-v1.json/);
  assert.match(verifier,/question_payload_sha256/);
  assert.match(verifier,/Response\.error/);
});
