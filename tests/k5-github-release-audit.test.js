import {withSyntheticApprovedK5Governance} from './helpers/k5-approved-governance-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';
const H='a'.repeat(40);
const WORKFLOWS={
 'Pull request quality gate':{workflow_id:354048838,path:'.github/workflows/ci.yml'},
 'Server and adapter contract tests':{workflow_id:352261825,path:'.github/workflows/server-tests.yml'}
};
const workflowRun=(name,id,sha)=>({
 ...WORKFLOWS[name],name,id,head_sha:sha,event:'pull_request',
 pull_requests:[{number:69,head:{sha}}],status:'completed',conclusion:'success'
});
const paths=[];
function fixture({openThread=false,approval=true,checkHead=H,reviewerLogin='chatgpt-codex-connector[bot]',reviewHead=H,reviewBody='### 💡 Codex Review\n**Reviewed commit:** `'+H.slice(0,10)+'`',requestedChanges=false,cleanReceipt=null,skipFormalReview=false,reviewFinding=false}={}){
 paths.length=0;
 const get=async(url,opts)=>{
  paths.push(url);
  const key=url.replace(/^https:\/\/api.github.com/,'');
  let data;
  if(key.endsWith('/pulls/69'))data={number:69,state:'open',draft:false,merged:false,head:{sha:H},base:{ref:'main'}};
  else if(key.includes('/actions/runs?'))data={workflow_runs:[
   workflowRun('Pull request quality gate',123,checkHead),
   workflowRun('Server and adapter contract tests',124,checkHead)
  ]};
  else if(key.endsWith('/actions/runs/123/jobs?per_page=100'))data={jobs:[{id:456,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(key.endsWith('/pulls/69/reviews?per_page=100'))data=[...(skipFormalReview?[]:[{id:410,commit_id:reviewHead,state:'COMMENTED',user:{login:reviewerLogin},body:reviewBody}]),...(requestedChanges?[{commit_id:H,state:'CHANGES_REQUESTED',user:{login:'independent-security-reviewer'},body:'Blocking request'}]:[])];
  else if(key.endsWith('/pulls/69/reviews/410/comments?per_page=100'))data=reviewFinding?[{body:'P2: security finding on same SHA'}]:[];
  else if(key.endsWith('/issues/69/comments?per_page=100'))data=[
   ...(approval?[{body:'K5-LANDING-APPROVED PR=69 HEAD='+H,user:{login:'oaabahussain'},created_at:'2026-10-12T13:01:00Z'}]:[]),
   ...(cleanReceipt===null?[]:[
    {id:500,user:{login:cleanReceipt.requester??'oaabahussain'},
     body:'@codex review\nReview head: `'+(cleanReceipt.requestHead??H)+'`',
     created_at:cleanReceipt.requestAt??'2026-10-12T14:00:00Z'},
    {id:501,user:{login:cleanReceipt.author??'chatgpt-codex-connector[bot]',type:cleanReceipt.type??'Bot'},
     body:cleanReceipt.body??'<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn\'t find any major issues.\n\n**Reviewed commit:** `'+(cleanReceipt.reviewPrefix??H.slice(0,10))+'`',
     created_at:cleanReceipt.receiptAt??'2026-10-12T14:04:00Z'}
   ])
  ];
  else if(url.endsWith('/graphql'))data={data:{repository:{pullRequest:{reviewThreads:{nodes:openThread?[{isResolved:false,comments:{nodes:[{body:'P1 unresolved'}]}}]:[],pageInfo:{hasNextPage:false}}}}}};
  else throw Error('unexpected endpoint '+url);
  return {ok:true,json:async()=>data};
 };
 return withSyntheticApprovedK5Governance(get);
}
test('auditor reads GitHub head, workflow checks and browser job instead of caller claims',async()=>{
 const result=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',prNumber:69,
   token:'test',fetchImpl:fixture()});
 assert.equal(result.prHead,H);
 assert.equal(result.readiness.ready,true);
 assert.ok(paths.some(url=>url.endsWith('/pulls/69')));
 assert.ok(paths.some(url=>url.includes('/actions/runs?')));
 assert.ok(paths.some(url=>url.endsWith('/graphql')));
});
test('wrong commit checks or open P1 thread make authoritative readiness false',async()=>{
 for(const opts of [{checkHead:'b'.repeat(40)},{openThread:true},{approval:false}]){
  const result=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
   prNumber:69,token:'test',fetchImpl:fixture(opts)});
  assert.equal(result.readiness.ready,false);
 }
});
test('auditor forbids arbitrary repository, no PR and missing token',async()=>{
 await assert.rejects(collectK5GitHubEvidence({repo:'../fake',prNumber:69,token:'test',fetchImpl:fixture()}),/repo/i);
 await assert.rejects(collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',prNumber:0,token:'test',fetchImpl:fixture()}),/pr/i);
 await assert.rejects(collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',prNumber:69,token:'',fetchImpl:fixture()}),/token/i);
});

test('self COMMENTED review and unrelated users never authorize independent review',async()=>{
 for(const reviewerLogin of ['oaabahussain','unrelated-user','random-bot[bot]']){
  const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
   prNumber:69,token:'test',fetchImpl:fixture({reviewerLogin})});
  assert.equal(report.readiness.ready,false,reviewerLogin);
  assert.ok(report.readiness.blockers.includes('INDEPENDENT_REVIEW_NOT_CLEAN'),reviewerLogin);
 }
});
test('trusted reviewer must supply genuine full-review marker on exact current head',async()=>{
 const variants=[
  {reviewHead:'b'.repeat(40)},
  {reviewBody:''},
  {reviewBody:'Looks good, incidental comment'},
  {reviewBody:'### 💡 Codex Review\\n**Reviewed commit:** \`bbbbbbbbbb\`'}
 ];
 for(const options of variants){
  const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
   prNumber:69,token:'test',fetchImpl:fixture(options)});
  assert.equal(report.readiness.ready,false,JSON.stringify(options));
 }
});

test('a pending changes-requested review blocks landing despite Codex COMMENTED and green CI',async()=>{
 const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
  prNumber:69,token:'test',fetchImpl:fixture({requestedChanges:true})});
 assert.equal(report.readiness.ready,false);
 assert.ok(report.readiness.blockers.includes('CHANGES_REQUESTED_BLOCKS_RELEASE'));
});

test('authenticated Codex clean issue receipt on requested exact head satisfies independent review gate',async()=>{
 const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
  prNumber:69,token:'test',fetchImpl:fixture({skipFormalReview:true,cleanReceipt:{}})});
 assert.equal(report.review.completed,true);
 assert.equal(report.readiness.ready,true);
});

test('clean issue receipts cannot be spoofed, stale, unanchored or earlier than owner request',async()=>{
 const invalid=[
  {author:'oaabahussain'},
  {author:'unrelated-user'},
  {type:'User'},
  {requester:'unrelated-user'},
  {requestHead:'b'.repeat(40)},
  {reviewPrefix:'bbbbbbbbbb'},
  {requestAt:'2026-10-12T15:00:00Z',receiptAt:'2026-10-12T14:04:00Z'},
  {body:"Codex Review: Didn't find any major issues.\n**Reviewed commit:** \`aaaaaaaaaa\`"},
  {body:'<!-- codex-review-receipt:v1 -->\n\nLGTM\n**Reviewed commit:** \`aaaaaaaaaa\`'}
 ];
 for(const options of invalid){
  const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
   prNumber:69,token:'test',fetchImpl:fixture({skipFormalReview:true,cleanReceipt:options})});
  assert.equal(report.review.completed,false,JSON.stringify(options));
  assert.ok(report.readiness.blockers.includes('INDEPENDENT_REVIEW_NOT_CLEAN'),JSON.stringify(options));
 }
});

test('clean Codex issue receipt never overrides actual findings, check failures or missing merge consent',async()=>{
 for(const options of [
  {openThread:true,skipFormalReview:true,cleanReceipt:{}},
  {checkHead:'b'.repeat(40),skipFormalReview:true,cleanReceipt:{}},
  {requestedChanges:true,skipFormalReview:true,cleanReceipt:{}},
  {reviewFinding:true,cleanReceipt:{}},
  {approval:false,skipFormalReview:true,cleanReceipt:{}}
 ]){
  const report=await collectK5GitHubEvidence({repo:'oaabahussain/sdaia-ai-engineer',
   prNumber:69,token:'test',fetchImpl:fixture(options)});
  assert.equal(report.readiness.ready,false,JSON.stringify(options));
 }
});
