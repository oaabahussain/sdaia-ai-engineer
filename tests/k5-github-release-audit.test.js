import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5GitHubEvidence} from '../scripts/process/verify_k5_release.js';
const H='a'.repeat(40);
const paths=[];
function fixture({openThread=false,approval=true,checkHead=H}={}){
 paths.length=0;
 const get=async(url,opts)=>{
  paths.push(url);
  const key=url.replace(/^https:\/\/api.github.com/,'');
  let data;
  if(key.endsWith('/pulls/69'))data={number:69,state:'open',draft:false,merged:false,head:{sha:H},base:{ref:'main'}};
  else if(key.includes('/actions/runs?'))data={workflow_runs:[
   {name:'Pull request quality gate',head_sha:checkHead,status:'completed',conclusion:'success',id:123},
   {name:'Server and adapter contract tests',head_sha:checkHead,status:'completed',conclusion:'success',id:124}
  ]};
  else if(key.endsWith('/actions/runs/123/jobs?per_page=100'))data={jobs:[{id:456,steps:[{name:'Browser smoke test',conclusion:'success'}]}]};
  else if(key.endsWith('/pulls/69/reviews?per_page=100'))data=[{commit_id:H,state:'COMMENTED',user:{login:'codex'}}];
  else if(key.endsWith('/issues/69/comments?per_page=100'))data=approval?[{body:'K5-LANDING-APPROVED PR=69 HEAD='+H,user:{login:'oaabahussain'},created_at:'2026-10-12T13:01:00Z'}]:[];
  else if(url.endsWith('/graphql'))data={data:{repository:{pullRequest:{reviewThreads:{nodes:openThread?[{isResolved:false,comments:{nodes:[{body:'P1 unresolved'}]}}]:[],pageInfo:{hasNextPage:false}}}}}};
  else throw Error('unexpected endpoint '+url);
  return {ok:true,json:async()=>data};
 };
 return get;
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
