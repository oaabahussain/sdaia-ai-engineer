// Pure release-readiness contract; NEVER a merge operation.
// Only independently verified GitHub current-head checks and explicit owner
// authorization may populate these arguments during a real landing decision.
const REQUIRED_CHECKS=['Pull request quality gate','Server and adapter contract tests','K5 Chromium accessibility'];
const FULL_SHA=/^[0-9a-f]{40}$/;
function approved(approval,number,sha){
 return approval?.prNumber===number&&approval?.headSha===sha&&
  typeof approval.approvedBy==='string'&&approval.approvedBy.length>0&&
  typeof approval.approvedAt==='string'&&Number.isFinite(Date.parse(approval.approvedAt));
}
export function verifyK5Release({prNumber,prHead,approval,checks=[],review,policy,
  phase='PRE_MERGE',mergedHead,postMergeChecks=[]}={}){
 const blockers=[];
 if(!Number.isSafeInteger(prNumber)||prNumber<1||!FULL_SHA.test(prHead??''))
  blockers.push('INVALID_PR_HEAD');
 if(!approved(approval,prNumber,prHead))
  blockers.push('OWNER_PR_HEAD_APPROVAL_REQUIRED');
 if(!review||review.headSha!==prHead||review.completed!==true||
    !Number.isInteger(review.openCritical)||review.openCritical!==0||
    !Number.isInteger(review.openImportant)||review.openImportant!==0)
  blockers.push('INDEPENDENT_REVIEW_NOT_CLEAN');
 if(!Array.isArray(checks)||!REQUIRED_CHECKS.every(name=>
    checks.some(check=>check.name===name&&check.sha===prHead&&check.conclusion==='success')))
  blockers.push('CI_INCOMPLETE_EXACT_HEAD');
 if(policy?.policy_id!=='K5.EVIDENCE.v1'||policy.numericalLane!=='INACTIVE')
  blockers.push('UNAPPROVED_SCORING_LANE');
 if(phase==='POST_MERGE'){
   if(mergedHead!==prHead||
      !postMergeChecks.some(check=>check.name==='merged-main full regression'&&
        check.sha===mergedHead&&check.conclusion==='success'))
     blockers.push('POST_MERGE_VERIFICATION_REQUIRED');
 }else if(phase!=='PRE_MERGE')blockers.push('INVALID_RELEASE_PHASE');
 return {ready:blockers.length===0,blockers};
}
