import { resolveCurrentEvidence } from '../evidence/corrections.js';
import { eligiblePublicItems } from './publicCatalog.js';
import { validateRulePolicy } from './policy.js';
import { assertInstant, computeDueAt } from './clock.js';

const cmp=(a,b)=>a<b?-1:a>b?1:0;
const instant=(value)=>typeof value==='string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
const PRESENTED='learner.item.presented@1';
const CORRECTION='learner.evidence.correction.recorded@1';

export function computeScheduleProjection({
  learnerId,sourceStoreId,throughStoreSeq,events,activeReleaseId,
  policy,nowIso,acceptedContentCatalog
}={}) {
  validateRulePolicy(policy);
  assertInstant(nowIso);
  if (![learnerId,sourceStoreId,activeReleaseId].every(x=>typeof x==='string'&&x.length>0) ||
      !Number.isSafeInteger(throughStoreSeq) || throughStoreSeq<0 ||
      !Array.isArray(events) || instant(nowIso)===null)
    throw new TypeError('K4 projection source, watermark, events, or injected clock invalid');
  const permitted=eligiblePublicItems({
    catalog:acceptedContentCatalog,releaseId:activeReleaseId,
    availableIds:acceptedContentCatalog?.items?.map(i=>i.item_version_id)
  });
  const eligible=new Map(permitted.map(i=>[i.item_version_id,i]));
  const seenIds=new Set(),seenSeq=new Set();
  for(const e of events) {
    if(!e || typeof e.event_id!=='string'||!e.event_id ||
       !Number.isSafeInteger(e.store_seq)||e.store_seq<1||e.store_seq>throughStoreSeq ||
       e.store_id!==sourceStoreId || e.learner_id!==learnerId ||
       e.track_id!==acceptedContentCatalog.track_id ||
       e.content_release_id!==activeReleaseId ||
       typeof e.definition_id!=='string'||!e.definition_id ||
       seenIds.has(e.event_id)||seenSeq.has(e.store_seq))
      throw new TypeError('K4 source identity, fingerprint boundary, or replay sequence invalid');
    seenIds.add(e.event_id);seenSeq.add(e.store_seq);
  }
  if(throughStoreSeq===0 && events.length!==0)
    throw new TypeError('K4 zero watermark cannot contain events');
  const ordered=[...events].sort((a,b)=>a.store_seq-b.store_seq||cmp(a.event_id,b.event_id));
  const resolved=resolveCurrentEvidence(ordered);
  const byEventId=new Map(ordered.map(e=>[e.event_id,e]));
  const byFamily=new Map(),affectedFamilies=new Set();
  let globalUnknown=false;

  const familyOf=(e)=>{
    if(!e) return null;
    if(typeof e.item_version_id==='string' && eligible.has(e.item_version_id))
      return eligible.get(e.item_version_id).question_family_id;
    if(typeof e.question_family_id==='string' &&
       [...eligible.values()].some(i=>i.question_family_id===e.question_family_id))
      return e.question_family_id;
    return null;
  };
  for(const finding of [...resolved.conflicts,...resolved.unresolved]){
    const referenced=[
      finding.target_event_id,finding.superseding_event_id,
      ...(finding.event_ids??[])
    ].filter(x=>typeof x==='string');
    if(!referenced.length)globalUnknown=true;
    for(const id of referenced){
      const base=byEventId.get(id);
      const family=familyOf(base);
      if(family)affectedFamilies.add(family);
      else if(!base || policy.include_modes.includes(base.mode))globalUnknown=true;
    }
  }
  for(const e of resolved.activeEvents) {
    if(e.definition_id!==PRESENTED || !policy.include_modes.includes(e.mode))continue;
    const candidate=eligible.get(e.item_version_id);
    if(!candidate)continue;
    if(e.question_family_id!==candidate.question_family_id ||
       e.objective_id!==candidate.objective_id ||
       e.domain_id!==candidate.domain_id ||
       typeof e.item_interaction_id!=='string'||!e.item_interaction_id)
      throw new TypeError('K4 presented item does not match published family/objective interaction');
    const key=candidate.question_family_id;
    if(!byFamily.has(key))byFamily.set(key,{candidate,interactions:new Set(),events:[],badTime:false});
    const item=byFamily.get(key);
    if(item.interactions.has(e.item_interaction_id))continue;
    item.interactions.add(e.item_interaction_id);
    item.events.push(e);
    let when;
    try { when=assertInstant(e.accepted_at); } catch { item.badTime=true; continue; }
    if(when>assertInstant(nowIso))item.badTime=true;
  }
  for(const family of affectedFamilies) {
    if(byFamily.has(family))continue;
    const candidate=permitted.find(c=>c.question_family_id===family);
    if(candidate)byFamily.set(family,{candidate,interactions:new Set(),events:[],badTime:false});
  }
  const items=[...byFamily.values()].sort((a,b)=>
    cmp(a.candidate.question_family_id,b.candidate.question_family_id)
  ).map(row=>{
    const found=row.events.sort((a,b)=>a.store_seq-b.store_seq||cmp(a.event_id,b.event_id));
    const provenance=found.slice(-5).map(e=>e.event_id);
    const conflicted=affectedFamilies.has(row.candidate.question_family_id);
    const invalid=conflicted||row.badTime;
    const times=found.map(e=>{try{return assertInstant(e.accepted_at)}catch{return null}}).filter(x=>x!==null&&x<=assertInstant(nowIso));
    const lastExposureAt=!invalid&&times.length?new Date(times.reduce((a,b)=>Math.max(a,b),-Infinity)).toISOString():null;
    const dueAt=invalid?null:computeDueAt({lastExposureAt,lastTrustedGradeAt:null,gradeEvidence:found.length?'EXPOSURE_ONLY':'NONE',correct:null,nowIso,policy});
    return {
      question_family_id:row.candidate.question_family_id,
      latest_item_version_id:row.candidate.item_version_id,
      objective_id:row.candidate.objective_id,
      last_exposure_at:lastExposureAt,
      last_graded_at:null,
      grade_evidence:found.length>0?'EXPOSURE_ONLY':'NONE',
      due_at:dueAt,
      exposure_count:row.interactions.size,
      source_event_ids:provenance,
      source_event_ids_truncated:found.length>5,
      data_quality_status:conflicted?'CONFLICTED':row.badTime?'INCOMPLETE':'VALID'
    };
  });
  return {
    schema_version:1,projection_type:'ScheduleProjectionV1',
    policy_id:policy.policy_id,source_store_id:sourceStoreId,
    through_store_seq:throughStoreSeq,content_release_id:activeReleaseId,
    learner_id:learnerId,generated_for_at:nowIso,
    // A known public family's conflicting evidence is quarantined at item level.
    // Only an unscoped/unknown source finding invalidates all recommendations.
    integrity_status:globalUnknown
      ? (resolved.conflicts.length?'CONFLICTED':'INCOMPLETE') : 'COMPLETE',
    items
  };
}
