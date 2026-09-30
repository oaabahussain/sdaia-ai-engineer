import { stableJson, sha256Text } from './stable_json.js';
const INVALID=new Set(['UNRELATED_IMPORT_FAILURE','SETUP_FAILURE','ENVIRONMENT_FAILURE']);
function core(input){return {schema_version:1,failure_class:input.failure_class,command:input.command,test_hashes:input.test_hashes??{},fixture_hashes:input.fixture_hashes??{}};}
function digestCore(v){return sha256Text(stableJson(v));}
export function acceptRedEvidence(input,{replaces=null,ruling=null}={}){
 if(!input?.failure_class||INVALID.has(input.failure_class))return {ok:false,code:'INVALID_RED',errors:['failure class is not accepted behavioral RED']};
 const value=core(input);
 if(replaces){
  if(!ruling||!/^Ruling:/i.test(ruling))return {ok:false,code:'INVALID_RED',errors:['replacement requires explicit high-reasoning Ruling']};
  value.replaces_digest=replaces.evidence_digest; value.ruling=ruling;
 }
 value.evidence_digest=digestCore({...value,evidence_digest:undefined});
 return {ok:true,code:'ACCEPTED_RED_VALID',evidence:value,errors:[]};
}
export function validateAcceptedRed(accepted,current){
 if(!accepted)return {ok:false,code:'INVALID_RED',errors:['accepted evidence missing']};
 const now=core(current);
 if(INVALID.has(now.failure_class))return {ok:false,code:'INVALID_RED',errors:['current RED class invalid']};
 if(stableJson(accepted.test_hashes)!==stableJson(now.test_hashes)||stableJson(accepted.fixture_hashes)!==stableJson(now.fixture_hashes)){
  return {ok:false,code:'ACCEPTED_RED_MUTATED',errors:['accepted test/fixture hashes changed']};
 }
 if(accepted.failure_class!==now.failure_class||accepted.command!==now.command)return {ok:false,code:'ACCEPTED_RED_MUTATED',errors:['accepted RED identity changed']};
 return {ok:true,code:'ACCEPTED_RED_VALID',errors:[]};
}
