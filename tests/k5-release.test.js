import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyK5Release} from '../src/mastery/release.js';
const SHA='b'.repeat(40);
const valid=()=>({prNumber:69,prHead:SHA,
 approval:{prNumber:69,headSha:SHA,approvedBy:'owner',approvedAt:'2026-10-12T12:00:00Z'},
 checks:[{name:'Pull request quality gate',sha:SHA,conclusion:'success'},
  {name:'Server and adapter contract tests',sha:SHA,conclusion:'success'}],
 browserEvidence:{sha:SHA,runId:10001,jobId:20002,stepName:'Browser smoke test',conclusion:'success'},
 review:{headSha:SHA,completed:true,openCritical:0,openImportant:0},
 policy:{policy_id:'K5.EVIDENCE.v1',numericalLane:'INACTIVE'},phase:'PRE_MERGE'});
test('missing owner approval cannot authorize landing',()=>{
 const input=valid();delete input.approval;
 const out=verifyK5Release(input);
 assert.equal(out.ready,false);assert.ok(out.blockers.includes('OWNER_PR_HEAD_APPROVAL_REQUIRED'));
});
test('approval of another PR, or older head SHA, is rejected',()=>{
 for(const approval of [{...valid().approval,prNumber:68},{...valid().approval,headSha:'a'.repeat(40)}]){
  const out=verifyK5Release({...valid(),approval});
  assert.equal(out.ready,false);assert.ok(out.blockers.includes('OWNER_PR_HEAD_APPROVAL_REQUIRED'));
 }
});
test('missing exact-head CI or Chromium tests blocks landing',()=>{
 const input=valid();input.checks.pop();
 assert.equal(verifyK5Release(input).ready,false);
 assert.ok(verifyK5Release(input).blockers.includes('CI_INCOMPLETE_EXACT_HEAD'));
});
test('open critical review findings block landing',()=>{
 const input=valid();input.review.openCritical=1;
 assert.equal(verifyK5Release(input).ready,false);
});
test('numerical scoring lane remains inactive even with green tests',()=>{
 const input=valid();input.policy.numericalLane='ACTIVE';
 assert.equal(verifyK5Release(input).ready,false);
});
test('post-merge closure requires validated exact merged main SHA',()=>{
 const input=valid();input.phase='POST_MERGE';
 assert.equal(verifyK5Release(input).ready,false);
 input.mergedHead=SHA;
 input.postMergeChecks=[{name:'merged-main full regression',sha:SHA,conclusion:'success'}];
 assert.equal(verifyK5Release(input).ready,true);
});
test('positive predicate is only a synthetic readiness contract, not live merge consent',()=>{
 const out=verifyK5Release(valid());assert.equal(out.ready,true);assert.deepEqual(out.blockers,[]);
});
