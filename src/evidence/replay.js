export async function replayEvidence(store, { fromSeq = 1, toSeq, projectors = {} } = {}) {
  if (!store || typeof store.readRange !== 'function') throw new TypeError('store.readRange is required for replay');
  if (!Number.isSafeInteger(fromSeq) || fromSeq < 1) throw new TypeError('fromSeq watermark must be a positive integer');
  if (!Number.isSafeInteger(toSeq) || toSeq < fromSeq) throw new RangeError('toSeq watermark must be >= fromSeq');
  if (!projectors || typeof projectors !== 'object' || Array.isArray(projectors)) throw new TypeError('projectors must be an object');
  const source = store.store_id ?? store.storeId;
  if (typeof source !== 'string' || !source) throw new TypeError('Replay requires stable source store identity');
  const rows = await store.readRange({ fromSeq, toSeq });
  if (!Array.isArray(rows)) throw new TypeError('store.readRange must return an array');
  const events = structuredClone(rows), sequences = new Set(), identities = new Set();
  for (const event of events) {
    if (!Number.isSafeInteger(event?.store_seq) || event.store_seq < fromSeq || event.store_seq > toSeq) {
      throw new Error('Replay store sequence is invalid or outside requested range');
    }
    if ((event.store_id !== undefined && event.store_id !== source) || typeof event.event_id !== 'string' || !event.event_id) {
      throw new Error('Replay event or store identity is invalid');
    }
    if (sequences.has(event.store_seq) || identities.has(event.event_id)) throw new Error('Duplicate replay sequence or event identity');
    sequences.add(event.store_seq); identities.add(event.event_id);
  }
  events.sort((a, b) => a.store_seq - b.store_seq);
  const projections = {};
  for (const name of Object.keys(projectors).sort()) {
    const projector = projectors[name];
    if (typeof projector !== 'function') throw new TypeError(`projector ${name} must be a function`);
    const value = await projector(structuredClone(events), { fromStoreSeq: fromSeq, throughStoreSeq: toSeq, sourceStoreId: source });
    Object.defineProperty(projections, name, { value, enumerable: true, configurable: true, writable: true });
  }
  return { source_store_id: source, from_store_seq: fromSeq, through_store_seq: toSeq, event_count: events.length, projections };
}
