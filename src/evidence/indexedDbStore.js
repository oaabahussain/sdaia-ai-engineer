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
    async getSourceHead() {
      return transact(['meta'], 'readonly', async tx => {
        const saved = await requestResult(tx.objectStore('meta').get('next_store_seq'));
        const next = saved?.value ?? 1;
        if (!Number.isSafeInteger(next) || next < 1)
          throw new Error('Invalid local evidence source head');
        return { store_id: storeId, through_store_seq: next - 1 };
      });
    },
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
    async getK4Preferences({learnerId,initial}={}) {
      if(typeof learnerId!=='string'||!learnerId)throw new TypeError('K4 learner ID required');
      return transact(['meta'],initial===undefined?'readonly':'readwrite',async tx=>{
        const meta=tx.objectStore('meta'),key='k4_preferences:'+learnerId;
        const saved=(await requestResult(meta.get(key)))?.value;
        if(saved)return structuredClone(saved);
        if(initial===undefined)return null;
        if(typeof initial?.persisted!=='boolean' ||
           initial.preferences?.learner_id!==learnerId ||
           !Number.isSafeInteger(initial.preferences?.revision) ||
           initial.preferences.revision<0)
          throw new TypeError('K4 initial preference snapshot invalid');
        const value=structuredClone(initial);
        meta.add({key,value});
        return value;
      });
    },
    async saveK4Preferences({learnerId,expectedRevision,next}={}) {
      if(typeof learnerId!=='string'||!learnerId ||
         !Number.isSafeInteger(expectedRevision)||expectedRevision<0 ||
         next?.learner_id!==learnerId)
        throw new TypeError('K4 save preference identity or revision invalid');
      return transact(['meta'],'readwrite',async tx=>{
        const meta=tx.objectStore('meta'),key='k4_preferences:'+learnerId;
        const saved=(await requestResult(meta.get(key)))?.value;
        if(!saved)throw new Error('K4 preferences must be loaded before save');
        if(saved.preferences?.revision!==expectedRevision)
          throw new Error('K4 preferences revision conflict');
        const value=structuredClone(next);
        value.revision=expectedRevision+1;
        meta.put({key,value:{persisted:true,preferences:value}});
        return {persisted:true,revision:value.revision};
      });
    },
    async clearK4Preferences(learnerId) {
      if(typeof learnerId!=='string'||!learnerId)throw new TypeError('K4 learner ID required');
      return transact(['meta'],'readwrite',async tx=>{
        const meta=tx.objectStore('meta'),key='k4_preferences:'+learnerId;
        const saved=(await requestResult(meta.get(key)))?.value;
        const revision=(saved?.preferences?.revision??0)+1;
        meta.put({key,value:{persisted:false,preferences:{
          learner_id:learnerId,version:1,revision,
          snoozed_families:[],dismissed_families:[],preferred_domain_id:null
        }}});
        return {persisted:true};
      });
    },
    captureLocalPracticePair({
      startInput,presentInput,runtimeContext,outbox:requestedOutbox,
      expectedSourceHead,expectedPreferencesRevision
    }={}) {
      if(requestedOutbox!=null && requestedOutbox!==outbox)
        throw new TypeError('capture requires the same store-bound outbox');
      if(!expectedSourceHead || expectedSourceHead.store_id!==storeId ||
         !Number.isSafeInteger(expectedSourceHead.through_store_seq) ||
         expectedSourceHead.through_store_seq<0)
        throw new Error('stale K4 practice source watermark');
      if(!Number.isSafeInteger(expectedPreferencesRevision)||expectedPreferencesRevision<0)
        throw new TypeError('K4 guarded practice preference revision required');
      const start=structuredClone(startInput),present=structuredClone(presentInput);
      if(start?.definition_id!=='learner.activity.started@1' ||
         present?.definition_id!=='learner.item.presented@1' ||
         start.mode!=='practice'||present.mode!=='practice' ||
         !start.learner_id||present.learner_id!==start.learner_id ||
         present.activity_id!==start.activity_id ||
         present.track_id!==start.track_id ||
         present.content_release_id!==start.content_release_id ||
         present.locale!==start.locale)
        throw new TypeError('K4 guarded practice pair has inconsistent identity');
      assertOrdinaryEvidenceProducer(start.definition_id);
      assertOrdinaryEvidenceProducer(present.definition_id);
      const storage=runtimeContext?.originStorage;
      const context=structuredClone({
        track:runtimeContext?.track,evidence:runtimeContext?.evidence,
        eventDefinitions:runtimeContext?.eventDefinitions
      });
      const syncEnabled=requestedOutbox!=null;
      const operation=async()=>{
        for(;;){
          const head=await transact(['events','meta'],'readonly',tx=>localHead(tx,storage));
          if(!Number.isSafeInteger(head.origin_seq) || head.origin_seq<0 ||
             head.origin_seq>Number.MAX_SAFE_INTEGER-2)
            throw new Error('capture origin sequence overflow');
          const startEvent=createLearnerEvidenceEvent({
            ...start,origin_id:head.origin_id,origin_seq:head.origin_seq+1
          },context);
          const presentEvent=createLearnerEvidenceEvent({
            ...present,origin_id:head.origin_id,origin_seq:head.origin_seq+2
          },context);
          assertEvidenceAcceptance(startEvent);
          assertEvidenceAcceptance(presentEvent);
          // Calculate both fingerprints before opening the write transaction.
          const [startHash,presentHash]=await Promise.all([
            fingerprintEvent(startEvent),fingerprintEvent(presentEvent)
          ]);
          const result=await transact(['events','receipts','meta','outbox'],'readwrite',async tx=>{
            const current=await localHead(tx,storage);
            if(current.origin_id!==head.origin_id ||
               current.origin_seq!==head.origin_seq)return null;
            const meta=tx.objectStore('meta');
            const next=(await requestResult(meta.get('next_store_seq')))?.value??1;
            if(!Number.isSafeInteger(next)||next<1||
               next-1!==expectedSourceHead.through_store_seq)
              throw new Error('stale K4 practice source watermark');
            const pref=(await requestResult(meta.get('k4_preferences:'+start.learner_id)))?.value;
            const revision=pref?.preferences?.revision??0;
            if(!Number.isSafeInteger(revision)||revision!==expectedPreferencesRevision)
              throw new Error('stale K4 practice preference revision');
            const started=await appendInTransaction(tx,startEvent,startHash);
            if(started.disposition!=='ACCEPTED')
              throw new Error('K4 activity start was not accepted');
            const shown=await appendInTransaction(tx,presentEvent,presentHash);
            if(shown.disposition!=='ACCEPTED')
              throw new Error('K4 presentation was not accepted');
            meta.put({key:'capture_origin',value:{
              origin_id:head.origin_id,origin_seq:head.origin_seq+2
            }});
            if(syncEnabled){
              tx.objectStore('outbox').add(pendingOutboxRecord(startEvent.event_id));
              tx.objectStore('outbox').add(pendingOutboxRecord(presentEvent.event_id));
            }
            return {
              started:{event:startEvent,receipt:started},
              presented:{event:presentEvent,receipt:shown}
            };
          });
          if(result)return result;
        }
      };
      const job=captureTail.then(operation,operation);
      captureTail=job.then(()=>undefined,()=>undefined);
      return job;
    },
    captureLocal({ eventInput, runtimeContext, outbox: requestedOutbox, expectedSourceHead }) {
      if (requestedOutbox != null && requestedOutbox !== outbox) throw new TypeError('capture requires the same store-bound outbox');
      if (expectedSourceHead !== undefined &&
          (!expectedSourceHead || expectedSourceHead.store_id !== storeId ||
           !Number.isSafeInteger(expectedSourceHead.through_store_seq) ||
           expectedSourceHead.through_store_seq < 0))
        throw new Error('stale K4 practice source watermark');
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
            if (expectedSourceHead !== undefined) {
              const next = (await requestResult(tx.objectStore('meta').get('next_store_seq')))?.value ?? 1;
              if (!Number.isSafeInteger(next) || next < 1 ||
                  next - 1 !== expectedSourceHead.through_store_seq)
                throw new Error('stale K4 practice source watermark');
            }
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
    captureLocalStrict({ eventInput, runtimeContext, outbox: requestedOutbox, assessmentAttemptId, baseAttemptRevision, proposedAttemptRevision }) {
      if (requestedOutbox != null && requestedOutbox !== outbox) throw new TypeError('capture requires the same store-bound outbox');
      if (typeof assessmentAttemptId !== 'string' || !assessmentAttemptId) throw new TypeError('assessmentAttemptId is required');
      if (!Number.isSafeInteger(baseAttemptRevision) || baseAttemptRevision < 0) throw new TypeError('baseAttemptRevision must be a non-negative integer');
      if (!Number.isSafeInteger(proposedAttemptRevision) || proposedAttemptRevision !== baseAttemptRevision + 1) throw new TypeError('proposedAttemptRevision must equal baseAttemptRevision + 1');
      const input = structuredClone(eventInput);
      if (input.assessment_attempt_id !== assessmentAttemptId) throw new Error('assessment attempt identity mismatch');
      if (input.base_attempt_revision !== baseAttemptRevision || input.proposed_attempt_revision !== proposedAttemptRevision) throw new Error('assessment revision envelope mismatch');
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
          const fingerprint = await fingerprintEvent(event);
          const captured = await transact(['events', 'receipts', 'meta', 'outbox'], 'readwrite', async tx => {
            const current = await localHead(tx, storage);
            if (current.origin_id !== head.origin_id || current.origin_seq !== head.origin_seq) return null;
            const meta = tx.objectStore('meta');
            const revisionKey = `attempt_revision:${assessmentAttemptId}`;
            const savedRevision = await requestResult(meta.get(revisionKey));
            const currentRevision = savedRevision?.value ?? 0;
            if (!Number.isSafeInteger(currentRevision) || currentRevision < 0) throw new Error('invalid assessment attempt revision');
            if (currentRevision !== baseAttemptRevision) throw new Error(`stale assessment attempt revision: expected ${currentRevision}, received ${baseAttemptRevision}`);
            const receipt = await appendInTransaction(tx, event, fingerprint);
            if (receipt.disposition !== 'ACCEPTED') throw new Error(`Local evidence not durably recorded: ${receipt.disposition}`);
            meta.put({ key: 'capture_origin', value: { origin_id: event.origin_id, origin_seq: event.origin_seq } });
            meta.put({ key: revisionKey, value: proposedAttemptRevision });
            if (syncEnabled) tx.objectStore('outbox').add(pendingOutboxRecord(event.event_id));
            return { event, receipt };
          });
          if (captured) return captured;
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
