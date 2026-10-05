import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAssessmentMutation } from '../src/evidence/assessmentRevision.js';
const raw=(extra={})=>({event_id:'20000000-0000-4000-8000-000000000001',activity_id:'20000000-0000-4000-8000-000000000010',assessment_attempt_id:'20000000-0000-4000-8000-000000000020',base_attempt_revision:0,...extra});
for(const proposed of [undefined,7,-1,'1',true,2**53])test(`reject invalid proposed revision ${proposed}`,()=>{
 const candidate=raw({...proposed===undefined?{}:{proposed_attempt_revision:proposed}});const before=structuredClone(candidate);
 const result=resolveAssessmentMutation({candidateEvent:candidate,currentRevision:0,storeSeq:1,authorityRef:'authority:test'});
 assert.equal(result.payload.decision,'REJECTED');assert.equal(result.payload.authoritative_revision_after,undefined);assert.deepEqual(candidate,before);
});
test('valid proposed revision is used exactly and stale candidate never advances',()=>{
 const candidate=raw({proposed_attempt_revision:1});
 const applied=resolveAssessmentMutation({candidateEvent:candidate,currentRevision:0,storeSeq:1,authorityRef:'authority:test'});
 const stale=resolveAssessmentMutation({candidateEvent:candidate,currentRevision:1,storeSeq:2,authorityRef:'authority:test'});
 assert.equal(applied.payload.authoritative_revision_after,1);assert.equal(stale.payload.decision,'STALE');
});
for(const field of ['currentRevision','storeSeq'])test(`unsafe ${field} rejected`,()=>{
 assert.throws(()=>resolveAssessmentMutation({candidateEvent:raw({proposed_attempt_revision:1}),currentRevision:0,storeSeq:1,authorityRef:'authority:test',[field]:2**53}),/safe|integer|revision|sequence/i);
});
