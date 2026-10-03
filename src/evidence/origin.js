import { EVIDENCE_ORIGIN_KEY, EVIDENCE_ORIGIN_SEQ_KEY } from '../storage/identity.js';

const memoryOriginByStorage = new WeakMap();
const memorySeqByStorage = new WeakMap();
let fallbackOriginId;
let fallbackSeq = 0;
const locks = new WeakMap();
let fallbackLock = Promise.resolve();

function defaultStorage() {
  try { return globalThis.localStorage; }
  catch { return null; }
}

function randomUuid() {
  const value = globalThis.crypto?.randomUUID?.();
  if (!value) throw new Error('crypto.randomUUID is required for evidence origin identity');
  return value;
}

function memoryOrigin(storage) {
  if (storage && (typeof storage === 'object' || typeof storage === 'function')) {
    let value = memoryOriginByStorage.get(storage);
    if (!value) {
      value = randomUuid();
      memoryOriginByStorage.set(storage, value);
    }
    return value;
  }
  if (!fallbackOriginId) fallbackOriginId = randomUuid();
  return fallbackOriginId;
}

export function getOrCreateEvidenceOriginId(storage = defaultStorage()) {
  try {
    const existing = storage?.getItem?.(EVIDENCE_ORIGIN_KEY);
    if (existing) return existing;
    const created = randomUuid();
    storage?.setItem?.(EVIDENCE_ORIGIN_KEY, created);
    return created;
  } catch {
    return memoryOrigin(storage);
  }
}

function readSeq(storage) {
  try {
    const raw = storage?.getItem?.(EVIDENCE_ORIGIN_SEQ_KEY);
    if (raw == null) return 0;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('invalid evidence origin sequence');
    return value;
  } catch {
    if (storage && (typeof storage === 'object' || typeof storage === 'function')) {
      return memorySeqByStorage.get(storage) ?? 0;
    }
    return fallbackSeq;
  }
}

function writeSeq(storage, value) {
  let durable = false;
  try {
    if (storage?.setItem) {
      storage.setItem(EVIDENCE_ORIGIN_SEQ_KEY, String(value));
      durable = true;
    }
  } catch {}
  if (storage && (typeof storage === 'object' || typeof storage === 'function')) {
    memorySeqByStorage.set(storage, value);
  } else {
    fallbackSeq = value;
  }
  return durable;
}

function queueFor(storage) {
  if (storage && (typeof storage === 'object' || typeof storage === 'function')) {
    return locks.get(storage) ?? Promise.resolve();
  }
  return fallbackLock;
}

function setQueue(storage, promise) {
  if (storage && (typeof storage === 'object' || typeof storage === 'function')) {
    locks.set(storage, promise);
  } else {
    fallbackLock = promise;
  }
}

export function withNextEvidenceOriginSeq(storage = defaultStorage(), operation) {
  const previous = queueFor(storage);
  const run = previous.catch(() => {}).then(async () => {
    const current = readSeq(storage);
    const next = current + 1;
    const result = await operation(next);
    writeSeq(storage, next);
    return result;
  });
  setQueue(storage, run.then(() => undefined, () => undefined));
  return run;
}
