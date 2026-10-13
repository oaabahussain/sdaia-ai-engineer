import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyK5Release} from '../src/mastery/release.js';
const SHA='a'.repeat(40);
const fixture=()=>({prNumber:69,prHead:SHA,
 approval:{prNumber:69,headSha:SHA,approvedBy:'owner',approvedAt:'2026-10-12T13:00:00Z'},
 checks:[{name:'Pull request quality gate',sha:SHA,conclusion:'success'},
  {name:'Server and adapter contract tests',sha:SHA,conclusion:'success'}],
 browserEvidence:{sha:SHA,runId:10001,jobId:20002,stepName:'Browser smoke test',conclusion:'success'},
 review:{headSha:SHA,completed:true,openCritical:0,openImportant:0},
 policy:{policy_id:'K5.EVIDENCE.v1',numericalLane:'INACTIVE'},
 governance:{approved:true,headSha:SHA,specBlobSha:'b'.repeat(40),planBlobSha:'c'.repeat(40)},phase:'PRE_MERGE'});
test('actual CI browser job-step evidence qualifies, no imaginary third workflow',()=>{
 assert.equal(verifyK5Release(fixture()).ready,true);
});
test('missing or mismatched browser step evidence blocks release',()=>{
 for(const evidence of [undefined,{...fixture().browserEvidence,sha:'b'.repeat(40)},
  {...fixture().browserEvidence,stepName:'Unrelated test'},
  {...fixture().browserEvidence,conclusion:'failure'}]){
  const result=verifyK5Release({...fixture(),browserEvidence:evidence});
  assert.equal(result.ready,false);assert.ok(result.blockers.includes('BROWSER_SMOKE_EVIDENCE_REQUIRED'));
 }
});
