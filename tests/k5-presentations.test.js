import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {collectK5Presentations} from '../src/mastery/presentations.js';
const ID='sdaia-ai-engineer',RELEASE='sdaia-ai-engineer.bootstrap.v1';
const FAMILY=ID+'.core-ai.reasoning.definition.best-description',VERSION=FAMILY+'.v1';
const OBJECTIVE=ID+'.objective.core-ai.reasoning.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const catalog=()=>validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
  items:[{question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
   domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
 trackManifest:{id:ID,status:'active'},evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:'core-ai',answer:0}],
 objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,
  domain_id:'core-ai',concept_ids:['core-ai.reasoning'],status:'provisional'}]}
});
const run=events=>collectK5Presentations({events,catalog:catalog(),releaseId:RELEASE,policy:{policy_id:'K5.EVIDENCE.v1'}});
test('invented browser-only event_type/accepted fields are NOT K3 evidence',()=>{
 const item={event_type:'learner.item.presented@1',accepted:true,interaction_id:'I1',
  family_id:FAMILY,mode:'practice',release_id:RELEASE};
 const result=run([item]);
 assert.equal(result.observations.length,0);
 assert.equal(result.observed_distinct_interaction_count,0);
});
test('unverified caller lineage mapping cannot confer historical transfer evidence',()=>{
 const result=collectK5Presentations({
  events:[{event_id:'e1',definition_id:'learner.item.presented@1',
   content_release_id:'old-unapproved',mode:'practice',item_interaction_id:'i1',
   question_family_id:'private-old',item_version_id:'private-old.v1',
   domain_id:'core-ai',objective_id:OBJECTIVE}],
  catalog:catalog(),releaseId:RELEASE,
  policy:{policy_id:'K5.EVIDENCE.v1',lineage:{'old-unapproved:private-old':FAMILY}}
 });
 assert.deepEqual(result.observations,[]);
});
test('caller-constructed public item inventory does not satisfy K4 verification',()=>{
 assert.throws(()=>collectK5Presentations({
  events:[],catalog:{content_release_id:RELEASE,items:[]},releaseId:RELEASE,
  policy:{policy_id:'K5.EVIDENCE.v1'}
 }),/verified/i);
});
