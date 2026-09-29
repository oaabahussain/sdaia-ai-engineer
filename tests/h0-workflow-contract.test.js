import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ci = readFileSync('.github/workflows/ci.yml','utf8');
const pages = readFileSync('.github/workflows/pages.yml','utf8');
const server = readFileSync('.github/workflows/server-tests.yml','utf8');

const pins = [
  'actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803',
  'actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444',
  'actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1',
  'actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b',
  'actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b',
  'actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e'
];

test('required workflow checks have unique stable identities',()=>{
  assert.match(ci,/jobs:\s*\n\s{2}quality-gate:/);
  assert.match(server,/jobs:\s*\n\s{2}server-adapter-gate:/);
  assert.doesNotMatch(ci,/\n\s{2}test:/);
  assert.doesNotMatch(server,/\n\s{2}test:/);
});

test('PR workflows cancel superseded runs without path-filtering required checks',()=>{
  for(const [name,src] of [['ci',ci],['server',server]]){
    assert.match(src,/concurrency:/,name);
    assert.match(src,/cancel-in-progress:\s*true/,name);
    assert.doesNotMatch(src,/paths-ignore:/,name);
  }
});

test('node and python dependency caches are explicit',()=>{
  assert.match(ci,/cache:\s*['"]?npm['"]?/);
  assert.match(server,/cache:\s*['"]?npm['"]?/);
  assert.match(server,/cache:\s*['"]?pip['"]?/);
  assert.match(server,/cache-dependency-path:\s*server\/requirements\.txt/);
});

test('CI and Pages share the repository Pages artifact builder',()=>{
  for(const [name,src] of [['ci',ci],['pages',pages]]){
    assert.match(src,/node scripts\/build_pages_artifact\.js _site/,name);
    assert.doesNotMatch(src,/cp index\.html feedback\.html manifest\.webmanifest/,name);
  }
});

test('critical GitHub Actions are pinned to immutable SHAs',()=>{
  const all = ci+'\n'+pages+'\n'+server;
  for(const pin of pins) assert.ok(all.includes(pin),pin);
  assert.doesNotMatch(all,/actions\/(?:checkout|setup-node|setup-python|configure-pages|upload-pages-artifact|deploy-pages)@v\d+/);
});
