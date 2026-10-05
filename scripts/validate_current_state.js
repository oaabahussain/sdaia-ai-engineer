import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(repoRoot, 'docs/superpowers/state/current-state.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schema);

function result(ok, code, details = {}) {
  return { ok, code, details };
}

function ledgerProvesTask(ledgerText, n) {
  const lines = String(ledgerText ?? '').split(/\r?\n/);
  return lines.some((line) => {
    const task = new RegExp('\\bTask\\s+' + n + '\\b', 'i').test(line);
    const proof = /RETROSPECTIVE VERIFIED|complete\b/i.test(line);
    return task && proof;
  });
}

export function validateCurrentState(state, context = {}) {
  if (!validateSchema(state)) {
    return result(false, 'STATE_SCHEMA_INVALID', { errors: validateSchema.errors ?? [] });
  }

  if (!/^impl\/k3-[a-z0-9][a-z0-9._\/-]*$/.test(state.execution_branch)) {
    return result(false, 'EXECUTION_BRANCH_INVALID', { execution_branch: state.execution_branch });
  }

  if (state.next_task !== state.completed_through_task + 1) {
    return result(false, 'TASK_SEQUENCE_INVALID', {
      completed_through_task: state.completed_through_task,
      next_task: state.next_task
    });
  }

  const minimumStateRevision = Number(context.minimumStateRevision ?? 1);
  if (state.state_revision < minimumStateRevision) {
    return result(false, 'STATE_REVISION_REGRESSION', {
      state_revision: state.state_revision,
      minimum_state_revision: minimumStateRevision
    });
  }

  if (Array.isArray(context.existingPaths)) {
    const existing = new Set(context.existingPaths);
    for (const referencedPath of [state.spec_path, state.plan_path, state.ledger_path, state.checkpoint_path]) {
      if (!existing.has(referencedPath)) {
        return result(false, 'STATE_REFERENCE_MISSING', { path: referencedPath });
      }
    }
  }

  if (context.specBlobSha && state.spec_blob_sha !== context.specBlobSha) {
    return result(false, 'PLAN_SPEC_HASH_MISMATCH', {
      kind: 'spec',
      expected: state.spec_blob_sha,
      actual: context.specBlobSha
    });
  }
  if (context.planBlobSha && state.plan_blob_sha !== context.planBlobSha) {
    return result(false, 'PLAN_SPEC_HASH_MISMATCH', {
      kind: 'plan',
      expected: state.plan_blob_sha,
      actual: context.planBlobSha
    });
  }

  if (state.base_main_sha !== null && context.liveMainSha && state.base_main_sha !== context.liveMainSha) {
    return result(false, 'MAIN_DRIFT', {
      base_main_sha: state.base_main_sha,
      live_main_sha: context.liveMainSha
    });
  }

  if (context.sourceRef === state.execution_branch && state.base_main_sha === null) {
    return result(false, 'MAIN_DRIFT', { reason: 'execution branch requires non-null base_main_sha' });
  }

  for (let n = 1; n <= state.completed_through_task; n += 1) {
    if (!ledgerProvesTask(context.ledgerText, n)) {
      return result(false, 'LEDGER_INCOMPLETE', { missing_task: n });
    }
  }

  if (state.low_model_ready) {
    const blockedGate = Object.entries(state.gates).find(([, status]) => status !== 'PASS');
    if (
      state.base_main_sha === null ||
      blockedGate ||
      state.open_critical_findings !== 0 ||
      state.open_important_findings !== 0 ||
      !state.project_bootstrap_revision ||
      state.gates.PROJECT_BOOTSTRAP_CURRENT !== 'PASS'
    ) {
      return result(false, 'LOW_MODEL_GATE_INVALID', {
        blocked_gate: blockedGate?.[0] ?? null,
        open_critical_findings: state.open_critical_findings,
        open_important_findings: state.open_important_findings,
        project_bootstrap_revision: state.project_bootstrap_revision
      });
    }
  }

  return result(true, 'STATE_VALID', {
    state_revision: state.state_revision,
    completed_through_task: state.completed_through_task,
    next_task: state.next_task,
    low_model_ready: state.low_model_ready,
    merge_guard_mode: state.merge_guard_mode
  });
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function gitBlobSha(filePath) {
  return execFileSync('git', ['rev-parse', 'HEAD:' + filePath], {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim();
}

function main() {
  const liveMainSha = arg('--live-main-sha');
  if (!liveMainSha || !/^[0-9a-f]{40}$/.test(liveMainSha)) {
    process.stderr.write('usage: validate_current_state.js --live-main-sha <40hex> [--json]\n');
    process.exitCode = 2;
    return;
  }

  const statePath = path.join(repoRoot, 'docs/superpowers/state/CURRENT-STATE.json');
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const referencedPaths = [state.spec_path, state.plan_path, state.ledger_path, state.checkpoint_path];
  const existingPaths = referencedPaths.filter((p) => existsSync(path.join(repoRoot, p)));
  const ledgerExists = existingPaths.includes(state.ledger_path);
  const context = {
    liveMainSha,
    sourceRef: process.env.GITHUB_REF_NAME || execFileSync('git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8' }).trim(),
    specBlobSha: existingPaths.includes(state.spec_path) ? gitBlobSha(state.spec_path) : null,
    planBlobSha: existingPaths.includes(state.plan_path) ? gitBlobSha(state.plan_path) : null,
    ledgerText: ledgerExists ? readFileSync(path.join(repoRoot, state.ledger_path), 'utf8') : '',
    existingPaths,
    minimumStateRevision: Number(process.env.MINIMUM_STATE_REVISION || 1)
  };
  const checked = validateCurrentState(state, context);
  process.stdout.write(JSON.stringify(checked) + '\n');
  if (!checked.ok) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
