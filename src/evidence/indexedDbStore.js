import { fingerprintEvent } from './jcs.js';
import { assertEvidenceAcceptance, assertOrdinaryEvidenceProducer, prepareEvidenceBatch, rejectedEvidenceReceipt } from './acceptance.js';
import { createLearnerEvidenceEvent } from './contract.js';
import { getOrCreateEvidenceOriginId, readEvidenceOriginSeq } from './origin.js';
import { createIndexedDbOutbox, pendingOutboxRecord } from './indexedDbOutbox.js';

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction(db, names, mode, operation) {
  const tx = db.transaction(names, mode);
  const done = new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
  // Observe rejection immediately even if a request fails before operation ends.
  done.catch(() => {});
  try {
    const result = await operation(tx);
    await done;
    return result;
  } catch (error) {
    try { tx.abort(); } catch { /* It may already have aborted/completed. */ }
    await done.catch(() => {});
    throw error;
  }
}

function openDatabase(indexedDB, dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    let blocked = false;
    request.onblocked = () => { blocked = true; reject(new Error('IndexedDB upgrade blocked by another connection')); };
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      const events = db.objectStoreNames.contains('events')
        ? request.transaction.objectStore('events') : db.createObjectStore('events', { keyPath: 'event_id' });
      const indexes = [
        ['by_origin_seq', ['origin_id', 'origin_seq'], true], ['by_store_seq', 'store_seq', true],
        ['by_learner_seq', ['learner_id', 'store_seq']], ['by_activity_seq', ['activity_id', 'store_seq']],
        ['by_attempt_seq', ['assessment_attempt_id', 'store_seq']], ['by_item_seq', ['item_version_id', 'store_seq']],
        ['by_release_seq', ['content_release_id', 'store_seq']], ['by_definition_seq', ['definition_id', 'store_seq']]
      ];
      for (const [name, key, unique = false] of indexes) {
        if (!events.indexNames.contains(name)) events.createIndex(name, key, { unique });
      }
      for (const [name, keyPath] of [['receipts', 'event_id'], ['meta', 'key'], ['outbox', 'event_id']]) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      if (blocked) db.close(); else resolve(db);
    };
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

  async function transact(names, mode, operation) {
    const db = await openDatabase(indexedDB, dbName);
    try {
      await runTransaction(db, ['meta','events','receipts'], 'readwrite', async tx => {
        const meta = tx.objectStore('meta');
        const saved = await requestResult(meta.get('store_id'));
        if (saved) {
          if (saved.value !== storeId) throw new Error('IndexedDB store identity mismatch');
        } else {
          const rows = await requestResult(tx.objectStore('events').getAll());
          const receipts = await requestResult(tx.objectStore('receipts').getAll());
          if ([...rows,...receipts].some(row => row.store_id !== storeId)) throw new Error('IndexedDB legacy store identity mismatch');
          meta.add({key:'store_id', value:storeId});
        }
      });
      return await runTransaction(db, names, mode, operation);
    }
    finally { db.close(); }
  }
  const outbox = createIndexedDbOutbox({ transact, requestResult });
  let captureTail = Promise.resolve();
  let freshOriginId;

  async function appendInTransaction(tx, event, fingerprint) {
    const events = tx.objectStore('events'), receipts = tx.objectStore('receipts'), meta = tx.objectStore('meta');
    const sameId = await requestResult(events.get(event.event_id));
    if (sameId) {
      const original = await requestResult(receipts.get(event.event_id));
      if (!original) throw new Error('IndexedDB evidence receipt missing');
      return sameId.event_fingerprint === fingerprint ? duplicateReceipt(original)
        : conflictReceipt(storeId, event.event_id, fingerprint, 'EVENT_ID_CONFLICT');
    }
    const sameOrigin = await requestResult(events.index('by_origin_seq').get([event.origin_id, event.origin_seq]));
    if (sameOrigin) return conflictReceipt(storeId, event.event_id, fingerprint, 'ORIGIN_SEQ_CONFLICT');
    const seqRecord = await requestResult(meta.get('next_store_seq'));
    const storeSeq = seqRecord?.value ?? 1;
    if (!Number.isSafeInteger(storeSeq) || storeSeq < 1 || storeSeq >= Number.MAX_SAFE_INTEGER) throw new Error('invalid or exhausted store sequence');
    const row = {
      event_id: event.event_id, event_fingerprint: fingerprint, origin_id: event.origin_id,
      origin_seq: event.origin_seq, learner_id: event.learner_id, activity_id: event.activity_id,
      assessment_attempt_id: event.assessment_attempt_id ?? null, item_version_id: event.item_version_id ?? null,
      content_release_id: event.content_release_id, definition_id: event.definition_id,
      store_seq: storeSeq, accepted_at: new Date().toISOString(), store_id: storeId, event
    };
    const receipt = acceptedReceipt(row);
    events.add(row); receipts.add(receipt); meta.put({ key: 'next_store_seq', value: storeSeq + 1 });
    const local = await requestResult(meta.get('capture_origin'));
    if (local?.value.origin_id === event.origin_id && local.value.origin_seq < event.origin_seq) {
      meta.put({ key: 'capture_origin', value: { origin_id: event.origin_id, origin_seq: event.origin_seq } });
    }
    return receipt;
  }

  async function localHead(tx, storage) {
    const saved = await requestResult(tx.objectStore('meta').get('capture_origin'));
    if (saved) {
      if (!Number.isSafeInteger(saved.value?.origin_seq) || saved.value.origin_seq < 0) throw new Error('invalid capture sequence');
      return saved.value;
    }
    // One-time V1 migration: only actual committed events and the retained
    // legacy high-water mark may advance this origin. Never invent history.
    const originId = getOrCreateEvidenceOriginId(storage);
    const rows = await requestResult(tx.objectStore('events').getAll());
    const legacy = rows.filter(row => row.origin_id === originId);
    if (legacy.length) {
      let sequence = readEvidenceOriginSeq(storage);
      for (const row of legacy) sequence = Math.max(sequence, row.origin_seq);
      return { origin_id: originId, origin_seq: sequence };
    }
    // Independent databases must not reuse one localStorage origin/sequence
    // pair. Adopt the legacy identity only when actual evidence anchors it.
    freshOriginId ??= globalThis.crypto.randomUUID();
    return { origin_id: freshOriginId, origin_seq: 0 };
  }

  return {
    store_id: storeId,
    outbox,
    async getSyncCursor() {
      return transact(['meta'], 'readonly', async tx => (await requestResult(tx.objectStore('meta').get('sync_cursor')))?.value ?? null);
    },
    async commitSyncCursor(cursor) {
      const value = structuredClone(cursor);
      if (typeof value?.store_id !== 'string' || !value.store_id || !Number.isSafeInteger(value.through_store_seq) || value.through_store_seq < 0) throw new TypeError('Invalid source-bound sync cursor');
      return transact(['meta'], 'readwrite', async tx => {
        const meta = tx.objectStore('meta'), previous = (await requestResult(meta.get('sync_cursor')))?.value;
        if (previous && (previous.store_id !== value.store_id || previous.through_store_seq > value.through_store_seq)) throw new Error('Sync cursor source mismatch or regression');
        meta.put({key:'sync_cursor',value});
        return value;
      });
    },
    async readRange({fromSeq=1,toSeq,learnerId,filters={}}={}) {
      if (!Number.isSafeInteger(fromSeq) || fromSeq < 1 || !Number.isSafeInteger(toSeq) || toSeq < fromSeq) throw new RangeError('Invalid replay watermark range');
      const rows = await transact(['events'], 'readonly', async tx => await requestResult(tx.objectStore('events').getAll()));
      const selected = rows.filter(row => row.store_seq >= fromSeq && row.store_seq <= toSeq && (learnerId === undefined || row.learner_id === learnerId) && matchesFilters(row.event,filters)).sort((a,b)=>a.store_seq-b.store_seq);
      const views = [];
      for (const row of selected) {
        if (row.store_id !== storeId || row.event_fingerprint !== await fingerprintEvent(row.event)) throw new Error('Replay store identity or fingerprint mismatch');
        views.push({...row.event, store_id:storeId, store_seq:row.store_seq, accepted_at:row.accepted_at, event_fingerprint:row.event_fingerprint});
      }
      return views;
    },
    async accept(event) {
      event = structuredClone(event); assertEvidenceAcceptance(event);
      const fingerprint = await fingerprintEvent(event);
      return transact(['events', 'receipts', 'meta'], 'readwrite', tx => appendInTransaction(tx, event, fingerprint));
    },
    async acceptBatch(events) {
      const prepared = await prepareEvidenceBatch(events), receipts = [];
      for (const value of prepared) receipts.push(value.invalid ? rejectedEvidenceReceipt(storeId, value) : await this.accept(value.event));
      return { schema_version: 1, receipts };
    },
    captureLocal({ eventInput, runtimeContext, outbox: requestedOutbox }) {
      if (requestedOutbox != null && requestedOutbox !== outbox) throw new TypeError('capture requires the same store-bound outbox');
      const input = structuredClone(eventInput);
      assertOrdinaryEvidenceProducer(input.definition_id);
      const storage = runtimeContext?.originStorage;
      const context = structuredClone({ track: runtimeContext?.track, evidence: runtimeContext?.evidence, eventDefinitions: runtimeContext?.eventDefinitions });
      const syncEnabled = requestedOutbox != null;
      const operation = async () => {
        for (;;) {
          const head = await transact(['events', 'meta'], 'readonly', tx => localHead(tx, storage));
          if (!Number.isSafeInteger(head.origin_seq) || head.origin_seq >= Number.MAX_SAFE_INTEGER) throw new Error('capture origin sequence overflow');
          const event = createLearnerEvidenceEvent({ ...input, origin_id: head.origin_id, origin_seq: head.origin_seq + 1 }, context);
          assertEvidenceAcceptance(event);
          // Hash before the write transaction: WebCrypto may outlive an IDB tx.
          const fingerprint = await fingerprintEvent(event);
          const captured = await transact(['events', 'receipts', 'meta', 'outbox'], 'readwrite', async tx => {
            const current = await localHead(tx, storage);
            if (current.origin_id !== head.origin_id || current.origin_seq !== head.origin_seq) return null;
            const receipt = await appendInTransaction(tx, event, fingerprint);
            if (receipt.disposition !== 'ACCEPTED') throw new Error(`Local evidence not durably recorded: ${receipt.disposition}`);
            tx.objectStore('meta').put({ key: 'capture_origin', value: { origin_id: event.origin_id, origin_seq: event.origin_seq } });
            if (syncEnabled) tx.objectStore('outbox').add(pendingOutboxRecord(event.event_id));
            return { event, receipt };
          });
          if (captured) return captured;
          // Another writer advanced the observed head. Rebuild and re-hash;
          // this abandoned candidate has never been acknowledged or persisted.
        }
      };
      const job = captureTail.then(operation, operation);
      captureTail = job.then(() => undefined, () => undefined);
      return job;
    },
    async getById(eventId) {
      return transact(['events'], 'readonly', async tx => (await requestResult(tx.objectStore('events').get(eventId)))?.event ?? null);
    },
    async read(learnerId, afterStoreSeq = undefined, filters = {}) {
      return transact(['events'], 'readonly', async tx => {
        const rows = await requestResult(tx.objectStore('events').getAll());
        return rows.filter(row => row.learner_id === learnerId)
          .filter(row => afterStoreSeq === undefined || row.store_seq > afterStoreSeq)
          .filter(row => matchesFilters(row.event, filters)).sort((a, b) => a.store_seq - b.store_seq).map(row => row.event);
      });
    }
  };
}
