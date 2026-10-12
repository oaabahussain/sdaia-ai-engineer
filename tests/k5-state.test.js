import test from 'node:test';
import assert from 'node:assert/strict';
import {validateK5State} from '../scripts/process/validate_k5_state.js';
const A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const fixture=()=>({state:{schema_version:1,feature:'K5.EVIDENCE.v1',stage:'IN_PROGRESS',
 baseline_main_sha:A,spec_blob_sha:B,plan_blob_sha:C,
 branch:'feat/k5-tdd-evidence-20261012',numeric_lane:'INACTIVE'},
 liveMainSha:A,specBlobSha:B,planBlobSha:C,executionRef:'feat/k5-tdd-evidence-20261012'});
test('isolated K5 work is tracked without declaring a release',()=>{
 assert.deepEqual(validateK5State(fixture()),{ok:true,code:'OK'});
});
test('spec/plan mismatch, baseline drift or main branch blocks',()=>{
 const variants=[{specBlobSha:A},{planBlobSha:B},{liveMainSha:B},{executionRef:'main'},
  {state:{...fixture().state,branch:'main'}}];
 for(const changed of variants)assert.equal(validateK5State({...fixture(),...changed}).ok,false);
});
test('unapproved complete status or active numerical lane blocks release claims',()=>{
 for(const changed of [{stage:'COMPLETE'},{numeric_lane:'ACTIVE'},{schema_version:2}])
  assert.equal(validateK5State({...fixture(),state:{...fixture().state,...changed}}).ok,false);
});
