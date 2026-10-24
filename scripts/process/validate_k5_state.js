const SHA=/^[0-9a-f]{40}$/;
export function validateK5State({state,liveMainSha,specBlobSha,planBlobSha,executionRef}={}){
 if(!state||state.schema_version!==1||state.feature!=='K5.EVIDENCE.v1'||
    state.stage!=='IN_PROGRESS'||state.numeric_lane!=='INACTIVE')
   return {ok:false,code:'INVALID_STAGE_OR_POLICY'};
 if(![liveMainSha,specBlobSha,planBlobSha,state.baseline_main_sha,state.spec_blob_sha,
   state.plan_blob_sha].every(sha=>typeof sha==='string'&&SHA.test(sha)))
   return {ok:false,code:'INVALID_SHA'};
 if(state.baseline_main_sha!==liveMainSha)return {ok:false,code:'MAIN_BASE_DRIFT'};
 if(state.spec_blob_sha!==specBlobSha||state.plan_blob_sha!==planBlobSha)
   return {ok:false,code:'SPEC_OR_PLAN_DRIFT'};
 if(!executionRef||executionRef==='main'||executionRef==='master'||
    !executionRef.startsWith('feat/')||state.branch!==executionRef)
   return {ok:false,code:'UNSAFE_EXECUTION_BRANCH'};
 return {ok:true,code:'OK'};
}
