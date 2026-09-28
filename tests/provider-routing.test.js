import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/providers/routeProvider.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const policy = {
  schema_version: 1,
  policy_id: 'k2.provider-routing.default',
  version: '1',
  routes: [
    {
      capability: 'generate',
      language: 'ar',
      risk_classes: ['low', 'medium'],
      required_evaluation_status: 'APPROVED',
      provider_refs: ['ai-primary', 'ai-secondary']
    }
  ],
  fallback: {
    mode: 'DETERMINISTIC',
    provider_ref: 'deterministic'
  },
  created_at: '2026-09-28T00:00:00Z'
};

test('provider routing module exists', () => {
  assert.equal(moduleExists(), true);
});

test('routeProvider never selects an unapproved candidate', async () => {
  if (!moduleExists()) return;
  const { routeProvider } = await import(moduleUrl);

  const decision = routeProvider({
    capability: 'generate',
    language: 'ar',
    riskClass: 'low',
    candidates: [
      { provider_ref: 'ai-primary', evaluation_status: 'FAILED' },
      { provider_ref: 'ai-secondary', evaluation_status: 'APPROVED' }
    ],
    policy
  });

  assert.deepEqual(decision, {
    mode: 'PROVIDER',
    providerRef: 'ai-secondary',
    reason: 'eligible_policy_route'
  });
});

test('routeProvider uses explicit deterministic fallback when no provider is eligible', async () => {
  if (!moduleExists()) return;
  const { routeProvider } = await import(moduleUrl);

  const decision = routeProvider({
    capability: 'generate',
    language: 'ar',
    riskClass: 'low',
    candidates: [
      { provider_ref: 'ai-primary', evaluation_status: 'FAILED' }
    ],
    policy
  });

  assert.deepEqual(decision, {
    mode: 'DETERMINISTIC',
    providerRef: 'deterministic',
    reason: 'no_eligible_provider'
  });
});

test('routeProvider returns ABSTAIN fallback without inventing a provider', async () => {
  if (!moduleExists()) return;
  const { routeProvider } = await import(moduleUrl);

  const abstainPolicy = {
    ...policy,
    fallback: { mode: 'ABSTAIN' }
  };

  const decision = routeProvider({
    capability: 'generate',
    language: 'ar',
    riskClass: 'low',
    candidates: [],
    policy: abstainPolicy
  });

  assert.deepEqual(decision, {
    mode: 'ABSTAIN',
    providerRef: null,
    reason: 'no_eligible_provider'
  });
});
