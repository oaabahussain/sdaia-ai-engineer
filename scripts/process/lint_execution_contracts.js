import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function finding(code, path, detail) { return { code, path, detail }; }

export function lintExecutionContracts(files) {
  const findings = [];
  for (const { path, content } of files) {
    if (/^\s*-\s*Run\s+(RED|GREEN)\s*$/gmi.test(content)) {
      findings.push(finding('BARE_EXECUTION_SHORTHAND', path, 'RED/GREEN must include exact command and expected outcome'));
    }
    if (/bootstrap/i.test(path) && /\bcurrent_task\s*[:=]\s*\d+/i.test(content)) {
      findings.push(finding('MUTABLE_BOOTSTRAP_STATE', path, 'static bootstrap cannot carry current task'));
    }
    if (/bootstrap|test/i.test(path) && /\bmain_sha\s*[:=]\s*[0-9a-f]{40}\b/i.test(content) && !/historical_/i.test(content)) {
      findings.push(finding('DYNAMIC_SHA_PIN', path, 'reusable execution input cannot pin dynamic main SHA'));
    }
    const requiredNames = [...content.matchAll(/^\s*name:\s*(quality-gate|server-adapter-gate)\s*$/gmi)].map((m) => m[1].toLowerCase());
    if (new Set(requiredNames).size !== requiredNames.length) {
      findings.push(finding('DUPLICATE_REQUIRED_CHECK_IDENTITY', path, 'required CI check identity must be unique'));
    }
    if (/"digest"\s*:\s*"digest"/i.test(content)) {
      findings.push(finding('SELF_REFERENTIAL_DIGEST', path, 'digest cannot include itself'));
    }
  }
  return { ok: findings.length === 0, code: findings.length ? 'EXECUTION_CONTRACT_LINT_FAILED' : 'EXECUTION_CONTRACT_LINT_PASS', findings };
}

function runCli() {
  const paths = process.argv.slice(2);
  const defaults = [
    'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md',
    'docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md',
    'PROJECT-INDEX.md',
    'RECOVERY-PROTOCOL.md'
  ];
  const selected = paths.length ? paths : defaults;
  const files = selected.map((path) => ({ path, content: readFileSync(path, 'utf8') }));
  const result = lintExecutionContracts(files);
  if (!result.ok) {
    process.stderr.write(`EXECUTION_CONTRACT_LINT_FAILED ${JSON.stringify(result.findings)}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`EXECUTION_CONTRACT_LINT_PASS files=${files.length}\n`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) runCli();
