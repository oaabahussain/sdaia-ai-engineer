import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readK5Source} from '../src/mastery/source.js';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {validateK5ObjectiveMap} from '../src/mastery/objectiveMap.js';
import {deriveK5EvidenceSufficiency} from '../src/mastery/projection.js';
import {buildK5Snapshot} from '../src/mastery/snapshot.js';
import {renderK5Summary} from '../src/mastery/view.js';

const ID='sdaia-ai-engineer', RELEASE=ID+'.bootstrap.v1';
const OBJECTIVE=ID+'.objective.core-ai.activation-function.v1';
const FAMILY=ID+'.core-ai.activation-function.trust-boundary-fixture';
const VERSION=FAMILY+'.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const raw=JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8'));
const catalog=validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,
  source:'MIGRATED_GRANDFATHERED_PUBLIC',
  items:[{question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
   domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
 trackManifest:{id:ID,status:'active'},
 evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:'core-ai'}],
 objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,
   domain_id:'core-ai',concept_ids:['core-ai.activation-function'],status:'provisional'}]}
});
async function source(){
 return readK5Source({store:{store_id:'trust-boundary-test',
  getSourceHead:async()=>({store_id:'trust-boundary-test',through_store_seq:0}),
  readRange:async()=>{throw Error('unexpected zero-watermark read');}},
  learnerId:'opaque-fixture',trackId:ID,releaseId:RELEASE,throughStoreSeq:0});
}
async function derive(map){
 const pinned=await source();
 return deriveK5EvidenceSufficiency({source:pinned,events:pinned.events,
  acceptedPublicCatalog:catalog,acceptedObjectiveMap:map,
  policy:{policy_id:'K5.EVIDENCE.v1'}});
}

test('P1 trust boundary: copied or fabricated structurally valid projection never becomes public evidence',async()=>{
 const authorized=await validateK5ObjectiveMap(raw,ID);
 const original=await derive(authorized);
 assert.equal(buildK5Snapshot({projection:original}).exposure.families,0);
 assert.equal(renderK5Summary({projection:original,locale:'en'}).count,0);
 const copied=structuredClone(original);
 assert.throws(()=>buildK5Snapshot({projection:copied}),/verified|authentic|source|trusted|provenance/i);
 assert.throws(()=>renderK5Summary({projection:copied}),/verified|authentic|source|trusted|provenance/i);
 const forged={...copied,observation_status:'OBSERVATIONS_PRESENT',
  reason_codes:['CALIBRATION_NOT_APPROVED','EXPOSURE_ONLY','IDENTITY_UNVERIFIED','NO_TRUSTED_EVALUATION','PROVISIONAL_OBJECTIVE_MAP'],
  observed_distinct_family_count:1,observed_distinct_interaction_count:1,observed_domain_count:1,
  objectives:[{objective_id:OBJECTIVE,domain_id:'core-ai',mapping_status:'PROVISIONAL',
   observed_distinct_family_count:1,observed_distinct_interaction_count:1,
   source_status:'OBSERVED_ONLY',reason_codes:[],mastery_estimate:null}]};
 assert.throws(()=>buildK5Snapshot({projection:forged}),/verified|authentic|source|trusted|provenance/i);
 assert.throws(()=>renderK5Summary({projection:forged}),/verified|authentic|source|trusted|provenance/i);
});

test('P1 objective boundary: direct forged APPROVED and synthetically rewritten maps cannot bypass immutable approval',async()=>{
 const verified=await validateK5ObjectiveMap(raw,ID);
 assert.equal((await derive(verified)).observation_status,'NO_OBSERVATIONS');
 const forged={version:verified.version,items:verified.items.map(item=>({
  ...item,mapping_status:'APPROVED'})),raw:verified.raw,canonicalSha256:verified.canonicalSha256};
 await assert.rejects(derive(forged),/objective|map|verified|trusted|approved|authentic/i);
 const rewritten={...verified,items:verified.items.map(x=>({...x}))};
 await assert.rejects(derive(rewritten),/objective|map|verified|trusted|approved|authentic/i);
});
