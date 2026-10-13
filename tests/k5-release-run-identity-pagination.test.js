import {withSyntheticApprovedK5Governance} from './helpers/k5-approved-governance-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';

const H='a'.repeat(40),REPO='oaabahussain/sdaia-ai-engineer';
const body='### 💡 Codex Review\n**Reviewed commit:** `'+H.slice(0,10)+'`';
const WF={
 quality:{name:'Pull request quality gate',workflow_id:354048838,path:'.github/workflows/ci.yml'},
 server:{name:'Server and adapter contract tests',workflow_id:352261825,path:'.github/workflows/server-tests.yml'}
};
function run(which,id,createdAt,overrides={}){
 return {...WF[which],id,event:'pull_request',pull_requests:[{number:69,head:{sha:H}}],
  head_sha:H,status:'completed',conclusion:'success',created_at:createdAt,...overrides};
}
function api({runs=[],reviews=[],extraReviewPages={}}={}){
 const firstReviews=reviews.length?reviews:[{id:410,commit_id:H,state:'COMMENTED',
  user:{login:'chatgpt-codex-connector[bot]'},body}];
 const hits=[];
 const fetchImpl=async url=>{
  const path=url.replace('https://api.github.com','');hits.push(path);
  let response;
  if(path.endsWith('/pulls/69'))
   response={number:69,state:'open',merged:false,draft:false,head:{sha:H},base:{ref:'main'}};
  else if(path.includes('/actions/runs?'))response={workflow_runs:runs};
  else if(path.includes('/pulls/69/reviews?')){
   const page=Number(new URL(url).searchParams.get('page')??1);
   response=page===1?firstReviews:(extraReviewPages[page]??[]);
  }else if(path.endsWith('/pulls/69/reviews/410/comments?per_page=100'))
   response=[];
  else if(path.endsWith('/issues/69/comments?per_page=100'))
   response=[{body:'K5-LANDING-APPROVED PR=69 HEAD='+H,user:{login:'oaabahussain'},
    created_at:'2026-10-13T09:10:00Z'}];
  else if(path.endsWith('/graphql'))
   response={data:{repository:{pullRequest:{reviewThreads:{nodes:[],pageInfo:{hasNextPage:false}}}}}};
  else if(/\/actions\/runs\/\d+\/jobs\?per_page=100$/.test(path))
   response={jobs:[{id:301,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else throw Error('unexpected request '+path);
  return {ok:true,json:async()=>response};
 };
 return {fetchImpl,hits};
}
const verify=async cfg=>{
 const {fetchImpl,hits}=api(cfg);
 return {result:await collectK5GitHubEvidence({repo:REPO,prNumber:69,
  token:'fixture-token',fetchImpl:withSyntheticApprovedK5Governance(fetchImpl)}),hits};
};

test('P1 dispatched workflow cannot replace failed PR quality gate, even on same SHA',async()=>{
 const runs=[
  run('quality',201,'2026-10-13T09:00:00Z',{conclusion:'failure'}),
  run('server',202,'2026-10-13T09:00:00Z'),
  run('quality',203,'2026-10-13T09:05:00Z',{event:'workflow_dispatch',pull_requests:[]})
 ];
 const {result}=await verify({runs});
 assert.equal(result.readiness.ready,false);
 assert.ok(result.readiness.blockers.includes('CI_INCOMPLETE_EXACT_HEAD'));
 assert.equal(result.browserEvidence,null);
});

test('P1 matching display names do not authorize wrong workflow identity or wrong PR',async()=>{
 const controls=[
  {workflow_id:1},
  {path:'.github/workflows/malicious.yml'},
  {pull_requests:[{number:68,head:{sha:H}}]},
  {event:'workflow_dispatch'}
 ];
 for(const wrong of controls){
  const runs=[run('quality',201,'2026-10-13T09:00:00Z',wrong),
   run('server',202,'2026-10-13T09:00:00Z')];
  const {result}=await verify({runs});
  assert.equal(result.readiness.ready,false,JSON.stringify(wrong));
 }
});

test('P1 later 101st review CHANGES_REQUESTED cannot be omitted by first-page truncation',async()=>{
 const clean={id:410,commit_id:H,state:'COMMENTED',
  user:{login:'chatgpt-codex-connector[bot]'},body};
 const page1=[clean,...Array.from({length:99},(_,i)=>({
  id:500+i,commit_id:'b'.repeat(40),state:'COMMENTED',
  user:{login:'ordinary-reviewer'},body:'legacy'
 }))];
 const page2=[{id:911,commit_id:H,state:'CHANGES_REQUESTED',
  user:{login:'security-reviewer'},body:'P1 remains'}];
 const {result,hits}=await verify({runs:[
  run('quality',201,'2026-10-13T09:00:00Z'),
  run('server',202,'2026-10-13T09:00:00Z')
 ],reviews:page1,extraReviewPages:{2:page2}});
 assert.equal(result.readiness.ready,false);
 assert.ok(result.readiness.blockers.includes('CHANGES_REQUESTED_BLOCKS_RELEASE'));
 assert.ok(hits.some(x=>x.includes('/pulls/69/reviews?')&&x.includes('page=2')));
});

test('matching trusted PR workflows and clean review produce an eligible evidence report',async()=>{
 const {result}=await verify({runs:[
  run('quality',201,'2026-10-13T09:00:00Z'),
  run('server',202,'2026-10-13T09:00:00Z')
 ]});
 assert.equal(result.readiness.ready,true);
 assert.equal(result.browserEvidence.runId,201);
});
