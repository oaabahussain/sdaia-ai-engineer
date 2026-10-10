import { eligiblePublicItems } from './publicCatalog.js';
import { validateRulePolicy } from './policy.js';
import { assertInstant } from './clock.js';

const cmp=(a,b)=>a<b?-1:a>b?1:0;
function blockedResponse(info,reason,status='NO_ELIGIBLE_ACTION'){
  return {...info,status,action:null,reason_code:reason,
    evidence_strength:'COLD_START',reason_event_ids:[],
    reason_event_ids_truncated:false};
}
function excludedByPreferences(family,preferences,now){
  for(const entry of preferences.snoozed_families??[]){
    if(entry?.question_family_id!==family)continue;
    if(assertInstant(entry.until_at)>now)return true;
  }
  for(const entry of preferences.dismissed_families??[]){
    if(entry?.question_family_id!==family)continue;
    if(entry.until_at==null || assertInstant(entry.until_at)>now)return true;
  }
  return false;
}
export function recommendNextAction({
  scheduleProjection,catalog,policy,nowIso,preferences
}={}) {
  const base={
    schema_version:1,recommendation_type:'RecommendationV1',
    policy_id:'K4.RULES.v1',source_store_id:scheduleProjection?.source_store_id??null,
    through_store_seq:scheduleProjection?.through_store_seq??null,
    content_release_id:scheduleProjection?.content_release_id??null,
    selection_version:'K4.RULES.v1',generated_for_at:nowIso??null
  };
  let eligible,now;
  try{
    validateRulePolicy(policy);
    now=assertInstant(nowIso);
    if(scheduleProjection?.schema_version!==1 ||
       scheduleProjection.projection_type!=='ScheduleProjectionV1' ||
       scheduleProjection.policy_id!==policy.policy_id ||
       scheduleProjection.integrity_status!=='COMPLETE' ||
       typeof scheduleProjection.source_store_id!=='string' ||
       !Number.isSafeInteger(scheduleProjection.through_store_seq) ||
       scheduleProjection.through_store_seq<0 ||
       typeof scheduleProjection.learner_id!=='string' ||
       !Array.isArray(scheduleProjection.items))
      return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
    eligible=eligiblePublicItems({catalog,
      releaseId:scheduleProjection.content_release_id,
      availableIds:catalog.items.map(i=>i.item_version_id)
    });
    if(!preferences)preferences={
      learner_id:scheduleProjection.learner_id,version:1,revision:0,
      snoozed_families:[],dismissed_families:[],preferred_domain_id:null
    };
    if(preferences.learner_id!==scheduleProjection.learner_id ||
       preferences.version!==1 || !Number.isSafeInteger(preferences.revision) ||
       preferences.revision<0 ||
       !Array.isArray(preferences.snoozed_families) ||
       !Array.isArray(preferences.dismissed_families))
      return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
  }catch{
    return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
  }
  const byFamily=new Map();
  for(const item of scheduleProjection.items){
    if(!item || typeof item.question_family_id!=='string' ||
       byFamily.has(item.question_family_id) ||
       !['VALID','INCOMPLETE','CONFLICTED'].includes(item.data_quality_status))
      return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
    if(item.grade_evidence==='TRUSTED_GRADED')
      return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
    byFamily.set(item.question_family_id,item);
  }
  const candidates=[];
  let eligibleUnsnoozed=0,excludedByUser=0;
  try{
    for(const item of eligible){
      if(excludedByPreferences(item.question_family_id,preferences,now)){
        excludedByUser++;continue;
      }
      eligibleUnsnoozed++;
      const history=byFamily.get(item.question_family_id);
      if(history && (history.data_quality_status!=='VALID' ||
          history.latest_item_version_id!==item.item_version_id))
        continue;
      if(!history || history.exposure_count===0){
        candidates.push({item,history:null,priority:2});
      }else if(history.grade_evidence==='EXPOSURE_ONLY' &&
          typeof history.due_at==='string' && assertInstant(history.due_at)<=now){
        candidates.push({item,history,priority:1});
      }
    }
  }catch{
    return blockedResponse(base,'SOURCE_INVALID','INSUFFICIENT_EVIDENCE');
  }
  if(!candidates.length)
    return blockedResponse(base,
      eligible.length>0&&eligibleUnsnoozed===0&&excludedByUser>0 ?
        'ALL_SNOOZED':'CONTENT_UNAVAILABLE');
  candidates.sort((a,b)=>
    a.priority-b.priority ||
    cmp(a.item.objective_id,b.item.objective_id) ||
    cmp(a.item.domain_id,b.item.domain_id) ||
    cmp(a.item.question_family_id,b.item.question_family_id) ||
    cmp(a.item.item_version_id,b.item.item_version_id)
  );
  const selected=candidates[0],h=selected.history;
  const reason=h?'REVIEW_DUE':scheduleProjection.through_store_seq===0?'COLD_START':'NEW_FAMILY';
  return {
    ...base,status:'ACTION',reason_code:reason,
    evidence_strength:h?'EXPOSURE_ONLY':scheduleProjection.through_store_seq===0?'COLD_START':'EXPOSURE_ONLY',
    reason_event_ids:h?[...h.source_event_ids].slice(0,5):[],
    reason_event_ids_truncated:Boolean(h?.source_event_ids_truncated),
    action:{action_type:'PRACTICE_ONE',track_id:catalog.track_id,
      domain_id:selected.item.domain_id,objective_id:selected.item.objective_id,
      question_family_id:selected.item.question_family_id,
      item_version_id:selected.item.item_version_id,route_mode:'practice',
      release_id:catalog.content_release_id,due_at:h?.due_at??null}
  };
}
