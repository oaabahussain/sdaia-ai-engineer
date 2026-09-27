export function validateTrackRegistry(registry){
 if(!registry||registry.schema_version!==1||!Array.isArray(registry.tracks)||registry.tracks.length<1)throw new Error('Invalid track registry');
 const ids=registry.tracks.map(x=>x?.id);
 if(ids.some(id=>typeof id!=='string'||!id))throw new Error('Invalid track id');
 if(new Set(ids).size!==ids.length)throw new Error('Duplicate track id');
 if(!ids.includes(registry.default_track_id))throw new Error('Registry default track is not registered');
 return true;
}
export async function loadTrackRegistry(fetchJson){const registry=await fetchJson('./tracks/registry.json');validateTrackRegistry(registry);return registry}
export function resolveActiveTrackId({registry,requestedTrackId,savedTrackId}){validateTrackRegistry(registry);const ids=new Set(registry.tracks.map(x=>x.id));if(ids.has(requestedTrackId))return requestedTrackId;if(ids.has(savedTrackId))return savedTrackId;return registry.default_track_id}
