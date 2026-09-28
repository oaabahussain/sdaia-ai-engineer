import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl=new URL('../src/platform-kernel/observability/improvementFinding.js',import.meta.url);
const moduleExists=()=>fs.existsSync(moduleUrl);

async function signal(){
 const {registerEventDefinition,validateEvent}=await import('../src/platform-kernel/observability/eventRegistry.js');
 const id=registerEventDefinition({
  schema_version:1,event_name:'factory.quality.regression',event_version:1,
  purpose:'Signal aggregate quality regression',owner:'platform-quality',
  trigger_semantics:'Emit on calibrated regression detection',
  properties:{tranche_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'}},
  privacy_class:'ANONYMOUS',retention_class:'STANDARD',producer:'platform-kernel',
  compatibility:{strategy:'NEW_EVENT',previous_versions:[]},created_at:'2026-09-28T00:00:00Z'
 });
 return validateEvent(id,{occurred_at:'2026-09-28T00:00:00Z',properties:{tranche_id:'t1'}});
}

test('improvement finding builder module exists',()=>assert.equal(moduleExists(),true));

test('builder requires registry-validated signal and preserves observation/hypothesis separation',async()=>{
 if(!moduleExists())return;
 const {createImprovementFinding}=await import(moduleUrl);
 const out=createImprovementFinding({
  findingId:'finding:1',signal:await signal(),signalType:'quality_drift',summary:'quality regressed',
  evidenceRefs:['event:1'],scope:{kind:'tranche',ref:'t1'},
  uncertainty:{confidence:'MEDIUM',limitations:['observational']},
  hypothesis:{statement:'provider drift may contribute',evidence_class:'CORRELATION',causal:false},
  counterEvidence:['event:stable'],recommendedInvestigation:'slice by provider',
  recommendedExperiment:'controlled provider comparison',expectedImpact:'lower failure rate',
  owner:'platform-quality',createdAt:'2026-09-28T00:00:01Z'
 });
 assert.equal(out.status,'CANDIDATE');
 assert.equal(out.hypothesis.causal,false);
 assert.equal(out.observed_signal.signal_ref,'factory.quality.regression@1');
 assert.equal(Object.isFrozen(out),true);
});

test('correlation input cannot produce causal finding',async()=>{
 if(!moduleExists())return;
 const {createImprovementFinding}=await import(moduleUrl);
 const validatedSignal=await signal();
 assert.throws(()=>createImprovementFinding({
  findingId:'finding:bad',signal:validatedSignal,signalType:'quality_drift',summary:'regression',
  evidenceRefs:['event:1'],scope:{kind:'tranche',ref:'t1'},
  uncertainty:{confidence:'LOW',limitations:['correlation only']},
  hypothesis:{statement:'provider caused regression',evidence_class:'CORRELATION',causal:true},
  counterEvidence:[],recommendedInvestigation:'investigate',expectedImpact:'unknown',
  owner:'platform-quality',createdAt:'2026-09-28T00:00:01Z'
 }),/causal|hypothesis/i);
});

test('raw unvalidated signal is rejected',async()=>{
 if(!moduleExists())return;
 const {createImprovementFinding}=await import(moduleUrl);
 assert.throws(()=>createImprovementFinding({
  findingId:'finding:raw',signal:{definition_id:'fake@1'},signalType:'anomaly',summary:'raw',
  evidenceRefs:['e1'],scope:{kind:'platform',ref:'all'},
  uncertainty:{confidence:'LOW',limitations:['raw']},
  hypothesis:{statement:'unknown',evidence_class:'CORRELATION',causal:false},
  counterEvidence:[],recommendedInvestigation:'inspect',expectedImpact:'unknown',
  owner:'platform-quality',createdAt:'2026-09-28T00:00:01Z'
 }),/validated|signal/i);
});
