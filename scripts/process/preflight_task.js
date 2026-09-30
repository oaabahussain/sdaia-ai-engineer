import { readFileSync } from 'node:fs';
import { validateTaskDefinitionPacket } from './validate_task_packet.js';
import { validateTaskExecutionEnvelope } from './bind_task_execution.js';
import { requireCapabilities } from './runtime_capabilities.js';
import { stableJson, sha256Text } from './stable_json.js';

export function preflightTask(x){
 const failures=[]; const {packet,state,runtime,envelope}=x;
 const add=(code,ok)=>{if(!ok)failures.push(code);};
 add('STATE_VALID',Boolean(state&&Number.isInteger(state.state_revision)));
 add('PLAN_SPEC_HASH_MATCH',packet?.authority?.spec_blob_sha===state?.spec_blob_sha&&packet?.authority?.plan_blob_sha===state?.plan_blob_sha);
 add('MAIN_BASE_MATCH',Boolean(state?.base_main_sha)&&state.base_main_sha===x.liveMainSha);
 add('TASK_ID_MATCHES_NEXT_TASK',packet?.task_id===state?.next_task);
 add('TASK_PACKET_VALID',validateTaskDefinitionPacket(packet).ok);
 add('TASK_PACKET_FRESH',sha256Text(x.brief??'')===packet?.authority?.task_source_digest);
 add('TASK_PACKET_DETERMINISTIC',x.deterministicPacket===true);
 add('PROCESS_FAILURE_RULES_MATCH',packet?.authority?.process_failure_rules_digest===x.failureRulesDigest);
 add('TASK_EXECUTION_ENVELOPE_VALID',validateTaskExecutionEnvelope(envelope).ok);
 add('TASK_EXECUTION_ENVELOPE_FRESH',envelope?.task_packet_digest===sha256Text(stableJson(packet))&&envelope?.state_revision===state?.state_revision);
 add('TASK_SCOPE_VALID',Boolean(packet?.scope));
 add('BEHAVIORAL_RED_DEFINED',Boolean(packet?.red?.command&&packet?.red?.expected_failure_description));
 add('GREEN_DEFINED',Boolean(packet?.green?.command));
 add('REGRESSION_DEFINED',Boolean(packet?.regression?.command));
 add('STOP_CONDITIONS_DEFINED',Array.isArray(packet?.stop_conditions)&&packet.stop_conditions.length>0);
 add('NO_SHORTHAND',!/^\s*Run\s+(RED|GREEN)\s*$/mi.test(packet?.red?.command??''));
 add('NO_DYNAMIC_STALE_PINS',x.executionLintOk===true);
 add('NO_OPEN_CRITICAL',(state?.open_critical_findings??0)===0);
 add('NO_OPEN_IMPORTANT',(state?.open_important_findings??0)===0);
 add('EXECUTION_BRANCH_VALID',Boolean(state?.execution_branch)&&envelope?.execution_branch===state.execution_branch);
 add('RUNTIME_CAPABILITIES_SATISFY_PACKET',requireCapabilities(runtime,packet?.runtime_requirements??[]).ok);
 add('MERGE_AUTHORITY_FALSE',packet?.merge_authority===false);
 add('PROJECT_BOOTSTRAP_CURRENT',state?.gates?.PROJECT_BOOTSTRAP_CURRENT==='PASS'&&envelope?.project_bootstrap_revision===state?.project_bootstrap_revision);
 return failures.length?{ok:false,code:'TASK_EXECUTION_READY_FAIL',failures}:{ok:true,code:'TASK_EXECUTION_READY_PASS',failures:[]};
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
function runCli(){
 try{
  const state=JSON.parse(readFileSync(arg('--state'),'utf8')),packet=JSON.parse(readFileSync(arg('--packet'),'utf8')),envelope=JSON.parse(readFileSync(arg('--envelope'),'utf8')),runtime=JSON.parse(readFileSync(arg('--runtime'),'utf8'));
  const briefPath=arg('--brief'); const brief=briefPath?readFileSync(briefPath,'utf8'):'';
  const result=preflightTask({packet,state,envelope,runtime,brief,liveMainSha:arg('--live-main-sha'),deterministicPacket:true,failureRulesDigest:packet.authority.process_failure_rules_digest});
  process.stdout.write(`TASK_EXECUTION_READY = ${result.ok?'PASS':'FAIL'} ${JSON.stringify(result.failures)}\n`); if(!result.ok)process.exitCode=1;
 }catch(error){process.stderr.write(`TASK_EXECUTION_READY = FAIL ${error.message}\n`);process.exitCode=1;}
}
if(process.argv[1]?.endsWith('preflight_task.js'))runCli();
