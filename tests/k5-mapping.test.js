import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalMappingHash,canonicalMappingJson} from '../src/mastery/provenance.js';
const a={catalog:{release:'r1',families:[{family_id:'F1',domain_id:'D1'}]},objectives:[{objective_id:'O1',family_ids:['F1']}],lineage:{release:'r1',links:[]}};
const b={lineage:{links:[],release:'r1'},objectives:[{family_ids:['F1'],objective_id:'O1'}],catalog:{families:[{domain_id:'D1',family_id:'F1'}],release:'r1'}};
test('canonical mapping stable under object insertion order',async()=>{
 assert.equal(canonicalMappingJson(a),canonicalMappingJson(b));
 assert.equal(await canonicalMappingHash(a),await canonicalMappingHash(b));
});
test('mapping digest changes on objective/lineage even when payload hash unchanged',async()=>{
 assert.notEqual(await canonicalMappingHash(a),await canonicalMappingHash({...a,objectives:[{objective_id:'O2',family_ids:['F1']}]}));
 assert.notEqual(await canonicalMappingHash(a),await canonicalMappingHash({...a,lineage:{release:'r1',links:[['F0','F1']]}}));
});
test('rejects noncanonical unsupported values',()=>assert.throws(()=>canonicalMappingJson({bad:undefined}),/unsupported/i));
