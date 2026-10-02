import fs from 'node:fs/promises';
import path from 'node:path';
import { fingerprintEvent } from '../../../src/evidence/jcs.js';

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
  const temp = file + '.tmp';
  await fs.writeFile(temp, JSON.stringify(index, null, 2) + '\n');
  await fs.rename(temp, file);
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
    if (event[key] !== value) return false;
  }
  return true;
}

export function createJsonlEvidenceStore(eventFile, indexFile, { storeId }) {
  if (typeof storeId !== 'string' || storeId.length === 0) throw new TypeError('storeId is required');

  async function load() {
    const events = await readJsonl(eventFile);
    const index = await readIndex(indexFile, storeId);
    if (events.length !== index.entries.length && index.entries.length !== 0) {
      throw new Error('K3 evidence event/index length mismatch');
    }
    return { events, index };
  }

  return {
    async accept(event) {
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
      await fs.appendFile(eventFile, JSON.stringify(event) + '\n');
      index.entries.push(entry);
      index.next_store_seq += 1;
      await writeIndex(indexFile, index);
      return receiptFromEntry(entry);
    },

    async acceptBatch(events) {
      const receipts = [];
      for (const event of events) receipts.push(await this.accept(event));
      return { schema_version: 1, receipts };
    },

    async getById(eventId) {
      const { events, index } = await load();
      const entryIndex = index.entries.findIndex((entry) => entry.event_id === eventId);
      return entryIndex < 0 ? null : events[entryIndex];
    },

    async read(learnerId, afterStoreSeq = undefined, filters = {}) {
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
    }
  };
}
