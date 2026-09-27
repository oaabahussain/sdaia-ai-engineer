import fs from 'node:fs';
import path from 'node:path';
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
export function loadTrackRegistry(root){return readJson(path.join(root,'tracks','registry.json'))}
export function validateTrackRegistry(registry){
 if(!registry||registry.schema_version!==1||!Array.isArray(registry.tracks)||!registry.tracks.length)throw new Error('Invalid track registry');
 const ids=registry.tracks.map(x=>x.id);if(new Set(ids).size!==ids.length)throw new Error('Duplicate track id');
 if(!ids.includes(registry.default_track_id))throw new Error('Registry default track is not registered');
 return true;
}
export function loadTrack(root,trackId){
 const manifest=readJson(path.join(root,'tracks',trackId,'manifest.json'));
 const presentation=readJson(path.join(root,'tracks',trackId,'presentation.json'));
 const profiles=manifest.exam_profiles.map(p=>readJson(path.join(root,p)));
 const examProfile=profiles.find(p=>p.id===manifest.default_exam_profile);
 if(!examProfile)throw new Error(`Missing default exam profile ${manifest.default_exam_profile}`);
 const conceptDocs=manifest.content.concept_files.map(p=>readJson(path.join(root,p)));
 const domains=manifest.capabilities?.includes('content-model-v2')?readJson(path.join(root,'tracks',trackId,'domains.json')):null;
 const concepts=Object.fromEntries(conceptDocs.map(doc=>[domains?doc.domain_id:doc.domain,doc.concepts]));
 return{manifest,presentation,examProfile,...(domains?{domains}:{}),concepts,learn:readJson(path.join(root,manifest.content.learn)),cases:readJson(path.join(root,manifest.content.cases))};
}
