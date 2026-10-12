export function collectK5Presentations({events=[],catalog={},policy={},quarantinedFamilies=[]}={}){
 const allowed=new Set(catalog.families||[]);
 const lineage=policy.lineage||{};
 const quarantined=new Set(quarantinedFamilies);
 const seen=new Set(),families=new Map();
 let unknownMapping=false,repeatedFamilies=0;
 for(const e of events){
  if(e?.event_type!=='learner.item.presented@1'||e.accepted!==true||!['learn','practice'].includes(e.mode)||!e.interaction_id||!e.family_id)continue;
  if(seen.has(e.interaction_id))continue;seen.add(e.interaction_id);
  const family=lineage[`${e.release_id}:${e.family_id}`]||(allowed.has(e.family_id)?e.family_id:null);
  if(!family||!allowed.has(family)){unknownMapping=true;continue;}
  if(quarantined.has(family))continue;
  if(families.has(family)){repeatedFamilies++;continue;}
  families.set(family,{family_id:family});
 }
 return {observations:[...families.values()].sort((a,b)=>a.family_id.localeCompare(b.family_id)),unknownMapping,repeatedFamilies};
}
