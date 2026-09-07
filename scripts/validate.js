import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = process.cwd();
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const compile = (name) => ajv.compile(read(name));

function assertValid(label, validator, value) {
  if (!validator(value)) {
    console.error(label, validator.errors);
    process.exit(1);
  }
  console.log(`${label}: PASS`);
}

const args = process.argv.slice(2);
const stateIndex = args.indexOf('--state');
if (stateIndex >= 0) {
  const file = args[stateIndex + 1];
  if (!file) throw new Error('--state requires a file');
  assertValid('state', compile('data/schema/state.schema.json'), read(file));
  process.exit(0);
}

const questions = read('data/questions.json');
const sessions = read('data/sessions.json');
const weights = read('data/weights.json');
const validateQuestion = compile('data/schema/question.schema.json');
const validateSession = compile('data/schema/session.schema.json');
for (const q of questions) assertValid(`question:${q.id}`, validateQuestion, q);
for (const s of sessions) assertValid(`session:${s.id}`, validateSession, s);
if (questions.length !== 121) throw new Error(`Expected 121 questions, found ${questions.length}`);
const weightSum = Object.values(weights).reduce((sum, value) => sum + Number(value), 0);
if (Math.abs(weightSum - 100) > 1e-9) throw new Error(`Weights sum to ${weightSum}`);
console.log('questions: PASS (121)');
console.log(`weights: PASS (${weightSum.toFixed(1)})`);
