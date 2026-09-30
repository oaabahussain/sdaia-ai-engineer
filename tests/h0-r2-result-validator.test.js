import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskResult } from '../scripts/process/validate_task_result.js';
const H40='a'.repeat(40),H40B='c'.repeat(40),H64='b'.repeat(64);
function x(){
 const packet={authority:{spec_blob_sha:H40,plan_blob_sha:H40,task_source_digest:H64},source_contract_digest:H64,commit:{message:'feat: x'},scope:{allowed_create:['x.js'],allowed_modify:[],allowed_delete:[],forbidden_paths:[]}};
 const accepted={failure_class:'ASSERTION_FAILURE',command:'node --test x',test_hashes:{'t.js':H64},fixture_hashes:{},evidence_digest:H64};
 const state={state_revision:2,base_main_sha:H40,execution_branch:'impl/k3',spec_blob_sha:H40,plan_blob_sha:H40,open_critical_findings:0,open_important_findings:0,last_completed_task_base_sha:H40B};
 return {packet,state,envelope:{task_base_sha:H40B,state_revision:2,base_main_sha:H40,execution_branch:'impl/k3'},acceptedRed:accepted,currentRed:{failure_class:'ASSERTION_FAILURE',command:'node --test x',test_hashes:{'t.js':H64},fixture_hashes:{}},green:{ok:true},regression:{ok:true},changedPaths:[{path:'x.js',status:'added'}],liveMainSha:H40,currentStateRevision:2,currentSource:{spec_blob_sha:H40,plan_blob_sha:H40,task_source_digest:H64,source_contract_digest:H64},commitMessage:'feat: x',durableEvidence:{ledger_entry:true,checkpoint:true,required_fields:true}};
}
test('accepts complete unchanged task result',()=>{const r=validateTaskResult(x());assert.equal(r.ok,true,JSON.stringify(r.failures));assert.equal(r.code,'TASK_RESULT_ACCEPTED');});
test('rejects RED mutation, green/regression fail, scope, main/state/source/branch/checkpoint drift, findings, commit, or incomplete evidence',()=>{
 const ms=[
  v=>{v.currentRed.test_hashes['t.js']='d'.repeat(64)},v=>{v.green.ok=false},v=>{v.regression.ok=false},v=>{v.changedPaths=[{path:'oops.js',status:'added'}]},
  v=>{v.liveMainSha='d'.repeat(40)},v=>{v.currentStateRevision=3},v=>{v.currentSource.spec_blob_sha='d'.repeat(40)},v=>{v.currentSource.source_contract_digest='d'.repeat(64)},
  v=>{v.state.execution_branch='impl/other'},v=>{v.state.last_completed_task_base_sha='d'.repeat(40)},v=>{v.state.open_important_findings=1},v=>{v.commitMessage='wrong'},v=>{v.durableEvidence.required_fields=false}
 ];
 for(const m of ms){const v=x();m(v);const r=validateTaskResult(v);assert.equal(r.ok,false);assert.notEqual(r.code,'TASK_RESULT_ACCEPTED');}
});
test('reports implemented-not-checkpointed recovery state',()=>{const v=x();v.durableEvidence={ledger_entry:false,checkpoint:false,required_fields:false};const r=validateTaskResult(v);assert.equal(r.code,'IMPLEMENTED_NOT_CHECKPOINTED');});
