import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateTaskDefinitionPacket } from './validate_task_packet.js';
import { validateTaskExecutionEnvelope } from './bind_task_execution.js';
import { requireCapabilities, validateRuntimeCapabilityProfile } from './runtime_capabilities.js';
import { stableJson, sha256Text } from './stable_json.js';
import { compileTaskPacket, gitBlobSha } from './compile_k3_task_packets.js';
import { lintExecutionContracts } from './lint_execution_contracts.js';
import { validateFailureRules, failureRulesDigest } from './validate_failure_rules.js';
import { validateCurrentState } from '../validate_current_state.js';

export function preflightTask(x){
 const failures=[]; const {packet,state,runtime,envelope}=x;
 const add=(code,ok)=>{if(!ok)failures.push(code);};
 add('STATE_VALID',Boolean(state&&Number.isInteger(state.state_revision))&&x.stateValid!==false);
 add('PLAN_SPEC_HASH_MATCH',packet?.authority?.spec_blob_sha===state?.spec_blob_sha&&packet?.authority?.plan_blob_sha===state?.plan_blob_sha&&x.authorityHashesMatch!==false);
 add('MAIN_BASE_MATCH',Boolean(state?.base_main_sha)&&state.base_main_sha===x.liveMainSha);
 add('TASK_ID_MATCHES_NEXT_TASK',packet?.task_id===state?.next_task);
 add('TASK_PACKET_VALID',validateTaskDefinitionPacket(packet).ok);
 add('TASK_PACKET_FRESH',sha256Text(x.brief??'')===packet?.authority?.task_source_digest);
 add('TASK_PACKET_DETERMINISTIC',x.deterministicPacket===true);
 add('PROCESS_FAILURE_RULES_MATCH',packet?.authority?.process_failure_rules_digest===x.failureRulesDigest);
 add('TASK_EXECUTION_ENVELOPE_VALID',validateTaskExecutionEnvelope(envelope).ok);
 add('TASK_EXECUTION_ENVELOPE_FRESH',envelope?.task_packet_digest===sha256Text(stableJson(packet))&&envelope?.state_revision===state?.state_revision
  &&typeof x.currentHeadSha==='string'&&envelope?.task_base_sha===x.currentHeadSha
  &&envelope?.task_id===packet?.task_id
  &&envelope?.base_main_sha===state?.base_main_sha
  &&envelope?.created_from_ref===state?.execution_branch
  &&envelope?.runtime_capability_profile_digest===sha256Text(stableJson(runtime)));

 add('TASK_SCOPE_VALID',Boolean(packet?.scope));
 add('BEHAVIORAL_RED_DEFINED',Boolean(packet?.red?.command&&packet?.red?.expected_failure_description));
 add('GREEN_DEFINED',Boolean(packet?.green?.command));
 add('REGRESSION_DEFINED',Boolean(packet?.regression?.command));
 add('STOP_CONDITIONS_DEFINED',Array.isArray(packet?.stop_conditions)&&packet.stop_conditions.length>0);
 add('NO_SHORTHAND',!/^\s*Run\s+(RED|GREEN)\s*$/mi.test(packet?.red?.command??''));
 add('NO_DYNAMIC_STALE_PINS',x.executionLintOk===true);
 add('NO_OPEN_CRITICAL',(state?.open_critical_findings??0)===0);
 add('NO_OPEN_IMPORTANT',(state?.open_important_findings??0)===0);
 add('EXECUTION_BRANCH_VALID',Boolean(state?.execution_branch)&&envelope?.execution_branch===state.execution_branch&&x.sourceRef===state.execution_branch);
 add('RUNTIME_CAPABILITIES_SATISFY_PACKET',validateRuntimeCapabilityProfile(runtime).ok&&requireCapabilities(runtime,packet?.runtime_requirements??[]).ok);
 add('MERGE_AUTHORITY_FALSE',packet?.merge_authority===false);
 add('PROJECT_BOOTSTRAP_CURRENT',state?.gates?.PROJECT_BOOTSTRAP_CURRENT==='PASS'&&envelope?.project_bootstrap_revision===state?.project_bootstrap_revision);
 return failures.length?{ok:false,code:'TASK_EXECUTION_READY_FAIL',failures}:{ok:true,code:'TASK_EXECUTION_READY_PASS',failures:[]};
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
function runCli(){
 try{
  const state=JSON.parse(readFileSync(arg('--state'),'utf8')),packet=JSON.parse(readFileSync(arg('--packet'),'utf8')),envelope=JSON.parse(readFileSync(arg('--envelope'),'utf8')),runtime=JSON.parse(readFileSync(arg('--runtime'),'utf8'));
  const briefPath=arg('--brief'); const brief=briefPath?readFileSync(briefPath,'utf8'):'';
  // Derive evidence from the checkout; never substitute packet assertions for checks.
  const planText=readFileSync(state.plan_path,'utf8');
  const specText=readFileSync(state.spec_path,'utf8');
  const planBlobSha=gitBlobSha(planText), specBlobSha=gitBlobSha(specText);
  const rules=JSON.parse(readFileSync('docs/superpowers/process/process-failure-rules-v1.json','utf8'));
  const rulesValid=validateFailureRules(rules).ok;
  const rulesDigest=failureRulesDigest(rules);
  const compiled=compileTaskPacket({taskId:packet.task_id,planText,specBlobSha,planBlobSha,rulesRevision:rules.revision,rulesDigest});
  const lintPaths=[state.plan_path,'docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md','PROJECT-INDEX.md','RECOVERY-PROTOCOL.md'];
  const executionLint=lintExecutionContracts(lintPaths.map(path=>({path,content:readFileSync(path,'utf8')})));
  const liveMainSha=arg('--live-main-sha');
  // Observe checkout identity; envelope claims cannot verify themselves.
  const currentHeadSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const sourceRef=execFileSync('git',['branch','--show-current'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const stateCheck=validateCurrentState(state,{
   liveMainSha,sourceRef,specBlobSha,planBlobSha,
   existingPaths:[state.spec_path,state.plan_path,state.ledger_path,state.checkpoint_path].filter(path=>existsSync(path)),
   ledgerText:readFileSync(state.ledger_path,'utf8')
  });
  const result=preflightTask({packet,state,envelope,runtime,brief,liveMainSha,currentHeadSha,sourceRef,
   stateValid:stateCheck.ok,
   authorityHashesMatch:specBlobSha===state.spec_blob_sha&&planBlobSha===state.plan_blob_sha,
   deterministicPacket:stableJson(compiled)===stableJson(packet),
   failureRulesDigest:rulesValid?rulesDigest:null,
   executionLintOk:executionLint.ok});
  process.stdout.write(`TASK_EXECUTION_READY = ${result.ok?'PASS':'FAIL'} ${JSON.stringify(result.failures)}\n`); if(!result.ok)process.exitCode=1;
 }catch(error){process.stderr.write(`TASK_EXECUTION_READY = FAIL ${error.message}\n`);process.exitCode=1;}
}
if(process.argv[1]?.endsWith('preflight_task.js'))runCli();
