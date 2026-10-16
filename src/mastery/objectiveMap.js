import {canonicalMappingHash} from './provenance.js';

// A validated objective mapping is a private capability, not a caller claim.
const VERIFIED_OBJECTIVE_MAPS=new WeakSet();
const deepFreeze=value=>{
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  for(const child of Object.values(value))deepFreeze(child);
  Object.freeze(value);
 }
 return value;
};
export function assertK5ValidatedObjectiveMap(map){
 if(!map||!VERIFIED_OBJECTIVE_MAPS.has(map))
  throw new TypeError('verified immutable K5 objective map required');
 return true;
}


// Approved K5 Lane 1 mapping is the frozen K2 provisional catalog.
// No objective has been approved for numerical readiness or mastery.
export const K5_APPROVED_OBJECTIVE_CANONICAL_SHA256=
 '6727666fa76c7ea66d35bb9c61232e523295e523ebc52ee0b49822af66ebf8bf';
export async function validateK5ObjectiveMap(raw,trackId){
 const approvedRaw=structuredClone(raw);
 if(trackId!=='sdaia-ai-engineer'||approvedRaw?.track_id!==trackId)
  throw new TypeError('unapproved objective track');
 if(approvedRaw.schema_version!==1||!Array.isArray(approvedRaw.objectives)||approvedRaw.objectives.length===0)
  throw new TypeError('invalid objective mapping');
 const seen=new Set(),items=[];
 for(const objective of approvedRaw.objectives){
  if(objective?.status!=='provisional'||objective?.origin!=='migration-derived')
   throw new TypeError('unapproved objective mapping status');
  if(objective?.track_id!==trackId||
     typeof objective?.objective_id!=='string'||!objective.objective_id||
     typeof objective?.domain_id!=='string'||!objective.domain_id||
     seen.has(objective.objective_id))
   throw new TypeError('invalid objective identity or duplicate');
  seen.add(objective.objective_id);
  items.push({
   objective_id:objective.objective_id,
   domain_id:objective.domain_id,
   mapping_status:'PROVISIONAL'
  });
 }
 const canonicalSha256=await canonicalMappingHash(approvedRaw);
 if(canonicalSha256!==K5_APPROVED_OBJECTIVE_CANONICAL_SHA256)
  throw new Error('objective mapping digest differs from approved immutable baseline');
 const accepted=Object.freeze({
  version:'sdaia-ai-engineer.objectives-v1',
  items:deepFreeze(items),raw:deepFreeze(approvedRaw),canonicalSha256
 });
 VERIFIED_OBJECTIVE_MAPS.add(accepted);
 return accepted;
}
