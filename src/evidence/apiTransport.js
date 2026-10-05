import { assertEvidenceSyncPort } from './syncPort.js';

function joinUrl(baseUrl, path) {
  const base = String(baseUrl ?? '').replace(/\/$/, '');
  return base + path;
}

async function readJsonResponse(response, action) {
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error(`Evidence sync ${action} returned invalid JSON`); }
  if (!response.ok) {
    const code = payload?.error?.code ?? response.status;
    throw new Error(`Evidence sync ${action} failed: ${code}`);
  }
  return payload;
}

export function createEvidenceApiTransport({
  baseUrl = '',
  fetchImpl = globalThis.fetch,
  pullLimit
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required');
  if (pullLimit !== undefined && (!Number.isInteger(pullLimit) || pullLimit < 1)) {
    throw new TypeError('pullLimit must be a positive integer');
  }
  const port = {
    async push(events) {
      const response = await fetchImpl(joinUrl(baseUrl, '/v1/learner-evidence/batch'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events })
      });
      return readJsonResponse(response, 'push');
    },
    async pull(afterStoreSeq = 0, sourceStoreId) {
      if (afterStoreSeq && typeof afterStoreSeq === 'object') { sourceStoreId=afterStoreSeq.store_id; afterStoreSeq=afterStoreSeq.through_store_seq; }
      if (!Number.isSafeInteger(afterStoreSeq) || afterStoreSeq < 0) throw new TypeError('afterStoreSeq must be a non-negative safe integer');
      if (afterStoreSeq > 0 && (typeof sourceStoreId !== 'string' || !sourceStoreId)) throw new TypeError('Nonzero cursor requires source store identity');
      const query = new URLSearchParams({ after_store_seq: String(afterStoreSeq) });
      if (sourceStoreId !== undefined) query.set('source_store_id',sourceStoreId);
      if (pullLimit !== undefined) query.set('limit', String(pullLimit));
      const response = await fetchImpl(joinUrl(baseUrl, '/v1/learner-evidence?' + query.toString()), { method: 'GET' });
      return readJsonResponse(response, 'pull');
    }
  };
  return assertEvidenceSyncPort(port);
}
