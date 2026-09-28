import { summarizeTrancheMetrics } from '../orchestration/trancheMetrics.js';
import { evaluateEventPrivacy } from './privacyPolicy.js';
import { registerEventDefinition, validateEvent } from './eventRegistry.js';

const DEFINITION = Object.freeze({
  schema_version: 1,
  event_name: 'factory.tranche.metrics',
  event_version: 1,
  purpose: 'Measure aggregate K2 factory/tranche quality and throughput without exporting private content',
  owner: 'platform-kernel',
  trigger_semantics: 'Emit once after a tranche result is summarized',
  properties: {
    track_id: { type: 'string', required: true, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    tranche_id: { type: 'string', required: true, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    request_count: { type: 'integer', required: true, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    yield_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    failure_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    duplicate_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    evidence_failure_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    bilingual_failure_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    review_escalation_rate: { type: 'number', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' },
    review_backlog: { type: 'integer', required: false, privacy_class: 'ANONYMOUS', export: 'ALLOW' }
  },
  privacy_class: 'ANONYMOUS',
  retention_class: 'STANDARD',
  producer: 'platform-kernel',
  compatibility: { strategy: 'NEW_EVENT', previous_versions: [] },
  created_at: '2026-09-28T00:00:00Z'
});

const DEFINITION_ID = registerEventDefinition(DEFINITION);

function putKnown(target, key, value) {
  if (value !== null && value !== undefined) target[key] = value;
}

export function createFactoryMetricEvent(trancheResult, options = {}) {
  if (typeof options.trackId !== 'string' || !options.trackId) {
    throw new Error('trackId is required for factory metric event');
  }
  if (typeof options.occurredAt !== 'string' || !options.occurredAt) {
    throw new Error('occurredAt is required for factory metric event');
  }

  const metrics = summarizeTrancheMetrics(trancheResult, {
    reviewBacklog: options.reviewBacklog,
    reviewQueueLatencyMs: options.reviewQueueLatencyMs
  });

  const payload = {
    track_id: options.trackId,
    tranche_id: metrics.trancheId,
    request_count: metrics.requestCount
  };
  putKnown(payload, 'yield_rate', metrics.yieldRate);
  putKnown(payload, 'failure_rate', metrics.failureRate);
  putKnown(payload, 'duplicate_rate', metrics.duplicateRate);
  putKnown(payload, 'evidence_failure_rate', metrics.evidenceFailureRate);
  putKnown(payload, 'bilingual_failure_rate', metrics.bilingualFailureRate);
  putKnown(payload, 'review_escalation_rate', metrics.reviewEscalationRate);
  putKnown(payload, 'review_backlog', metrics.reviewBacklog);

  const privacy = evaluateEventPrivacy(DEFINITION, payload);
  if (privacy.decision === 'REJECT') {
    throw new Error('Factory metric event rejected by privacy policy');
  }

  return validateEvent(DEFINITION_ID, {
    occurred_at: options.occurredAt,
    properties: privacy.payload
  });
}
