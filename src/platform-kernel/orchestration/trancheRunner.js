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

function validateRecoveryInputs(tranchePlan, previousResult, options) {
  if (!tranchePlan || typeof tranchePlan !== 'object') {
    throw new Error('Tranche plan is required');
  }
  if (!['PLANNED', 'RUNNING', 'PARTIAL'].includes(tranchePlan.status)) {
    throw new Error('Tranche state is not recoverable');
  }
  if (options?.approved !== true) {
    throw new Error('Tranche execution authorization is required');
  }
  if (typeof options?.buildRequest !== 'function') {
    throw new Error('options.buildRequest is required');
  }
  if (
    !previousResult ||
    previousResult.tranche_id !== tranchePlan.tranche_id ||
    !Array.isArray(previousResult.completed) ||
    !Array.isArray(previousResult.failed)
  ) {
    throw new Error('Previous tranche result does not match tranche lineage');
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

function failureRecord(entry, error, prior = null) {
  const record = {
    run_id: entry.request.run_id,
    target_id: entry.request.target_id,
    coverage_gap_id: entry.coverage_gap_id,
    error: error instanceof Error ? error.message : String(error),
    retryable: true
  };
  if (prior?.stage) record.stage = prior.stage;
  return record;
}

function resultEnvelope(tranchePlan, requestCount, completed, failed) {
  return {
    tranche_id: tranchePlan.tranche_id,
    status: resultStatus(completed, failed),
    request_count: requestCount,
    completed,
    failed
  };
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
      failed.push(failureRecord(entry, error));
    }
  }

  return resultEnvelope(
    tranchePlan,
    concrete.length,
    completed,
    failed
  );
}

export async function resumeTranche(
  tranchePlan,
  runner,
  previousResult,
  options = {}
) {
  validateRecoveryInputs(tranchePlan, previousResult, options);
  const concrete = expandRequests(tranchePlan, options.buildRequest);
  const completedByRun = new Map(
    previousResult.completed.map(item => [item.run_id, structuredClone(item)])
  );
  const failedByRun = new Map(
    previousResult.failed.map(item => [item.run_id, structuredClone(item)])
  );
  const completed = [];
  const failed = [];

  for (const entry of concrete) {
    const runId = entry.request.run_id;

    if (completedByRun.has(runId)) {
      completed.push(completedByRun.get(runId));
      continue;
    }

    const priorFailure = failedByRun.get(runId) ?? null;

    try {
      if (priorFailure && typeof runner?.resumeRun === 'function') {
        completed.push(await runner.resumeRun(runId));
      } else if (typeof runner?.runCandidate === 'function') {
        completed.push(await runner.runCandidate(entry.request));
      } else {
        throw new Error('Runner cannot resume or start tranche item');
      }
    } catch (error) {
      failed.push(failureRecord(entry, error, priorFailure));
    }
  }

  return resultEnvelope(
    tranchePlan,
    concrete.length,
    completed,
    failed
  );
}

export async function retryFailedTrancheItems(
  tranchePlan,
  runner,
  previousResult,
  options = {}
) {
  validateRecoveryInputs(tranchePlan, previousResult, options);
  const concrete = expandRequests(tranchePlan, options.buildRequest);
  const concreteByRun = new Map(
    concrete.map(entry => [entry.request.run_id, entry])
  );

  const completed = previousResult.completed.map(item => structuredClone(item));
  const failed = [];

  for (const priorFailure of previousResult.failed) {
    const entry = concreteByRun.get(priorFailure.run_id);
    if (!entry) {
      throw new Error('Failed tranche item is outside current tranche lineage');
    }

    if (priorFailure.retryable === false) {
      failed.push(structuredClone(priorFailure));
      continue;
    }

    try {
      let result;
      if (
        priorFailure.stage &&
        typeof runner?.retryStage === 'function'
      ) {
        result = await runner.retryStage(
          priorFailure.run_id,
          priorFailure.stage
        );
      } else if (typeof runner?.resumeRun === 'function') {
        result = await runner.resumeRun(priorFailure.run_id);
      } else {
        throw new Error('Runner cannot retry failed tranche item');
      }
      completed.push(result);
    } catch (error) {
      failed.push(failureRecord(entry, error, priorFailure));
    }
  }

  return resultEnvelope(
    tranchePlan,
    previousResult.request_count ?? concrete.length,
    completed,
    failed
  );
}
