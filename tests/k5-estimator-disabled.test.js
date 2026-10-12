import test from 'node:test';
import assert from 'node:assert/strict';
import { requestK5Estimator } from '../src/mastery/estimator.js';

const NULL_FIELDS = ['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'];
for (const input of [
  {policyId:'K5.EVIDENCE.v1',evidence:{},enableFlag:false},
  {policyId:'K5.EVIDENCE.v1',evidence:{authority_ref:'forged',score:100},enableFlag:true},
  {policyId:'K5.EVIDENCE.v1',evidence:{producer:'SYSTEM',grade:'GRADED',validated:true},enableFlag:true},
  {policyId:'K5.EVIDENCE.v1',evidence:{count:1120,mastery_estimate:1},enableFlag:true}
]) {
  test('K5 scoring remains dormant for '+JSON.stringify(input.evidence), () => {
    const result = requestK5Estimator(input);
    assert.equal(result.status,'DISABLED_UNVALIDATED');
    assert.deepEqual(Object.keys(result).sort(), ['status',...NULL_FIELDS].sort());
    for(const field of NULL_FIELDS) assert.strictEqual(result[field],null,field);
  });
}
test('K5 policy cannot be upgraded by configuration flag',()=>{
  assert.throws(()=>requestK5Estimator({policyId:'K5.SCORING.v2',evidence:{},enableFlag:true}),/unsupported.*policy/i);
});
