export function evaluateEventPrivacy(definition, payload = {}) {
  if (!definition || typeof definition !== 'object' || !definition.properties) {
    throw new Error('Event definition with property governance is required');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Event payload object is required');
  }

  const keys = Object.keys(payload).sort();
  for (const key of keys) {
    if (!Object.hasOwn(definition.properties, key)) {
      return {
        decision: 'REJECT',
        payload: null,
        reasons: [`unknown_property:${key}`]
      };
    }
  }

  const rejected = [];
  for (const key of keys) {
    if (definition.properties[key].export === 'REJECT') {
      rejected.push(`rejected:${key}`);
    }
  }
  if (rejected.length) {
    return {
      decision: 'REJECT',
      payload: null,
      reasons: rejected
    };
  }

  const sanitized = {};
  const redacted = [];
  for (const key of keys) {
    const contract = definition.properties[key];
    if (contract.export === 'REDACT') {
      redacted.push(`redacted:${key}`);
      continue;
    }
    sanitized[key] = structuredClone(payload[key]);
  }

  return {
    decision: redacted.length ? 'REDACT' : 'ALLOW',
    payload: sanitized,
    reasons: redacted
  };
}
