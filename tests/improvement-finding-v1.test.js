import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const schema=JSON.parse(fs.readFileSync(new URL('../data/schema/improvement-finding-v1.schema.json',import.meta.url),'utf8'));
const validate=new Ajv({strict:false,allErrors:true,formats:{'date-time':true}}).compile(schema);

const valid={
 schema_version:1,
 finding_id:'finding:factory:1',
 observed_signal:{signal_type:'metric_regression',signal_ref:'factory.tranche.metrics@1',summary:'failure rate increased'},
 evidence_refs:['event:1','event:2'],
 scope:{kind:'tranche',ref:'tranche:1'},
 uncertainty:{confidence:'MEDIUM',limitations:['observational evidence only']},
 hypothesis:{statement:'provider drift may explain the increase',evidence_class:'CORRELATION',causal:false},
 counter_evidence:['event:stable-latency'],
 recommended_investigation:'compare provider evaluation slices',
 recommended_experiment:'controlled provider comparison',
 expected_impact:'reduce factory failure rate if hypothesis is supported',
 owner:'platform-quality',
 status:'CANDIDATE',
 created_at:'2026-09-28T00:00:00Z'
};

test('ImprovementFindingV1 separates observation from hypothesis',()=>{
 assert.equal(validate(valid),true,JSON.stringify(validate.errors));
 const causal=structuredClone(valid);
 causal.cause='provider is bad';
 assert.equal(validate(causal),false);
});

test('ImprovementFindingV1 requires evidence, uncertainty and non-causal hypothesis classification',()=>{
 const noEvidence=structuredClone(valid); noEvidence.evidence_refs=[];
 assert.equal(validate(noEvidence),false);
 const causal=structuredClone(valid); causal.hypothesis.causal=true;
 assert.equal(validate(causal),false);
 const noHypothesis=structuredClone(valid); delete noHypothesis.hypothesis;
 assert.equal(validate(noHypothesis),false);
});
