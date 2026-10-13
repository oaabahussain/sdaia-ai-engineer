import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';

const H='a'.repeat(40), OLD='b'.repeat(40), REPO='oaabahussain/sdaia-ai-engineer';
const marker=sha=>'### 💡 Codex Review\n**Reviewed commit:** `'+sha.slice(0,10)+'`';
const workflow={
  quality:{name:'Pull request quality gate',workflow_id:354048838,path:'.github/workflows/ci.yml'},
  server:{name:'Server and adapter contract tests',workflow_id:352261825,path:'.github/workflows/server-tests.yml'}
};
const run=(type,id)=>({...workflow[type],id,head_sha:H,event:'pull_request',
 pull_requests:[{number:69,head:{sha:H}}],status:'completed',
 conclusion:'success',created_at:'2026-10-13T10:00:00Z'});
function transport({
 dismissedHead=H,dismissedFinding='P1: an exact-head finding was dismissed',
 includeDismissed=true,includeClean=true,nonCodexDismissed=false
}={}){
 const reviews=[];
 if(includeClean)reviews.push({id:410,commit_id:H,state:'COMMENTED',
   user:{login:'chatgpt-codex-connector[bot]'},body:marker(H)});
 if(includeDismissed)reviews.push({id:411,commit_id:dismissedHead,state:'DISMISSED',
   user:{login:nonCodexDismissed?'ordinary-reviewer':'chatgpt-codex-connector[bot]'},
   body:marker(dismissedHead)});
 const seen=[];
 const fetchImpl=async url=>{
  const path=url.replace('https://api.github.com','');seen.push(path);
  let data;
  if(path.endsWith('/pulls/69'))data={number:69,state:'open',draft:false,merged:false,
     head:{sha:H},base:{ref:'main'}};
  else if(path.includes('/actions/runs?'))data={workflow_runs:[run('quality',120),run('server',110)]};
  else if(path.endsWith('/pulls/69/reviews?per_page=100'))data=reviews;
  else if(path.endsWith('/pulls/69/reviews/410/comments?per_page=100'))data=[];
  else if(path.endsWith('/pulls/69/reviews/411/comments?per_page=100'))
    data=[{id:901,body:dismissedFinding}];
  else if(path.endsWith('/actions/runs/120/jobs?per_page=100'))
    data={jobs:[{id:210,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(path.endsWith('/issues/69/comments?per_page=100'))data=[{
    body:'K5-LANDING-APPROVED PR=69 HEAD='+H,user:{login:'oaabahussain'},
    created_at:'2026-10-13T10:10:00Z'}];
  else if(path.endsWith('/graphql'))data={data:{repository:{pullRequest:{reviewThreads:{
    nodes:[],pageInfo:{hasNextPage:false}
  }}}}};
  else throw new Error('unhandled API URL: '+path);
  return {ok:true,json:async()=>data};
 };
 return {seen,fetchImpl};
}
async function collect(opts){
 const {seen,fetchImpl}=transport(opts);
 return {data:await collectK5GitHubEvidence({repo:REPO,prNumber:69,
  token:'fixture-token',fetchImpl}),seen};
}

for(const priority of ['P0','P1','P2']){
 test('P1 review authorization: DISMISSED same-head Codex '+priority+' finding blocks separate clean review',async()=>{
  const {data,seen}=await collect({dismissedFinding:priority+': security issue, administratively dismissed'});
  assert.equal(data.review.completed,false);
  assert.equal(data.readiness.ready,false);
  assert.ok(data.readiness.blockers.includes('INDEPENDENT_REVIEW_NOT_CLEAN'));
  assert.ok(seen.some(path=>path.endsWith('/pulls/69/reviews/411/comments?per_page=100')));
 });
}
test('DISMISSED benign review does not count as clean or as a finding',async()=>{
 const {data}=await collect({dismissedFinding:'Typographical note, no security issue'});
 assert.equal(data.review.completed,true);
 assert.equal(data.readiness.ready,true);
});
test('DISMISSED review alone cannot satisfy clean independent review',async()=>{
 const {data}=await collect({includeClean:false,dismissedFinding:'no finding'});
 assert.equal(data.review.completed,false);
 assert.ok(data.readiness.blockers.includes('INDEPENDENT_REVIEW_NOT_CLEAN'));
});
test('DISMISSED Codex finding from previous SHA cannot veto current exact-head clean review',async()=>{
 const {data}=await collect({dismissedHead:OLD});
 assert.equal(data.review.completed,true);
 assert.equal(data.readiness.ready,true);
});
test('Ordinary dismissed inline comment never impersonates current-head independent Codex finding',async()=>{
 const {data}=await collect({nonCodexDismissed:true});
 assert.equal(data.review.completed,true);
 assert.equal(data.readiness.ready,true);
});
