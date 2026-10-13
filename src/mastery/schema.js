import { isOpaqueK5LearnerId } from './privacy.js';
// Versioned K5 Lane 1: never infer numeric ability from public exposures.
const ESTIMATES=['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'];
const KEYS=['schema_version','projection_type','policy_id','source_store_id','through_store_seq','learner_id','identity_scope','track_id','content_release_id','question_payload_sha256','catalog_version','catalog_canonical_sha256','objective_map_canonical_sha256','lineage_map_version','lineage_map_canonical_sha256','objective_map_version','identity_resolution_version','integrity_status','observation_status','estimation_status','reason_codes','observed_distinct_family_count','observed_distinct_interaction_count','observed_domain_count','objectives',...ESTIMATES];
const OBJ_KEYS=['objective_id','domain_id','mapping_status','observed_distinct_family_count','observed_distinct_interaction_count','source_status','reason_codes','mastery_estimate'];
export const K5_REASON_CODES=Object.freeze(['NO_EVIDENCE','EXPOSURE_ONLY','NO_TRUSTED_EVALUATION','PUBLIC_FAMILY_REPEATED','PROVISIONAL_OBJECTIVE_MAP','CORRECTION_UNRESOLVED','CORRECTION_CONFLICT','SOURCE_INTEGRITY_INVALID','CONTENT_RELEASE_MISMATCH','CORRECTION_AUTHORITY_UNVERIFIED','UNKNOWN_FAMILY_MAPPING','IDENTITY_UNVERIFIED','CALIBRATION_NOT_APPROVED','PROTECTED_EVIDENCE_UNAVAILABLE']);
const allowedReasons=new Set(K5_REASON_CODES);
const isPlain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const sha=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const id=x=>typeof x==='string'&&x.length>0;
const count=x=>Number.isSafeInteger(x)&&x>=0;
const must=(condition,message)=>{if(!condition)throw new Error(message)};
function exact(value,keys){
 must(isPlain(value),'projection must be plain object');
 for(const key of keys)must(Object.hasOwn(value,key),'missing '+key);
 for(const key of Object.keys(value))must(keys.includes(key),'unknown field '+key);
}
function validReasons(codes){
 must(Array.isArray(codes)&&codes.every(code=>allowedReasons.has(code)),'unknown reason');
 must(codes.every((code,i)=>i===0||codes[i-1]<code),'reason codes must be sorted and unique');
}
export function validateK5Projection(p){
 exact(p,KEYS);
 must(p.schema_version===1&&p.projection_type==='EvidenceSufficiencyProjectionV1'&&p.policy_id==='K5.EVIDENCE.v1'&&p.estimation_status==='DISABLED_UNVALIDATED','unsupported policy or schema');
 for(const key of ESTIMATES)must(p[key]===null,key+' must be JSON null');
 for(const key of ['source_store_id','learner_id','track_id','content_release_id','catalog_version','objective_map_version'])must(id(p[key]),'missing identity '+key);
 must(isOpaqueK5LearnerId(p.learner_id),'learner_id must be a pseudonym without direct PII or surrounding whitespace');
 for(const key of ['question_payload_sha256','catalog_canonical_sha256','objective_map_canonical_sha256'])must(sha(p[key]),'invalid SHA-256 hash '+key);
 must((p.lineage_map_version===null&&p.lineage_map_canonical_sha256===null)||(id(p.lineage_map_version)&&sha(p.lineage_map_canonical_sha256)),'lineage map version/digest inconsistent');
 must(count(p.through_store_seq),'invalid source watermark');
 must(['LOCAL_UNAUTHENTICATED','VERIFIED_LINKED'].includes(p.identity_scope),'invalid identity scope');
 must((p.identity_scope==='LOCAL_UNAUTHENTICATED'&&p.identity_resolution_version===null)||(p.identity_scope==='VERIFIED_LINKED'&&id(p.identity_resolution_version)),'invalid identity resolution version');
 for(const key of ['observed_distinct_family_count','observed_distinct_interaction_count','observed_domain_count'])must(count(p[key]),'invalid count '+key);
 must(Array.isArray(p.objectives),'invalid objectives');
 validReasons(p.reason_codes);
 for(const mandatory of ['CALIBRATION_NOT_APPROVED','NO_TRUSTED_EVALUATION'])must(p.reason_codes.includes(mandatory),'missing mandatory reason '+mandatory);
 must(p.reason_codes.includes('IDENTITY_UNVERIFIED')===(p.identity_scope==='LOCAL_UNAUTHENTICATED'),'missing/unexpected identity reason');
 const tuples={COMPLETE:['NO_OBSERVATIONS','OBSERVATIONS_PRESENT'],INCOMPLETE:['INSUFFICIENT_EVIDENCE','QUARANTINED'],CONFLICTED:['QUARANTINED'],SOURCE_INVALID:['QUARANTINED']};
 must(tuples[p.integrity_status]?.includes(p.observation_status),'invalid status tuple');
 must(p.reason_codes.includes('NO_EVIDENCE')===(p.observation_status==='NO_OBSERVATIONS'),'invalid NO_EVIDENCE reason for status');
 if(p.observation_status==='NO_OBSERVATIONS')
   must(p.observed_distinct_family_count===0&&p.observed_distinct_interaction_count===0&&p.observed_domain_count===0,'NO_OBSERVATIONS must have zero counts');
 if(p.observation_status==='OBSERVATIONS_PRESENT')
   must(p.reason_codes.includes('EXPOSURE_ONLY')&&p.observed_distinct_family_count>0&&p.observed_distinct_interaction_count>0,'OBSERVATIONS_PRESENT must have verified exposure');
 if(p.observation_status==='INSUFFICIENT_EVIDENCE')
   must(p.reason_codes.includes('UNKNOWN_FAMILY_MAPPING'),'INSUFFICIENT_EVIDENCE requires mapping reason');
 if(p.integrity_status==='SOURCE_INVALID')
   must(p.reason_codes.includes('SOURCE_INTEGRITY_INVALID')&&p.objectives.length===0&&p.observed_distinct_family_count===0&&p.observed_distinct_interaction_count===0&&p.observed_domain_count===0,'SOURCE_INVALID requires source reason and zero counts');
 if(p.integrity_status==='CONFLICTED')
   must(p.reason_codes.includes('CORRECTION_CONFLICT')||p.reason_codes.includes('CORRECTION_AUTHORITY_UNVERIFIED'),'CONFLICTED requires correction reason');
 if(p.integrity_status==='INCOMPLETE')
   must(p.reason_codes.includes('UNKNOWN_FAMILY_MAPPING')||p.reason_codes.includes('CORRECTION_UNRESOLVED'),'INCOMPLETE requires mapping/correction reason');
 let previous='';
 for(const objective of p.objectives){
   exact(objective,OBJ_KEYS);
   must(id(objective.objective_id)&&objective.objective_id>previous&&id(objective.domain_id),'invalid objective order/identity');
   previous=objective.objective_id;
   must(['PROVISIONAL','APPROVED'].includes(objective.mapping_status)&&['OBSERVED_ONLY','NO_OBSERVATIONS','QUARANTINED'].includes(objective.source_status),'invalid objective status');
   must(count(objective.observed_distinct_family_count)&&count(objective.observed_distinct_interaction_count)&&objective.mastery_estimate===null,'invalid objective count or mastery null');
   validReasons(objective.reason_codes);
   if(objective.source_status==='QUARANTINED'||objective.source_status==='NO_OBSERVATIONS')
     must(objective.observed_distinct_family_count===0&&objective.observed_distinct_interaction_count===0,'quarantined or empty objective counters must be zero');
   if(objective.source_status==='OBSERVED_ONLY')
     must(objective.observed_distinct_family_count>0&&objective.observed_distinct_interaction_count>0,'observed objective must have positive counters');
 }
 const active=p.objectives.filter(objective=>objective.source_status==='OBSERVED_ONLY');
 const familyTotal=active.reduce((sum,objective)=>sum+objective.observed_distinct_family_count,0);
 const interactionTotal=active.reduce((sum,objective)=>sum+objective.observed_distinct_interaction_count,0);
 const domainTotal=new Set(active.map(objective=>objective.domain_id)).size;
 must(p.observed_distinct_family_count===familyTotal&&
      p.observed_distinct_interaction_count===interactionTotal&&
      p.observed_domain_count===domainTotal,'K5 aggregate objective counts do not reconcile');
 return true;
}
