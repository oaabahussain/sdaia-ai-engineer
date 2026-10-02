import { readFile, writeFile } from 'node:fs/promises';
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
const code = standaloneCode(ajv, exportMap);
const payloadEntries = Object.entries(exportsByPath)
  .filter(([path]) => path.startsWith('data/evidence/payload-schemas/'))
  .map(([path, name]) => `  ${JSON.stringify(path)}: ${name}`)
  .join(',\n');
const eventName = exportsByPath['data/schema/learner-evidence-event-v2.schema.json'];
const output = `${code}\nexport const validateLearnerEvidenceEventSchema = ${eventName};\nexport const payloadValidators = {\n${payloadEntries}\n};\n`;
await writeFile(resolve(root, 'src/evidence/generatedValidators.js'), output);
