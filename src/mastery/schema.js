const NULL_FIELDS=['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'];
const REASONS=new Set(['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION','SOURCE_INVALID','CORRECTION_CONFLICT','CORRECTION_AUTHORITY_UNVERIFIED','CORRECTION_UNRESOLVED','UNKNOWN_FAMILY_MAPPING','SOURCE_UNAVAILABLE','EVIDENCE_INCOMPLETE','NO_PUBLIC_PRESENTATIONS']);
const STATUSES=new Set(['NO_OBSERVATIONS','INSUFFICIENT_EVIDENCE','QUARANTINED','OBSERVED']);
export function validateK5Projection(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid projection');
 const required=['schema_version','projection_type','policy_id','integrity_status','observation_status','estimation_status','reason_codes','observed_distinct_family_count','observed_distinct_interaction_count','observed_domain_count','objectives',...NULL_FIELDS];
 for(const key of required)if(!Object.hasOwn(value,key))throw Error('missing '+key);
 for(const key of Object.keys(value))if(!required.includes(key))throw Error('unknown field '+key);
 for(const key of NULL_FIELDS)if(value[key]!==null)throw Error(key+' must be null');
 if(value.schema_version!==1||value.projection_type!=='EvidenceSufficiencyProjectionV1'||value.policy_id!=='K5.EVIDENCE.v1'||value.estimation_status!=='DISABLED_UNVALIDATED')throw Error('invalid policy');
 if(!['COMPLETE','INCOMPLETE','CONFLICTED','INVALID'].includes(value.integrity_status)||!STATUSES.has(value.observation_status))throw Error('invalid status');
 if(value.observation_status==='QUARANTINED'&&value.integrity_status==='COMPLETE')throw Error('invalid status tuple');
 if(!Array.isArray(value.reason_codes)||value.reason_codes.some(x=>!REASONS.has(x)))throw Error('unknown reason');
 if(value.reason_codes.some((x,i)=>i>0&&value.reason_codes[i-1]>=x))throw Error('reason codes must be sorted and unique');
 for(const key of ['observed_distinct_family_count','observed_distinct_interaction_count','observed_domain_count'])if(!Number.isSafeInteger(value[key])||value[key]<0)throw Error('invalid count');
 if(!Array.isArray(value.objectives))throw Error('invalid objectives');
 return true;
}
