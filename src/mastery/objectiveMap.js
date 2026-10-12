import {canonicalMappingHash} from './provenance.js';

// Approved K5 Lane 1 mapping is the frozen K2 provisional catalog.
// No objective has been approved for numerical readiness or mastery.
export const K5_APPROVED_OBJECTIVE_CANONICAL_SHA256=
 '6727666fa76c7ea66d35bb9c61232e523295e523ebc52ee0b49822af66ebf8bf';
export async function validateK5ObjectiveMap(raw,trackId){
 if(trackId!=='sdaia-ai-engineer'||raw?.track_id!==trackId)
  throw new TypeError('unapproved objective track');
 if(raw.schema_version!==1||!Array.isArray(raw.objectives)||raw.objectives.length===0)
  throw new TypeError('invalid objective mapping');
 const seen=new Set(),items=[];
 for(const objective of raw.objectives){
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
 const canonicalSha256=await canonicalMappingHash(raw);
 if(canonicalSha256!==K5_APPROVED_OBJECTIVE_CANONICAL_SHA256)
  throw new Error('objective mapping digest differs from approved immutable baseline');
 return Object.freeze({
  version:'sdaia-ai-engineer.objectives-v1',
  items,raw,canonicalSha256
 });
}
