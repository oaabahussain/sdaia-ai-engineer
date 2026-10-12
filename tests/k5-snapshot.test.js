import test from 'node:test';
import assert from 'node:assert/strict';
import {buildK5Snapshot} from '../src/mastery/snapshot.js';
test('raw public exposure is not itself K5 source-verified evidence',()=>{
 assert.throws(()=>buildK5Snapshot({
  policyId:'K5.EVIDENCE.v1',exposure:{families:1120,interactions:200}
 }),/validated projection|projection required/i);
});
test('scoring feature flag without verified K5 projection is rejected',()=>{
 assert.throws(()=>buildK5Snapshot({
  policyId:'K5.SCORING.v2',exposure:{families:1120,interactions:200}
 }),/validated projection|projection required/i);
});
