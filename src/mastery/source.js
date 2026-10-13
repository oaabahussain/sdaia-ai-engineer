import { replayEvidence } from '../evidence/replay.js';

const verifiedReplayEvents=new WeakMap();
// Freeze an independent replay snapshot, never mutable IndexedDB/store row references.
function deepFreezeReplay(value,seen=new WeakSet()){
 if(!value||typeof value!=='object'||seen.has(value))return value;
 seen.add(value);
 for(const child of Object.values(value))deepFreezeReplay(child,seen);
 return Object.freeze(value);
}
export function assertK5VerifiedReplayBinding(source,events) {
  if(!source||typeof source!=='object'||verifiedReplayEvents.get(source)!==events)
    throw new TypeError('K5 requires source and events from the same verified K3 replay');
  return true;
}
const validId = value => typeof value === 'string' && value.length > 0;
const hasDirectPII = value => /@/.test(value) || /^\+?\d[\d\s().-]{6,}$/.test(value) || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);
async function fingerprintScope(parts) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto SHA-256 required');
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
}

export async function computeK5SourceFingerprint(source,events) {
  if(!source||!Array.isArray(events))throw new TypeError('pinned source and events required');
  const ordered=[...events].sort((a,b)=>a.store_seq-b.store_seq||
    (a.event_id<b.event_id?-1:a.event_id>b.event_id?1:0));
  return fingerprintScope([
    source.source_store_id,source.learner_id,source.track_id,source.release_id,source.through_store_seq,
    ordered.map(event=>[event.store_seq,event.event_id,event.event_fingerprint])
  ]);
}

// Read a pinned K3 local source head, not its independent sync cursor.
// Full learner history across valid releases is kept for correction resolution.
export async function readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq}={}) {
  if (![learnerId,trackId,releaseId].every(validId)) throw new TypeError('invalid source scope');
  if (hasDirectPII(learnerId)) throw new TypeError('learner_id must be an opaque pseudonym without direct PII');
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
  // Clone and deep-freeze before the first async fingerprint calculation.
  // All later correction classification sees the same immutable verified bytes.
  const frozenEvents=Object.freeze(events.map(event=>deepFreezeReplay(structuredClone(event))));
  const source_fingerprint = await computeK5SourceFingerprint({
    source_store_id:store.store_id,learner_id:learnerId,
    track_id:trackId,release_id:releaseId,through_store_seq:throughStoreSeq
  },frozenEvents);
  // Bind this result to the exact verified replay array. Public hashes alone
  // are not authority; only this reader may register the source/event pair.
  const source=Object.freeze({
    learner_id:learnerId,track_id:trackId,release_id:releaseId,
    source_store_id:store.store_id,through_store_seq:throughStoreSeq,
    source_fingerprint,events:frozenEvents
  });
  verifiedReplayEvents.set(source,frozenEvents);
  return source;
}
