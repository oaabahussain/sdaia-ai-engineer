import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptRedEvidence, validateAcceptedRed } from '../scripts/process/validate_accepted_red.js';

const H64='a'.repeat(64);
const behavioral={ failure_class:'ASSERTION_FAILURE', command:'node --test x', test_hashes:{'tests/x.test.js':H64}, fixture_hashes:{} };

test('accepts behavioral RED and freezes test/fixture hashes',()=>{
 const r=acceptRedEvidence(behavioral); assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(validateAcceptedRed(r.evidence,{...behavioral}).code,'ACCEPTED_RED_VALID');
});
test('rejects unrelated import/setup RED',()=>{
 for(const failure_class of ['UNRELATED_IMPORT_FAILURE','SETUP_FAILURE','ENVIRONMENT_FAILURE']){
  const r=acceptRedEvidence({...behavioral,failure_class}); assert.equal(r.ok,false); assert.equal(r.code,'INVALID_RED');
 }
});
test('rejects changed accepted hashes',()=>{
 const accepted=acceptRedEvidence(behavioral).evidence;
 const current={...behavioral,test_hashes:{'tests/x.test.js':'b'.repeat(64)}};
 const r=validateAcceptedRed(accepted,current); assert.equal(r.ok,false); assert.equal(r.code,'ACCEPTED_RED_MUTATED');
});
test('high-reasoning ruling can explicitly replace frozen hashes',()=>{
 const first=acceptRedEvidence(behavioral).evidence;
 const next={...behavioral,test_hashes:{'tests/x.test.js':'c'.repeat(64)}};
 const r=acceptRedEvidence(next,{replaces:first,ruling:'Ruling: intended RED changed after reviewed test correction'});
 assert.equal(r.ok,true,JSON.stringify(r.errors)); assert.equal(r.evidence.replaces_digest.length,64);
});
