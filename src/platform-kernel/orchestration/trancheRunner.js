function validateInputs(tranchePlan, runner, options) {
  if (!tranchePlan || typeof tranchePlan !== 'object') {
    throw new Error('Tranche plan is required');
  }
  if (tranchePlan.status !== 'PLANNED') {
    throw new Error('Only PLANNED tranches are runnable');
  }
  if (options?.approved !== true) {
    throw new Error('Tranche execution authorization is required');
  }
  if (!Array.isArray(tranchePlan.requests) || tranchePlan.requests.length === 0) {
    throw new Error('Tranche plan requests are required');
  }
  if (!runner || typeof runner.runCandidate !== 'function') {
    throw new Error('Runner must implement runCandidate()');
  }
  if (typeof options?.buildRequest !== 'function') {
    throw new Error('options.buildRequest is required');
  }
}

function expandRequests(tranchePlan, buildRequest) {
  const concrete = [];
  let globalIndex = 0;

  for (const request of tranchePlan.requests) {
    if (
      typeof request?.coverage_gap_id !== 'string' ||
      !request.coverage_gap_id ||
      !Number.isInteger(request.requested_families) ||
      request.requested_families < 1
    ) {
      throw new Error('Invalid tranche coverage request');
    }

    for (let indexWithinGap = 0; indexWithinGap < request.requested_families; indexWithinGap++) {
      const factoryRequest = buildRequest({
        tranchePlan,
        request: structuredClone(request),
        indexWithinGap,
        globalIndex
      });

      if (
        typeof factoryRequest?.run_id !== 'string' ||
        !factoryRequest.run_id ||
        typeof factoryRequest?.target_id !== 'string' ||
        !factoryRequest.target_id
      ) {
        throw new Error('Concrete factory request requires run_id and target_id');
      }

      concrete.push({
        request: structuredClone(factoryRequest),
        coverage_gap_id: request.coverage_gap_id
      });
      globalIndex++;
    }
  }

  return concrete;
}

function resultStatus(completed, failed) {
  if (failed.length === 0) return 'COMPLETED';
  if (completed.length === 0) return 'FAILED';
  return 'PARTIAL';
}

export async function runTranche(tranchePlan, runner, options = {}) {
  validateInputs(tranchePlan, runner, options);
  const concrete = expandRequests(tranchePlan, options.buildRequest);
  const completed = [];
  const failed = [];

  for (const entry of concrete) {
    try {
      completed.push(await runner.runCandidate(entry.request));
    } catch (error) {
      failed.push({
        run_id: entry.request.run_id,
        target_id: entry.request.target_id,
        coverage_gap_id: entry.coverage_gap_id,
        error: error instanceof Error ? error.message : String(error),
        retryable: true
      });
    }
  }

  return {
    tranche_id: tranchePlan.tranche_id,
    status: resultStatus(completed, failed),
    request_count: concrete.length,
    completed,
    failed
  };
}
