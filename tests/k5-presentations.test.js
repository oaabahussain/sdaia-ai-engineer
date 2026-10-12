import test from 'node:test';
import assert from 'node:assert/strict';
import {collectK5Presentations} from '../src/mastery/presentations.js';
const item=(id,family,release='r1',mode='practice')=>({event_type:'learner.item.presented@1',interaction_id:id,family_id:family,release_id:release,mode,accepted:true});
test('dedupes interaction and siblings, excludes mock and response',()=>{
 const events=[item('I1','F1'),item('I1','F1'),item('I2','F1'),item('I3','F2','r1','mock'),{...item('I4','F3'),event_type:'learner.item.responded@1'}];
 const x=collectK5Presentations({events,catalog:{families:['F1','F2','F3']},policy:{}});
 assert.deepEqual(x.observations.map(v=>v.family_id),['F1']);
 assert.equal(x.repeatedFamilies,1);
});
test('approved cross-release lineage unifies historical sibling',()=>{
 const x=collectK5Presentations({events:[item('I1','F1','r1'),item('I2','F1-new','r2')],catalog:{families:['F1-new']},policy:{lineage:{'r1:F1':'F1-new','r2:F1-new':'F1-new'}}});
 assert.deepEqual(x.observations.map(v=>v.family_id),['F1-new']);
});
test('missing cross-release lineage abstains rather than transferring',()=>{
 const x=collectK5Presentations({events:[item('I1','F1','r1')],catalog:{families:['F1-new']},policy:{}});
 assert.deepEqual(x.observations,[]);
 assert.equal(x.unknownMapping,true);
});
