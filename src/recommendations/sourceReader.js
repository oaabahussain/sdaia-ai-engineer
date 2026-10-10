import { replayEvidence } from '../evidence/replay.js';

// Reads accepted local K3 evidence, never its sync cursor. This local pseudonym
// is not a server-authenticated learner identity and does not authorize grading.
export async function readK4Evidence({store,learnerId,trackId,releaseId,throughStoreSeq}={}) {
  if (!store || typeof store.readRange!=='function' || typeof store.getSourceHead!=='function' ||
      typeof store.store_id!=='string' || !store.store_id)
    throw new TypeError('K4 requires a source-bound K3 evidence store');
  if (![learnerId,trackId,releaseId].every(s=>typeof s==='string'&&s.length>0))
    throw new TypeError('K4 learner/track/release identity is required');
  if (!Number.isSafeInteger(throughStoreSeq) || throughStoreSeq<0)
    throw new RangeError('K4 source watermark must be nonnegative');
  const head=await store.getSourceHead();
  if(head?.store_id!==store.store_id ||
     !Number.isSafeInteger(head?.through_store_seq) || head.through_store_seq<0 ||
     throughStoreSeq>head.through_store_seq)
    throw new Error('K4 source identity or watermark mismatch');

  if(throughStoreSeq===0)
    return {source_store_id:head.store_id,through_store_seq:0,events:[]};

  const source={
    store_id:head.store_id,
    readRange:({fromSeq,toSeq})=>store.readRange({fromSeq,toSeq,learnerId})
  };
  // replayEvidence enforces unique event/sequence IDs and stable source identity;
  // IndexedDB.readRange independently checks each persisted event fingerprint.
  const replay=await replayEvidence(source,{
    fromSeq:1,toSeq:throughStoreSeq,projectors:{events: rows=>rows}
  });
  // Replay and fingerprint-check the full learner history before selecting the
  // active release; retained older content releases are valid K3 history, not
  // evidence usable by this K4 recommendation snapshot.
  const activeEvents=[];
  for(const row of replay.projections.events){
    if(row.learner_id!==learnerId || row.track_id!==trackId ||
       row.store_id!==head.store_id)
      throw new Error('K4 evidence principal/track/store identity is inconsistent');
    if(row.content_release_id===releaseId)activeEvents.push(row);
  }
  return {
    source_store_id:head.store_id,
    through_store_seq:throughStoreSeq,
    events:activeEvents
  };
}
