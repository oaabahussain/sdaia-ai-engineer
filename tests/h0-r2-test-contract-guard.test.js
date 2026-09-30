import test from 'node:test';
import assert from 'node:assert/strict';
import { checkTestContracts } from '../scripts/process/check_test_contracts.js';
test('rejects known inline YAML cp -R implementation coupling',()=>{
 const r=checkTestContracts([{path:'tests/workflow.test.js',content:"assert.match(yaml, /cp -R public\\/\\. dist/);"}]);
 assert.equal(r.ok,false); assert.equal(r.code,'IMPLEMENTATION_COUPLING_BLOCKED');
});
test('allows artifact-boundary behavior and normative workflow structure',()=>{
 const r=checkTestContracts([
  {path:'tests/artifact.test.js',content:"assert.equal(existsSync('dist/index.html'), true); assert.equal(digestA,digestB);"},
  {path:'tests/ci.test.js',content:"assert.match(yaml, /quality-gate/); assert.match(yaml, /actions\\/checkout@[0-9a-f]{40}/); assert.doesNotMatch(yaml, /paths-ignore/);"}
 ]); assert.equal(r.ok,true,JSON.stringify(r.findings));
});
test('does not globally ban unknown patterns without a registry rule',()=>{
 const r=checkTestContracts([{path:'tests/x.test.js',content:"assert.match(text, /some future implementation detail/);"}]);
 assert.equal(r.ok,true,JSON.stringify(r.findings));
});
