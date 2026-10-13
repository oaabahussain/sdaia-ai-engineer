import test from 'node:test';
import assert from 'node:assert/strict';
import {renderK5Summary} from '../src/mastery/view.js';
import {trustedProjection} from './helpers/k5-valid-fixtures.js';

test('Arabic recorded activity from verified K3 source does not claim readiness',async()=>{
 const projection=await trustedProjection();
 const r=renderK5Summary({projection,locale:'ar'});
 assert.equal(r.heading,'النشاط المسجل');assert.equal(r.count,0);
 assert.ok(r.explanation.includes('الجاهزية'));
 assert.equal(r.direction,'rtl');assert.doesNotMatch(r.explanation,/%/);
});
test('English accessible description omits accuracy, ranking and passing chance',async()=>{
 const projection=await trustedProjection({observed:true});
 const r=renderK5Summary({projection,locale:'en'});
 assert.equal(r.heading,'Recorded activity');assert.equal(r.direction,'ltr');
 assert.equal(r.count,1);
 assert.match(r.explanation,/readiness.*not available/i);
 assert.doesNotMatch(JSON.stringify(r),/score:|passed|accuracy|100%/i);
});
test('source-invalid and copied projections cannot claim optimistic activity',async()=>{
 const original=await trustedProjection({observed:true});
 const fake={...original,integrity_status:'SOURCE_INVALID',observation_status:'QUARANTINED',
  observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,
  objectives:[],reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED',
   'NO_TRUSTED_EVALUATION','SOURCE_INTEGRITY_INVALID']};
 assert.throws(()=>renderK5Summary({projection:fake,locale:'en'}),/verified source|validated K5 projection/i);
});
test('untrusted response text never crosses the projection view boundary',async()=>{
 const original=await trustedProjection();
 assert.throws(()=>renderK5Summary({projection:{...original,
  raw_response:'<img src=x onerror=alert(1)>'},locale:'ar'}),/verified source|validated K5 projection/i);
});
