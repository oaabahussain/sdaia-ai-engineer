import { assertResponsePrivacy } from './responsePrivacy.js';
import { fingerprintEvent } from './jcs.js';
import { payloadValidators, validateLearnerEvidenceEventSchema, evidenceDefinitionContracts } from './generatedValidators.js';

const definitions = new Map(evidenceDefinitionContracts.map(value => [
  `${value.event_name}@${value.event_version}`, structuredClone(value)
]));
const directPii = [/@/, /^\+?\d[\d\s().-]{6,}$/, /^(?:\d{1,3}\.){3}\d{1,3}$/];

// Shared storage boundary: no persistence adapter may trust a caller's claim
// that it already validated the envelope. Deployment authentication remains
// a separate port, not a property supplied by the evidence payload itself.
export function assertEvidenceAcceptance(event) {
  if (!validateLearnerEvidenceEventSchema(event)) throw new TypeError('Invalid LearnerEvidenceEventV2 envelope');
  if (!Number.isSafeInteger(event.origin_seq)) throw new TypeError('Invalid evidence origin sequence');
  if (directPii.some(pattern => pattern.test(event.learner_id))) throw new TypeError('Evidence learner must be pseudonymous, not direct PII');
  const definition = definitions.get(event.definition_id);
  if (!definition) throw new TypeError('Unknown evidence definition');
  for (const key of definition.required_context_fields ?? []) {
    if (event[key] === undefined || event[key] === null || event[key] === '') throw new TypeError(`Missing evidence context: ${key}`);
  }
  const validatePayload = payloadValidators[definition.payload_schema_ref];
  if (!validatePayload || !validatePayload(event.payload)) throw new TypeError('Invalid evidence payload');
  assertResponsePrivacy(event);
  return event;
}

export function assertOrdinaryEvidenceProducer(definitionId) {
  if (definitions.get(definitionId)?.actor_kind !== 'LEARNER') {
    throw new TypeError('Ordinary local capture cannot originate this producer authority');
  }
}

function assertBatchEncoding(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value))) throw new TypeError('batch numeric value is not interoperable');
  } else if (value === null || ['string', 'boolean'].includes(typeof value)) {
    return;
  } else if (Array.isArray(value)) {
    value.forEach(assertBatchEncoding);
  } else if (value && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    Object.values(value).forEach(assertBatchEncoding);
  } else throw new TypeError('batch must contain JSON values');
}

export async function prepareEvidenceBatch(events) {
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  const values = structuredClone(events);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const event of values) {
    if (typeof event?.event_id !== 'string' || !uuid.test(event.event_id)) throw new TypeError('batch event identity cannot form a receipt');
    assertBatchEncoding(event);
  }
  // Prepare every identity/fingerprint before any sibling is persisted. A
  // malformed identity cannot be replaced with a fabricated UUID receipt.
  return Promise.all(values.map(async event => {
    const fingerprint = await fingerprintEvent(event);
    let invalid = false;
    try { assertEvidenceAcceptance(event); } catch (error) { if (!(error instanceof TypeError)) throw error; invalid = true; }
    return { event, fingerprint, invalid };
  }));
}

export function rejectedEvidenceReceipt(storeId, prepared) {
  return { schema_version: 1, store_id: storeId, event_id: prepared.event.event_id,
    event_fingerprint: prepared.fingerprint, disposition: 'REJECTED',
    accepted_at: new Date().toISOString(), reason_code: 'INVALID_EVIDENCE', warnings: [] };
}
