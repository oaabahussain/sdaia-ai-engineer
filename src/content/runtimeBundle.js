export async function loadRuntimeBundle(fetchJson,trackId){
 if(typeof trackId!=='string'||!trackId)throw new Error('trackId is required to load a runtime bundle');
 const manifest=await fetchJson(`./tracks/${trackId}/manifest.json`);
 const examProfiles=await Promise.all(manifest.exam_profiles.map(fetchJson));
 const examProfile=examProfiles.find(x=>x.id===manifest.default_exam_profile);
 if(!examProfile)throw new Error(`Missing exam profile ${manifest.default_exam_profile}`);
 const conceptDocs=await Promise.all(manifest.content.concept_files.map(fetchJson));
 return{contract_version:2,track:manifest,exam_profile:examProfile,concepts:Object.fromEntries(conceptDocs.map(doc=>[doc.domain,doc.concepts])),learn:await fetchJson(manifest.content.learn),cases:await fetchJson(manifest.content.cases)};
}
