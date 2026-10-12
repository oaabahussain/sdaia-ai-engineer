import { replayEvidence } from '../evidence/replay.js';

const validId = value => typeof value === 'string' && value.length > 0;
async function fingerprintScope(parts) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto SHA-256 required');
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
}

// Read a pinned K3 local source head, not its independent sync cursor.
// Full learner history across valid releases is kept for correction resolution.
export async function readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq}={}) {
  if (![learnerId,trackId,releaseId].every(validId)) throw new TypeError('invalid source scope');
  if (!Number.isSafeInteger(throughStoreSeq) || throughStoreSeq < 0)
    throw new RangeError('invalid watermark');
  if (!store || !validId(store.store_id) || typeof store.getSourceHead !== 'function' ||
      typeof store.readRange !== 'function') throw new TypeError('K3 source store required');
  const head = await store.getSourceHead();
  if (head?.store_id !== store.store_id || !Number.isSafeInteger(head.through_store_seq) ||
      head.through_store_seq < 0) throw new Error('source identity or head invalid');
  if (throughStoreSeq > head.through_store_seq) throw new RangeError('watermark exceeds source head');
  let events = [];
  if (throughStoreSeq > 0) {
    const replay = await replayEvidence({
      store_id: store.store_id,
      readRange: ({fromSeq,toSeq}) => store.readRange({fromSeq,toSeq,learnerId})
    }, {fromSeq:1,toSeq:throughStoreSeq,projectors:{events:rows=>rows}});
    events = replay.projections.events;
  }
  const seen = new Set();
  for (const event of events) {
    if (event?.store_id !== store.store_id || event.learner_id !== learnerId ||
        event.track_id !== trackId || !validId(event.content_release_id) ||
        !/^[a-f0-9]{64}$/.test(event.event_fingerprint || ''))
      throw new Error('source event identity, track, release or fingerprint invalid');
    if (seen.has(event.event_id)) throw new Error('duplicate source event identity');
    seen.add(event.event_id);
  }
  if (throughStoreSeq === 0 && events.length) throw new Error('zero watermark cannot contain events');
  const source_fingerprint = await fingerprintScope([
    store.store_id,learnerId,trackId,releaseId,throughStoreSeq,
    events.map(event=>[event.store_seq,event.event_id,event.event_fingerprint])
  ]);
  return {
    learner_id: learnerId,track_id:trackId,release_id:releaseId,
    source_store_id:store.store_id,through_store_seq:throughStoreSeq,
    source_fingerprint,events
  };
}
