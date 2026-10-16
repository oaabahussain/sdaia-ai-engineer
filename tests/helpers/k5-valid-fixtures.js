import {readFileSync} from 'node:fs';
import {validatePublicCatalog} from '../../src/recommendations/publicCatalog.js';
import {validateK5ObjectiveMap} from '../../src/mastery/objectiveMap.js';
import {readK5Source} from '../../src/mastery/source.js';
import {deriveK5EvidenceSufficiency} from '../../src/mastery/projection.js';
import {fingerprintEvent} from '../../src/evidence/jcs.js';

export const ID='sdaia-ai-engineer';
export const RELEASE=ID+'.bootstrap.v1';
export const OBJECTIVE=ID+'.objective.core-ai.activation-function.v1';
export const FAMILY=ID+'.core-ai.activation-function.trusted-fixture';
export const VERSION=FAMILY+'.v1';
export const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const RAW=JSON.parse(readFileSync(new URL('../../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8'));
export async function validatedObjectiveMap(){return validateK5ObjectiveMap(RAW,ID);}
export function publicFixtureCatalog(){
 return validatePublicCatalog({
  catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
   content_release_id:RELEASE,question_payload_sha256:DIGEST,
   source:'MIGRATED_GRANDFATHERED_PUBLIC',items:[{
    question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
    domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'
   }]},
  trackManifest:{id:ID,status:'active'},
  evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
  publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:'core-ai'}],
  objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,
    domain_id:'core-ai',concept_ids:['core-ai.activation-function'],status:'provisional'}]}
 });
}
export async function trustedProjection({observed=false}={}){
 const rawEvent={event_id:'fixture-presented-1',definition_id:'learner.item.presented@1',
   learner_id:'opaque-learner',track_id:ID,content_release_id:RELEASE,mode:'practice',
   item_interaction_id:'interaction-1',question_family_id:FAMILY,item_version_id:VERSION,
   domain_id:'core-ai',objective_id:OBJECTIVE};
 const records=observed?[{...rawEvent,store_id:'trusted-k5-fixture',store_seq:1,
  event_fingerprint:await fingerprintEvent(rawEvent)}]:[];
 const store={store_id:'trusted-k5-fixture',
  getSourceHead:async()=>({store_id:'trusted-k5-fixture',through_store_seq:records.length}),
  readRange:async({fromSeq,toSeq})=>records.filter(r=>r.store_seq>=fromSeq&&r.store_seq<=toSeq)};
 const source=await readK5Source({store,learnerId:'opaque-learner',trackId:ID,
  releaseId:RELEASE,throughStoreSeq:records.length});
 return deriveK5EvidenceSufficiency({source,events:source.events,
  acceptedPublicCatalog:publicFixtureCatalog(),
  acceptedObjectiveMap:await validatedObjectiveMap(),policy:{policy_id:'K5.EVIDENCE.v1'}});
}
