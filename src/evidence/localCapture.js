import { createLearnerEvidenceEvent } from './contract.js';
import { getOrCreateEvidenceOriginId, withNextEvidenceOriginSeq } from './origin.js';

function definitionId(definition) {
  if (!definition?.event_name || !Number.isInteger(definition.event_version)) {
    throw new TypeError('definition must provide event_name and event_version');
  }
  return `${definition.event_name}@${definition.event_version}`;
}

export async function captureLocalEvidence({ store, outbox, eventInput, definition, runtimeContext }) {
  if (!store || typeof store.accept !== 'function') throw new TypeError('store.accept is required');
  const storage = runtimeContext?.originStorage;
  const originId = getOrCreateEvidenceOriginId(storage);

  return withNextEvidenceOriginSeq(storage, async (originSeq) => {
    const event = createLearnerEvidenceEvent({
      ...eventInput,
      definition_id: eventInput.definition_id ?? definitionId(definition),
      origin_id: originId,
      origin_seq: originSeq
    }, runtimeContext);

    const receipt = await store.accept(event);
    if (!receipt || !['ACCEPTED', 'DUPLICATE'].includes(receipt.disposition)) {
      throw new Error(`Local evidence was not durably recorded: ${receipt?.disposition ?? 'NO_RECEIPT'}`);
    }

    if (outbox?.enqueue) await outbox.enqueue(event.event_id);
    return { event, receipt };
  });
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
