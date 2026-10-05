import { assertEvidenceStorageReceipt } from './storePort.js';

const states = new Set(['PENDING', 'IN_FLIGHT', 'ACKNOWLEDGED', 'BLOCKED']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function assertId(id) {
  if (typeof id !== 'string' || !uuid.test(id)) throw new TypeError('outbox event ID must be UUIDv4');
}
function check(record) {
  if (!record || record.schema_version !== 1 || !states.has(record.state) || !Number.isSafeInteger(record.attempt_count) || record.attempt_count < 0) {
    throw new TypeError('invalid persisted outbox record');
  }
  assertId(record.event_id);
  return record;
}
export function pendingOutboxRecord(eventId) {
  assertId(eventId);
  return { schema_version: 1, event_id: eventId, state: 'PENDING', attempt_count: 0 };
}

// Every mutation below runs in the evidence database's own transaction. There
// is no separately committed load/save snapshot and no network I/O in a tx.
export function createIndexedDbOutbox({ transact, requestResult }) {
  const write = fn => transact(['events', 'receipts', 'outbox'], 'readwrite', fn);
  async function lookup(tx, id) {
    const record = await requestResult(tx.objectStore('outbox').get(id));
    if (!record) throw new Error(`Outbox record not found: ${id}`);
    return check(record);
  }
  return Object.freeze({
    enqueue(eventId) {
      assertId(eventId);
      return write(async tx => {
        if (!await requestResult(tx.objectStore('events').get(eventId))) throw new Error(`Evidence not found: ${eventId}`);
        const outbox = tx.objectStore('outbox');
        const prior = await requestResult(outbox.get(eventId));
        if (prior) {
          check(prior);
          if (prior.state === 'BLOCKED') {
            prior.state = 'PENDING'; delete prior.next_attempt_at; outbox.put(prior);
          }
          return prior;
        }
        const record = pendingOutboxRecord(eventId); outbox.add(record); return record;
      });
    },
    markInFlight(eventIds, at) {
      if (!Array.isArray(eventIds)) throw new TypeError('eventIds must be an array');
      const ids = [...eventIds]; ids.forEach(assertId);
      if (typeof at !== 'string' || !Number.isFinite(Date.parse(at))) throw new TypeError('at must be a date-time string');
      return write(async tx => {
        const changed = [];
        for (const id of ids) {
          const record = await lookup(tx, id);
          if (!['PENDING', 'IN_FLIGHT'].includes(record.state)) throw new Error(`Outbox record is not retryable: ${id}`);
          if (record.attempt_count >= Number.MAX_SAFE_INTEGER) throw new Error('outbox attempt count overflow');
          record.state = 'IN_FLIGHT'; record.attempt_count++; record.last_attempt_at = at;
          delete record.next_attempt_at; tx.objectStore('outbox').put(record); changed.push(record);
        }
        return changed;
      });
    },
    markPending(eventIds) {
      const ids = [...eventIds]; ids.forEach(assertId);
      return write(async tx => {
        for (const id of ids) {
          const record = await lookup(tx, id);
          if (record.state === 'IN_FLIGHT') { record.state = 'PENDING'; tx.objectStore('outbox').put(record); }
        }
      });
    },
    async applyReceipt(receipt) {
      const value = structuredClone(receipt); assertEvidenceStorageReceipt(value);
      return write(async tx => {
        const record = await lookup(tx, value.event_id);
        const local = await requestResult(tx.objectStore('receipts').get(value.event_id));
        if (!local || local.event_fingerprint !== value.event_fingerprint) throw new Error('outbox receipt fingerprint mismatch');
        if (record.state === 'ACKNOWLEDGED') {
          if (!['ACCEPTED','DUPLICATE'].includes(value.disposition)
              || record.authoritative_store_id !== value.store_id
              || record.authoritative_store_seq !== value.store_seq) {
            throw new Error('Contradictory receipt cannot change acknowledged evidence');
          }
          return record;
        }
        record.last_disposition = value.disposition;
        if (value.reason_code) record.last_reason_code = value.reason_code;
        else delete record.last_reason_code;
        if (['ACCEPTED', 'DUPLICATE'].includes(value.disposition)) {
          record.state = 'ACKNOWLEDGED'; record.authoritative_store_id = value.store_id;
          if (value.store_seq !== undefined) record.authoritative_store_seq = value.store_seq;
          else delete record.authoritative_store_seq;
          delete record.next_attempt_at;
        } else {
          record.state = 'BLOCKED'; delete record.authoritative_store_id; delete record.authoritative_store_seq;
        }
        tx.objectStore('outbox').put(record); return record;
      });
    },
    listPending(options = {}) {
      const includeInFlight = options?.includeInFlight === true;
      const now = options?.now === undefined ? null : Date.parse(options.now);
      if (options?.now !== undefined && !Number.isFinite(now)) throw new TypeError('options.now must be a date-time string');
      return transact(['outbox'], 'readonly', async tx => {
        const rows = await requestResult(tx.objectStore('outbox').getAll());
        return rows.map(check).filter(r => r.state === 'PENDING' || (includeInFlight && r.state === 'IN_FLIGHT'))
          .filter(r => now === null || !r.next_attempt_at || Date.parse(r.next_attempt_at) <= now);
      });
    }
  });
}
