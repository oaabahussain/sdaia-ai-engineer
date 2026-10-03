import test from 'node:test';
import assert from 'node:assert/strict';

async function loadIntegrity(){try{return await import('../src/platform-kernel/evidence/integrity.js')}catch{return {}}}
function ev(id,seq,overrides={}){return {schema_version:2,event_id:id,definition_id:'learner.activity.started@1',learner_id:'learner:p1',origin_id:'20000000-0000-4000-8000-000000000001',origin_seq:seq,activity_id:'30000000-0000-4000-8000-000000000001',track_id:'sdaia-ai-engineer',content_release_id:'release-1',mode:'practice',locale:'en',occurred_at:'2026-10-03T10:00:00Z',accepted_at:'2026-10-03T10:00:01Z',payload:{},...overrides}}

test('integrity detects orphan correction and origin/event identity conflicts deterministically',async()=>{
 const {inspectEvidenceIntegrity}=await loadIntegrity();assert.equal(typeof inspectEvidenceIntegrity,'function','inspectEvidenceIntegrity behavior is missing');
 const a=ev('10000000-0000-4000-8000-000000000001',1);
 const duplicateChanged={...a,payload:{different:true}};
 const originReuse=ev('10000000-0000-4000-8000-000000000002',1);
 const orphan=ev('10000000-0000-4000-8000-000000000003',2,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'authority:test',payload:{target_event_id:'99999999-0000-4000-8000-000000000999',action:'VOID',reason_code:'ADMIN_CORRECTION'}});
 const findings=inspectEvidenceIntegrity([a,duplicateChanged,originReuse,orphan],{knownDefinitionIds:['learner.activity.started@1','learner.evidence.correction.recorded@1']});
 assert.deepEqual(new Set(findings.filter(f=>f.severity==='ERROR').map(f=>f.code)),new Set(['EVENT_ID_CONFLICT','ORIGIN_SEQ_CONFLICT','UNRESOLVED_CORRECTION_TARGET']));
 const again=inspectEvidenceIntegrity([a,duplicateChanged,originReuse,orphan],{knownDefinitionIds:['learner.activity.started@1','learner.evidence.correction.recorded@1']});
 assert.deepEqual(findings,again);
});

test('clock divergence is a warning without numeric anomaly thresholds',async()=>{
 const {inspectEvidenceIntegrity}=await loadIntegrity();assert.equal(typeof inspectEvidenceIntegrity,'function','inspectEvidenceIntegrity behavior is missing');
 const futureSource=ev('10000000-0000-4000-8000-000000000001',1,{occurred_at:'2026-10-04T00:00:00Z',accepted_at:'2026-10-03T00:00:00Z'});
 const findings=inspectEvidenceIntegrity([futureSource],{knownDefinitionIds:['learner.activity.started@1']});
 assert.equal(findings.some(f=>f.code==='CLOCK_DIVERGENCE'&&f.severity==='WARNING'),true);
});

test('unsupported schema, unknown definition and projection watermark regression are deterministic errors',async()=>{
 const {inspectEvidenceIntegrity}=await loadIntegrity();assert.equal(typeof inspectEvidenceIntegrity,'function','inspectEvidenceIntegrity behavior is missing');
 const bad=ev('10000000-0000-4000-8000-000000000001',1,{schema_version:99,definition_id:'learner.unknown@1'});
 const findings=inspectEvidenceIntegrity([bad],{knownDefinitionIds:['learner.activity.started@1'],previousProjectionWatermark:10,currentProjectionWatermark:9});
 assert.deepEqual(new Set(findings.filter(f=>f.severity==='ERROR').map(f=>f.code)),new Set(['UNSUPPORTED_EVENT_SCHEMA','UNKNOWN_EVENT_DEFINITION','PROJECTION_WATERMARK_REGRESSION']));
});
