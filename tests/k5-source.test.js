import test from 'node:test';
import assert from 'node:assert/strict';
import {readK5Source} from '../src/mastery/source.js';
function source(head=0,rows=[]){
  let reads=0;
  return {
    store_id:'k5-local-store',
    get reads(){return reads;},
    getSourceHead:async()=>({store_id:'k5-local-store',through_store_seq:head}),
    readRange:async({fromSeq,toSeq,learnerId})=>{
      reads++;
      return rows.filter(row=>row.store_seq>=fromSeq&&row.store_seq<=toSeq&&row.learner_id===learnerId);
    }
  };
}
const args={learnerId:'learner-opaque',trackId:'sdaia-ai-engineer',releaseId:'release-current'};
test('empty K3 source never performs an invalid zero-range replay',async()=>{
  const store=source();
  const result=await readK5Source({store,...args,throughStoreSeq:0});
  assert.equal(store.reads,0);
  assert.equal(result.source_store_id,'k5-local-store');
  assert.deepEqual(result.events,[]);
  assert.match(result.source_fingerprint,/^[0-9a-f]{64}$/);
});
test('reject wrong scope, unpinned store and future watermark',async()=>{
  const store=source();
  await assert.rejects(readK5Source({store,...args,learnerId:'',throughStoreSeq:0}),/scope/i);
  await assert.rejects(readK5Source({store,...args,throughStoreSeq:-1}),/watermark/i);
  await assert.rejects(readK5Source({store,...args,throughStoreSeq:1}),/watermark/i);
  await assert.rejects(readK5Source({store:{read:async()=>[]},...args,throughStoreSeq:0}),/K3 source store/i);
});
