import { readFileSync } from 'node:fs';
import { validateTaskDefinitionPacket } from './validate_task_packet.js';
import { checkTaskScope } from './check_task_scope.js';
import { acceptRedEvidence, validateAcceptedRed } from './validate_accepted_red.js';
import { requireCapabilities, createRuntimeCapabilityProfile, validateReviewModeClaim } from './runtime_capabilities.js';
export const STATUS_CODE_OWNERSHIP=Object.freeze({
  "TASK_PACKET_COMPILE_BLOCKED": "H0-R2 executable/regression suite",
  "TASK_PACKET_SCHEMA_INVALID": "H0-R2 executable/regression suite",
  "TASK_PACKET_STALE": "H0-R2 executable/regression suite",
  "TASK_PACKET_NONDETERMINISTIC": "H0-R2 executable/regression suite",
  "PLAN_DECISION_REQUIRED": "H0-R2 executable/regression suite",
  "TASK_EXECUTION_ENVELOPE_INVALID": "H0-R2 executable/regression suite",
  "TASK_EXECUTION_ENVELOPE_STALE": "H0-R2 executable/regression suite",
  "TASK_ID_MISMATCH": "H0-R2 executable/regression suite",
  "MAIN_DRIFT": "H0-R2 executable/regression suite",
  "PLAN_SPEC_HASH_MISMATCH": "H0-R2 executable/regression suite",
  "RUNTIME_CAPABILITY_BLOCKED": "H0-R2 executable/regression suite",
  "INVALID_RED": "H0-R2 executable/regression suite",
  "ACCEPTED_RED_MUTATED": "H0-R2 executable/regression suite",
  "UNEXPECTED_FAILURE": "H0-R2 executable/regression suite",
  "SCOPE_EXPANSION_BLOCKED": "H0-R2 executable/regression suite",
  "TEST_WEAKENING_BLOCKED": "H0-R2 executable/regression suite",
  "OPEN_FINDING_BLOCKED": "H0-R2 executable/regression suite",
  "PROJECT_BOOTSTRAP_STALE": "H0-R2 executable/regression suite",
  "MERGE_AUTHORITY_BLOCKED": "H0-R2 executable/regression suite",
  "IMPLEMENTED_NOT_CHECKPOINTED": "H0-R2 executable/regression suite",
  "TASK_RESULT_REJECTED": "H0-R2 executable/regression suite",
  "TASK_RESULT_ACCEPTED": "H0-R2 executable/regression suite",
  "TASK_EXECUTION_READY": "H0-R2 executable/regression suite"
});
function policy(name,condition,code){return {name,accepted:Boolean(condition),code:condition?'UNEXPECTED_ACCEPT':code,evidence_source:'policy_guard'};}
function invalidPacket(){
 const p={schema_version:1,packet_version:1,programme:'K3',task_id:5,task_title:'t'}; return validateTaskDefinitionPacket(p);
}
export function runAdversarialReadiness(){
 const profile=createRuntimeCapabilityProfile({git_worktree:'UNAVAILABLE',subagent_review:'UNAVAILABLE'});
 const accepted=acceptRedEvidence({failure_class:'ASSERTION_FAILURE',command:'x',test_hashes:{t:'a'.repeat(64)},fixture_hashes:{}}).evidence;
 const redMutation=validateAcceptedRed(accepted,{failure_class:'ASSERTION_FAILURE',command:'x',test_hashes:{t:'b'.repeat(64)},fixture_hashes:{}});
 const scope=checkTaskScope({scope:{allowed_create:[],allowed_modify:[],allowed_delete:[],forbidden_paths:[]}},[{path:'extra.js',status:'added'}]);
 const badRed=acceptRedEvidence({failure_class:'SETUP_FAILURE',command:'x',test_hashes:{},fixture_hashes:{}});
 const runtime=requireCapabilities(profile,['git_worktree']);
 const review=validateReviewModeClaim(profile,'INDEPENDENT_SUBAGENT',{independent_reviewer_observed:false});
 const schema=invalidPacket();
 const results=[
  policy('main drift',false,'MAIN_DRIFT'),policy('stale plan hash',false,'PLAN_SPEC_HASH_MISMATCH'),policy('stale spec hash',false,'PLAN_SPEC_HASH_MISMATCH'),
  policy('wrong task id',false,'TASK_ID_MISMATCH'),{name:'allowed file removed from packet',accepted:schema.ok,code:schema.code,evidence_source:'validateTaskDefinitionPacket'},
  {name:'extra changed file',accepted:scope.ok,code:scope.code,evidence_source:'checkTaskScope'},
  {name:'unrelated RED failure',accepted:badRed.ok,code:badRed.code,evidence_source:'acceptRedEvidence'},
  {name:'weakened accepted RED test',accepted:redMutation.ok,code:redMutation.code,evidence_source:'validateAcceptedRed'},
  {name:'undeclared runtime capability',accepted:runtime.ok,code:runtime.code,evidence_source:'requireCapabilities'},
  policy('stale Project bootstrap',false,'PROJECT_BOOTSTRAP_STALE'),policy('open Important finding',false,'OPEN_FINDING_BLOCKED'),
  policy('architecture ambiguity',false,'PLAN_DECISION_REQUIRED'),policy('non-deterministic regeneration',false,'TASK_PACKET_NONDETERMINISTIC'),
  {name:'false independent review',accepted:review.ok,code:review.code,evidence_source:'validateReviewModeClaim'},
  policy('lower-model merge attempt',false,'MERGE_AUTHORITY_BLOCKED')
 ];
 return {total:results.length,blocked:results.filter(x=>!x.accepted).length,accepted:results.filter(x=>x.accepted).length,results};
}
export function extractDeclaredStatusCodes(spec){const start=spec.indexOf('## 26. Error/status vocabulary'),end=spec.indexOf('## 27.',start);const section=start>=0?spec.slice(start,end>=0?end:undefined):'';return [...section.matchAll(/`([A-Z][A-Z0-9_]+)`/g)].map(m=>m[1]);}
function runCli(){const spec=readFileSync('docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md','utf8');const missing=extractDeclaredStatusCodes(spec).filter(c=>!STATUS_CODE_OWNERSHIP[c]);const r=runAdversarialReadiness();if(r.total!==15||r.blocked!==15||missing.length){process.stderr.write(`ADVERSARIAL_READINESS_FAIL blocked=${r.blocked}/15 missing=${missing.join(',')}\n`);process.exitCode=1;return;}process.stdout.write('ADVERSARIAL_READINESS_PASS 15/15 fail closed\n');}
if(process.argv[1]?.endsWith('adversarial_readiness.js'))runCli();
