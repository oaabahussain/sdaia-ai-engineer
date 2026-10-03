function byStoreSeq(a,b){const as=Number.isInteger(a?.store_seq)?a.store_seq:Number.MAX_SAFE_INTEGER;const bs=Number.isInteger(b?.store_seq)?b.store_seq:Number.MAX_SAFE_INTEGER;return as!==bs?as-bs:String(a?.event_id??'').localeCompare(String(b?.event_id??''))}
export async function replayEvidence(store,{fromSeq=1,toSeq,projectors={}}={}){
  if(!store||typeof store.readRange!=='function')throw new TypeError('store.readRange is required for replay');
  if(!Number.isInteger(fromSeq)||fromSeq<1)throw new TypeError('fromSeq watermark must be a positive integer');
  if(!Number.isInteger(toSeq)||toSeq<fromSeq)throw new RangeError('toSeq watermark must be >= fromSeq');
  if(!projectors||typeof projectors!=='object'||Array.isArray(projectors))throw new TypeError('projectors must be an object');
  const rows=await store.readRange({fromSeq,toSeq});
  if(!Array.isArray(rows))throw new TypeError('store.readRange must return an array');
  const events=rows.filter(e=>Number.isInteger(e?.store_seq)&&e.store_seq>=fromSeq&&e.store_seq<=toSeq).sort(byStoreSeq);
  const projections={};
  for(const name of Object.keys(projectors).sort()){
    const projector=projectors[name];
    if(typeof projector!=='function')throw new TypeError(`projector ${name} must be a function`);
    projections[name]=await projector(events,{fromStoreSeq:fromSeq,throughStoreSeq:toSeq,sourceStoreId:store.store_id??store.storeId??null});
  }
  return {source_store_id:store.store_id??store.storeId??null,from_store_seq:fromSeq,through_store_seq:toSeq,event_count:events.length,projections};
}
