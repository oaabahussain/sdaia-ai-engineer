import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';

const H='a'.repeat(40),MAIN='d'.repeat(40),SPEC='b'.repeat(40),PLAN='c'.repeat(40);
const REPO='oaabahussain/sdaia-ai-engineer', OWNER='oaabahussain';
const state=(approved=true,detached=false)=>({
  schema_version:1,feature:'K5.EVIDENCE.v1',stage:'IN_PROGRESS',
  numeric_lane:'INACTIVE',baseline_main_sha:MAIN,
  spec_blob_sha:SPEC,plan_blob_sha:PLAN,branch:'feat/k5-tdd-evidence-20261012',
  formal_spec_approval:approved?{approved_by:OWNER,blob_sha:SPEC,approved_at:'2026-10-13T10:00:00Z'}:null,
  formal_plan_approval:approved?{approved_by:OWNER,blob_sha:PLAN,approved_at:'2026-10-13T10:00:00Z'}:null,
  owner_authorization_for_spec_and_plan:detached?{approved:true,at:'2026-10-14T13:03:19Z',pr_comment_id:6169066017,spec_blob_sha:SPEC,plan_blob_sha:PLAN,scope:'SPEC_AND_PLAN_ONLY_NO_MERGE_AUTHORIZATION'}:null,
  release_blockers:approved?['AC23_EXACT_HEAD_REVIEW_PENDING']:['AC01_SPEC_PLAN_APPROVAL_MISSING']
});
const ownerComment=(body,login=OWNER)=>({user:{login},body,created_at:'2026-10-13T10:05:00Z'});
const landing=ownerComment('K5-LANDING-APPROVED PR=69 HEAD='+H);
const specApproval=ownerComment('K5-SPEC-APPROVED BLOB='+SPEC);
const planApproval=ownerComment('K5-PLAN-APPROVED BLOB='+PLAN);
const encode=(body,sha)=>({sha,encoding:'base64',content:Buffer.from(body).toString('base64')});
function fixture({formal=true,specStatus='APPROVED',planStatus='APPROVED',
  ownerSpec=true,landingPage2=false,detached=false}={}){
 const recorded=[];
 const comments=[specApproval,ownerSpec?specApproval:ownerComment('K5-SPEC-APPROVED BLOB='+SPEC,'another-user'),planApproval];
 // The duplicated valid spec comment is harmless and models real repeated approval notes.
 const deduped=ownerSpec?[specApproval,planApproval]:[comments[1],planApproval];
 const detachedComment={...ownerComment('Owner decision recorded from ChatGPT conversation, 2026-10-14T13:03:19Z: **APPROVED** the explicitly requested K5 design/spec blob `'+SPEC+'` and implementation plan blob `'+PLAN+'` (AC-01). Approval scope: **specification and plan only**. It is **NOT** per-PR/exact-HEAD landing consent.'),id:6169066017};
 const page1=landingPage2?[
   ...deduped,...Array.from({length:98},(_,i)=>ownerComment('ordinary backlog note '+i))
 ]:[...deduped,landing,...(detached?[detachedComment]:[])];
 const requests=async url=>{
  const p=url.replace('https://api.github.com','');
  recorded.push(p);let body;
  if(p.endsWith('/pulls/69'))
   body={number:69,state:'open',draft:false,merged:false,head:{sha:H,ref:'feat/k5-tdd-evidence-20261012'},base:{ref:'main',sha:MAIN}};
  else if(p.includes('/actions/runs?'))body={workflow_runs:[
   {id:123,name:'Pull request quality gate',workflow_id:354048838,path:'.github/workflows/ci.yml',
    event:'pull_request',pull_requests:[{number:69,head:{sha:H}}],head_sha:H,status:'completed',conclusion:'success'},
   {id:124,name:'Server and adapter contract tests',workflow_id:352261825,path:'.github/workflows/server-tests.yml',
    event:'pull_request',pull_requests:[{number:69,head:{sha:H}}],head_sha:H,status:'completed',conclusion:'success'}
  ]};
  else if(p.endsWith('/pulls/69/reviews?per_page=100'))body=[{
   id:410,commit_id:H,state:'COMMENTED',
   user:{login:'chatgpt-codex-connector[bot]'},
   body:'### 💡 Codex Review\n**Reviewed commit:** `'+H.slice(0,10)+'`'
  }];
  else if(p.endsWith('/pulls/69/reviews/410/comments?per_page=100'))body=[];
  else if(p.endsWith('/issues/69/comments?per_page=100'))body=page1;
  else if(p.endsWith('/issues/69/comments?per_page=100&page=2'))body=landingPage2?[landing]:[];
  else if(p.endsWith('/actions/runs/123/jobs?per_page=100'))
   body={jobs:[{id:201,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(p.includes('/contents/docs/superpowers/state/K5-CURRENT-STATE.json?ref='))
   body=encode(JSON.stringify(state(formal,detached)),'e'.repeat(40));
  else if(p.includes('/contents/docs/superpowers/specs/2026-10-11-k5-mastery-readiness-projections-design.md?ref='))
   body=encode('# Spec\n**Status:** '+specStatus+'\n','b'.repeat(40));
  else if(p.includes('/contents/docs/superpowers/plans/2026-10-12-k5-evidence-sufficiency-tdd.md?ref='))
   body=encode('# Plan\n**Status:** '+planStatus+'\n','c'.repeat(40));
  else if(p.endsWith('/graphql'))
   body={data:{repository:{pullRequest:{reviewThreads:{nodes:[],pageInfo:{hasNextPage:false}}}}}};
  else throw new Error('Unexpected URL '+p);
  return {ok:true,json:async()=>body};
 };
 return {requests,recorded};
}
async function audit(opts={}){
 const {requests,recorded}=fixture(opts);
 const report=await collectK5GitHubEvidence({
  repo:REPO,prNumber:69,token:'test-token',fetchImpl:requests
 });
 return {report,recorded};
}
test('P1: ready requires checked-in frozen formal spec/plan approval state',async()=>{
 const {report,recorded}=await audit({formal:false});
 assert.equal(report.readiness.ready,false);
 assert.ok(report.readiness.blockers.includes('K5_FORMAL_SPEC_PLAN_APPROVAL_REQUIRED'));
 assert.ok(recorded.some(x=>x.includes('/contents/docs/superpowers/state/K5-CURRENT-STATE.json?ref='+H)));
});
test('P1: a status NOT_APPROVED spec blocks despite owner PR-head landing comment and green CI',async()=>{
 const {report}=await audit({specStatus:'NOT_APPROVED'});
 assert.equal(report.readiness.ready,false);
 assert.ok(report.readiness.blockers.includes('K5_FORMAL_SPEC_PLAN_APPROVAL_REQUIRED'));
});
test('P1: nonowner spec digest statement does not prove owner-approved canonical artifact',async()=>{
 const {report}=await audit({ownerSpec:false});
 assert.equal(report.readiness.ready,false);
 assert.ok(report.readiness.blockers.includes('K5_FORMAL_SPEC_PLAN_APPROVAL_REQUIRED'));
});
test('P2: exact-head owner landing approval on issue-comment page two is recognized',async()=>{
 const {report,recorded}=await audit({landingPage2:true});
 assert.equal(report.readiness.ready,true);
 assert.ok(recorded.some(x=>x.endsWith('/issues/69/comments?per_page=100&page=2')));
});
test('fully authenticated synthetic approvals plus clean review can satisfy pure readiness predicate',async()=>{
 const {report}=await audit();
 assert.equal(report.readiness.ready,true);
 assert.equal(report.approvalPresent,true);
});

test('detached exact-blob owner attestation can approve immutable NOT_APPROVED spec/plan without editing them',async()=>{
 const {report}=await audit({specStatus:'WRITTEN_SPEC_FOR_OWNER_REVIEW / NOT_APPROVED / NO_IMPLEMENTATION_PLAN',planStatus:'NOT_APPROVED',detached:true});
 assert.equal(report.governance.approved,true);
 assert.ok(!report.readiness.blockers.includes('K5_FORMAL_SPEC_PLAN_APPROVAL_REQUIRED'));
});
test('NOT_APPROVED spec remains blocked without owner-authenticated detached approval',async()=>{
 const {report}=await audit({specStatus:'NOT_APPROVED',planStatus:'NOT_APPROVED'});
 assert.equal(report.governance.approved,false);
});
