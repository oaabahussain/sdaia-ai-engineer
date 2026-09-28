import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Pages assembly explicitly excludes K2 platform-kernel and private governance data',()=>{
 for(const p of ['.github/workflows/ci.yml','.github/workflows/pages.yml']){
  const src=read(p);
  assert.match(src,/rm -rf _site\/src\/platform-kernel/);
  assert.match(src,/test ! -e _site\/src\/platform-kernel/);
  assert.match(src,/test ! -e _site\/data\/factory/);
  assert.doesNotMatch(src,/cp\s+-R\s+data\/factory/);
 }
});
test('public application has no runtime import from private platform-kernel',()=>{
 const app=read('src/app.js');
 assert.doesNotMatch(app,/platform-kernel/);
});
