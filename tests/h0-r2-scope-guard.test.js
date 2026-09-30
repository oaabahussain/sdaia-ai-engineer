import test from 'node:test';
import assert from 'node:assert/strict';
import { checkTaskScope, comparisonBaseSha } from '../scripts/process/check_task_scope.js';
const H40='a'.repeat(40);
const packet={task_id:12,scope:{allowed_create:['a.js'],allowed_modify:['b.js'],allowed_delete:['c.js'],forbidden_paths:['secret/**'],product_scope:'H0_R2'}};
test('allows declared create/modify/delete paths',()=>{
 const r=checkTaskScope(packet,[{path:'a.js',status:'added'},{path:'b.js',status:'modified'},{path:'c.js',status:'removed'}]);
 assert.equal(r.ok,true,JSON.stringify(r.violations));
});
test('blocks unexpected and forbidden paths',()=>{
 for(const changed of [[{path:'x.js',status:'added'}],[{path:'secret/key.txt',status:'added'}]]){
  const r=checkTaskScope(packet,changed); assert.equal(r.ok,false); assert.equal(r.code,'SCOPE_EXPANSION_BLOCKED');
 }
});
test('blocks K3 Task 5 product files during H0-R2 process work',()=>{
 const r=checkTaskScope(packet,[{path:'src/evidence/contract.js',status:'added'}],{processOnly:true});
 assert.equal(r.ok,false); assert.equal(r.code,'SCOPE_EXPANSION_BLOCKED');
});
test('comparison base comes only from envelope task_base_sha',()=>{
 assert.equal(comparisonBaseSha({task_base_sha:H40,base_main_sha:'b'.repeat(40)}),H40);
 assert.throws(()=>comparisonBaseSha({base_main_sha:H40}),/task_base_sha/);
});
