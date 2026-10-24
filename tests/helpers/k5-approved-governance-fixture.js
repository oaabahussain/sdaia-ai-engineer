// Synthetic, deliberately approved K5 governance context for release-auditor
// unit tests. Not a deployment authority. Never use this outside tests.
export const APPROVED_HEAD='a'.repeat(40);
const MAIN='d'.repeat(40),SPEC='b'.repeat(40),PLAN='c'.repeat(40);
const OWNER='oaabahussain',BRANCH='feat/k5-tdd-evidence-20261012';
const comment=(body)=>({body,user:{login:OWNER},created_at:'2026-10-13T09:00:00Z'});
const encode=(source,sha)=>({sha,encoding:'base64',content:Buffer.from(source).toString('base64')});

export function withSyntheticApprovedK5Governance(transport){
 return async(url,options)=>{
  const path=url.replace('https://api.github.com','');
  if(path.includes('/contents/docs/superpowers/state/K5-CURRENT-STATE.json?ref=')){
   const state={schema_version:1,feature:'K5.EVIDENCE.v1',
    stage:'IN_PROGRESS',numeric_lane:'INACTIVE',baseline_main_sha:MAIN,
    spec_blob_sha:SPEC,plan_blob_sha:PLAN,branch:BRANCH,
    formal_spec_approval:{approved_by:OWNER,blob_sha:SPEC,approved_at:'2026-10-13T09:00:00Z'},
    formal_plan_approval:{approved_by:OWNER,blob_sha:PLAN,approved_at:'2026-10-13T09:00:00Z'},
    release_blockers:[]};
   return {ok:true,json:async()=>encode(JSON.stringify(state),'e'.repeat(40))};
  }
  if(path.includes('/contents/docs/superpowers/specs/2026-10-11-k5-mastery-readiness-projections-design.md?ref='))
   return {ok:true,json:async()=>encode('# Spec\n**Status:** APPROVED\n',SPEC)};
  if(path.includes('/contents/docs/superpowers/plans/2026-10-12-k5-evidence-sufficiency-tdd.md?ref='))
   return {ok:true,json:async()=>encode('# Plan\n**Status:** APPROVED\n',PLAN)};
  const r=await transport(url,options);
  if(path.endsWith('/pulls/69'))
   return {ok:r.ok,json:async()=>{
    const pr=await r.json();
    return {...pr,base:{...pr.base,sha:MAIN},head:{...pr.head,ref:BRANCH}};
   }};
  if(path.endsWith('/issues/69/comments?per_page=100'))
   return {ok:r.ok,json:async()=>{
    const comments=await r.json();
    if(!Array.isArray(comments))throw new Error('invalid test issue comments');
    return [...comments,comment('K5-SPEC-APPROVED BLOB='+SPEC),
      comment('K5-PLAN-APPROVED BLOB='+PLAN)];
   }};
  return r;
 };
}
