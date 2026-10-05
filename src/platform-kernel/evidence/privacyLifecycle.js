import { canonicalizeJson } from '../../evidence/jcs.js';
import { resolveLearnerPrincipal } from './identityLinks.js';

function validateRequest(request) {
  if (!request || typeof request !== 'object') throw new TypeError('privacy policy request is required');
  resolveLearnerPrincipal(request.learner_id, []);
  for (const field of ['authority_ref', 'reason_code']) {
    if (typeof request[field] !== 'string' || !request[field].trim()) throw new TypeError(`${field} is required`);
  }
  const policy = request.policy;
  if (!policy || typeof policy.policy_ref !== 'string' || !policy.policy_ref.trim()
      || !['DELETE', 'DELINK'].includes(request.operation)
      || policy.projection_caches !== 'INVALIDATE_ALL'
      || !['ERASE', 'RETAIN'].includes(policy.export_records)
      || policy.linked_metadata !== (request.operation === 'DELETE' ? 'ERASE' : 'RETAIN')) {
    throw new TypeError('unsupported privacy policy or linked metadata disposition');
  }
  if ((policy.linked_metadata === 'RETAIN' || policy.export_records === 'RETAIN')
      && (typeof policy.retention_reason_code !== 'string' || !policy.retention_reason_code.trim())) {
    throw new TypeError('retention requires a documented policy reason');
  }
}

// The injected commit must atomically replace this entire K3 snapshot. The
// authorizer must validate the principal, operation AND deployment policy.
// This is deliberately not an ordinary EvidenceStore method or a UI endpoint.
export function createPrivacyLifecycle({ authorize, load, commit }) {
  if (![authorize, load, commit].every(value => typeof value === 'function')) {
    throw new TypeError('privacy lifecycle requires authorize, load and atomic commit callbacks');
  }
  let tail = Promise.resolve();
  return {
    async apply(input) {
      const request = structuredClone(input);
      const job = tail.then(async () => {
        validateRequest(request);
        if (await authorize(structuredClone(request)) !== true) throw new Error('privacy authorization denied');
        const data = structuredClone(await load());
        for (const field of ['events', 'receipts', 'fingerprints', 'projections', 'identity_links', 'export_records']) {
          if (!Array.isArray(data?.[field]) || data[field].some(row => !row || typeof row !== 'object')) {
            throw new TypeError(`invalid privacy snapshot: ${field}`);
          }
        }
        const learner = request.learner_id;
        const eventIds = new Set(data.events.filter(row => row.learner_id === learner).map(row => row.event_id));
        const belongs = row => row.learner_id === learner || eventIds.has(row.event_id);
        const linkIds = new Set(data.identity_links.filter(row => row.source_learner_id === learner || row.target_learner_id === learner).map(row => row.link_id));
        if (request.policy.export_records === 'RETAIN' && data.export_records.some(row => belongs(row) && row.learner_id !== learner)) {
          throw new TypeError('retained export requires a durable erasure-owner index');
        }
        if (request.operation === 'DELETE') {
          data.events = data.events.filter(row => row.learner_id !== learner);
          data.receipts = data.receipts.filter(row => !belongs(row));
          data.fingerprints = data.fingerprints.filter(row => !belongs(row));
        }
        if (request.policy.export_records === 'ERASE') data.export_records = data.export_records.filter(row => !belongs(row));
        data.identity_links = data.identity_links.filter(row => !linkIds.has(row.link_id));
        // Explicitly conservative: cross-principal projection dependencies are
        // not indexed yet, so policy must authorize invalidating every cache.
        data.projections = [];
        data.replay_complete = false;
        data.privacy_policy = {
          policy_ref: request.policy.policy_ref,
          linked_metadata: request.policy.linked_metadata,
          export_records: request.policy.export_records,
          projection_caches: request.policy.projection_caches,
          ...(request.policy.retention_reason_code ? { retention_reason_code: request.policy.retention_reason_code } : {})
        };
        const policies = data.privacy_policies ?? [];
        if (!Array.isArray(policies)) throw new TypeError('invalid privacy policy history');
        if (!policies.some(value => canonicalizeJson(value) === canonicalizeJson(data.privacy_policy))) {
          policies.push(structuredClone(data.privacy_policy));
        }
        data.privacy_policies = policies;
        await commit(data);
        return { status: 'APPLIED', replay_complete: false, external_deletion: 'NOT_PERFORMED' };
      });
      tail = job.catch(() => {});
      return job;
    }
  };
}
