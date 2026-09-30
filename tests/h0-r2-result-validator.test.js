import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskResult } from '../scripts/process/validate_task_result.js';
const H40='a'.repeat(40),H64='b'.repeat(64);
function x(){
 const packet={commit:{message:'feat: x'},scope:{allowed_create:['x.js'],allowed_modify:[],allowed_delete:[],forbidden_paths:[]}};
 const accepted={failure_class:'ASSERTION_FAILURE',command:'node --test x',test_hashes:{'t.js':H64},fixture_hashes:{},evidence_digest:H64};
 return {packet,envelope:{task_base_sha:H40,state_revision:2,base_main_sha:H40},acceptedRed:accepted,currentRed:{failure_class:'ASSERTION_FAILURE',command:'node --test x',test_hashes:{'t.js':H64},fixture_hashes:{}},green:{ok:true},regression:{ok:true},changedPaths:[{path:'x.js',status:'added'}],liveMainSha:H40,currentStateRevision:2,commitMessage:'feat: x',durableEvidence:{ledger_entry:true,checkpoint:true}};
}
test('accepts complete unchanged task result',()=>{const r=validateTaskResult(x());assert.equal(r.ok,true,JSON.stringify(r.failures));assert.equal(r.code,'TASK_RESULT_ACCEPTED');});
test('rejects mutation, green/regression fail, scope, drift, commit, or missing durable evidence',()=>{
 const ms=[v=>{v.currentRed.test_hashes['t.js']='c'.repeat(64)},v=>{v.green.ok=false},v=>{v.regression.ok=false},v=>{v.changedPaths=[{path:'oops.js',status:'added'}]},v=>{v.liveMainSha='d'.repeat(40)},v=>{v.currentStateRevision=3},v=>{v.commitMessage='wrong'},v=>{v.durableEvidence=null}];
 for(const m of ms){const v=x();m(v);const r=validateTaskResult(v);assert.equal(r.ok,false);assert.notEqual(r.code,'TASK_RESULT_ACCEPTED');}
});
test('reports implemented-not-checkpointed recovery state',()=>{const v=x();v.durableEvidence={ledger_entry:false,checkpoint:false};const r=validateTaskResult(v);assert.equal(r.code,'IMPLEMENTED_NOT_CHECKPOINTED');});
