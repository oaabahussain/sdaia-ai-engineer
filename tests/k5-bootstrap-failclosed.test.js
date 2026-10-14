import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('outer app bootstrap failure marks K5 card SOURCE_INVALID instead of indefinite verifying',()=>{
 const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const init=source.slice(source.indexOf('async function init(){'));
 assert.ok(init.startsWith('async function init(){try{'),'expected guarded app bootstrap');
 const outerCatch=init.slice(init.lastIndexOf('}catch(error){'));
 assert.match(outerCatch,/showK5Unavailable\(\)/,
  'all startup failures must fail closed K5, including pre-K4 fetch and IndexedDB rejection');
});
