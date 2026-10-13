import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';

const H='a'.repeat(40);
const REVIEW_BODY='### 💡 Codex Review\n**Reviewed commit:** `'+H.slice(0,10)+'`';
const workflow={
 quality:{workflow_id:354048838,path:'.github/workflows/ci.yml',
  name:'Pull request quality gate'},
 server:{workflow_id:352261825,path:'.github/workflows/server-tests.yml',
  name:'Server and adapter contract tests'}
};
const trusted=name=>({...workflow[name],head_sha:H,event:'pull_request',
 pull_requests:[{number:69,head:{sha:H}}]});
function transport({latestQuality='success',resolvedFinding=false,firstReviewFinding=false}={}){
 const runs=[
  {...trusted('quality'),id:100,created_at:'2026-10-13T09:00:00Z',status:'completed',conclusion:'success'},
  {...trusted('server'),id:110,created_at:'2026-10-13T09:01:00Z',status:'completed',conclusion:'success'}
 ];
 if(latestQuality!=='absent')runs.push({...trusted('quality'),id:120,created_at:'2026-10-13T09:02:00Z',
  status:latestQuality==='in_progress'?'in_progress':'completed',
  conclusion:latestQuality==='in_progress'?null:latestQuality});
 return async(url)=>{
  const path=url.replace('https://api.github.com','');
  let data;
  if(path.endsWith('/pulls/69'))
   data={number:69,state:'open',draft:false,merged:false,head:{sha:H},base:{ref:'main'}};
  else if(path.includes('/actions/runs?'))data={workflow_runs:[...runs].reverse()};
  else if(path.endsWith('/pulls/69/reviews?per_page=100'))data=[{
    id:410,commit_id:H,state:'COMMENTED',user:{login:'chatgpt-codex-connector[bot]'},
    submitted_at:'2026-10-13T09:03:00Z',body:REVIEW_BODY
  }];
  else if(path.endsWith('/pulls/69/reviews/410/comments?per_page=100'))
   data=resolvedFinding||firstReviewFinding?[{id:981,body:'P1: approval can be bypassed'}]:[];
  else if(path.endsWith('/actions/runs/100/jobs?per_page=100'))
   data={jobs:[{id:200,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(path.endsWith('/actions/runs/120/jobs?per_page=100'))
   data={jobs:[{id:201,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(path.endsWith('/issues/69/comments?per_page=100'))data=[{
   body:'K5-LANDING-APPROVED PR=69 HEAD='+H,user:{login:'oaabahussain'},
   created_at:'2026-10-13T09:04:00Z'
  }];
  else if(path.endsWith('/graphql'))data={data:{repository:{pullRequest:{reviewThreads:{
    nodes:resolvedFinding?[{isResolved:true,comments:{nodes:[{body:'P1: approval can be bypassed'}]}}]:[],
    pageInfo:{hasNextPage:false}
  }}}}};
  else throw new Error('unexpected GitHub URL '+path);
  return {ok:true,json:async()=>data};
 };
}

const run=async options=>collectK5GitHubEvidence({
 repo:'oaabahussain/sdaia-ai-engineer',prNumber:69,token:'fake-test-token',
 fetchImpl:transport(options)
});
test('P1 resolved independent Codex inline finding still rejects release without clean follow-up review',async()=>{
 const r=await run({resolvedFinding:true});
 assert.equal(r.review.completed,false);
 assert.equal(r.readiness.ready,false);
 assert.ok(r.readiness.blockers.includes('INDEPENDENT_REVIEW_NOT_CLEAN'));
});
test('P1 newest exact-head quality workflow failure supersedes earlier successful run',async()=>{
 const r=await run({latestQuality:'failure'});
 assert.equal(r.readiness.ready,false);
 assert.ok(r.readiness.blockers.includes('CI_INCOMPLETE_EXACT_HEAD'));
 assert.equal(r.browserEvidence,null);
});
test('P1 newest exact-head quality workflow pending supersedes earlier successful run',async()=>{
 const r=await run({latestQuality:'in_progress'});
 assert.equal(r.readiness.ready,false);
 assert.ok(r.readiness.blockers.includes('CI_INCOMPLETE_EXACT_HEAD'));
 assert.equal(r.browserEvidence,null);
});
test('trusted review without findings plus latest passing required checks can pass deterministic prerelease predicate',async()=>{
 const r=await run({latestQuality:'success'});
 assert.equal(r.review.completed,true);
 assert.equal(r.readiness.ready,true);
 assert.equal(r.browserEvidence.runId,120);
});
