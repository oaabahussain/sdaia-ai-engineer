// Pure release-readiness contract; NEVER a merge operation.
// Only independently verified GitHub current-head checks and explicit owner
// authorization may populate these arguments during a real landing decision.
const REQUIRED_CHECKS=['Pull request quality gate','Server and adapter contract tests'];
const FULL_SHA=/^[0-9a-f]{40}$/;
function approved(approval,number,sha){
 return approval?.prNumber===number&&approval?.headSha===sha&&
  typeof approval.approvedBy==='string'&&approval.approvedBy.length>0&&
  typeof approval.approvedAt==='string'&&Number.isFinite(Date.parse(approval.approvedAt));
}
export function verifyK5Release({prNumber,prHead,approval,checks=[],review,policy,
  phase='PRE_MERGE',mergedHead,mainHead,mergeParents,postMergeChecks=[],browserEvidence,
  governance}={}){
 const blockers=[];
 if(!Number.isSafeInteger(prNumber)||prNumber<1||!FULL_SHA.test(prHead??''))
  blockers.push('INVALID_PR_HEAD');
 // Governance is a separate prerequisite: a landing comment cannot silently
 // approve a previously unapproved spec or plan. The authenticated GitHub
 // auditor must supply both canonical blob proofs and formal owner evidence.
 if(governance?.approved!==true||governance.headSha!==prHead||
    !FULL_SHA.test(governance.specBlobSha??'')||
    !FULL_SHA.test(governance.planBlobSha??''))
  blockers.push('K5_FORMAL_SPEC_PLAN_APPROVAL_REQUIRED');
 if(!approved(approval,prNumber,prHead))
  blockers.push('OWNER_PR_HEAD_APPROVAL_REQUIRED');
 if(!review||review.headSha!==prHead||review.completed!==true||
    !Number.isInteger(review.openCritical)||review.openCritical!==0||
    !Number.isInteger(review.openImportant)||review.openImportant!==0)
  blockers.push('INDEPENDENT_REVIEW_NOT_CLEAN');
 if(!Array.isArray(checks)||!REQUIRED_CHECKS.every(name=>
    checks.some(check=>check.name===name&&check.sha===prHead&&check.conclusion==='success')))
  blockers.push('CI_INCOMPLETE_EXACT_HEAD');
 if(!browserEvidence||browserEvidence.sha!==prHead||
    !Number.isSafeInteger(browserEvidence.runId)||browserEvidence.runId<=0||
    !Number.isSafeInteger(browserEvidence.jobId)||browserEvidence.jobId<=0||
    browserEvidence.stepName!=='Browser smoke test'||browserEvidence.conclusion!=='success')
  blockers.push('BROWSER_SMOKE_EVIDENCE_REQUIRED');
 if(policy?.policy_id!=='K5.EVIDENCE.v1'||policy.numericalLane!=='INACTIVE')
  blockers.push('UNAPPROVED_SCORING_LANE');
 if(phase==='POST_MERGE'){
   const mergeIsDescendant=FULL_SHA.test(mergedHead??'')&&mergedHead!==prHead&&
     mainHead===mergedHead&&Array.isArray(mergeParents)&&mergeParents.length===2&&
     mergeParents.every(parent=>FULL_SHA.test(parent))&&mergeParents.includes(prHead);
   const required=['merged-main full regression','Pages deployment smoke'];
   if(!mergeIsDescendant||!required.every(name=>postMergeChecks.some(check=>
     check.name===name&&check.sha===mergedHead&&check.conclusion==='success')))
     blockers.push('POST_MERGE_VERIFICATION_REQUIRED');
 }else if(phase!=='PRE_MERGE')blockers.push('INVALID_RELEASE_PHASE');
 return {ready:blockers.length===0,blockers};
}
