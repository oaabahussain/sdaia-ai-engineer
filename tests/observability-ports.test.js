import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/observability/ports.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

test('observability ports module exists', () => {
  assert.equal(moduleExists(), true);
});

test('observability port shape assertions reject malformed implementations', async () => {
  if (!moduleExists()) return;
  const {
    assertAnalyticsSink,
    assertTelemetrySink,
    assertFeatureFlagPort
  } = await import(moduleUrl);

  assert.throws(() => assertAnalyticsSink({}), /publish/i);
  assert.throws(() => assertTelemetrySink({}), /emit/i);
  assert.throws(() => assertFeatureFlagPort({}), /evaluate/i);

  assert.equal(
    assertAnalyticsSink({ publish() {} }).publish instanceof Function,
    true
  );
  assert.equal(
    assertTelemetrySink({ emit() {} }).emit instanceof Function,
    true
  );
  assert.equal(
    assertFeatureFlagPort({ evaluate() {} }).evaluate instanceof Function,
    true
  );
});

test('guarded AnalyticsSink rejects unvalidated events and publishes registry-validated events', async () => {
  if (!moduleExists()) return;
  const { createGuardedAnalyticsSink } = await import(moduleUrl);
  const {
    registerEventDefinition,
    validateEvent
  } = await import('../src/platform-kernel/observability/eventRegistry.js');

  const published = [];
  const sink = createGuardedAnalyticsSink({
    async publish(event) {
      published.push(event);
      return { accepted: true };
    }
  });

  await assert.rejects(
    () => sink.publish({
      definition_id: 'product.feature.opened@1',
      event_name: 'product.feature.opened',
      event_version: 1,
      occurred_at: '2026-09-28T00:00:00Z',
      producer: 'web-client',
      properties: { track_id: 'sdaia-ai-engineer' }
    }),
    /validated|registry/i
  );
  assert.equal(published.length, 0);

  const definitionId = registerEventDefinition({
    schema_version: 1,
    event_name: 'product.feature.opened',
    event_version: 1,
    purpose: 'Measure governed feature discovery',
    owner: 'product-platform',
    trigger_semantics: 'Emit once when the feature is opened',
    properties: {
      track_id: {
        type: 'string',
        required: true,
        privacy_class: 'ANONYMOUS',
        export: 'ALLOW'
      }
    },
    privacy_class: 'ANONYMOUS',
    retention_class: 'STANDARD',
    producer: 'web-client',
    compatibility: {
      strategy: 'NEW_EVENT',
      previous_versions: []
    },
    created_at: '2026-09-28T00:00:00Z'
  });

  const event = validateEvent(definitionId, {
    occurred_at: '2026-09-28T00:00:00Z',
    properties: { track_id: 'sdaia-ai-engineer' }
  });

  assert.deepEqual(
    await sink.publish(event),
    { accepted: true }
  );
  assert.equal(published.length, 1);
  assert.equal(published[0], event);
});
