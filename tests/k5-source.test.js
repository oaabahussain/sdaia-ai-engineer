import test from 'node:test';
import assert from 'node:assert/strict';
import {readK5Source} from '../src/mastery/source.js';
test('empty store bypasses replay and preserves scope',async()=>{
 let called=0;const store={read:async()=>{called++;return [];}};
 const r=await readK5Source({store,learnerId:'L',trackId:'T',releaseId:'R',throughStoreSeq:0});
 assert.equal(called,0);assert.equal(r.learner_id,'L');assert.equal(r.track_id,'T');assert.equal(r.release_id,'R');assert.equal(r.through_store_seq,0);assert.deepEqual(r.events,[]);
});
test('wrong scope and invalid watermark fail closed',async()=>{
 await assert.rejects(readK5Source({store:{read:async()=>[]},learnerId:'',trackId:'T',releaseId:'R',throughStoreSeq:1}),/scope/i);
 await assert.rejects(readK5Source({store:{read:async()=>[]},learnerId:'L',trackId:'T',releaseId:'R',throughStoreSeq:-1}),/watermark/i);
});
