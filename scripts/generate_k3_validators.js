import { readFile, writeFile, rename } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';

const root = resolve(import.meta.dirname, '..');
const schemaFiles = [
  'data/schema/learner-evidence-event-v2.schema.json',
  ...readdirSync(resolve(root, 'data/evidence/payload-schemas'))
    .filter((name) => name.endsWith('.schema.json'))
    .sort()
    .map((name) => `data/evidence/payload-schemas/${name}`)
];

const ajv = new Ajv({ allErrors: true, strict: false, code: { source: true, esm: true } });
addFormats(ajv);
const exportsByPath = {};
const exportMap = {};
for (const path of schemaFiles) {
  const schema = JSON.parse(await readFile(resolve(root, path), 'utf8'));
  const key = path.replace(/^data\//, '').replace(/\.schema\.json$/, '');
  ajv.addSchema(schema, key);
  const name = 'validate_' + basename(path, '.schema.json').replace(/[^A-Za-z0-9_$]/g, '_');
  exportMap[name] = key;
  exportsByPath[path] = name;
}
let code = standaloneCode(ajv, exportMap);
code = code
  .replace('const func3 = require("ajv/dist/runtime/ucs2length").default;', 'const func3 = (value) => Array.from(value).length;')
  .replace('const formats0 = require("ajv-formats/dist/formats").fullFormats["date-time"];', 'const formats0 = {validate: (value) => /^\\d{4}-\\d{2}-\\d{2}[Tt ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:[Zz]|[+-]\\d{2}:\\d{2})$/.test(value) && Number.isFinite(Date.parse(value))};');
if (/\brequire\s*\(/.test(code)) throw new Error('Ajv standalone output contains an unsupported CommonJS runtime helper');
const payloadEntries = Object.entries(exportsByPath)
  .filter(([path]) => path.startsWith('data/evidence/payload-schemas/'))
  .map(([path, name]) => `  ${JSON.stringify(path)}: ${name}`)
  .join(',\n');
const eventName = exportsByPath['data/schema/learner-evidence-event-v2.schema.json'];
const output = `${code}\nexport const validateLearnerEvidenceEventSchema = ${eventName};\nexport const payloadValidators = {\n${payloadEntries}\n};\n`;
const target = resolve(root, 'src/evidence/generatedValidators.js');
const temp = `${target}.tmp-${process.pid}`;
await writeFile(temp, output);
await rename(temp, target);
