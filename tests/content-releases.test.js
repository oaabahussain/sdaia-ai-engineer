import test from 'node:test';
import assert from 'node:assert/strict';

test('content release constructor is immutable and hash-stable', async () => {
  const { createContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const base = {
    release_id: 'rel1',
    track_id: 'sdaia-ai-engineer',
    status: 'DRAFT',
    item_version_ids: ['b', 'a'],
    source_policy_version: 's1',
    quality_policy_version: 'q1',
    review_policy_version: 'r1',
    exam_profile_id: 'p1',
    exam_profile_version: '1',
    created_at: '2026-09-27T00:00:00Z'
  };
  const a = createContentRelease(base);
  const b = createContentRelease({ ...base, item_version_ids: ['a', 'b'] });
  assert.deepEqual(a.item_version_ids, ['a', 'b']);
  assert.equal(a.content_hash, b.content_hash);
  const c = createContentRelease({ ...base, item_version_ids: ['a', 'c'] });
  assert.notEqual(a.content_hash, c.content_hash);
  assert.equal(Object.isFrozen(a), true);
});

test('release lifecycle requires CANARY before ACTIVE and governed K2 activation evidence', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const draft = { release_id: 'r', status: 'DRAFT' };
  assert.throws(() => transitionContentRelease(draft, 'activate'), /Invalid release transition/);

  let r = transitionContentRelease(draft, 'develop');
  r = transitionContentRelease(r, 'submit_review');
  r = transitionContentRelease(r, 'canary');
  assert.equal(r.status, 'CANARY');

  assert.throws(
    () => transitionContentRelease(r, 'activate', { activation_evidence: 'quality:pass' }),
    /structured|PROMOTE|ActivationEvidence/i
  );

  assert.throws(
    () => transitionContentRelease(r, 'activate', {
      activation_evidence: {
        schema_version: 1,
        activation_evidence_id: 'activation:r:hold',
        release_id: 'r',
        decision: 'HOLD'
      }
    }),
    /PROMOTE/i
  );

  r = transitionContentRelease(r, 'activate', {
    activation_evidence: {
      schema_version: 1,
      activation_evidence_id: 'activation:r:1',
      release_id: 'r',
      decision: 'PROMOTE'
    }
  });
  assert.equal(r.status, 'ACTIVE');
});

test('grandfathered migrated release may use legacy string activation evidence only when explicitly identified', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');

  let r = {
    release_id: 'legacy-r',
    status: 'REVIEW',
    origin: 'migrated-grandfathered'
  };
  r = transitionContentRelease(r, 'canary');
  r = transitionContentRelease(r, 'activate', {
    activation_evidence: 'quality:pass'
  });

  assert.equal(r.status, 'ACTIVE');
});

test('content release constructor cannot bypass CANARY with an ACTIVE initial state', async () => {
  const { createContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const base = {
    release_id: 'rel-active',
    track_id: 'sdaia-ai-engineer',
    status: 'ACTIVE',
    item_version_ids: ['i1'],
    source_policy_version: 's1',
    quality_policy_version: 'q1',
    review_policy_version: 'r1',
    exam_profile_id: 'p1',
    exam_profile_version: '1',
    created_at: '2026-09-27T00:00:00Z'
  };
  assert.throws(
    () => createContentRelease(base),
    /initial release status|CANARY|ACTIVE/i
  );
});
