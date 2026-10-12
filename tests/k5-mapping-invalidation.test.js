import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {deriveK5EvidenceSufficiency} from '../src/mastery/projection.js';
import {readK5Source,computeK5SourceFingerprint} from '../src/mastery/source.js';
const ID='sdaia-ai-engineer',RELEASE=ID+'.bootstrap.v1',
 DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const FAMILY=ID+'.core-ai.reasoning.definition.best-description',OBJECTIVE=ID+'.objective.core-ai.reasoning.v1';
function verified(){
 return validatePublicCatalog({
  catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
   content_release_id:RELEASE,question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
   items:[{question_family_id:FAMILY,item_version_id:FAMILY+'.v1',objective_id:OBJECTIVE,
    domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
  trackManifest:{id:ID,status:'active'},evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
  publicQuestions:[{id:FAMILY+'.v1',family_id:FAMILY,domain_id:'core-ai'}],
  objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,
   domain_id:'core-ai',concept_ids:['core-ai.reasoning'],status:'provisional'}]}
 });
}
test('same version and public bank digest cannot reuse an objective-mapping-changed projection',async()=>{
 const catalog=verified(),source={source_store_id:'local',through_store_seq:0,learner_id:'opaque',
  track_id:ID,release_id:RELEASE},policy={policy_id:'K5.EVIDENCE.v1'};
 const trust=await readK5Source({
  store:{store_id:'local',
   getSourceHead:async()=>({store_id:'local',through_store_seq:0}),
   readRange:async()=>{throw Error('zero watermark never reads');}},
  learnerId:'opaque',trackId:ID,releaseId:RELEASE,throughStoreSeq:0
 });
 const build=raw=>deriveK5EvidenceSufficiency({
  source:trust,events:trust.events,acceptedPublicCatalog:catalog,
  acceptedObjectiveMap:{version:'objectives-v1',items:[{objective_id:OBJECTIVE,domain_id:'core-ai',
    mapping_status:'PROVISIONAL'}],raw},policy
 });
 const a=await build({schema_version:1,objectives:[{objective_id:OBJECTIVE,title:'A'}]}),
  b=await build({schema_version:1,objectives:[{objective_id:OBJECTIVE,title:'B'}]});
 assert.equal(a.content_release_id,b.content_release_id);
 assert.equal(a.through_store_seq,b.through_store_seq);
 assert.equal(a.question_payload_sha256,b.question_payload_sha256);
 assert.equal(a.catalog_canonical_sha256,b.catalog_canonical_sha256);
 assert.notEqual(a.objective_map_canonical_sha256,b.objective_map_canonical_sha256);
});

test('mutated normalized mapping cannot reuse unchanged raw-mapping SHA',async()=>{
 const catalog=verified();
 const source={source_store_id:'local',through_store_seq:0,learner_id:'opaque',track_id:ID,release_id:RELEASE};
 const trust=await readK5Source({
  store:{store_id:'local',
   getSourceHead:async()=>({store_id:'local',through_store_seq:0}),
   readRange:async()=>{throw Error('zero watermark never reads');}},
  learnerId:'opaque',trackId:ID,releaseId:RELEASE,throughStoreSeq:0
 });
 const raw={schema_version:1,track_id:ID,objectives:[{
  objective_id:OBJECTIVE,track_id:ID,domain_id:'core-ai',status:'provisional'
 }]};
 const fixed={version:'objectives-v1',raw,items:[{objective_id:OBJECTIVE,domain_id:'core-ai',mapping_status:'PROVISIONAL'}]};
 const changed={version:'objectives-v1',raw,items:[{objective_id:OBJECTIVE,domain_id:'wrong-domain',mapping_status:'APPROVED'}]};
 const build=acceptedObjectiveMap=>deriveK5EvidenceSufficiency({source,events:[],
   acceptedPublicCatalog:catalog,acceptedObjectiveMap,policy:{policy_id:'K5.EVIDENCE.v1'}});
 const a=await build(fixed);
 let b;
 try{b=await build(changed)}catch(error){assert.match(error.message,/map|objective|approval|status|mismatch/i);return}
 assert.notEqual(a.objective_map_canonical_sha256,b.objective_map_canonical_sha256,
  'aggregation mapping changed under unchanged raw bytes and digest');
});
