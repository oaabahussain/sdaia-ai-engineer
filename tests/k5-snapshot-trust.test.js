import test from 'node:test';
import assert from 'node:assert/strict';
import {buildK5Snapshot} from '../src/mastery/snapshot.js';
import {trustedProjection} from './helpers/k5-valid-fixtures.js';

test('raw public exposure is not itself source-verified K5 evidence',()=>{
 assert.throws(()=>buildK5Snapshot({policyId:'K5.EVIDENCE.v1',exposure:{families:1120,interactions:200}}),/projection/i);
});
test('snapshot accepts genuinely derived source-bound projection; scoring remains disabled',async()=>{
 const projection=await trustedProjection();
 const snapshot=buildK5Snapshot({projection});
 assert.equal(snapshot.exposure.families,0);
 assert.equal(snapshot.exposure.interactions,0);
 assert.equal(snapshot.estimator.readiness_estimate,null);
});
test('snapshot displays only actually verified recorded public families',async()=>{
 const projection=await trustedProjection({observed:true});
 assert.equal(buildK5Snapshot({projection}).exposure.families,1);
 assert.throws(()=>buildK5Snapshot({projection:structuredClone(projection)}),/verified source|validated K5 projection/i);
});
test('caller-invented quarantined state cannot cross authenticated boundary',async()=>{
 const projection=await trustedProjection();
 const copy={...projection,integrity_status:'SOURCE_INVALID',observation_status:'QUARANTINED',
   reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_TRUSTED_EVALUATION','SOURCE_INTEGRITY_INVALID']};
 assert.throws(()=>buildK5Snapshot({projection:copy}),/verified source|validated K5 projection/i);
});
