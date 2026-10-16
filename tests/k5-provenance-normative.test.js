import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalMappingJson,canonicalMappingHash} from '../src/mastery/provenance.js';
test('RFC8785 sorts numeric-shaped object keys lexically',()=>{
 assert.equal(canonicalMappingJson({'2':'two','10':'ten',x:[1,2]}),'{"10":"ten","2":"two","x":[1,2]}');
});
test('canonical JSON SHA-256 fixed cross-runtime vector',async()=>{
 assert.equal(await canonicalMappingHash({b:2,a:1}),'43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777');
});
test('refuse unsupported omissions and noncanonical object types',()=>{
 for(const value of [{x:undefined},{x:NaN},{x:()=>0},{x:new Date()}])
  assert.throws(()=>canonicalMappingJson(value),/unsupported|invalid/i);
});
