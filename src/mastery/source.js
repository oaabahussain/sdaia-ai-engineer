export async function readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq}={}){
 if(!learnerId||!trackId||!releaseId)throw Error('invalid source scope');
 if(!Number.isSafeInteger(throughStoreSeq)||throughStoreSeq<0)throw Error('invalid watermark');
 if(!store||typeof store.read!=='function')throw Error('source unavailable');
 const events=throughStoreSeq===0?[]:await store.read({learnerId,trackId,releaseId,throughStoreSeq});
 if(!Array.isArray(events))throw Error('invalid source events');
 return Object.freeze({learner_id:learnerId,track_id:trackId,release_id:releaseId,source_store_id:store.id||null,through_store_seq:throughStoreSeq,source_fingerprint:store.fingerprint||null,events});
}
