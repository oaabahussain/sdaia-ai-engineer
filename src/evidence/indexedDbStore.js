import { fingerprintEvent } from './jcs.js';

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    transaction.onerror = () => reject(transaction.error);
  });
}

function openDatabase(indexedDB, dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      const events = db.createObjectStore('events', { keyPath: 'event_id' });
      events.createIndex('by_origin_seq', ['origin_id', 'origin_seq'], { unique: true });
      events.createIndex('by_store_seq', 'store_seq', { unique: true });
      events.createIndex('by_learner_seq', ['learner_id', 'store_seq']);
      events.createIndex('by_activity_seq', ['activity_id', 'store_seq']);
      events.createIndex('by_attempt_seq', ['assessment_attempt_id', 'store_seq']);
      events.createIndex('by_item_seq', ['item_version_id', 'store_seq']);
      events.createIndex('by_release_seq', ['content_release_id', 'store_seq']);
      events.createIndex('by_definition_seq', ['definition_id', 'store_seq']);
      db.createObjectStore('receipts', { keyPath: 'event_id' });
      db.createObjectStore('meta', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function acceptedReceipt(row) {
  return {
    schema_version: 1,
    store_id: row.store_id,
    event_id: row.event_id,
    event_fingerprint: row.event_fingerprint,
    disposition: 'ACCEPTED',
    accepted_at: row.accepted_at,
    store_seq: row.store_seq,
    warnings: []
  };
}

function duplicateReceipt(receipt) {
  return { ...receipt, disposition: 'DUPLICATE' };
}

function conflictReceipt(storeId, eventId, fingerprint, reasonCode) {
  return {
    schema_version: 1,
    store_id: storeId,
    event_id: eventId,
    event_fingerprint: fingerprint,
    disposition: 'CONFLICT',
    accepted_at: new Date().toISOString(),
    reason_code: reasonCode,
    warnings: []
  };
}

function matchesFilters(event, filters = {}) {
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value === undefined) continue;
    const actualKey = key === 'type' ? 'definition_id' : key;
    if (event[actualKey] !== value) return false;
  }
  return true;
}

export function createIndexedDbEvidenceStore({ dbName, storeId, indexedDB }) {
  if (!indexedDB?.open) throw new TypeError('indexedDB implementation is required');
  if (typeof dbName !== 'string' || !dbName) throw new TypeError('dbName is required');
  if (typeof storeId !== 'string' || !storeId) throw new TypeError('storeId is required');

  async function withDb(fn) {
    const db = await openDatabase(indexedDB, dbName);
    try { return await fn(db); }
    finally { db.close(); }
  }

  return {
    async accept(event) {
      const fingerprint = await fingerprintEvent(event);
      return withDb(async (db) => {
        const tx = db.transaction(['events', 'receipts', 'meta'], 'readwrite');
        const events = tx.objectStore('events');
        const receipts = tx.objectStore('receipts');
        const meta = tx.objectStore('meta');

        const sameId = await requestResult(events.get(event.event_id));
        if (sameId) {
          const original = await requestResult(receipts.get(event.event_id));
          await transactionDone(tx);
          return sameId.event_fingerprint === fingerprint
            ? duplicateReceipt(original)
            : conflictReceipt(storeId, event.event_id, fingerprint, 'EVENT_ID_CONFLICT');
        }

        const sameOrigin = await requestResult(events.index('by_origin_seq').get([event.origin_id, event.origin_seq]));
        if (sameOrigin) {
          await transactionDone(tx);
          return conflictReceipt(storeId, event.event_id, fingerprint, 'ORIGIN_SEQ_CONFLICT');
        }

        const seqRecord = await requestResult(meta.get('next_store_seq'));
        const storeSeq = seqRecord?.value ?? 1;
        const acceptedAt = new Date().toISOString();
        const row = {
          event_id: event.event_id,
          event_fingerprint: fingerprint,
          origin_id: event.origin_id,
          origin_seq: event.origin_seq,
          learner_id: event.learner_id,
          activity_id: event.activity_id,
          assessment_attempt_id: event.assessment_attempt_id ?? null,
          item_version_id: event.item_version_id ?? null,
          content_release_id: event.content_release_id,
          definition_id: event.definition_id,
          store_seq: storeSeq,
          accepted_at: acceptedAt,
          store_id: storeId,
          event
        };
        const receipt = acceptedReceipt(row);
        events.add(row);
        receipts.add(receipt);
        meta.put({ key: 'next_store_seq', value: storeSeq + 1 });
        await transactionDone(tx);
        return receipt;
      });
    },

    async acceptBatch(events) {
      const receipts = [];
      for (const event of events) receipts.push(await this.accept(event));
      return { schema_version: 1, receipts };
    },

    async getById(eventId) {
      return withDb(async (db) => {
        const tx = db.transaction('events', 'readonly');
        const row = await requestResult(tx.objectStore('events').get(eventId));
        await transactionDone(tx);
        return row?.event ?? null;
      });
    },

    async read(learnerId, afterStoreSeq = undefined, filters = {}) {
      return withDb(async (db) => {
        const tx = db.transaction('events', 'readonly');
        const rows = await requestResult(tx.objectStore('events').getAll());
        await transactionDone(tx);
        return rows
          .filter((row) => row.learner_id === learnerId)
          .filter((row) => afterStoreSeq === undefined || row.store_seq > afterStoreSeq)
          .filter((row) => matchesFilters(row.event, filters))
          .sort((a, b) => a.store_seq - b.store_seq)
          .map((row) => row.event);
      });
    }
  };
}
