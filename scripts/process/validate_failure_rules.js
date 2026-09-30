import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stableJson, sha256Text } from './stable_json.js';

const SCHEMA_URL = new URL('../../docs/superpowers/process/process-failure-rule-v1.schema.json', import.meta.url);
const DEFAULT_RULES_URL = new URL('../../docs/superpowers/process/process-failure-rules-v1.json', import.meta.url);
const schema = JSON.parse(readFileSync(SCHEMA_URL, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

export function validateFailureRules(document) {
  const errors = [];
  if (!validateSchema(document)) {
    for (const error of validateSchema.errors ?? []) {
      errors.push(`${error.instancePath || '/'} ${error.message}`);
    }
  }
  if (document && Array.isArray(document.rules)) {
    const ids = new Set();
    for (const rule of document.rules) {
      if (ids.has(rule.rule_id)) errors.push(`duplicate rule_id: ${rule.rule_id}`);
      ids.add(rule.rule_id);
      if (Array.isArray(rule.applies_to) && rule.applies_to.includes('product_semantics')) {
        errors.push(`${rule.rule_id} process rule cannot redefine product semantics`);
      }
    }
    const expected = Array.from({ length: 14 }, (_, i) => `F${String(i + 1).padStart(3, '0')}`);
    const actual = document.rules.map((rule) => rule.rule_id);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push('registry must contain exactly ordered F001-F014');
    }
  }
  return { ok: errors.length === 0, errors };
}

export function failureRulesDigest(document) {
  return sha256Text(stableJson(document));
}

function runCli() {
  const arg = process.argv[2];
  const source = arg ? new URL(`file://${process.cwd()}/${arg}`) : DEFAULT_RULES_URL;
  const document = JSON.parse(readFileSync(source, 'utf8'));
  const result = validateFailureRules(document);
  if (!result.ok) {
    process.stderr.write(`PROCESS_FAILURE_RULES_VALID FAIL ${JSON.stringify(result.errors)}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `PROCESS_FAILURE_RULES_VALID PASS revision=${document.revision} rules=${document.rules.length} digest=${failureRulesDigest(document)}\n`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  runCli();
}
