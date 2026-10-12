import test from 'node:test';
import assert from 'node:assert/strict';
import {createK5BrowserController} from '../src/mastery/browserController.js';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {fingerprintEvent} from '../src/evidence/jcs.js';
const ID='sdaia-ai-engineer',RELEASE=ID+'.bootstrap.v1';
const FAMILY=ID+'.core-ai.reasoning.definition.best-description',VERSION=FAMILY+'.v1';
const OBJECTIVE=ID+'.objective.core-ai.reasoning.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const catalog=validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
  items:[{question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
   domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
 trackManifest:{id:ID,status:'active'},evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:'core-ai'}],
 objectives:{track_id:ID,objectives:[{objective_id:OBJECTIVE,track_id:ID,domain_id:'core-ai',
  concept_ids:['core-ai.reasoning'],status:'provisional'}]}
});
const objectiveMap={version:'objectives-1',items:[{objective_id:OBJECTIVE,domain_id:'core-ai',mapping_status:'PROVISIONAL'}]};
const document={createElement:tag=>({tagName:tag.toUpperCase(),textContent:'',setAttribute(key,value){this[key]=value}})};
const root=()=>({attrs:{},children:[],setAttribute(key,value){this.attrs[key]=value},replaceChildren(...nodes){this.children=nodes}});
const store=()=>({store_id:'local-store',getSourceHead:async()=>({store_id:'local-store',through_store_seq:0}),readRange:()=>{throw Error('zero-range read not allowed')}});
test('K5 card is RTL/AR then LTR/EN with region, live text and no invented readiness',async()=>{
 const el=root();let lang='ar';
 const controller=createK5BrowserController({document,root:el,store:store(),catalog,objectiveMap,
  learnerId:'local',trackId:ID,releaseId:RELEASE,locale:()=>lang});
 await controller.render();
 assert.equal(el.attrs.role,'region');assert.equal(el.attrs['aria-live'],'polite');
 assert.equal(el.attrs.dir,'rtl');assert.equal(el.children[0].textContent,'النشاط المسجل');
 assert.ok(el.children.some(node=>node.textContent.includes('الجاهزية')));
 lang='en';await controller.render();assert.equal(el.attrs.dir,'ltr');
 assert.equal(el.attrs.lang,'en');assert.equal(el.children[0].textContent,'Recorded activity');
});
test('denied IndexedDB does not pretend to report zero or reveal exceptions',async()=>{
 const el=root();const denied={...store(),getSourceHead:async()=>{throw Error('private IndexedDB permission denied')}};
 const controller=createK5BrowserController({document,root:el,store:denied,catalog,objectiveMap,
  learnerId:'local',trackId:ID,releaseId:RELEASE,locale:()=> 'en'});
 await controller.render();assert.equal(el.attrs['data-k5-status'],'SOURCE_INVALID');
 assert.ok(el.children.some(node=>/unavailable|verify/i.test(node.textContent)));
 assert.ok(!el.children.some(node=>/permission denied|private IndexedDB/i.test(node.textContent)));
});

test('K5 discards prior observed activity immediately after source erasure',async()=>{
 const el=root();
 const raw={event_id:'opaque-event-1',definition_id:'learner.item.presented@1',
  learner_id:'local',track_id:ID,content_release_id:RELEASE,mode:'practice',
  item_interaction_id:'interaction-1',question_family_id:FAMILY,item_version_id:VERSION,
  domain_id:'core-ai',objective_id:OBJECTIVE};
 const event={...raw,store_id:'local-store',store_seq:1,
  event_fingerprint:await fingerprintEvent(raw)};
 let head=1;
 const mutableStore={store_id:'local-store',
  getSourceHead:async()=>({store_id:'local-store',through_store_seq:head}),
  readRange:async({fromSeq,toSeq})=>head&&fromSeq<=1&&toSeq>=1?[event]:[]};
 const controller=createK5BrowserController({document,root:el,store:mutableStore,
  catalog,objectiveMap,learnerId:'local',trackId:ID,releaseId:RELEASE,locale:()=> 'en'});
 const before=await controller.render();
 assert.equal(before.status,'OBSERVATIONS_PRESENT');
 assert.equal(before.count,1);
 head=0; // simulates successful K3 source erasure, not a cached estimate
 const after=await controller.render();
 assert.equal(after.status,'NO_OBSERVATIONS');
 assert.equal(after.count,0);
 assert.equal(el.attrs['data-k5-status'],'NO_OBSERVATIONS');
 assert.ok(!el.children.some(node=>/1 public question families/i.test(node.textContent)));
});
