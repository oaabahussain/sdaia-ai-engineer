import {eligiblePublicItems} from '../recommendations/publicCatalog.js';
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const PRESENTED='learner.item.presented@1';

// Lane 1 counts only K3 presented events against a K4 VERIFIED active PUBLIC
// catalog. Neither response/evaluation nor strict-assessment mode can qualify.
export function collectK5Presentations({events,catalog,releaseId,policy,quarantinedFamilies=[]}={}) {
  if(!Array.isArray(events)||!releaseId||policy?.policy_id!=='K5.EVIDENCE.v1')
    throw new TypeError('K5 requires validated source history, release and evidence policy');
  const eligible=eligiblePublicItems({
    catalog,releaseId,availableIds:catalog?.items?.map(item=>item.item_version_id)
  });
  const byVersion=new Map(eligible.map(item=>[item.item_version_id,item]));
  const quarantined=new Set(quarantinedFamilies);
  const ordered=[...events].sort((a,b)=>(a.store_seq??0)-(b.store_seq??0)||cmp(a.event_id,b.event_id));
  const seen=new Map(),families=new Map();
  let unknownMapping=false;
  for(const event of ordered){
    if(event?.definition_id!==PRESENTED||!['learn','practice'].includes(event.mode))continue;
    if(event.content_release_id!==releaseId)continue;
    const item=byVersion.get(event.item_version_id);
    if(!item||item.question_family_id!==event.question_family_id||
       item.objective_id!==event.objective_id||item.domain_id!==event.domain_id||
       typeof event.item_interaction_id!=='string'||!event.item_interaction_id){
      unknownMapping=true;
      continue;
    }
    if(quarantined.has(event.question_family_id))continue;
    const prior=seen.get(event.item_interaction_id);
    if(prior) {
      if(prior!==event.question_family_id)throw new Error('conflicting interaction family');
      continue;
    }
    seen.set(event.item_interaction_id,event.question_family_id);
    const row=families.get(event.question_family_id)||{
      family_id:event.question_family_id,objective_id:event.objective_id,
      domain_id:event.domain_id,interaction_count:0
    };
    row.interaction_count++;
    families.set(row.family_id,row);
  }
  const observations=[...families.values()].sort((a,b)=>cmp(a.family_id,b.family_id));
  return {
    observations,observed_distinct_interaction_count:seen.size,unknownMapping,
    repeatedFamilies:observations.filter(row=>row.interaction_count>1).length
  };
}
