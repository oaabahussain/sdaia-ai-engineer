import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {collectK5Presentations} from '../src/mastery/presentations.js';
const RELEASE='sdaia-ai-engineer.bootstrap.v1',ID='sdaia-ai-engineer';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const FAMILY=ID+'.core-ai.reasoning.definition.best-description';
const VERSION=FAMILY+'.v1',OBJECTIVE=ID+'.objective.core-ai.reasoning.v1',DOMAIN='core-ai';
function verifiedCatalog(){return validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
  items:[{question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
   domain_id:DOMAIN,visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
 trackManifest:{id:ID,status:'active'},
 evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:DOMAIN,answer:0}],
 objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,domain_id:DOMAIN,
  concept_ids:['core-ai.reasoning'],status:'provisional'}]}
});}
const event=(id,changes={})=>({
 event_id:id,store_seq:Number(id.replace(/\D/g,''))||1,definition_id:'learner.item.presented@1',
 item_interaction_id:id,question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
 domain_id:DOMAIN,mode:'practice',content_release_id:RELEASE,...changes
});
const run=(events,additional={})=>collectK5Presentations({
 events,catalog:verifiedCatalog(),releaseId:RELEASE,
 policy:{policy_id:'K5.EVIDENCE.v1'},...additional
});
test('K3 presented format counts only verified public practice family once',()=>{
 const r=run([event('e1'),event('e2',{item_interaction_id:'e1'}),
  event('e3',{definition_id:'learner.response.recorded@1'}),event('e4',{mode:'mock'})]);
 assert.deepEqual(r.observations.map(x=>x.family_id),[FAMILY]);
 assert.equal(r.observed_distinct_interaction_count,1);
 assert.equal(r.unknownMapping,false);
});
test('unique interactions of same family increase interactions, not families',()=>{
 const r=run([event('e1'),event('e2')]);
 assert.equal(r.observations.length,1);
 assert.equal(r.observed_distinct_interaction_count,2);
 assert.equal(r.repeatedFamilies,1);
});
test('quarantine excludes affected family from descriptive public count',()=>{
 assert.deepEqual(run([event('e1')],{quarantinedFamilies:[FAMILY]}).observations,[]);
});
test('unknown current mapping abstains; historical release is not claimed unseen',()=>{
 const unknown=run([event('e1',{item_version_id:'protected-item.v1'})]);
 assert.deepEqual(unknown.observations,[]);
 assert.equal(unknown.unknownMapping,true);
 assert.deepEqual(run([event('e2',{content_release_id:'historic-v1'})]).observations,[]);
});
test('unverified forged catalog cannot qualify an item',()=>{
 const catalog={content_release_id:RELEASE,items:[{item_version_id:VERSION,visibility:'PUBLIC',lifecycle:'ACTIVE'}]};
 assert.throws(()=>collectK5Presentations({events:[event('e1')],catalog,releaseId:RELEASE,
  policy:{policy_id:'K5.EVIDENCE.v1'}}),/verif/i);
});
