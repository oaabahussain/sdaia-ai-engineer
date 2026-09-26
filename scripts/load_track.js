import fs from 'node:fs';
import path from 'node:path';
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
export function loadTrack(root,trackId){
 const manifest=readJson(path.join(root,'tracks',trackId,'manifest.json'));
 const presentation=readJson(path.join(root,'tracks',trackId,'presentation.json'));
 const profiles=manifest.exam_profiles.map(p=>readJson(path.join(root,p)));
 const examProfile=profiles.find(p=>p.id===manifest.default_exam_profile);
 if(!examProfile)throw new Error(`Missing default exam profile ${manifest.default_exam_profile}`);
 const conceptDocs=manifest.content.concept_files.map(p=>readJson(path.join(root,p)));
 const concepts=Object.fromEntries(conceptDocs.map(doc=>[doc.domain,doc.concepts]));
 return{manifest,presentation,examProfile,concepts,learn:readJson(path.join(root,manifest.content.learn)),cases:readJson(path.join(root,manifest.content.cases))};
}
