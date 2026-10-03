import { newUuid } from './ids.js';
import { payloadValidators, validateLearnerEvidenceEventSchema } from './generatedValidators.js';

const DIRECT_PII = [/@/, /^\+?\d[\d\s().-]{6,}$/, /^(?:\d{1,3}\.){3}\d{1,3}$/];

function definitionsOf(runtimeContext) {
  const definitions = runtimeContext?.eventDefinitions;
  if (!Array.isArray(definitions)) throw new Error('runtimeContext.eventDefinitions is required');
  return definitions;
}

function definitionId(definition) {
  return `${definition.event_name}@${definition.event_version}`;
}

function definitionFor(event, runtimeContext) {
  const definition = definitionsOf(runtimeContext).find((item) => definitionId(item) === event.definition_id);
  if (!definition) throw new Error(`Unknown definition_id: ${event.definition_id}`);
  return definition;
}

function errorsOf(validate) {
  return (validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`.trim());
}

export function validateLearnerEvidenceEvent(event, runtimeContext) {
  const errors = [];
  if (!validateLearnerEvidenceEventSchema(event)) errors.push(...errorsOf(validateLearnerEvidenceEventSchema));

  let definition;
  try { definition = definitionFor(event, runtimeContext); }
  catch (error) { errors.push(error.message); }

  const track = runtimeContext?.track;
  if (!track || track.id !== event.track_id) errors.push('track_id does not match runtime track');
  if (!track?.locales?.includes(event.locale)) errors.push(`locale ${event.locale} is not declared by the active track`);
  if (runtimeContext?.evidence?.content_release_id !== event.content_release_id) errors.push('content_release_id does not match runtime evidence context');
  if (typeof event.learner_id === 'string' && DIRECT_PII.some((pattern) => pattern.test(event.learner_id))) {
    errors.push('learner_id must be an opaque pseudonymous principal and must not contain direct PII');
  }

  if (definition) {
    for (const field of definition.required_context_fields ?? []) {
      if (event[field] === undefined || event[field] === null || event[field] === '') {
        errors.push(`required context field ${field} is missing`);
      }
    }
    const validatePayload = payloadValidators[definition.payload_schema_ref];
    if (!validatePayload) errors.push(`No generated payload validator for ${definition.payload_schema_ref}`);
    else if (!validatePayload(event.payload)) {
      errors.push(...errorsOf(validatePayload).map((message) => `payload ${message}`));
    }
  }
  return { ok: errors.length === 0, errors };
}

export function createLearnerEvidenceEvent(input, runtimeContext) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('event input must be an object');
  const occurred = new Date(input.occurred_at);
  if (!Number.isFinite(occurred.getTime())) throw new Error('occurred_at must be a valid date-time');
  const event = { schema_version: 2, event_id: newUuid(), ...input, occurred_at: occurred.toISOString() };
  const result = validateLearnerEvidenceEvent(event, runtimeContext);
  if (!result.ok) throw new Error(`Invalid LearnerEvidenceEventV2: ${result.errors.join('; ')}`);
  return event;
}
