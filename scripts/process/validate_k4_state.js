import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schema = JSON.parse(readFileSync(new URL('../../docs/superpowers/state/k4-current-state.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({ allErrors:true, strict:true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);
const SHA = /^[0-9a-f]{40}$/;
const pass = (details={}) => ({ok:true,code:'STATE_VALID',details});
const deny = (code,details={}) => ({ok:false,code,details});

export function validateK4State({state,liveMainSha,specBlobSha,planBlobSha,executionRef}={}) {
  if (!validateSchema(state)) return deny('STATE_SCHEMA_INVALID',{errors:validateSchema.errors});
  if (![liveMainSha,specBlobSha,planBlobSha].every(s=>SHA.test(s??''))) return deny('SOURCE_REF_MISSING');
  if (state.spec_blob_sha !== specBlobSha || state.spec_approval.git_blob_sha !== specBlobSha) return deny('SPEC_BLOB_MISMATCH');
  if (state.plan_blob_sha !== planBlobSha || state.plan_approval.git_blob_sha !== planBlobSha) return deny('PLAN_BLOB_MISMATCH');
  if (state.spec_approval.status !== 'APPROVED' || state.plan_approval.status !== 'APPROVED') return deny('APPROVAL_MISSING');
  if (state.completed_through_task + 1 !== state.next_task) return deny('TASK_SEQUENCE_INVALID');
  if (state.open_critical_findings || state.open_important_findings) return deny('OPEN_REVIEW_FINDINGS');
  const blocked = Object.entries(state.gates).find(([,value]) => value !== 'PASS');
  if (blocked) return deny('PROCESS_GATE_BLOCKED',{gate:blocked[0]});
  if (state.status === 'COMPLETE') {
    if (!SHA.test(state.merged_main_sha??'') || state.merged_main_sha !== liveMainSha ||
        typeof state.release_evidence_ref !== 'string' || !state.release_evidence_ref ||
        executionRef !== 'main') return deny('POST_MERGE_EVIDENCE_MISSING');
  } else {
    if (state.base_main_sha !== liveMainSha) return deny('MAIN_DRIFT');
    if (executionRef !== state.execution_branch) return deny('EXECUTION_BRANCH_INVALID');
  }
  return pass({next_task:state.next_task,completed_through_task:state.completed_through_task});
}

function argument(name) {
  const index=process.argv.indexOf(name);
  return index<0?null:process.argv[index+1];
}
function headBlob(filePath) {
  return execFileSync('git',['rev-parse','HEAD:'+filePath],{cwd:root,encoding:'utf8'}).trim();
}
function main() {
  const liveMainSha=argument('--live-main-sha');
  const executionRef=argument('--source-ref');
  if (!SHA.test(liveMainSha??'') || !executionRef) {
    process.stdout.write(JSON.stringify(deny('SOURCE_REF_MISSING'))+'\n');
    process.exitCode=2;
    return;
  }
  try {
    const state=JSON.parse(readFileSync(path.join(root,'docs/superpowers/state/K4-CURRENT-STATE.json'),'utf8'));
    const result=validateK4State({
      state,liveMainSha,executionRef,
      specBlobSha:headBlob(state.spec_path),
      planBlobSha:headBlob(state.plan_path)
    });
    process.stdout.write(JSON.stringify(result)+'\n');
    if(!result.ok)process.exitCode=1;
  } catch(error) {
    process.stdout.write(JSON.stringify(deny('PREFLIGHT_ERROR',{message:String(error.message??error)}))+'\n');
    process.exitCode=1;
  }
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();
