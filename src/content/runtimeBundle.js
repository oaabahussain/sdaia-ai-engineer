export async function loadRuntimeBundle(fetchJson,trackId){
 if(typeof trackId!=='string'||!trackId)throw new Error('trackId is required to load a runtime bundle');
 const manifest=await fetchJson(`./tracks/${trackId}/manifest.json`);
 const v2=manifest.capabilities?.includes('content-model-v2');
 const domains=v2?await fetchJson(`./tracks/${trackId}/domains.json`):null;
 const examProfiles=await Promise.all(manifest.exam_profiles.map(fetchJson));
 const examProfile=examProfiles.find(x=>x.id===manifest.default_exam_profile);
 if(!examProfile)throw new Error(`Missing exam profile ${manifest.default_exam_profile}`);
 const conceptDocs=await Promise.all(manifest.content.concept_files.map(fetchJson));
 const concepts=Object.fromEntries(conceptDocs.map(doc=>[v2?doc.domain_id:doc.domain,doc.concepts]));
 return{contract_version:v2?3:2,track:manifest,...(v2?{domains}:{}),exam_profile:examProfile,concepts,learn:await fetchJson(manifest.content.learn),cases:await fetchJson(manifest.content.cases)};
}
