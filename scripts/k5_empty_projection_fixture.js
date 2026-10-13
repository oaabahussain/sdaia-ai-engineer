import {readK5Source} from '../src/mastery/source.js';
import {deriveK5EvidenceSufficiency} from '../src/mastery/projection.js';
import {renderK5Summary} from '../src/mastery/view.js';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {validateK5ObjectiveMap} from '../src/mastery/objectiveMap.js';
import {readFileSync} from 'node:fs';

// Intentionally independent Node process: Chromium smoke compares its real
// DOM to this same-policy, no-history projection without a browser mock.
const ID='sdaia-ai-engineer',RELEASE=ID+'.bootstrap.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const family=ID+'.core-ai.activation-function.definition.best-description';
const objective=ID+'.objective.core-ai.activation-function.v1',version=family+'.v1';
const catalog=validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,
  source:'MIGRATED_GRANDFATHERED_PUBLIC',items:[{
   question_family_id:family,item_version_id:version,objective_id:objective,
   domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'
  }]},
 trackManifest:{id:ID,status:'active'},
 evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:version,family_id:family,domain_id:'core-ai'}],
 objectives:{track_id:ID,objectives:[{
  objective_id:objective,track_id:ID,domain_id:'core-ai',
  concept_ids:['core-ai.activation-function'],status:'provisional'
 }]}
});
const source=await readK5Source({
 store:{
  store_id:'node-cold-start',
  getSourceHead:async()=>({store_id:'node-cold-start',through_store_seq:0}),
  readRange:async()=>{throw new Error('readRange must not run at zero watermark');}
 },
 learnerId:'node-opaque-learner',trackId:ID,releaseId:RELEASE,throughStoreSeq:0
});
const projection=await deriveK5EvidenceSufficiency({
 source,events:source.events,acceptedPublicCatalog:catalog,
 acceptedObjectiveMap:await validateK5ObjectiveMap(JSON.parse(readFileSync(
  new URL('../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8')),ID),
 policy:{policy_id:'K5.EVIDENCE.v1'}
});
const view=renderK5Summary({projection,locale:'en'});
process.stdout.write(JSON.stringify({
 status:view.status,heading:view.heading,body:view.body,count:view.count
})+'\n');
