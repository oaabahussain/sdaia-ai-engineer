import {verifyK5Release} from '../../src/mastery/release.js';
import {validateK5State} from './validate_k5_state.js';
import {pathToFileURL} from 'node:url';

const SHA=/^[a-f0-9]{40}$/;
const APPROVAL=/^K5-LANDING-APPROVED PR=(\d+) HEAD=([a-f0-9]{40})$/;
const SPEC_APPROVAL=/^K5-SPEC-APPROVED BLOB=([a-f0-9]{40})$/;
const PLAN_APPROVAL=/^K5-PLAN-APPROVED BLOB=([a-f0-9]{40})$/;
const GOV_STATE='docs/superpowers/state/K5-CURRENT-STATE.json';
const SPEC_DOC='docs/superpowers/specs/2026-10-11-k5-mastery-readiness-projections-design.md';
const PLAN_DOC='docs/superpowers/plans/2026-10-12-k5-evidence-sufficiency-tdd.md';
// Repository-pinned GitHub workflow identities, not mutable display names.
const REQUIRED_WORKFLOWS=Object.freeze({
  'Pull request quality gate':Object.freeze({
    id:354048838,path:'.github/workflows/ci.yml'
  }),
  'Server and adapter contract tests':Object.freeze({
    id:352261825,path:'.github/workflows/server-tests.yml'
  })
});
const REQUESTED_CHECKS=Object.keys(REQUIRED_WORKFLOWS);

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
  // GitHub caps reviews at 100 per page; an omitted objection must never
  // become an implicit approval. Page until short, or fail closed on limits.
  async function getCompleteReviews(){
    const all=[];
    for(let page=1;page<=100;page++){
      const suffix=page===1?'':'&page='+page;
      const entries=await request(api+'/pulls/'+prNumber+
        '/reviews?per_page=100'+suffix);
      if(!Array.isArray(entries)||entries.length>100)
        throw new Error('invalid GitHub review pagination; release blocked');
      all.push(...entries);
      if(entries.length<100)return all;
    }
    throw new Error('review pagination limit exceeded; release blocked');
  }
  async function getCompleteIssueComments(){
    const all=[];
    for(let page=1;page<=100;page++){
      const suffix=page===1?'':'&page='+page;
      const entries=await request(api+'/issues/'+prNumber+
        '/comments?per_page=100'+suffix);
      if(!Array.isArray(entries)||entries.length>100)
        throw new Error('invalid owner-comment pagination; release blocked');
      all.push(...entries);
      if(entries.length<100)return all;
    }
    throw new Error('owner-comment pagination limit exceeded; release blocked');
  }
  // Obtain immutable GitHub blob IDs and bytes from the SAME head as the PR.
  // The PR author cannot turn an unapproved specification into approval via
  // a landing comment; approval must bind the actual spec/plan Git blobs.
  async function readGovernanceDocument(path){
    const file=await request(api+'/contents/'+path+'?ref='+prHead);
    if(!SHA.test(file?.sha??'')||file?.encoding!=='base64'||
       typeof file?.content!=='string')
      throw new Error('invalid authenticated K5 governance artifact '+path);
    return {sha:file.sha,text:Buffer.from(file.content,'base64').toString('utf8')};
  }
  const [runs,reviews,comments,graphql,governanceDocs]=await Promise.all([
    request(api+'/actions/runs?head_sha='+prHead+'&per_page=100'),
    getCompleteReviews(),
    getCompleteIssueComments(),
    request('/graphql',{query:`query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){pullRequest(number:$number){
        reviewThreads(first:100){nodes{isResolved comments(first:1){nodes{body}}}
          pageInfo{hasNextPage}}
      }}
    }`,variables:{owner,name,number:prNumber}}),
    Promise.all([readGovernanceDocument(GOV_STATE),
      readGovernanceDocument(SPEC_DOC),readGovernanceDocument(PLAN_DOC)])
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
  // Exact-head dismissed Codex reviews can still carry a P0/P1/P2 finding.
  // Dismissal must never erase evidence, but it is NOT clean approval either.
  const evidenceReviews=(Array.isArray(reviews)?reviews:[])
    .filter(v=>v.commit_id===prHead&&
      (v.state==='COMMENTED'||v.state==='DISMISSED')&&
      v.user?.login==='chatgpt-codex-connector[bot]'&&
      Number.isSafeInteger(v.id)&&v.id>0&&
      typeof v.body==='string'&&
      v.body.includes('### 💡 Codex Review')&&
      v.body.includes('**Reviewed commit:** `'+prHead.slice(0,10)+'`'));
  const validReviews=evidenceReviews.filter(v=>v.state==='COMMENTED');
  // Resolved threads and administratively dismissed review submissions do
  // not erase exact-head findings. Fixes need a new head and a new review.
  const reviewComments=await Promise.all(evidenceReviews.map(async review=>{
    const comments=await request(api+'/pulls/'+prNumber+'/reviews/'+review.id+'/comments?per_page=100');
    if(!Array.isArray(comments)||comments.length===100)
      throw new Error('review comment pagination incomplete; release blocked');
    return comments;
  }));
  const exactHeadReviewHasFindings=reviewComments.some(comments=>
    comments.some(comment=>/\bP[012]\b|critical|important/i.test(comment.body??'')));
  // Select the newest check independently from its result: old green runs
  // cannot conceal later failed, cancelled or pending runs on the same SHA.
  const allRuns=Array.isArray(runs.workflow_runs)?runs.workflow_runs:[];
  const latestRun=name=>allRuns
    .filter(run=>{
      const workflow=REQUIRED_WORKFLOWS[name];
      return run.head_sha===prHead&&run.name===name&&
        run.workflow_id===workflow.id&&run.path===workflow.path&&
        run.event==='pull_request'&&
        Array.isArray(run.pull_requests)&&run.pull_requests.some(p=>
          p.number===prNumber&&p.head?.sha===prHead);
    })
    .sort((a,b)=>{
      const timeA=Date.parse(a.created_at??'')||0,timeB=Date.parse(b.created_at??'')||0;
      return timeB-timeA||(Number(b.run_number)||0)-(Number(a.run_number)||0)||
        (Number(b.id)||0)-(Number(a.id)||0);
    })[0]??null;
  const latestRuns=REQUESTED_CHECKS.map(latestRun);
  const successful=run=>run?.status==='completed'&&run.conclusion==='success';
  const checks=latestRuns.filter(successful).map(run=>({
    name:run.name,sha:prHead,conclusion:'success'
  }));
  const quality=latestRuns.find(run=>run?.name==='Pull request quality gate'&&successful(run));
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
  const [stateDoc,specDoc,planDoc]=governanceDocs;
  const state=JSON.parse(stateDoc.text);
  const stateValidity=validateK5State({
    state,liveMainSha:pr.base?.sha,specBlobSha:specDoc.sha,
    planBlobSha:planDoc.sha,executionRef:pr.head?.ref
  });
  // The status lines are in the exact Git blobs, not inferred from the
  // implementation authorization or from draft/CI status.
  const approvedStatus=source=>
    /^\*\*Status:\*\*\s*APPROVED\s*$/m.test(source);
  const ownerHasBlobApproval=(regex,blob)=>comments.some(note=>{
    if(note.user?.login!==owner)return false;
    const match=regex.exec((note.body??'').trim());
    return Boolean(match&&match[1]===blob);
  });
  // Immutable approved blobs remain unchanged. An explicit authenticated
  // owner attestation can approve those exact bytes without rewriting their
  // historical NOT_APPROVED headers (which would change the approved hashes).
  const detached=state.owner_authorization_for_spec_and_plan;
  const detachedApproval=Boolean(detached?.approved===true&&
    detached.scope==='SPEC_AND_PLAN_ONLY_NO_MERGE_AUTHORIZATION'&&
    detached.spec_blob_sha===specDoc.sha&&detached.plan_blob_sha===planDoc.sha&&
    Number.isSafeInteger(detached.pr_comment_id)&&detached.pr_comment_id>0&&
    Number.isFinite(Date.parse(detached.at??''))&&comments.some(note=>{
      if(note.id!==detached.pr_comment_id||note.user?.login!==owner||
        !Number.isFinite(Date.parse(note.created_at??''))||
        Date.parse(note.created_at)<Date.parse(detached.at))return false;
      const match=/^Owner decision recorded from ChatGPT conversation, (\\S+): \\*\\*APPROVED\\*\\* the explicitly requested K5 design\\/spec blob \\x60([0-9a-f]{40})\\x60 and implementation plan blob \\x60([0-9a-f]{40})\\x60 \\(AC-01\\)\\. Approval scope: \\*\\*specification and plan only\\*\\*\\. It is \\*\\*NOT\\*\\* per-PR\\/exact-HEAD landing consent/.exec(note.body??'');
      return Boolean(match&&match[1]===detached.at&&
        match[2]===specDoc.sha&&match[3]===planDoc.sha);
    }));
  const specAccepted=state.formal_spec_approval?.approved_by===owner&&
    state.formal_spec_approval.blob_sha===specDoc.sha&&
    Number.isFinite(Date.parse(state.formal_spec_approval.approved_at));
  const planAccepted=state.formal_plan_approval?.approved_by===owner&&
    state.formal_plan_approval.blob_sha===planDoc.sha&&
    Number.isFinite(Date.parse(state.formal_plan_approval.approved_at));
  const ac01Blocked=Array.isArray(state.release_blockers)&&
    state.release_blockers.some(value=>/AC0?1|SPEC.*APPROV|PLAN.*APPROV/i.test(String(value)));
  const governance={headSha:prHead,specBlobSha:specDoc.sha,
    planBlobSha:planDoc.sha,approved:Boolean(stateValidity.ok&&
      ((approvedStatus(specDoc.text)&&approvedStatus(planDoc.text)&&
        specAccepted&&planAccepted&&
        ownerHasBlobApproval(SPEC_APPROVAL,specDoc.sha)&&
        ownerHasBlobApproval(PLAN_APPROVAL,planDoc.sha))||detachedApproval)&&
      !ac01Blocked)};
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
    completed:validReviews.length>0&&openThreads.length===0&&
      !changesRequested&&!exactHeadReviewHasFindings,
    openCritical:materialOpen.length,openImportant:openThreads.length};
  const readiness=verifyK5Release({prNumber,prHead,approval,checks,review,browserEvidence,
    policy:{policy_id:'K5.EVIDENCE.v1',numericalLane:'INACTIVE'},governance});
  if(changesRequested){
    readiness.ready=false;
    readiness.blockers.push('CHANGES_REQUESTED_BLOCKS_RELEASE');
  }
  if(pr.draft||openThreads.length){
    readiness.ready=false;
    if(pr.draft)readiness.blockers.push('DRAFT_PR');
    if(openThreads.length)readiness.blockers.push('OPEN_REVIEW_THREADS');
  }
  return {prNumber,prHead,draft:Boolean(pr.draft),governance,checks,review,browserEvidence,
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
