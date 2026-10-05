const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const DISPOSITIONS = new Set(['ACCEPTED', 'DUPLICATE', 'CONFLICT', 'REJECTED']);
const RECEIPT_KEYS = new Set([
  'schema_version',
  'store_id',
  'event_id',
  'event_fingerprint',
  'disposition',
  'accepted_at',
  'store_seq',
  'reason_code',
  'warnings'
]);
const BATCH_KEYS = new Set(['schema_version', 'receipts']);

export const EVIDENCE_STORE_METHODS = Object.freeze(['accept', 'acceptBatch', 'getById', 'read']);

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function assertNoAdditionalFields(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new TypeError(`${label} has additional field ${key}`);
  }
}

function assertNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

export function assertEvidenceStore(store) {
  assertObject(store, 'EvidenceStore');
  for (const method of EVIDENCE_STORE_METHODS) {
    if (typeof store[method] !== 'function') {
      throw new TypeError(`EvidenceStore.${method} must be a function`);
    }
  }
  return store;
}

export function assertEvidenceStorageReceipt(receipt) {
  assertObject(receipt, 'EvidenceStorageReceiptV1');
  assertNoAdditionalFields(receipt, RECEIPT_KEYS, 'EvidenceStorageReceiptV1');

  if (receipt.schema_version !== 1) throw new TypeError('schema_version must equal 1');
  assertNonEmptyString(receipt.store_id, 'store_id');

  if (typeof receipt.event_id !== 'string' || !UUID_V4.test(receipt.event_id)) {
    throw new TypeError('event_id must be a UUIDv4 string');
  }
  if (typeof receipt.event_fingerprint !== 'string' || !SHA256_HEX.test(receipt.event_fingerprint)) {
    throw new TypeError('event_fingerprint must be lowercase SHA-256 hex');
  }
  if (!DISPOSITIONS.has(receipt.disposition)) {
    throw new TypeError('disposition must be ACCEPTED, DUPLICATE, CONFLICT, or REJECTED');
  }
  if (typeof receipt.accepted_at !== 'string' || !Number.isFinite(Date.parse(receipt.accepted_at))) {
    throw new TypeError('accepted_at must be a valid date-time string');
  }
  if (!Array.isArray(receipt.warnings) || receipt.warnings.some((warning) => typeof warning !== 'string' || warning.length === 0)) {
    throw new TypeError('warnings must be an array of non-empty strings');
  }

  if (['ACCEPTED', 'DUPLICATE'].includes(receipt.disposition) && receipt.store_seq === undefined) {
    throw new TypeError('stored receipt must include store_seq');
  }
  if (receipt.store_seq !== undefined && (!Number.isSafeInteger(receipt.store_seq) || receipt.store_seq < 1)) {
    throw new TypeError('store_seq must be a positive integer');
  }
  if (receipt.reason_code !== undefined) assertNonEmptyString(receipt.reason_code, 'reason_code');

  return receipt;
}

export function assertEvidenceBatchResult(result) {
  assertObject(result, 'EvidenceBatchResultV1');
  assertNoAdditionalFields(result, BATCH_KEYS, 'EvidenceBatchResultV1');
  if (result.schema_version !== 1) throw new TypeError('schema_version must equal 1');
  if (!Array.isArray(result.receipts)) throw new TypeError('receipts must be an array');
  for (const receipt of result.receipts) assertEvidenceStorageReceipt(receipt);
  return result;
}
