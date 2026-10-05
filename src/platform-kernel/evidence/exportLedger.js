import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { canonicalizeJson as canonicalize } from '../../evidence/jcs.js';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(readFileSync(new URL('../../../data/schema/evidence-export-record-v1.schema.json', import.meta.url), 'utf8')));
const identity = ['event_id', 'adapter_id', 'adapter_version', 'destination_class', 'mapping_version', 'external_ref'];
const outcomes = ['DELETED', 'DELETION_UNSUPPORTED', 'DELETION_FAILED'];

function checkDestination(policy) {
  if (!['SUPPORTED', 'UNSUPPORTED'].includes(policy?.deletion_support)) throw new TypeError('destination deletion support is unknown');
  if (policy.deletion_support === 'UNSUPPORTED' && (typeof policy.limitation_ref !== 'string' || !policy.limitation_ref.trim())) {
    throw new TypeError('unsupported destination deletion requires a documented limitation');
  }
}

// Internal port: load/append must be durable and exclusive to this coordinator.
// Lifecycle records append; only a separately authorized privacy adapter erases.
export function createExportLedger({ load, append: persist, destinationPolicy }) {
  if (typeof load !== 'function' || typeof persist !== 'function') throw new TypeError('export persistence callbacks are required');
  const policy = structuredClone(destinationPolicy);
  let tail = Promise.resolve();
  const serial = operation => {
    const job = tail.then(operation);
    tail = job.catch(() => {});
    return job;
  };
  async function records() {
    const rows = structuredClone(await load());
    if (!Array.isArray(rows) || rows.some(row => !validate(row))) throw new TypeError('invalid persisted export schema');
    const seen = new Map(), children = new Set();
    for (const row of rows) {
      if (seen.has(row.export_record_id)) throw new Error('duplicate persisted export identity');
      if (row.action === 'EXPORTED') {
        if (row.predecessor_record_id) throw new Error('export root cannot have a predecessor');
      } else {
        const parent = seen.get(row.predecessor_record_id);
        if (!parent || identity.some(key => parent[key] !== row[key])) throw new Error('export predecessor identity mismatch');
        const valid = row.action === 'DELETE_REQUESTED'
          ? ['EXPORTED', 'DELETION_FAILED', 'DELETION_UNSUPPORTED'].includes(parent.action)
          : outcomes.includes(row.action) && parent.action === 'DELETE_REQUESTED';
        if (!valid) throw new Error('invalid export predecessor transition');
        if (children.has(parent.export_record_id)) throw new Error('export predecessor conflict');
        children.add(parent.export_record_id);
      }
      seen.set(row.export_record_id, row);
    }
    return rows;
  }
  async function appendRecord(record) {
    if (!validate(record)) throw new TypeError('invalid export schema');
    const rows = await records();
    const previous = rows.find(row => row.export_record_id === record.export_record_id);
    if (previous) {
      if (canonicalize(previous) !== canonicalize(record)) throw new Error('export record conflict');
      return { disposition: 'DUPLICATE', export_record_id: record.export_record_id };
    }
    if (record.action === 'EXPORTED') {
      checkDestination(policy);
      if (record.predecessor_record_id) throw new Error('export root cannot have a predecessor');
    } else {
      const predecessor = rows.find(row => row.export_record_id === record.predecessor_record_id);
      if (!predecessor || identity.some(key => predecessor[key] !== record[key])) throw new Error('export predecessor identity mismatch');
      if (record.action === 'DELETE_REQUESTED' ? !['EXPORTED', 'DELETION_FAILED', 'DELETION_UNSUPPORTED'].includes(predecessor.action)
        : !outcomes.includes(record.action) || predecessor.action !== 'DELETE_REQUESTED') throw new Error('invalid export predecessor transition');
      if (rows.some(row => row.predecessor_record_id === predecessor.export_record_id)) throw new Error('export predecessor conflict');
    }
    await persist(structuredClone(record));
    return { disposition: 'ACCEPTED', export_record_id: record.export_record_id };
  }
  return {
    append(record) {
      const value = structuredClone(record);
      return serial(() => appendRecord(value));
    },
    read() { return serial(records); },
    propagateDeletion(exportId, { occurred_at, deleteRemote } = {}) {
      return serial(async () => {
        checkDestination(policy);
        const rows = await records();
        let original = rows.find(row => row.export_record_id === exportId);
        if (!original) throw new Error('export predecessor not found');
        const visited = new Set();
        while (true) {
          if (visited.has(original.export_record_id)) throw new Error('export predecessor cycle');
          visited.add(original.export_record_id);
          const children = rows.filter(row => row.predecessor_record_id === original.export_record_id);
          if (children.length > 1) throw new Error('export predecessor conflict');
          if (!children.length) break;
          if (identity.some(key => children[0][key] !== original[key])) throw new Error('export predecessor identity mismatch');
          original = children[0];
        }
        if (original.action === 'DELETED') return structuredClone(original);
        // Resume a persisted request after interruption. Destination deletion
        // callbacks must be idempotent: a lost outcome can require a safe retry.
        const requested = original.action === 'DELETE_REQUESTED' ? original
          : { ...original, export_record_id: randomUUID(), action: 'DELETE_REQUESTED', occurred_at, predecessor_record_id: original.export_record_id };
        const result = { ...requested, export_record_id: randomUUID(), predecessor_record_id: requested.export_record_id, occurred_at, action: 'DELETION_FAILED' };
        if (!validate(result)) throw new TypeError('invalid export outcome schema');
        if (original.action !== 'DELETE_REQUESTED') await appendRecord(requested);
        let action = 'DELETION_UNSUPPORTED';
        if (policy.deletion_support === 'SUPPORTED') {
          action = 'DELETION_FAILED';
          try { if (typeof deleteRemote === 'function' && await deleteRemote(structuredClone(original)) === true) action = 'DELETED'; }
          catch { /* Persist failure, never substitute a success claim. */ }
        }
        result.action = action;
        await appendRecord(result);
        return structuredClone(result);
      });
    }
  };
}
