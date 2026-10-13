import {verifyK5Release} from '../../src/mastery/release.js';
import {pathToFileURL} from 'node:url';

const SHA=/^[a-f0-9]{40}$/;
const APPROVAL=/^K5-LANDING-APPROVED PR=(\d+) HEAD=([a-f0-9]{40})$/;
const REQUESTED_CHECKS=['Pull request quality gate','Server and adapter contract tests'];

// Read-only, fail-closed GitHub API inspection. Never merges, approves or sets
// an issue label. Synthetic test objects are not a live authorization source.
export async function collectK5GitHubEvidence({
  repo,prNumber,token,fetchImpl=globalThis.fetch
}={}) {
  const parts=typeof repo==='string'?repo.split('/'):[];
  if(parts.length!==2||
     !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(parts[0])||
     !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}$/.test(parts[1])||
     parts[1].includes('..'))
    throw new TypeError('invalid GitHub repo');
  if(!Number.isSafeInteger(prNumber)||prNumber<1)
    throw new TypeError('invalid PR number');
  if(typeof token!=='string'||!token)throw new TypeError('GitHub token required');
  if(typeof fetchImpl!=='function')throw new TypeError('GitHub transport required');
  const [owner,name]=parts;
  const root='https://api.github.com';
  const api='/repos/'+repo;
  async function request(path,graphqlBody=null){
    const opts={method:graphqlBody?'POST':'GET',headers:{
      Accept:'application/vnd.github+json',Authorization:'Bearer '+token,
      'X-GitHub-Api-Version':'2022-11-28'
    }};
    if(graphqlBody){
      opts.headers['Content-Type']='application/json';
      opts.body=JSON.stringify(graphqlBody);
    }
    const response=await fetchImpl(root+path,opts);
    if(!response?.ok)throw new Error('GitHub read-only API rejected request '+path);
    const data=await response.json();
    if(data?.errors?.length)throw new Error('GitHub review-thread GraphQL unavailable');
    return data;
  }
  const pr=await request(api+'/pulls/'+prNumber);
  if(pr.number!==prNumber||pr.base?.ref!=='main'||!SHA.test(pr.head?.sha??'')||
     pr.merged||pr.state!=='open')throw new Error('unexpected PR identity/base/state');
  const prHead=pr.head.sha;
  const [runs,reviews,comments,graphql]=await Promise.all([
    request(api+'/actions/runs?head_sha='+prHead+'&per_page=100'),
    request(api+'/pulls/'+prNumber+'/reviews?per_page=100'),
    request(api+'/issues/'+prNumber+'/comments?per_page=100'),
    request('/graphql',{query:`query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){pullRequest(number:$number){
        reviewThreads(first:100){nodes{isResolved comments(first:1){nodes{body}}}
          pageInfo{hasNextPage}}
      }}
    }`,variables:{owner,name,number:prNumber}})
  ]);
  const threadPage=graphql?.data?.repository?.pullRequest?.reviewThreads;
  if(!threadPage||threadPage.pageInfo?.hasNextPage)
    throw new Error('review-thread pagination incomplete; release blocked');
  const openThreads=threadPage.nodes.filter(node=>!node.isResolved);
  const materialOpen=openThreads.filter(node=>
    node.comments?.nodes?.some(c=>/P0|P1|P2|critical|important/i.test(c.body??'')));
  // Owner COMMENTED reviews and drive-by remarks are not independent
  // code reviews. Require Codex's actual review submission (not an
  // arbitrary PR comment), its reviewed-commit marker, and exact head.
  const validReviews=(Array.isArray(reviews)?reviews:[])
    .filter(v=>v.commit_id===prHead&&v.state==='COMMENTED'&&
      v.user?.login==='chatgpt-codex-connector[bot]'&&
      typeof v.body==='string'&&
      v.body.includes('### 💡 Codex Review')&&
      v.body.includes('**Reviewed commit:** `'+prHead.slice(0,10)+'`'));
  const eligibleRuns=(runs.workflow_runs??[]).filter(run=>
    run.head_sha===prHead&&run.status==='completed'&&run.conclusion==='success');
  const checks=REQUESTED_CHECKS.flatMap(checkName=>{
    const run=eligibleRuns.find(v=>v.name===checkName);
    return run?[{name:checkName,sha:prHead,conclusion:'success'}]:[];
  });
  const quality=eligibleRuns.find(run=>run.name==='Pull request quality gate');
  let browserEvidence=null;
  if(quality){
    const jobs=await request(api+'/actions/runs/'+quality.id+'/jobs?per_page=100');
    for(const job of jobs.jobs??[]){
      if(job.steps?.some(step=>step.name==='Browser smoke test'&&step.conclusion==='success')){
        browserEvidence={sha:prHead,runId:quality.id,jobId:job.id,
          stepName:'Browser smoke test',conclusion:'success'};
        break;
      }
    }
  }
  const approvalComments=(Array.isArray(comments)?comments:[])
    .filter(c=>c.user?.login===owner)
    .filter(c=>{
      const match=APPROVAL.exec((c.body??'').trim());
      return match&&Number(match[1])===prNumber&&match[2]===prHead;
    });
  const approval=approvalComments.length?{
    prNumber,headSha:prHead,approvedBy:owner,
    approvedAt:approvalComments.at(-1).created_at
  }:null;
  // A current-head CHANGES_REQUESTED submission is a blocking review even
  // when a different independent reviewer also left a COMMENTED review.
  const changesRequested=(Array.isArray(reviews)?reviews:[])
    .some(v=>v.commit_id===prHead&&v.state==='CHANGES_REQUESTED');
  const review={headSha:prHead,
    completed:validReviews.length>0&&openThreads.length===0&&!changesRequested,
    openCritical:materialOpen.length,openImportant:openThreads.length};
  const readiness=verifyK5Release({prNumber,prHead,approval,checks,review,browserEvidence,
    policy:{policy_id:'K5.EVIDENCE.v1',numericalLane:'INACTIVE'}});
  if(changesRequested){
    readiness.ready=false;
    readiness.blockers.push('CHANGES_REQUESTED_BLOCKS_RELEASE');
  }
  if(pr.draft||openThreads.length){
    readiness.ready=false;
    if(pr.draft)readiness.blockers.push('DRAFT_PR');
    if(openThreads.length)readiness.blockers.push('OPEN_REVIEW_THREADS');
  }
  return {prNumber,prHead,draft:Boolean(pr.draft),checks,review,browserEvidence,
    approvalPresent:Boolean(approval),readiness};
}

async function main(){
 const args=process.argv.slice(2);
 const val=name=>args[args.indexOf(name)+1];
 const repo=process.env.GITHUB_REPOSITORY;
 const prNumber=Number(val('--pr')||process.env.K5_PR_NUMBER);
 const expectedHead=val('--head')||process.env.K5_EXPECTED_HEAD;
 const data=await collectK5GitHubEvidence({
   repo,prNumber,token:process.env.GITHUB_TOKEN
 });
 if(expectedHead&&data.prHead!==expectedHead)throw new Error('PR head moved since CI checkout');
 console.log(JSON.stringify({
   feature:'K5.EVIDENCE.v1',mode:'READ_ONLY_AUDIT',...data
 }));
 // Audit is a reporting gate while the feature PR is a draft; the merge
 // pathway must invoke the fail-closed release and PR Completion plan itself.
 if(!args.includes('--audit')&&!data.readiness.ready)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  main().catch(error=>{console.error('K5 GitHub audit blocked: '+error.message);process.exitCode=1});
