import { validateAcceptedRed } from './validate_accepted_red.js';
import { checkTaskScope } from './check_task_scope.js';
export function validateTaskResult(x){
 const failures=[]; const state=x.state??{};
 const red=validateAcceptedRed(x.acceptedRed,x.currentRed); if(!red.ok)failures.push(red.code);
 if(!x.green?.ok)failures.push('GREEN_FAILED');
 if(!x.regression?.ok)failures.push('REGRESSION_FAILED');
 const scope=checkTaskScope(x.packet,x.changedPaths??[]); if(!scope.ok)failures.push(scope.code);
 if(x.liveMainSha!==x.envelope?.base_main_sha||state.base_main_sha!==x.envelope?.base_main_sha)failures.push('MAIN_DRIFT');
 if(x.currentStateRevision!==x.envelope?.state_revision||state.state_revision!==x.envelope?.state_revision)failures.push('STATE_DRIFT');
 if(state.execution_branch!==x.envelope?.execution_branch)failures.push('EXECUTION_BRANCH_DRIFT');
 if(x.packet?.authority?.spec_blob_sha!==state.spec_blob_sha||x.packet?.authority?.plan_blob_sha!==state.plan_blob_sha)failures.push('PLAN_SPEC_HASH_MISMATCH');
 if(x.currentSource?.spec_blob_sha!==x.packet?.authority?.spec_blob_sha||x.currentSource?.plan_blob_sha!==x.packet?.authority?.plan_blob_sha||x.currentSource?.task_source_digest!==x.packet?.authority?.task_source_digest)failures.push('TASK_PACKET_STALE');
 if(x.currentSource?.source_contract_digest!==x.packet?.source_contract_digest)failures.push('TASK_PACKET_STALE');
 if(state.last_completed_task_base_sha!==x.envelope?.task_base_sha)failures.push('TASK_BASE_CHECKPOINT_DRIFT');
 if((state.open_critical_findings??0)>0||(state.open_important_findings??0)>0)failures.push('OPEN_FINDING_BLOCKED');
 if(x.commitMessage!==x.packet?.commit?.message)failures.push('COMMIT_MESSAGE_MISMATCH');
 const durable=x.durableEvidence;
 if(!durable?.ledger_entry||!durable?.checkpoint){
  return {ok:false,code:'IMPLEMENTED_NOT_CHECKPOINTED',failures:[...failures,'DURABLE_EVIDENCE_MISSING']};
 }
 if(!durable.required_fields)failures.push('DURABLE_EVIDENCE_INCOMPLETE');
 return failures.length?{ok:false,code:'TASK_RESULT_REJECTED',failures}:{ok:true,code:'TASK_RESULT_ACCEPTED',failures:[]};
}
