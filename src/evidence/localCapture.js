
import { assertOrdinaryEvidenceProducer } from './acceptance.js';

function definitionId(definition) {
  if (!definition?.event_name || !Number.isInteger(definition.event_version)) {
    throw new TypeError('definition must provide event_name and event_version');
  }
  return `${definition.event_name}@${definition.event_version}`;
}

export async function captureLocalEvidence({ store, outbox, eventInput, definition, runtimeContext }) {
  if (!store || typeof store.captureLocal !== 'function') throw new TypeError('an atomic store.captureLocal implementation is required');
  const input = structuredClone(eventInput);
  input.definition_id ??= definitionId(definition);
  assertOrdinaryEvidenceProducer(input.definition_id);
  const result = await store.captureLocal({ outbox, eventInput: input, runtimeContext });
  if (!result?.receipt || !['ACCEPTED', 'DUPLICATE'].includes(result.receipt.disposition)) {
    throw new Error(`Local evidence was not durably recorded: ${result?.receipt?.disposition ?? 'NO_RECEIPT'}`);
  }
  return result;
}

export async function requestEvidenceStoragePersistence(navigatorLike = globalThis.navigator) {
  const persist = navigatorLike?.storage?.persist;
  if (typeof persist !== 'function') return { supported: false, granted: false };
  try {
    return { supported: true, granted: Boolean(await persist.call(navigatorLike.storage)) };
  } catch {
    return { supported: true, granted: false };
  }
}
