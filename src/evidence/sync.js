import { fingerprintEvent } from './jcs.js';
import { assertEvidenceSyncPort } from './syncPort.js';
import { assertEvidenceBatchResult } from './storePort.js';

function nowFrom(policy) {
  if (typeof policy?.now === 'function') return policy.now();
  return new Date().toISOString();
}

function assertWatermark(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('watermark must be a non-negative integer');
}

function assertPullResult(result, previous) {
  if (!result || typeof result !== 'object' || !Array.isArray(result.events)) {
    throw new TypeError('pull result must contain events');
  }
  if (!Number.isSafeInteger(result.next_store_seq) || result.next_store_seq < previous) {
    throw new TypeError('pull result next_store_seq must be a monotonic non-negative integer');
  }
}

export async function syncEvidence({
  store,
  outbox,
  syncPort,
  watermark,
  sourceStoreId,
  policy = {}
}) {
  if (!store || typeof store.getById !== 'function' || typeof store.accept !== 'function') {
    throw new TypeError('store.getById and store.accept are required');
  }
  if (!outbox || typeof outbox.listPending !== 'function' || typeof outbox.markInFlight !== 'function' || typeof outbox.applyReceipt !== 'function') {
    throw new TypeError('outbox port is incomplete');
  }
  assertEvidenceSyncPort(syncPort);
  const persisted = await store.getSyncCursor?.();
  let source = sourceStoreId ?? persisted?.store_id ?? null;
  if (watermark && typeof watermark === 'object') { source=watermark.store_id; watermark=watermark.through_store_seq; }
  watermark ??= persisted?.through_store_seq ?? 0;
  assertWatermark(watermark);
  if (source !== null && (typeof source !== 'string' || !source)) throw new TypeError('Invalid cursor source store');
  if (watermark > 0 && !source) throw new TypeError('Nonzero cursor requires source store identity');
  if (persisted && source !== persisted.store_id) throw new Error('Persisted cursor source mismatch');

  const pending = await outbox.listPending({ ...(policy.pendingOptions ?? {}), includeInFlight: true });
  const rows = [];
  for (const record of pending) {
    const event = await store.getById(record.event_id);
    if (!event) throw new Error(`Pending evidence event not found: ${record.event_id}`);
    if (typeof event.origin_id !== 'string' || !Number.isSafeInteger(event.origin_seq) || event.origin_seq < 1) throw new TypeError('Invalid pending origin sequence');
    rows.push({record, event});
  }
  // Reorder only within each origin's queue slots. Cross-origin order is a
  // transport choice, never a claim about causality or client wall clocks.
  const groups = new Map();
  for (const row of rows) { const group = groups.get(row.event.origin_id) ?? []; group.push(row); groups.set(row.event.origin_id, group); }
  for (const group of groups.values()) group.sort((a,b) => a.event.origin_seq - b.event.origin_seq);
  const offsets = new Map();
  const ordered = rows.map(row => { const id = row.event.origin_id, i = offsets.get(id) ?? 0; offsets.set(id, i + 1); return groups.get(id)[i]; });
  const selected = Number.isSafeInteger(policy.pushBatchSize) && policy.pushBatchSize > 0 ? ordered.slice(0,policy.pushBatchSize) : ordered;
  const events = selected.map(row => row.event);
  const selectedIds = selected.map(row => row.record.event_id);

  if (events.length) {
    const fingerprints = new Map(await Promise.all(events.map(async event => [event.event_id, await fingerprintEvent(event)])));
    await outbox.markInFlight(selectedIds, nowFrom(policy));
    try {
      const batch = await syncPort.push(events);
      assertEvidenceBatchResult(batch);
      const seen = new Set();
      // Validate the entire transport response before acknowledging siblings.
      for (const receipt of batch.receipts) {
        if (!fingerprints.has(receipt.event_id)) throw new Error(`Unexpected sync receipt: ${receipt.event_id}`);
        if (seen.has(receipt.event_id)) throw new Error(`Duplicate sync receipt: ${receipt.event_id}`);
        if (receipt.event_fingerprint !== fingerprints.get(receipt.event_id)) throw new Error('Sync receipt fingerprint mismatch');
        seen.add(receipt.event_id);
      }
      const sources = new Set(batch.receipts.map(receipt=>receipt.store_id));
      if (sources.size > 1 || (sources.size && source && !sources.has(source))) throw new Error('Sync receipt source store mismatch');
      source ??= batch.receipts[0]?.store_id ?? null;
      if (source) await store.commitSyncCursor?.({store_id:source,through_store_seq:watermark});
      for (const receipt of batch.receipts) await outbox.applyReceipt(receipt);
      await outbox.markPending?.(selectedIds.filter(id => !seen.has(id)));
    } catch (error) {
      // A failed reset leaves IN_FLIGHT records recoverable on the next run.
      try { await outbox.markPending?.(selectedIds); }
      catch (resetError) { throw new AggregateError([error, resetError], 'Sync failed and pending reset failed'); }
      throw error;
    }
  }

  const pulled = await syncPort.pull(watermark, source ?? undefined);
  assertPullResult(pulled, watermark);
  const remote = pulled.store_id;
  if (remote === undefined && !(pulled.events.length === 0 && pulled.next_store_seq === 0 && watermark === 0)) throw new Error('Pull cursor requires source store identity');
  if (remote !== undefined && (typeof remote !== 'string' || !remote || (source && remote !== source))) throw new Error('Pull source store identity mismatch');
  source ??= remote ?? null;
  if (pulled.events.length && pulled.next_store_seq === watermark) throw new Error('Nonempty pull did not advance its source cursor');
  for (const event of pulled.events) {
    const receipt = await store.accept(event);
    if (!receipt || !['ACCEPTED', 'DUPLICATE'].includes(receipt.disposition)) {
      throw new Error(`Authoritative pulled evidence could not be stored: ${receipt?.disposition ?? 'NO_RECEIPT'}`);
    }
  }

  const cursor = source ? {store_id:source,through_store_seq:pulled.next_store_seq} : null;
  if (cursor) await store.commitSyncCursor?.(cursor);
  return {
    source_store_id:source,
    cursor,
    pushed: events.length,
    pulled: pulled.events.length,
    watermark: pulled.next_store_seq
  };
}
