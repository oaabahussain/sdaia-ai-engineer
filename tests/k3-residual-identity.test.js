import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveLearnerPrincipal} from '../src/platform-kernel/evidence/identityLinks.js';
const record=(n,extra={})=>({schema_version:1,identity_link_record_id:`record:${n}`,link_id:'link:1',action:'LINK',source_learner_id:'learner:a',target_learner_id:'learner:b',effective_at:'2026-10-03T10:00:00Z',authority_ref:'authority:test',reason_code:'TEST',created_at:`2026-10-03T10:0${n}:00Z`,...extra});
const resolve=rows=>resolveLearnerPrincipal('learner:a',rows);
for(const reverse of [false,true])test(`same-link retarget never wins by timestamp/order (${reverse})`,()=>{
 const rows=[record(1),record(2,{target_learner_id:'learner:c'})];if(reverse)rows.reverse();
 assert.equal(resolve(rows).status,'CONFLICT');assert.equal(resolve(rows).principal,null);
});
for(const predecessor of [undefined,'missing'])test(`orphan unlink is unresolved (${predecessor})`,()=>{
 assert.equal(resolve([record(2,{action:'UNLINK',predecessor_record_id:predecessor})]).status,'CONFLICT');
});
test('unlink-before-link arrival and older timestamp still resolves by predecessor',()=>{
 const root=record(5),end=record(1,{action:'UNLINK',predecessor_record_id:root.identity_link_record_id});
 assert.deepEqual(resolve([end,root]),{principal:'learner:a',chain:['learner:a'],status:'UNLINKED'});
});
test('two unlink descendants are an explicit branch conflict',()=>{
 const root=record(1);const a=record(2,{action:'UNLINK',predecessor_record_id:root.identity_link_record_id});const b=record(3,{action:'UNLINK',predecessor_record_id:root.identity_link_record_id});
 assert.equal(resolve([root,a,b]).status,'CONFLICT');
});
test('same record id with conflicting content is never overwritten',()=>{
 const root=record(1);assert.equal(resolve([root,{...root,target_learner_id:'learner:c'}]).status,'CONFLICT');
});
test('exact duplicate record is idempotent even with key order changed',()=>{
 const root=record(1),again=Object.fromEntries(Object.entries(root).reverse());
 assert.deepEqual(resolve([root,again]),{principal:'learner:b',chain:['learner:a','learner:b'],status:'LINKED'});
});
test('unlink cannot silently change endpoints',()=>{
 const root=record(1);assert.equal(resolve([root,record(2,{action:'UNLINK',target_learner_id:'learner:c',predecessor_record_id:root.identity_link_record_id})]).status,'CONFLICT');
});
test('relink is a new link identity after a valid unlink',()=>{
 const root=record(1),end=record(2,{action:'UNLINK',predecessor_record_id:root.identity_link_record_id}),next=record(3,{link_id:'link:2',target_learner_id:'learner:c'});
 assert.deepEqual(resolve([next,end,root]),{principal:'learner:c',chain:['learner:a','learner:c'],status:'LINKED'});
});
test('LINK carrying predecessor is not an implicit overwrite',()=>{
 const root=record(1);assert.equal(resolve([root,record(2,{predecessor_record_id:root.identity_link_record_id})]).status,'CONFLICT');
});
test('an unrelated invalid graph does not manufacture a link for this principal',()=>{
 const root=record(1,{source_learner_id:'learner:x'}),end=record(2,{action:'UNLINK',source_learner_id:'learner:x',predecessor_record_id:'missing'});
 assert.deepEqual(resolve([root,end]),{principal:'learner:a',chain:['learner:a'],status:'UNLINKED'});
});
