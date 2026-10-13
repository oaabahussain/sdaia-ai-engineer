import test from 'node:test';
import assert from 'node:assert/strict';
import {readK5Source} from '../src/mastery/source.js';
const F='a'.repeat(64);
function k3Store(rows=[],head=rows.length){let reads=0;return {store_id:'store-A',get reads(){return reads},getSourceHead:async()=>({store_id:'store-A',through_store_seq:head}),readRange:async({fromSeq,toSeq,learnerId})=>{reads++;return rows.filter(e=>e.store_seq>=fromSeq&&e.store_seq<=toSeq&&e.learner_id===learnerId)}}}
function evt(seq,release='release-old',extra={}){return {event_id:'event'+seq,store_seq:seq,store_id:'store-A',event_fingerprint:F,definition_id:'learner.item.presented@1',learner_id:'L',track_id:'T',content_release_id:release,question_family_id:'family1',item_interaction_id:'interaction'+seq,...extra}}
const base={learnerId:'L',trackId:'T',releaseId:'release-new'};
test('K3 head zero never calls range replay, retains verified store scope',async()=>{const store=k3Store([],0);const v=await readK5Source({...base,store,throughStoreSeq:0});assert.equal(store.reads,0);assert.deepEqual(v.events,[]);assert.equal(v.source_store_id,'store-A');assert.equal(v.through_store_seq,0);assert.match(v.source_fingerprint,/^[a-f0-9]{64}$/)});
test('full verified learner history includes old and current releases before correction',async()=>{const rows=[evt(1,'release-old'),evt(2,'release-new',{definition_id:'learner.evidence.correction.recorded@1',payload:{action:'VOID',target_event_id:'event1'},authority_ref:'forged'})];const v=await readK5Source({...base,store:k3Store(rows),throughStoreSeq:2});assert.deepEqual(v.events.map(x=>x.event_id),['event1','event2']);assert.equal(v.learner_id,'L');assert.equal(v.track_id,'T');assert.equal(v.release_id,'release-new')});
test('rejects foreign principal / wrong track / source id',async()=>{for(const bad of [evt(1,'release-old',{learner_id:'foreigner'}),evt(1,'release-old',{track_id:'foreign'}),evt(1,'release-old',{store_id:'foreign'})]){const store={...k3Store([bad]),readRange:async()=>[bad]};await assert.rejects(readK5Source({...base,store,throughStoreSeq:1}),/identity|principal|track|source|store/i)}});
test('rejects watermark above actual head, duplicates and missing fingerprint',async()=>{await assert.rejects(readK5Source({...base,store:k3Store([],0),throughStoreSeq:1}),/watermark/i);for(const rows of [[evt(1),evt(1)],[evt(1,'release-old',{event_fingerprint:undefined})]])await assert.rejects(readK5Source({...base,store:{...k3Store(rows),readRange:async()=>rows},throughStoreSeq:rows.length}),/duplicate|fingerprint|identity/i)});


test('correction payload and nested metadata are immutable bound K3 replay evidence',async()=>{
 const rows=[evt(1,'release-old'),evt(2,'release-new',{
  definition_id:'learner.evidence.correction.recorded@1',
  payload:{action:'VOID',target_event_id:'event1',metadata:{nested:{scope:'source'}}},
  authority_ref:'unverified'
 })];
 const source=await readK5Source({...base,store:k3Store(rows),throughStoreSeq:2});
 const correction=source.events[1];
 assert.equal(correction.payload.action,'VOID');
 assert.equal(Object.isFrozen(source.events),true);
 assert.equal(Object.isFrozen(correction),true);
 assert.equal(Object.isFrozen(correction.payload),true,'nested correction payload must be frozen');
 assert.equal(Object.isFrozen(correction.payload.metadata.nested),true,'deep nested fields must be frozen');
 assert.throws(()=>{correction.payload.action='SUPERSEDE'},TypeError);
 rows[1].payload.action='SUPERSEDE';
 assert.equal(correction.payload.action,'VOID','mutation of original K3 store rows cannot alter verified replay');
});
