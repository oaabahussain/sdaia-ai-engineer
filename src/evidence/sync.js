import { assertEvidenceSyncPort } from './syncPort.js';
import { assertEvidenceBatchResult } from './storePort.js';

function nowFrom(policy) {
  if (typeof policy?.now === 'function') return policy.now();
  return new Date().toISOString();
}

function assertWatermark(value) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError('watermark must be a non-negative integer');
}

function assertPullResult(result, previous) {
  if (!result || typeof result !== 'object' || !Array.isArray(result.events)) {
    throw new TypeError('pull result must contain events');
  }
  if (!Number.isInteger(result.next_store_seq) || result.next_store_seq < previous) {
    throw new TypeError('pull result next_store_seq must be a monotonic non-negative integer');
  }
}

export async function syncEvidence({
  store,
  outbox,
  syncPort,
  watermark = 0,
  policy = {}
}) {
  if (!store || typeof store.getById !== 'function' || typeof store.accept !== 'function') {
    throw new TypeError('store.getById and store.accept are required');
  }
  if (!outbox || typeof outbox.listPending !== 'function' || typeof outbox.markInFlight !== 'function' || typeof outbox.applyReceipt !== 'function') {
    throw new TypeError('outbox port is incomplete');
  }
  assertEvidenceSyncPort(syncPort);
  assertWatermark(watermark);

  const pending = await outbox.listPending({ ...(policy.pendingOptions ?? {}), includeInFlight: true });
  const selected = Number.isInteger(policy.pushBatchSize) && policy.pushBatchSize > 0
    ? pending.slice(0, policy.pushBatchSize)
    : pending;
  const events = [];
  for (const record of selected) {
    const event = await store.getById(record.event_id);
    if (!event) throw new Error(`Pending evidence event not found: ${record.event_id}`);
    events.push(event);
  }

  if (events.length) {
    const batch = await syncPort.push(events);
    assertEvidenceBatchResult(batch);
    const selectedIds = new Set(selected.map((record) => record.event_id));
    const seen = new Set();
    for (const receipt of batch.receipts) {
      if (!selectedIds.has(receipt.event_id)) throw new Error(`Unexpected sync receipt: ${receipt.event_id}`);
      if (seen.has(receipt.event_id)) throw new Error(`Duplicate sync receipt: ${receipt.event_id}`);
      seen.add(receipt.event_id);
      await outbox.markInFlight([receipt.event_id], nowFrom(policy));
      await outbox.applyReceipt(receipt);
    }
  }

  const pulled = await syncPort.pull(watermark);
  assertPullResult(pulled, watermark);
  for (const event of pulled.events) {
    const receipt = await store.accept(event);
    if (!receipt || !['ACCEPTED', 'DUPLICATE'].includes(receipt.disposition)) {
      throw new Error(`Authoritative pulled evidence could not be stored: ${receipt?.disposition ?? 'NO_RECEIPT'}`);
    }
  }

  return {
    pushed: events.length,
    pulled: pulled.events.length,
    watermark: pulled.next_store_seq
  };
}
