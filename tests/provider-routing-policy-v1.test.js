import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const load = name => JSON.parse(
  fs.readFileSync(new URL('../data/schema/' + name, import.meta.url), 'utf8')
);

const compile = name => new Ajv({
  strict: false,
  allErrors: true,
  formats: { 'date-time': true }
}).compile(load(name));

const valid = {
  schema_version: 1,
  policy_id: 'k2.provider-routing.default',
  version: '1',
  routes: [
    {
      capability: 'generate',
      language: 'ar',
      risk_classes: ['low', 'medium'],
      required_evaluation_status: 'APPROVED',
      provider_refs: ['deterministic']
    }
  ],
  fallback: {
    mode: 'DETERMINISTIC',
    provider_ref: 'deterministic'
  },
  created_at: '2026-09-28T00:00:00Z'
};

test('ProviderRoutingPolicyV1 requires approved provider evaluation state', () => {
  const validate = compile('provider-routing-policy-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const failed = structuredClone(valid);
  failed.routes[0].required_evaluation_status = 'FAILED';
  assert.equal(validate(failed), false);
});

test('ProviderRoutingPolicyV1 requires explicit fallback behavior', () => {
  const validate = compile('provider-routing-policy-v1.schema.json');
  const noFallback = structuredClone(valid);
  delete noFallback.fallback;
  assert.equal(validate(noFallback), false);
});


test('ProviderRoutingPolicyV1 validates optional cost and latency bounds', () => {
  const validate=compile('provider-routing-policy-v1.schema.json');
  const bounded=structuredClone(valid);
  bounded.routes[0].max_latency_ms=500;
  bounded.routes[0].max_cost=0.1;
  assert.equal(validate(bounded),true,JSON.stringify(validate.errors));
  bounded.routes[0].max_cost=-1;
  assert.equal(validate(bounded),false);
});
