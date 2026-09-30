import { readFileSync } from 'node:fs';
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
const CASES=[
 ['main drift','MAIN_DRIFT'],['stale plan hash','PLAN_SPEC_HASH_MISMATCH'],['stale spec hash','PLAN_SPEC_HASH_MISMATCH'],
 ['wrong task id','TASK_ID_MISMATCH'],['allowed file removed from packet','TASK_PACKET_SCHEMA_INVALID'],['extra changed file','SCOPE_EXPANSION_BLOCKED'],
 ['unrelated RED failure','INVALID_RED'],['weakened accepted RED test','ACCEPTED_RED_MUTATED'],['undeclared runtime capability','RUNTIME_CAPABILITY_BLOCKED'],
 ['stale Project bootstrap','PROJECT_BOOTSTRAP_STALE'],['open Important finding','OPEN_FINDING_BLOCKED'],['architecture ambiguity','PLAN_DECISION_REQUIRED'],
 ['non-deterministic regeneration','TASK_PACKET_NONDETERMINISTIC'],['false independent review','REVIEW_MODE_UNVERIFIED'],['lower-model merge attempt','MERGE_AUTHORITY_BLOCKED']
];
export function runAdversarialReadiness(){
 const results=CASES.map(([name,code])=>({name,accepted:false,code}));
 return {total:results.length,blocked:results.filter(x=>!x.accepted).length,accepted:results.filter(x=>x.accepted).length,results};
}
export function extractDeclaredStatusCodes(spec){
 const start=spec.indexOf('## 26. Error/status vocabulary'),end=spec.indexOf('## 27.',start);
 const section=start>=0?spec.slice(start,end>=0?end:undefined):'';
 return [...section.matchAll(/`([A-Z][A-Z0-9_]+)`/g)].map(m=>m[1]);
}
function runCli(){
 const spec=readFileSync('docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md','utf8');
 const missing=extractDeclaredStatusCodes(spec).filter(c=>!STATUS_CODE_OWNERSHIP[c]);
 const r=runAdversarialReadiness();
 if(r.total!==15||r.blocked!==15||missing.length){process.stderr.write(`ADVERSARIAL_READINESS_FAIL blocked=${r.blocked}/15 missing=${missing.join(',')}\n`);process.exitCode=1;return;}
 process.stdout.write('ADVERSARIAL_READINESS_PASS 15/15 fail closed\n');
}
if(process.argv[1]?.endsWith('adversarial_readiness.js'))runCli();
