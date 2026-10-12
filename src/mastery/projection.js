import {classifyK5Corrections} from './corrections.js';
import {collectK5Presentations} from './presentations.js';
import {canonicalMappingHash} from './provenance.js';
import {validateK5Projection} from './schema.js';
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const nonempty=x=>typeof x==='string'&&x.length>0;
const nullEstimates={mastery_estimate:null,readiness_estimate:null,readiness_probability:null,confidence_interval:null,model_validation_ref:null};

// Deterministic descriptive K5 Lane 1 projection. No ability estimator exists.
export async function deriveK5EvidenceSufficiency({
  source,events,acceptedPublicCatalog,acceptedObjectiveMap,policy,identityResolutionVersion=null
}={}) {
  if(policy?.policy_id!=='K5.EVIDENCE.v1'||identityResolutionVersion!==null)
    throw new TypeError('unsupported K5 evidence policy or identity linkage');
  if(!source||!nonempty(source.source_store_id)||!nonempty(source.learner_id)||
     !nonempty(source.track_id)||!nonempty(source.release_id)||
     !Number.isSafeInteger(source.through_store_seq)||source.through_store_seq<0)
    throw new TypeError('invalid pinned source');
  if(!Array.isArray(events)||(source.through_store_seq===0&&events.length))
    throw new TypeError('invalid K3 replay history');
  if(!acceptedPublicCatalog||acceptedPublicCatalog.content_release_id!==source.release_id||
     acceptedPublicCatalog.track_id!==source.track_id||
     !Array.isArray(acceptedPublicCatalog.items)||
     !/^[0-9a-f]{64}$/.test(acceptedPublicCatalog.question_payload_sha256))
    throw new TypeError('invalid pinned public catalog');
  if(!acceptedObjectiveMap||!nonempty(acceptedObjectiveMap.version)||
     !Array.isArray(acceptedObjectiveMap.items))
    throw new TypeError('invalid validated objective map');
  const ids=new Set(),seqs=new Set();
  for(const event of events){
    if(!nonempty(event?.event_id)||!Number.isSafeInteger(event.store_seq)||
       event.store_seq<1||event.store_seq>source.through_store_seq||
       event.store_id!==source.source_store_id||event.learner_id!==source.learner_id||
       event.track_id!==source.track_id||!nonempty(event.content_release_id)||
       !/^[a-f0-9]{64}$/.test(event.event_fingerprint)||
       ids.has(event.event_id)||seqs.has(event.store_seq))
      throw new TypeError('source replay identity, fingerprint or duplicate invalid');
    ids.add(event.event_id);seqs.add(event.store_seq);
  }
  const corrected=classifyK5Corrections({events});
  const visible=corrected.sourceInvalid?
    {observations:[],observed_distinct_interaction_count:0,unknownMapping:false,repeatedFamilies:0}:
    collectK5Presentations({events:corrected.safeEvents,catalog:acceptedPublicCatalog,
      releaseId:source.release_id,policy,quarantinedFamilies:corrected.quarantinedFamilies});
  const reasons=new Set(['CALIBRATION_NOT_APPROVED','NO_TRUSTED_EVALUATION','IDENTITY_UNVERIFIED',...corrected.reasons]);
  let integrity_status,observation_status;
  if(corrected.sourceInvalid){
    integrity_status='SOURCE_INVALID';observation_status='QUARANTINED';
    reasons.add('SOURCE_INTEGRITY_INVALID');
  }else if(corrected.integrity_status==='CONFLICTED'){
    integrity_status='CONFLICTED';observation_status='QUARANTINED';
  }else if(corrected.integrity_status==='INCOMPLETE'){
    integrity_status='INCOMPLETE';observation_status='QUARANTINED';
  }else if(visible.unknownMapping){
    integrity_status='INCOMPLETE';observation_status='INSUFFICIENT_EVIDENCE';
    reasons.add('UNKNOWN_FAMILY_MAPPING');
  }else if(visible.observations.length){
    integrity_status='COMPLETE';observation_status='OBSERVATIONS_PRESENT';
  }else{
    integrity_status='COMPLETE';observation_status='NO_OBSERVATIONS';
    reasons.add('NO_EVIDENCE');
  }
  if(visible.observations.length)reasons.add('EXPOSURE_ONLY');
  if(visible.repeatedFamilies)reasons.add('PUBLIC_FAMILY_REPEATED');
  const mapped=new Map(acceptedObjectiveMap.items.map(item=>[item.objective_id,item]));
  const byObjective=new Map();
  for(const family of visible.observations){
    const mapping=mapped.get(family.objective_id);
    if(!mapping||mapping.domain_id!==family.domain_id){
      if(integrity_status==='COMPLETE'){
        integrity_status='INCOMPLETE';observation_status='INSUFFICIENT_EVIDENCE';
      }
      reasons.add('UNKNOWN_FAMILY_MAPPING');
      continue;
    }
    const row=byObjective.get(family.objective_id)||{
      objective_id:family.objective_id,domain_id:family.domain_id,
      mapping_status:mapping.mapping_status,
      observed_distinct_family_count:0,observed_distinct_interaction_count:0,
      source_status:'OBSERVED_ONLY',reason_codes:[],mastery_estimate:null
    };
    row.observed_distinct_family_count++;
    row.observed_distinct_interaction_count+=family.interaction_count;
    byObjective.set(row.objective_id,row);
  }
  if(!corrected.sourceInvalid){
    for(const familyId of corrected.quarantinedFamilies){
      const candidate=acceptedPublicCatalog.items.find(item=>item.question_family_id===familyId);
      if(!candidate)continue;
      const mapping=mapped.get(candidate.objective_id);
      if(!mapping)continue;
      byObjective.set(mapping.objective_id,{
        objective_id:mapping.objective_id,domain_id:mapping.domain_id,
        mapping_status:mapping.mapping_status,
        observed_distinct_family_count:0,observed_distinct_interaction_count:0,
        source_status:'QUARANTINED',reason_codes:corrected.reasons,mastery_estimate:null
      });
    }
  }
  const objectives=[...byObjective.values()].sort((a,b)=>cmp(a.objective_id,b.objective_id));
  if(objectives.some(item=>item.mapping_status==='PROVISIONAL'))
    reasons.add('PROVISIONAL_OBJECTIVE_MAP');
  const counted=objectives.filter(item=>item.source_status==='OBSERVED_ONLY');
  const observedFamilies=counted.reduce((n,item)=>n+item.observed_distinct_family_count,0);
  const observedInteractions=counted.reduce((n,item)=>n+item.observed_distinct_interaction_count,0);
  const observedDomains=new Set(counted.filter(item=>item.observed_distinct_family_count>0).map(item=>item.domain_id)).size;
  const output={
    schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
    source_store_id:source.source_store_id,through_store_seq:source.through_store_seq,
    learner_id:source.learner_id,identity_scope:'LOCAL_UNAUTHENTICATED',
    track_id:source.track_id,content_release_id:source.release_id,
    question_payload_sha256:acceptedPublicCatalog.question_payload_sha256,
    catalog_version:acceptedPublicCatalog.catalog_id,
    catalog_canonical_sha256:await canonicalMappingHash(acceptedPublicCatalog),
    objective_map_canonical_sha256:await canonicalMappingHash(acceptedObjectiveMap.raw ?? acceptedObjectiveMap),
    lineage_map_version:null,lineage_map_canonical_sha256:null,
    objective_map_version:acceptedObjectiveMap.version,identity_resolution_version:null,
    integrity_status,observation_status,estimation_status:'DISABLED_UNVALIDATED',
    reason_codes:[...reasons].sort(cmp),observed_distinct_family_count:observedFamilies,
    observed_distinct_interaction_count:observedInteractions,
    observed_domain_count:observedDomains,objectives,...nullEstimates
  };
  validateK5Projection(output);
  return output;
}
