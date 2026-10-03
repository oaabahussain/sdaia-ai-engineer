const ACK = new Set(['ACCEPTED', 'DUPLICATE']);
const BLOCK = new Set(['CONFLICT', 'REJECTED']);

function clone(value) {
  return structuredClone(value);
}

function assertEventId(eventId) {
  if (typeof eventId !== 'string' || eventId.length === 0) throw new TypeError('eventId is required');
}

function assertPersistence(persistence) {
  if (!persistence || typeof persistence.load !== 'function' || typeof persistence.save !== 'function') {
    throw new TypeError('persistence.load/save are required');
  }
}

function normalizeRecords(records) {
  if (!Array.isArray(records)) throw new TypeError('outbox persistence must return an array');
  return records.map((record) => clone(record));
}

export function createEvidenceOutbox({ persistence }) {
  assertPersistence(persistence);
  let tail = Promise.resolve();

  function exclusive(operation) {
    const run = tail.then(operation, operation);
    tail = run.then(() => undefined, () => undefined);
    return run;
  }

  async function load() {
    return normalizeRecords(await persistence.load());
  }

  async function save(records) {
    await persistence.save(clone(records));
  }

  return {
    enqueue(eventId) {
      assertEventId(eventId);
      return exclusive(async () => {
        const records = await load();
        const existing = records.find((record) => record.event_id === eventId);
        if (existing) {
          if (existing.state === 'BLOCKED') {
            existing.state = 'PENDING';
            delete existing.next_attempt_at;
            await save(records);
          }
          return clone(existing);
        }
        const record = {
          schema_version: 1,
          event_id: eventId,
          state: 'PENDING',
          attempt_count: 0
        };
        records.push(record);
        await save(records);
        return clone(record);
      });
    },

    markInFlight(eventIds, at) {
      if (!Array.isArray(eventIds)) throw new TypeError('eventIds must be an array');
      if (typeof at !== 'string' || !Number.isFinite(Date.parse(at))) throw new TypeError('at must be a date-time string');
      return exclusive(async () => {
        const records = await load();
        const changed = [];
        for (const eventId of eventIds) {
          const record = records.find((item) => item.event_id === eventId);
          if (!record) throw new Error(`Outbox record not found: ${eventId}`);
          if (!['PENDING', 'IN_FLIGHT'].includes(record.state)) throw new Error(`Outbox record is not retryable: ${eventId}`);
          record.state = 'IN_FLIGHT';
          record.attempt_count += 1;
          record.last_attempt_at = at;
          delete record.next_attempt_at;
          changed.push(clone(record));
        }
        await save(records);
        return changed;
      });
    },

    applyReceipt(receipt) {
      if (!receipt || typeof receipt !== 'object') throw new TypeError('receipt is required');
      assertEventId(receipt.event_id);
      if (!ACK.has(receipt.disposition) && !BLOCK.has(receipt.disposition)) {
        throw new TypeError('unsupported receipt disposition');
      }
      return exclusive(async () => {
        const records = await load();
        const record = records.find((item) => item.event_id === receipt.event_id);
        if (!record) throw new Error(`Outbox record not found: ${receipt.event_id}`);

        record.last_disposition = receipt.disposition;
        if (receipt.reason_code) record.last_reason_code = receipt.reason_code;
        else delete record.last_reason_code;

        if (ACK.has(receipt.disposition)) {
          record.state = 'ACKNOWLEDGED';
          record.authoritative_store_id = receipt.store_id;
          if (receipt.store_seq !== undefined) record.authoritative_store_seq = receipt.store_seq;
          else delete record.authoritative_store_seq;
          delete record.next_attempt_at;
        } else {
          record.state = 'BLOCKED';
          delete record.authoritative_store_id;
          delete record.authoritative_store_seq;
        }

        await save(records);
        return clone(record);
      });
    },

    listPending(options = {}) {
      return exclusive(async () => {
        const records = await load();
        const now = options?.now === undefined ? null : Date.parse(options.now);
        if (options?.now !== undefined && !Number.isFinite(now)) throw new TypeError('options.now must be a date-time string');
        return records
          .filter((record) => record.state === 'PENDING' || (options?.includeInFlight === true && record.state === 'IN_FLIGHT'))
          .filter((record) => {
            if (now === null || !record.next_attempt_at) return true;
            return Date.parse(record.next_attempt_at) <= now;
          })
          .map((record) => clone(record));
      });
    }
  };
}
