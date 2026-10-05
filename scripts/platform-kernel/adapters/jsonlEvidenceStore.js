import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const storeQueues = new Map();

import { fingerprintEvent } from '../../../src/evidence/jcs.js';
import { assertEvidenceAcceptance, prepareEvidenceBatch, rejectedEvidenceReceipt } from '../../../src/evidence/acceptance.js';

async function readJsonl(file) {
  let text;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const rows = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      throw new Error(`Malformed K3 evidence event at line ${index + 1}`);
    }
  }
  return rows;
}

async function readIndex(file, storeId) {
  try {
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!parsed || parsed.schema_version !== 1 || parsed.store_id !== storeId || !Array.isArray(parsed.entries)) {
      throw new Error('Malformed K3 evidence index');
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { schema_version: 1, store_id: storeId, next_store_seq: 1, entries: [] };
    }
    if (error instanceof SyntaxError) throw new Error('Malformed K3 evidence index');
    throw error;
  }
}

async function writeIndex(file, index) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${randomUUID()}`;
  const handle = await fs.open(temp, 'wx');
  try {
    await handle.writeFile(JSON.stringify(index, null, 2) + '\n');
    await handle.sync();
    await handle.close();
    await fs.rename(temp, file);
  } finally {
    await handle.close();
    await fs.rm(temp, { force: true });
  }
}

async function canonicalPath(file) {
  const absolute = path.resolve(file);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  try { return await fs.realpath(absolute); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return path.join(await fs.realpath(path.dirname(absolute)), path.basename(absolute));
  }
}

async function exclusiveStore(eventFile, indexFile, operation) {
  const key = await canonicalPath(eventFile);
  const indexKey = await canonicalPath(indexFile);
  if (key === indexKey) throw new Error('Evidence and index paths must differ');
  const previous = storeQueues.get(key) ?? Promise.resolve();
  const run = previous.catch(() => {}).then(async () => {
    const owned = [];
    try {
      for (const file of [key, indexKey].sort()) {
        const lockPath = file + '.lock';
        let handle;
        try { handle = await fs.open(lockPath, 'wx'); }
        catch (error) {
          if (error.code === 'EEXIST') throw new Error('K3 reference store busy: an existing writer lock requires its owner or explicit recovery');
          throw error;
        }
        owned.push({ handle, lockPath });
      }
      return await operation();
    } finally {
      for (const { handle, lockPath } of owned.reverse()) {
        await handle.close();
        await fs.unlink(lockPath);
      }
    }
  });
  const settled = run.then(() => undefined, () => undefined);
  storeQueues.set(key, settled);
  void settled.then(() => { if (storeQueues.get(key) === settled) storeQueues.delete(key); });
  return run;
}

function nowIso() {
  return new Date().toISOString();
}

function conflictReceipt(storeId, event, fingerprint, reasonCode) {
  return {
    schema_version: 1,
    store_id: storeId,
    event_id: event.event_id,
    event_fingerprint: fingerprint,
    disposition: 'CONFLICT',
    accepted_at: nowIso(),
    reason_code: reasonCode,
    warnings: []
  };
}

function receiptFromEntry(entry, disposition = 'ACCEPTED') {
  return {
    schema_version: 1,
    store_id: entry.store_id,
    event_id: entry.event_id,
    event_fingerprint: entry.event_fingerprint,
    disposition,
    accepted_at: entry.accepted_at,
    store_seq: entry.store_seq,
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

export function createJsonlEvidenceStore(eventFile, indexFile, { storeId }) {
  if (typeof storeId !== 'string' || storeId.length === 0) throw new TypeError('storeId is required');

  async function load() {
    const events = await readJsonl(eventFile);
    const index = await readIndex(indexFile, storeId);
    if (events.length !== index.entries.length) {
      throw new Error('K3 evidence event/index length mismatch');
    }
    let previousSeq = 0;
    const ids = new Set();
    const origins = new Set();
    for (let position = 0; position < events.length; position += 1) {
      const event = events[position];
      const entry = index.entries[position];
      const fail = reason => { throw new Error(`K3 evidence index integrity at ${position}: ${reason}`); };
      if (!event || !entry || entry.store_id !== storeId) fail('store identity');
      for (const field of ['event_id', 'learner_id', 'origin_id', 'origin_seq']) {
        if (entry[field] !== event[field]) fail(`${field} linkage`);
      }
      if (!Number.isSafeInteger(entry.store_seq) || entry.store_seq <= previousSeq) fail('store sequence');
      if (typeof entry.accepted_at !== 'string' || !Number.isFinite(Date.parse(entry.accepted_at))) fail('acceptance time');
      const originKey = JSON.stringify([event.origin_id, event.origin_seq]);
      if (ids.has(event.event_id) || origins.has(originKey)) fail('duplicate identity');
      if (entry.event_fingerprint !== await fingerprintEvent(event)) fail('immutable fingerprint');
      ids.add(event.event_id);
      origins.add(originKey);
      previousSeq = entry.store_seq;
    }
    if (!Number.isSafeInteger(index.next_store_seq) || index.next_store_seq <= previousSeq) {
      throw new Error('K3 evidence index integrity: next store sequence');
    }
    return { events, index };
  }

  return {
    store_id: storeId,
    async readRange({fromSeq=1,toSeq,learnerId,filters={}}={}) {
      if (!Number.isSafeInteger(fromSeq) || fromSeq < 1 || !Number.isSafeInteger(toSeq) || toSeq < fromSeq) throw new RangeError('Invalid replay watermark range');
      return exclusiveStore(eventFile,indexFile,async()=>{
        const {events,index}=await load();
        return index.entries.flatMap((entry,i)=> entry.store_seq >= fromSeq && entry.store_seq <= toSeq && (learnerId === undefined || entry.learner_id === learnerId) && matchesFilters(events[i],filters)
          ? [{...events[i],store_id:storeId,store_seq:entry.store_seq,accepted_at:entry.accepted_at,event_fingerprint:entry.event_fingerprint}] : []);
      });
    },
    async accept(event) {
      event = structuredClone(event);
      assertEvidenceAcceptance(event);
      return exclusiveStore(eventFile, indexFile, async () => {
      const fingerprint = await fingerprintEvent(event);
      const { events, index } = await load();

      const sameId = index.entries.find((entry) => entry.event_id === event.event_id);
      if (sameId) {
        if (sameId.event_fingerprint === fingerprint) return receiptFromEntry(sameId, 'DUPLICATE');
        return conflictReceipt(storeId, event, fingerprint, 'EVENT_ID_CONFLICT');
      }

      const sameOriginSeq = index.entries.find(
        (entry) => entry.origin_id === event.origin_id && entry.origin_seq === event.origin_seq
      );
      if (sameOriginSeq) return conflictReceipt(storeId, event, fingerprint, 'ORIGIN_SEQ_CONFLICT');

      const entry = {
        store_id: storeId,
        event_id: event.event_id,
        event_fingerprint: fingerprint,
        origin_id: event.origin_id,
        origin_seq: event.origin_seq,
        learner_id: event.learner_id,
        store_seq: index.next_store_seq,
        accepted_at: nowIso()
      };

      await fs.mkdir(path.dirname(eventFile), { recursive: true });
      const eventHandle = await fs.open(eventFile, 'a');
      try { await eventHandle.writeFile(JSON.stringify(event) + '\n'); await eventHandle.sync(); }
      finally { await eventHandle.close(); }
      index.entries.push(entry);
      index.next_store_seq += 1;
      await writeIndex(indexFile, index);
      return receiptFromEntry(entry);
      });
    },

    async acceptBatch(events) {
      const prepared = await prepareEvidenceBatch(events), receipts = [];
      for (const value of prepared) receipts.push(value.invalid ? rejectedEvidenceReceipt(storeId, value) : await this.accept(value.event));
      return { schema_version: 1, receipts };
    },

    async getById(eventId) {
      return exclusiveStore(eventFile, indexFile, async () => {
      const { events, index } = await load();
      const entryIndex = index.entries.findIndex((entry) => entry.event_id === eventId);
      return entryIndex < 0 ? null : events[entryIndex];
      });
    },

    async read(learnerId, afterStoreSeq = undefined, filters = {}) {
      return exclusiveStore(eventFile, indexFile, async () => {
      const { events, index } = await load();
      const result = [];
      for (let i = 0; i < index.entries.length; i += 1) {
        const entry = index.entries[i];
        const event = events[i];
        if (entry.learner_id !== learnerId) continue;
        if (afterStoreSeq !== undefined && entry.store_seq <= afterStoreSeq) continue;
        if (!matchesFilters(event, filters)) continue;
        result.push({ store_seq: entry.store_seq, event });
      }
      result.sort((a, b) => a.store_seq - b.store_seq);
      return result.map((row) => row.event);
      });
    }
  };
}
