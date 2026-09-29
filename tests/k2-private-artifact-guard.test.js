import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Pages assembly explicitly excludes K2 platform-kernel and private governance data',()=>{
 const builder=read('scripts/build_pages_artifact.js');
 assert.match(builder,/src\/platform-kernel/);
 assert.match(builder,/data\/factory/);
 assert.match(builder,/Forbidden Pages artifact path/);
 assert.doesNotMatch(builder,/copyFile\(['\"]data\/factory/);
 for(const p of ['.github/workflows/ci.yml','.github/workflows/pages.yml']){
  const src=read(p);
  assert.match(src,/node scripts\/build_pages_artifact\.js _site/);
  assert.doesNotMatch(src,/cp\s+-R\s+data\/factory/);
 }
});
test('public application has no runtime import from private platform-kernel',()=>{
 const app=read('src/app.js');
 assert.doesNotMatch(app,/platform-kernel/);
});
