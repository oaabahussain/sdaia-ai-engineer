import { validateAcceptedRed } from './validate_accepted_red.js';
import { checkTaskScope } from './check_task_scope.js';
export function validateTaskResult(x){
 const failures=[];
 const red=validateAcceptedRed(x.acceptedRed,x.currentRed); if(!red.ok)failures.push(red.code);
 if(!x.green?.ok)failures.push('GREEN_FAILED');
 if(!x.regression?.ok)failures.push('REGRESSION_FAILED');
 const scope=checkTaskScope(x.packet,x.changedPaths??[]); if(!scope.ok)failures.push(scope.code);
 if(x.liveMainSha!==x.envelope?.base_main_sha)failures.push('MAIN_DRIFT');
 if(x.currentStateRevision!==x.envelope?.state_revision)failures.push('STATE_DRIFT');
 if(x.commitMessage!==x.packet?.commit?.message)failures.push('COMMIT_MESSAGE_MISMATCH');
 const durable=x.durableEvidence;
 if(!durable?.ledger_entry||!durable?.checkpoint){
  return {ok:false,code:'IMPLEMENTED_NOT_CHECKPOINTED',failures:[...failures,'DURABLE_EVIDENCE_MISSING']};
 }
 return failures.length?{ok:false,code:'TASK_RESULT_REJECTED',failures}:{ok:true,code:'TASK_RESULT_ACCEPTED',failures:[]};
}
