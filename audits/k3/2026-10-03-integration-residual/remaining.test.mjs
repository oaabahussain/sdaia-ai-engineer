import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const root=process.env.AUDIT_REPO;
if(!root)throw Error('AUDIT_REPO is required');
const mod=p=>import(pathToFileURL(`${root}/${p}`).href);
const { fixture,input,snapshot }=await mod('tests/helpers/k3AtomicCapture.js');
const {event,uid,fileStore}=await mod('tests/helpers/k3-repair-fixtures.js');
const {createIndexedDbEvidenceStore}=await mod('src/evidence/indexedDbStore.js');
const {captureLocalEvidence}=await mod('src/evidence/localCapture.js');
const {syncEvidence}=await mod('src/evidence/sync.js');
const {replayEvidence}=await mod('src/evidence/replay.js');
const {resolveLearnerPrincipal}=await mod('src/platform-kernel/evidence/identityLinks.js');
const {resolveCurrentEvidence}=await mod('src/evidence/corrections.js');
const capture=(f,changes={})=>captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:input(changes)});
const emptyPull=async after=>({events:[],next_store_seq:after});

test('C01 normal atomic capture and exact retry retain identity',async()=>{
 const f=fixture();const x=await capture(f);const again=await f.store.accept(x.event);
 assert.equal(again.disposition,'DUPLICATE');assert.equal(again.store_seq,x.receipt.store_seq);
 assert.equal((await f.store.outbox.listPending()).length,1);
});

test('R01a same physical IndexedDB must retain one stable store identity or reject mismatch',async()=>{
 const f=fixture();const first=await f.store.accept(event());
 const reopen=createIndexedDbEvidenceStore({dbName:f.name,storeId:'different:identity',indexedDB});
 let second;try{second=await reopen.accept(event(2));}catch(error){assert.match(error.message,/store|identity|mismatch/i);return;}
 assert.equal(second.store_id,first.store_id,'same database issued receipts under two store identities');
});

test('R02 native outbox must push same-origin revision chain in origin order',async()=>{
 const f=fixture();await capture(f,{event_id:uid(999)});await capture(f,{event_id:uid(1)});
 let pushed=[];
 await syncEvidence({store:f.store,outbox:f.store.outbox,syncPort:{
  async push(events){pushed=structuredClone(events);return {schema_version:1,receipts:[]};},pull:emptyPull
 }});
 assert.deepEqual(pushed.map(e=>e.origin_seq),[1,2],'outgoing order must not be randomized by event UUID');
});

test('R03 failed network attempt must be recorded before invoking push',async()=>{
 const f=fixture();await capture(f);
 await assert.rejects(()=>syncEvidence({store:f.store,outbox:f.store.outbox,syncPort:{async push(){throw Error('simulated network loss');},pull:emptyPull}}),/network loss/);
 const [row]=await f.store.outbox.listPending({includeInFlight:true});
 assert.equal(row.attempt_count,1,'real push attempt was left at zero');
 assert.ok(row.last_attempt_at,'real push attempt timestamp was not persisted');
});

for(const disposition of ['ACCEPTED','DUPLICATE'])test(`R04 ${disposition} receipt without authoritative sequence must not acknowledge`,async()=>{
 const f=fixture();const x=await capture(f);const bad={...x.receipt,store_id:'remote:test',disposition};delete bad.store_seq;
 await assert.rejects(()=>f.store.outbox.applyReceipt(bad),/sequence|store_seq|receipt/i);
 assert.equal((await f.store.outbox.listPending({includeInFlight:true})).length,1);
});

test('R04 unsafe integer receipt sequence must not acknowledge',async()=>{
 const f=fixture();const x=await capture(f);
 await assert.rejects(()=>f.store.outbox.applyReceipt({...x.receipt,store_id:'remote:test',store_seq:2**53}),/sequence|store_seq|receipt/i);
});

for(const kind of ['IndexedDB','JSONL'])test(`R05 real ${kind} evidence store can supply canonical replay`,async t=>{
 const store=kind==='IndexedDB'?fixture().store:(await fileStore(t)).store;
 await store.accept(event());let value,error=null;
 try{value=await replayEvidence(store,{fromSeq:1,toSeq:1,projectors:{count:events=>events.length}});}catch(e){error=e.message;}
 assert.equal(error,null,'production storage/replay integration failed: '+error);
 assert.equal(value.event_count,1);assert.equal(value.projections.count,1);
});

function link(n,target,changes={}){return {schema_version:1,identity_link_record_id:uid(n),link_id:'link:a',action:'LINK',source_learner_id:'learner:a',target_learner_id:target,effective_at:'2026-10-03T18:00:00Z',created_at:`2026-10-03T18:0${n}:00Z`,authority_ref:'authority:test',reason_code:'ACCOUNT_LINK',...changes};}
test('R06 competing LINK records cannot silently retarget one link ID',()=>{
 const a=link(1,'learner:b'),b=link(2,'learner:c');
 const resolved=resolveLearnerPrincipal('learner:a',[a,b]);
 assert.equal(resolved.status,'CONFLICT','conflicting identity history was resolved by timestamp');
 assert.equal(resolved.principal,null);
});
test('C02 different conflicting link IDs are already rejected',()=>{
 const resolved=resolveLearnerPrincipal('learner:a',[link(1,'learner:b'),link(2,'learner:c',{link_id:'link:c'})]);
 assert.equal(resolved.status,'CONFLICT');
});

test('R08 correction cannot change a different learner without validated cross-principal scope',()=>{
 const target=event(1,{learner_id:'learner:b'});
 const correction=event(2,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'authority:learner-a',payload:{target_event_id:target.event_id,action:'VOID',reason_code:'ADMIN_CORRECTION'}});
 const out=resolveCurrentEvidence([target,correction]);
 assert.ok(out.activeEvents.some(e=>e.event_id===target.event_id),'learner-a correction removed learner-b event');
 assert.ok(out.conflicts.length||out.unresolved.length,'scope conflict not surfaced');
});

const {resolveAssessmentMutation}=await mod('src/evidence/assessmentRevision.js');
for(const proposed of [undefined,7])test(`R09 strict candidate with proposed revision ${proposed} cannot be APPLIED`,async()=>{
 const candidate=event(1,{definition_id:'learner.response.recorded@1',mode:'mock',assessment_attempt_id:uid(70),form_id:'form:test',item_interaction_id:uid(80),item_version_id:'item:test',base_attempt_revision:0,payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}},...(proposed===undefined?{}:{proposed_attempt_revision:proposed})});
 const result=resolveAssessmentMutation({candidateEvent:candidate,currentRevision:0,storeSeq:1,authorityRef:'authority:assessment'});
 assert.equal(result.payload.decision,'REJECTED','missing or nonsequential proposed revision was applied');
});

test('R02 strict offline chain reordered by native outbox causes a stale valid mutation',async()=>{
 const f=fixture();
 for(let i=0;i<2;i++)await capture(f,{event_id:uid(i===0?999:1),mode:'mock',form_id:'form:test',assessment_attempt_id:uid(70),base_attempt_revision:i,proposed_attempt_revision:i+1});
 let revision=0;const decisions=[];
 await syncEvidence({store:f.store,outbox:f.store.outbox,syncPort:{
  async push(events){for(let i=0;i<events.length;i++){const decision=resolveAssessmentMutation({candidateEvent:events[i],currentRevision:revision,storeSeq:i+1,authorityRef:'authority:test'});decisions.push(decision.payload.decision);if(decision.payload.decision==='APPLIED')revision=decision.payload.authoritative_revision_after;}return {schema_version:1,receipts:[]};},pull:emptyPull
 }});
 assert.deepEqual(decisions,['APPLIED','APPLIED'],'otherwise valid same-origin chain was reordered before sequential authoritative resolution');
});

test('R10 native capture rejects undeclared sensitive fields inside OPTION response',async()=>{
 const f=fixture();
 await assert.rejects(()=>capture(f,{payload:{response_version:1,response_kind:'OPTION',response:{option_index:0,access_token:'SYNTHETIC-NOT-A-REAL-CREDENTIAL'}}}),/response|payload|privacy|sensitive|invalid/i);
 assert.equal((await f.store.read('learner:a')).length,0);
});
