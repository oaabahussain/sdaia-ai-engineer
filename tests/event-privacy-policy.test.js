import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/observability/privacyPolicy.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const definition = {
  event_name: 'product.review.opened',
  event_version: 1,
  properties: {
    track_id: {
      type: 'string',
      required: true,
      privacy_class: 'ANONYMOUS',
      export: 'ALLOW'
    },
    learner_ref: {
      type: 'string',
      required: false,
      privacy_class: 'PSEUDONYMOUS',
      export: 'ALLOW'
    },
    free_text: {
      type: 'string',
      required: false,
      privacy_class: 'SENSITIVE',
      export: 'REDACT'
    },
    raw_secret: {
      type: 'string',
      required: false,
      privacy_class: 'SENSITIVE',
      export: 'REJECT'
    }
  }
};

test('privacy policy module exists', () => {
  assert.equal(moduleExists(), true);
});

test('privacy policy rejects undeclared payload properties', async () => {
  if (!moduleExists()) return;
  const { evaluateEventPrivacy } = await import(moduleUrl);

  assert.deepEqual(
    evaluateEventPrivacy(definition, {
      track_id: 'sdaia-ai-engineer',
      email: 'not-declared@example.com'
    }),
    {
      decision: 'REJECT',
      payload: null,
      reasons: ['unknown_property:email']
    }
  );
});

test('privacy policy redacts configured sensitive fields deterministically', async () => {
  if (!moduleExists()) return;
  const { evaluateEventPrivacy } = await import(moduleUrl);

  assert.deepEqual(
    evaluateEventPrivacy(definition, {
      track_id: 'sdaia-ai-engineer',
      learner_ref: 'anon:1',
      free_text: 'do not export'
    }),
    {
      decision: 'REDACT',
      payload: {
        track_id: 'sdaia-ai-engineer',
        learner_ref: 'anon:1'
      },
      reasons: ['redacted:free_text']
    }
  );
});

test('privacy policy rejects fields explicitly marked REJECT', async () => {
  if (!moduleExists()) return;
  const { evaluateEventPrivacy } = await import(moduleUrl);

  assert.deepEqual(
    evaluateEventPrivacy(definition, {
      track_id: 'sdaia-ai-engineer',
      raw_secret: 'secret'
    }),
    {
      decision: 'REJECT',
      payload: null,
      reasons: ['rejected:raw_secret']
    }
  );
});

test('privacy policy allows minimal governed payload unchanged', async () => {
  if (!moduleExists()) return;
  const { evaluateEventPrivacy } = await import(moduleUrl);

  assert.deepEqual(
    evaluateEventPrivacy(definition, {
      track_id: 'sdaia-ai-engineer'
    }),
    {
      decision: 'ALLOW',
      payload: {
        track_id: 'sdaia-ai-engineer'
      },
      reasons: []
    }
  );
});
