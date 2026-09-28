import test from 'node:test';import assert from 'node:assert/strict';test('dedup stage rejects exact duplicate and abstains on unusable semantic evidence',async()=>{const {createDeduplicateStage}=await import('../src/platform-kernel/factory/stages/deduplicate.js');const exact=createDeduplicateStage({inventory:[{question_en:'Same text'}]});await assert.rejects(()=>exact.run({previous_output:{candidate:{question_en:' same   text '}}}),/duplicate/i);const uncertain=createDeduplicateStage({inventory:[{question_en:'other'}],embeddingProvider:{embed:async()=>null}});const out=await uncertain.run({previous_output:{candidate:{question_en:'new'}}});assert.equal(out.quality.duplication.result,'REVIEW_REQUIRED')});

test('semantic dedup without calibrated or explicit threshold routes to review instead of guessing',async()=>{
  const {createDeduplicateStage}=await import('../src/platform-kernel/factory/stages/deduplicate.js');
  const vectors=new Map([['candidate',[1,0]],['inventory',[0.99,Math.sqrt(1-0.99**2)]]]);
  const stage=createDeduplicateStage({
    inventory:[{id:'inventory',question_en:'other'}],
    embeddingProvider:{embed:async item=>vectors.get(item.id)}
  });
  const out=await stage.run({previous_output:{candidate:{id:'candidate',question_en:'new'}}});
  assert.equal(out.quality.duplication.result,'REVIEW_REQUIRED');
});
