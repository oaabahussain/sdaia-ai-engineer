import test from 'node:test';
import assert from 'node:assert/strict';
import { preflightTask } from '../scripts/process/preflight_task.js';
import { stableJson, sha256Text } from '../scripts/process/stable_json.js';
const H40='a'.repeat(40), H64='b'.repeat(64);
function fixture(){
 const brief='approved task brief\n';
 const packet={schema_version:1,packet_version:1,programme:'K3',task_id:5,task_title:'t',authority:{spec_path:'s',spec_blob_sha:H40,plan_path:'p',plan_blob_sha:H40,task_source_digest:sha256Text(brief),process_failure_rules_revision:'r',process_failure_rules_digest:H64},purpose:'p',phase:'A',dependencies:[4],scope:{allowed_create:[],allowed_modify:[],allowed_delete:[],forbidden_paths:[],product_scope:'K3_TASK_5'},interfaces:{consumes:[],produces:[]},red:{command:'node --test x',expected_failure_class:'ASSERTION_FAILURE',expected_failure_description:'missing',invalid_failure_classes:[]},implementation:{intent:'i',prohibited_inventions:[]},green:{command:'node --test x',expected_result:'PASS'},regression:{command:'npm test',expected_result:'PASS'},commit:{message:'feat: x'},stop_conditions:['PLAN_DECISION_REQUIRED'],required_skills:[],runtime_requirements:[],merge_authority:false,source_contract_digest:H64};
 const state={state_revision:2,next_task:5,base_main_sha:H40,execution_branch:'impl/k3',spec_blob_sha:H40,plan_blob_sha:H40,project_bootstrap_revision:'r1',open_critical_findings:0,open_important_findings:0,gates:{PROJECT_BOOTSTRAP_CURRENT:'PASS'}};
 const runtime={schema_version:1,profile_version:1,capabilities:{skill_discovery:'AVAILABLE',file_access:'AVAILABLE',shell_execution:'AVAILABLE',git_worktree:'AVAILABLE',github_write:'AVAILABLE',web_search:'AVAILABLE',durable_workspace:'AVAILABLE',subagent_review:'UNKNOWN',fresh_context_review:'UNKNOWN',project_file_mutation:'UNKNOWN'}};
 const envelope={schema_version:1,envelope_version:1,task_id:5,task_packet_digest:sha256Text(stableJson(packet)),state_revision:2,base_main_sha:H40,task_base_sha:'c'.repeat(40),execution_branch:'impl/k3',project_bootstrap_revision:'r1',runtime_capability_profile_digest:sha256Text(stableJson(runtime)),created_from_ref:'impl/k3',preflight_gate_set:[]};
 return {packet,state,runtime,envelope,brief,liveMainSha:H40,deterministicPacket:true,failureRulesDigest:H64,executionLintOk:true};
}
test('all gates pass only for a fresh deterministic current task',()=>{const r=preflightTask(fixture());assert.equal(r.ok,true,JSON.stringify(r.failures));assert.equal(r.code,'TASK_EXECUTION_READY_PASS');});
test('fails closed on stale brief, main, task, bootstrap, findings, merge authority, runtime, determinism, or missing stop condition',()=>{
 const mutations=[
  x=>{x.brief='changed\n'},x=>{x.liveMainSha='d'.repeat(40)},x=>{x.state.next_task=6},x=>{x.state.gates.PROJECT_BOOTSTRAP_CURRENT='FAIL'},
  x=>{x.state.open_critical_findings=1},x=>{x.packet.merge_authority=true},x=>{x.packet.runtime_requirements=['git_worktree'];x.runtime.capabilities.git_worktree='UNAVAILABLE'},
  x=>{x.deterministicPacket=false},x=>{x.packet.stop_conditions=[]},x=>{x.executionLintOk=false}
 ];
 for(const mutate of mutations){const x=fixture();mutate(x);const r=preflightTask(x);assert.equal(r.ok,false);assert.equal(r.code,'TASK_EXECUTION_READY_FAIL');assert.ok(r.failures.length);}
});
