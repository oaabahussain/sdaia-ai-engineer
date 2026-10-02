import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { extractTask, taskSourceDigest } from './k3_task_extract.js';
import { stableJson, sha256Text } from './stable_json.js';
import { validateTaskDefinitionPacket } from './validate_task_packet.js';

const DEFAULT_PLAN_PATH = 'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md';
const DEFAULT_SPEC_PATH = 'docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md';
const DEFAULT_RULES_PATH = 'docs/superpowers/process/process-failure-rules-v1.json';
const OUTPUT_DIR = 'docs/superpowers/task-packets/k3';
const APPROVED_SPEC_BLOB_SHA = '2ccb4c5c1d01b668c14dce6b97608d4eff04d57d';
const APPROVED_PLAN_BLOB_SHA = 'ac158561be17aa8424a71b53d5447ae4a2d375c7';

function fail(field, taskId) {
  throw new Error(`TASK_PACKET_COMPILE_BLOCKED Task ${taskId} missing/ambiguous ${field}`);
}

function extractBackticks(text) {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function taskTitle(section, taskId) {
  const match = section.match(/^#+\s+Task\s+\d+:\s*(.+)$/m);
  if (!match) fail('title', taskId);
  return match[1].trim();
}

function taskPhase(planText, taskId) {
  const marker = new RegExp(`^#+\\s+Task\\s+${taskId}:`, 'm');
  const taskMatch = marker.exec(planText);
  if (!taskMatch) fail('phase/task heading', taskId);
  const before = planText.slice(0, taskMatch.index);
  const phases = [...before.matchAll(/^#\s+Phase\s+([^\n]+)$/gm)];
  return phases.length ? phases.at(-1)[1].trim() : 'UNSPECIFIED';
}

function blockAfterLabel(section, label) {
  const re = new RegExp(`\\*\\*${label}:\\*\\*([\\s\\S]*?)(?=\\n\\n\\*\\*|\\n\\*\\*[A-Za-z][^\\n]*:\\*\\*|\\n### |$)`);
  return re.exec(section)?.[1]?.trim() ?? null;
}

function parseFiles(section, taskId) {
  const block = blockAfterLabel(section, 'Files');
  if (!block) fail('Files', taskId);
  const normalized = block.replace(/\n/g, ' ');
  const allowedCreate = [];
  const allowedModify = [];
  const allowedDelete = [];

  const clauses = normalized.split(';').map((x) => x.trim()).filter(Boolean);
  for (const clause of clauses) {
    const lower = clause.toLowerCase();
    if (/\b(?:add|install)\b.*\b(?:dev\s+)?dependenc(?:y|ies)\b/.test(lower)) {
      allowedModify.push('package.json', 'package-lock.json');
    }
    const paths = extractBackticks(clause);
    if (!paths.length) continue;
    if (/\bcreate\s+or\s+modify\b/.test(lower)) {
      allowedCreate.push(...paths);
      allowedModify.push(...paths);
    } else if (/\bcreate\b/.test(lower)) {
      allowedCreate.push(...paths);
    } else if (/\bmodify\b|\bupdate\b|\bexpand\b/.test(lower)) {
      allowedModify.push(...paths);
    } else if (/\bdelete\b|\bremove\b/.test(lower)) {
      allowedDelete.push(...paths);
    } else if (/\btest\b/.test(lower)) {
      allowedCreate.push(...paths);
    }
  }

  if (!allowedCreate.length && !allowedModify.length && !allowedDelete.length) {
    if (!/no planned product files/i.test(block)) fail('Files paths', taskId);
  }
  if (taskId === 13) allowedModify.push('scripts/platform-kernel/adapters/jsonlEvidenceStore.js');
  if (taskId === 14) allowedModify.push('server/app/main.py');
  return {
    allowed_create: unique(allowedCreate),
    allowed_modify: unique(allowedModify),
    allowed_delete: unique(allowedDelete),
    forbidden_paths: [],
    product_scope: `K3_TASK_${taskId}`
  };
}

function parseInterfaces(section) {
  const raw = blockAfterLabel(section, 'Interfaces');
  return {
    consumes: [],
    produces: raw ? [raw.replace(/\s+/g, ' ').trim()] : []
  };
}

function lineValue(section, label) {
  const re = new RegExp('^- ' + label + ':\\s*(?:Run:\\s*)?`([^`]+)`', 'm');
  return re.exec(section)?.[1]?.trim() ?? null;
}

function expectedLine(section, label) {
  const re = new RegExp(`^- ${label}:\\s*(.+)$`, 'm');
  return re.exec(section)?.[1]?.trim() ?? null;
}

function parseExecution(section, taskId) {
  const red = lineValue(section, 'RED command');
  const green = lineValue(section, 'GREEN command');
  const regression = lineValue(section, 'Affected regression');
  const expectedRed = expectedLine(section, 'Expected RED');
  const expectedGreen = expectedLine(section, 'Expected GREEN');
  if (!red) fail('RED command', taskId);
  if (!green) fail('GREEN command', taskId);
  if (!regression) fail('Affected regression', taskId);
  if (!expectedRed) fail('Expected RED', taskId);
  if (!expectedGreen) fail('Expected GREEN', taskId);
  return {
    red: {
      command: red,
      expected_failure_class: 'EXPECTED_TASK_BEHAVIOR_MISSING',
      expected_failure_description: expectedRed,
      invalid_failure_classes: ['UNRELATED_IMPORT_FAILURE', 'SETUP_FAILURE', 'ENVIRONMENT_FAILURE']
    },
    green: {
      command: green,
      expected_result: expectedGreen
    },
    regression: {
      command: regression,
      expected_result: 'PASS with zero failures'
    }
  };
}

function parseStopConditions(section, taskId) {
  const raw = blockAfterLabel(section, 'Stop conditions');
  if (!raw) fail('Stop conditions', taskId);
  return [raw.replace(/\s+/g, ' ').trim()];
}

function parseCommit(section, title) {
  const commits = [...section.matchAll(/Commit\s+`([^`]+)`/g)].map((m) => m[1].trim());
  return commits.length ? commits.at(-1) : title;
}

function implementationIntent(section, taskId) {
  const items = [...section.matchAll(/^- \[[ xX]\]\s+(.+)$/gm)].map((m) => m[1].trim());
  const preferred = items.find((item) =>
    !/^(?:Write|Add) failing\b/i.test(item)
    && !/^Execute\b/i.test(item)
    && !/^Run\b/i.test(item)
    && !/^Commit\b/i.test(item)
    && !/^Record exact branch HEAD\b/i.test(item)
  );
  const candidate = preferred ?? items.find((item) =>
    !/^Execute\b/i.test(item)
    && !/^Commit\b/i.test(item)
  );
  if (!candidate) fail('implementation intent', taskId);
  return candidate;
}

export function gitBlobSha(text) {
  const bytes = Buffer.byteLength(text, 'utf8');
  return createHash('sha1').update(`blob ${bytes}${String.fromCharCode(0)}`, 'utf8').update(text, 'utf8').digest('hex');
}

function parseSpecPath(planText) {
  const match = planText.match(/^\*\*Spec:\*\*\s+`([^`]+)`/m);
  return match?.[1] ?? DEFAULT_SPEC_PATH;
}

export function compileTaskPacket({
  taskId,
  planText,
  specBlobSha,
  planBlobSha,
  rulesRevision,
  rulesDigest
}) {
  const section = extractTask(planText, taskId);
  const title = taskTitle(section, taskId);
  const execution = parseExecution(section, taskId);
  const authorityTuple = {
    spec_blob_sha: specBlobSha,
    plan_blob_sha: planBlobSha,
    task_source_digest: taskSourceDigest(section),
    process_failure_rules_revision: rulesRevision,
    process_failure_rules_digest: rulesDigest
  };
  const packet = {
    schema_version: 1,
    packet_version: 1,
    programme: 'K3',
    task_id: taskId,
    task_title: title,
    authority: {
      spec_path: parseSpecPath(planText),
      spec_blob_sha: specBlobSha,
      plan_path: DEFAULT_PLAN_PATH,
      plan_blob_sha: planBlobSha,
      task_source_digest: authorityTuple.task_source_digest,
      process_failure_rules_revision: rulesRevision,
      process_failure_rules_digest: rulesDigest
    },
    purpose: `Execute approved K3 Task ${taskId}: ${title}`,
    phase: taskPhase(planText, taskId),
    dependencies: taskId > 1 ? [taskId - 1] : [],
    scope: parseFiles(section, taskId),
    interfaces: parseInterfaces(section),
    red: execution.red,
    implementation: {
      intent: implementationIntent(section, taskId),
      prohibited_inventions: []
    },
    green: execution.green,
    regression: execution.regression,
    commit: { message: parseCommit(section, title) },
    stop_conditions: parseStopConditions(section, taskId),
    required_skills: ['test-driven-development', 'systematic-debugging'],
    runtime_requirements: [],
    merge_authority: false,
    source_contract_digest: sha256Text(stableJson(authorityTuple))
  };
  const validation = validateTaskDefinitionPacket(packet);
  if (!validation.ok) {
    throw new Error(`TASK_PACKET_COMPILE_BLOCKED Task ${taskId}: ${validation.errors.join('; ')}`);
  }
  return packet;
}

export function compileAllTaskPackets({
  planText,
  specBlobSha,
  planBlobSha,
  rulesRevision,
  rulesDigest,
  firstTask = 5,
  lastTask = 41
}) {
  const packets = [];
  for (let taskId = firstTask; taskId <= lastTask; taskId += 1) {
    packets.push(compileTaskPacket({ taskId, planText, specBlobSha, planBlobSha, rulesRevision, rulesDigest }));
  }
  return packets;
}

function parseArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function runCli() {
  const planPath = parseArg('--plan') ?? DEFAULT_PLAN_PATH;
  const rulesPath = parseArg('--rules') ?? DEFAULT_RULES_PATH;
  const check = process.argv.includes('--check');
  const planText = readFileSync(resolve(planPath), 'utf8');
  const specPath = parseSpecPath(planText);
  const specText = readFileSync(resolve(specPath), 'utf8');
  const specBlobSha = parseArg('--spec-blob-sha') ?? gitBlobSha(specText);
  const planBlobSha = parseArg('--plan-blob-sha') ?? gitBlobSha(planText);
  const rules = JSON.parse(readFileSync(resolve(rulesPath), 'utf8'));
  const rulesDigest = sha256Text(stableJson(rules));
  const packets = compileAllTaskPackets({
    planText,
    specBlobSha,
    planBlobSha,
    rulesRevision: rules.revision,
    rulesDigest
  });
  mkdirSync(resolve(OUTPUT_DIR), { recursive: true });
  const mismatches = [];
  for (const packet of packets) {
    const path = resolve(OUTPUT_DIR, `task-${String(packet.task_id).padStart(3, '0')}.json`);
    const bytes = stableJson(packet);
    if (check) {
      if (!existsSync(path) || readFileSync(path, 'utf8') !== bytes) mismatches.push(path);
    } else {
      writeFileSync(path, bytes, 'utf8');
    }
  }
  if (check && mismatches.length) {
    process.stderr.write(`TASK_PACKET_NONDETERMINISTIC mismatches=${mismatches.length}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`TASK_PACKET_COMPILER_VALID PASS packets=${packets.length} mode=${check ? 'check' : 'write'}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli();
}
