import test from 'node:test';
import assert from 'node:assert/strict';
import {buildK5Snapshot} from '../src/mastery/snapshot.js';
test('snapshot does not infer readiness from exposure',()=>{
 const v=buildK5Snapshot({policyId:'K5.EVIDENCE.v1',exposure:{families:1120,interactions:200}});
 assert.equal(v.estimator.status,'DISABLED_UNVALIDATED');
 assert.equal(v.estimator.mastery_estimate,null);
 assert.equal(v.estimator.readiness_probability,null);
 assert.equal(v.exposure.families,1120);
 assert.equal(v.exposure.interactions,200);
});
test('snapshot rejects unapproved policy',()=>assert.throws(()=>buildK5Snapshot({policyId:'K5.SCORING.v2'}),/unsupported/i));
