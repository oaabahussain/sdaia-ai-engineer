import fs from 'node:fs';
import Ajv from 'ajv';
import { evaluateEventPrivacy } from './privacyPolicy.js';

const definitionSchema = JSON.parse(
  fs.readFileSync(
    new URL('../../../data/schema/event-definition-v1.schema.json', import.meta.url),
    'utf8'
  )
);

const validateDefinitionSchema = new Ajv({
  strict: false,
  allErrors: true,
  formats: { 'date-time': true }
}).compile(definitionSchema);

const definitions = new Map();
const validatedEvents = new WeakSet();

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function definitionId(definition) {
  return `${definition.event_name}@${definition.event_version}`;
}

function typeMatches(value, type) {
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === type;
}

export function registerEventDefinition(definition) {
  if (!validateDefinitionSchema(definition)) {
    throw new Error(
      'Invalid EventDefinitionV1: ' +
      JSON.stringify(validateDefinitionSchema.errors)
    );
  }

  const id = definitionId(definition);
  const existing = definitions.get(id);
  if (existing && JSON.stringify(existing) !== JSON.stringify(definition)) {
    throw new Error('Event definition version is immutable once registered');
  }

  if (!existing) definitions.set(id, deepFreeze(structuredClone(definition)));
  return id;
}

export function getEventDefinition(id) {
  return definitions.get(id) ?? null;
}

export function validateEvent(id, event = {}) {
  if (typeof id !== 'string' || !/@[1-9][0-9]*$/.test(id)) {
    throw new Error('Versioned event definition id is required');
  }

  const definition = definitions.get(id);
  if (!definition) throw new Error('Unknown event definition');

  if (
    typeof event.occurred_at !== 'string' ||
    Number.isNaN(Date.parse(event.occurred_at))
  ) {
    throw new Error('Event occurred_at must be a valid date-time');
  }

  const properties = event.properties;
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    throw new Error('Event properties object is required');
  }

  for (const key of Object.keys(properties)) {
    if (!Object.hasOwn(definition.properties, key)) {
      throw new Error(`Unknown event property: ${key}`);
    }
  }

  for (const [key, contract] of Object.entries(definition.properties)) {
    const present = Object.hasOwn(properties, key);
    if (contract.required && !present) {
      throw new Error(`Required event property missing: ${key}`);
    }
    if (present && !typeMatches(properties[key], contract.type)) {
      throw new Error(`Invalid type for event property: ${key}`);
    }
  }

  const privacy = evaluateEventPrivacy(definition, properties);
  if (privacy.decision === 'REJECT') {
    throw new Error(
      'Event rejected by privacy policy: ' + privacy.reasons.join(',')
    );
  }

  const envelope = deepFreeze({
    definition_id: id,
    event_name: definition.event_name,
    event_version: definition.event_version,
    occurred_at: event.occurred_at,
    producer: definition.producer,
    properties: structuredClone(privacy.payload)
  });
  validatedEvents.add(envelope);
  return envelope;
}

export function isValidatedEvent(event) {
  return !!event && validatedEvents.has(event);
}
