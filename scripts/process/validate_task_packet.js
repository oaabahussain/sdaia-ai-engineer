import Ajv from 'ajv';
import { readFileSync } from 'node:fs';

const SCHEMA_URL = new URL('../../docs/superpowers/process/task-definition-packet-v1.schema.json', import.meta.url);
const schema = JSON.parse(readFileSync(SCHEMA_URL, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

function formatError(error) {
  const path = error.instancePath || '/';
  if (error.keyword === 'required') return `${path} missing required property ${error.params.missingProperty}`;
  if (error.keyword === 'additionalProperties') return `${path} additionalProperties ${error.params.additionalProperty}`;
  return `${path} ${error.message}`;
}

function scanPlaceholders(value, path = '/') {
  const errors = [];
  if (typeof value === 'string') {
    if (/\b(?:TODO|TBD|FIXME)\b|<(?:insert|decide|replace|fill|todo|tbd|fixme)[^>]*>/i.test(value)) errors.push(`${path} unresolved placeholder`);
    return errors;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => errors.push(...scanPlaceholders(item, `${path}/${index}`)));
    return errors;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      const child = path === '/' ? `/${key}` : `${path}/${key}`;
      errors.push(...scanPlaceholders(item, child));
    }
  }
  return errors;
}

export function validateTaskDefinitionPacket(packet) {
  const errors = [];
  if (!validateSchema(packet)) errors.push(...(validateSchema.errors ?? []).map(formatError));
  errors.push(...scanPlaceholders(packet));
  return {
    ok: errors.length === 0,
    code: errors.length === 0 ? 'TASK_PACKET_VALID' : 'TASK_PACKET_SCHEMA_INVALID',
    errors
  };
}
