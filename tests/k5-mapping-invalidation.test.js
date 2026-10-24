import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalMappingHash} from '../src/mastery/provenance.js';
import {trustedProjection,validatedObjectiveMap,ID,OBJECTIVE} from './helpers/k5-valid-fixtures.js';
import {readK5Source} from '../src/mastery/source.js';
import {deriveK5EvidenceSufficiency} from '../src/mastery/projection.js';
import {publicFixtureCatalog,RELEASE} from './helpers/k5-valid-fixtures.js';

async function derive(acceptedObjectiveMap){
 const store={store_id:'mapping-invalidation',
  getSourceHead:async()=>({store_id:'mapping-invalidation',through_store_seq:0}),
  readRange:async()=>{throw Error('no read at zero watermark');}};
 const source=await readK5Source({store,learnerId:'opaque',
  trackId:ID,releaseId:RELEASE,throughStoreSeq:0});
 return deriveK5EvidenceSufficiency({source,events:source.events,acceptedPublicCatalog:publicFixtureCatalog(),
  acceptedObjectiveMap,policy:{policy_id:'K5.EVIDENCE.v1'}});
}
test('same public payload hash never authorizes changed objective mapping',async()=>{
 const verified=await validatedObjectiveMap(),original=await derive(verified);
 const changed={...verified,items:verified.items.map(x=>x.objective_id===OBJECTIVE
   ?{...x,domain_id:'tampered-domain'}:{...x})};
 assert.equal(original.question_payload_sha256,(await trustedProjection()).question_payload_sha256);
 await assert.rejects(derive(changed),/verified immutable K5 objective map/);
 assert.notEqual(await canonicalMappingHash({version:verified.version,items:verified.items,raw:verified.raw}),
   await canonicalMappingHash({version:changed.version,items:changed.items,raw:changed.raw}));
});
test('forged approved status with unchanged claimed digest is rejected',async()=>{
 const verified=await validatedObjectiveMap();
 const raw=structuredClone(verified.raw);
 const forged={...verified,items:verified.items.map(x=>x.objective_id===OBJECTIVE
   ?{...x,mapping_status:'APPROVED'}:{...x}),raw};
 await assert.rejects(derive(forged),/verified immutable K5 objective map/);
});
