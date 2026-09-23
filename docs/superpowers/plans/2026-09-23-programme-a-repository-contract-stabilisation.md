# Programme A — Repository & Contract Stabilisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one versioned runtime/content contract for the current SDAIA AI Engineer track, preserve existing learner progress through explicit migrations, remove active legacy contradictions, and make the repository safe to extend before large-scale content production begins.

**Architecture:** Programme A keeps the current Vanilla HTML/CSS/JavaScript + GitHub Pages + optional FastAPI shape. It introduces a small versioned track manifest and exam profile as the single runtime configuration source, stable content IDs, a versioned learner-state migration, one browser/API bundle contract, on-demand offline caching, and release checks driven by manifests instead of duplicated constants. It does **not** implement the future adaptive engine, 14,000-item production system, production authentication, or protected assessment service.

**Tech Stack:** Vanilla ES modules, JSON/JSON Schema Draft 7 for local validation, Node.js 22 tests/validation, Python 3.12 + FastAPI/SQLite for the optional test server, GitHub Actions/Pages, Service Worker/PWA.

**Spec:** `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`

**Evidence:** `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`

## Global Constraints

- Preserve the current supported stack; no React/Next/framework rewrite and no new product dependency unless a task proves it necessary.
- Arabic and English remain first-class; current RTL/LTR, theme, mobile, keyboard, confidence, resume, domain-exam, and result-review behaviour must not regress.
- SDAIA remains an independent/unofficial track; do not label current project weights as official SDAIA weights.
- The current 1,120 generated questions are migration/foundation material, **not** the 14,000+ end-state.
- The 121-question static bank is legacy content; do not silently discard its unique material.
- The anonymous UUID is an identifier, not authentication.
- New core storage/config names use a neutral platform namespace; old `sdaia.*` browser keys remain readable during migration.
- Do not pre-cache the future whole question bank.
- Programme A is the only implementation scope in this plan.
- No CAT/IRT, production auth, multi-tenant billing, protected-bank backend, or full authoring CMS is introduced here.
- Every task uses TDD: failing test → minimal implementation → passing test → focused regression run → commit.
- At execution time, create an isolated workspace with `superpowers:using-git-worktrees`; do not implement on `main` or directly on the design/spec branch.
- The implementation branch must contain the approved spec, evidence appendix, audit resolution, and this plan. If PR #6 is not merged when execution begins, branch from `design/platform-vnext-spec`; if it has been merged, branch from that merge commit on `main`.

## Review Focus

1. **Existing browser user with an unfinished 1,120-bank exam:** opening the new version must preserve the active exam and translate legacy `qN` IDs to stable IDs without losing answers, flags, confidence, or option order. Covered in Task 4.
2. **First-time API-backed user whose GET returns 404:** the bootstrap state and API adapter must use exactly the same anonymous ID, so the first save succeeds. Covered in Task 4.
3. **Old service worker/cache plus new manifest:** the app must either load a compatible cached release or fail clearly/recover, never silently combine incompatible shell/config. Covered in Task 7.
4. **Browser vs API runtime bundle:** both adapters must expose the same contract/version and generate the same 1,120 foundation items from the same manifest; the old 121-question API divergence must disappear. Covered in Task 5.
5. **Feedback form submission with blank issues disabled/enabled transition:** typed content must still reach a usable GitHub issue path instead of being discarded at the template chooser. Covered in Task 8.

---

## File Structure After Programme A

### New canonical runtime/config files

- `tracks/sdaia-ai-engineer/manifest.json` — current track identity, version, locales, content references, default exam profile, migration references.
- `tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json` — current 200-question project-reference profile and domain weights with explicit unverified-official status.
- `data/schema/track-manifest.schema.json` — validates track manifests.
- `data/schema/exam-profile.schema.json` — validates exam profiles.
- `data/schema/runtime-bundle.schema.json` — validates the browser/API bundle shape.
- `data/schema/rendered-question.schema.json` — validates the current generated bilingual foundation item shape with stable IDs.
- `data/schema/state-v2.schema.json` — canonical learner-state schema for the current app.
- `data/migrations/sdaia-generated-v2-question-ids.json` — fixed legacy `q1..q1120` → stable-ID mapping.
- `src/state/migrate.js` — pure learner-state migration functions.
- `src/storage/identity.js` — one anonymous-ID source shared by browser/API/interface.
- `src/content/runtimeBundle.js` — browser-side manifest/bundle loading and validation-by-shape helpers.
- `scripts/load_track.js` — Node-side loader used by validation/tests.
- `tests/track-contract.test.js` — manifest/profile/runtime-contract tests.
- `tests/state-migration.test.js` — v1/legacy → v2 state migration tests.
- `tests/storage.api.test.js` — first-run API identity/bootstrap contract.
- `data/legacy/static-bank-v1/README.md` — explicit disposition of the 121-question legacy bank.
- `data/legacy/static-bank-v1/questions.json` — moved legacy content pending later semantic migration.
- `data/legacy/static-bank-v1/sessions.json` — moved legacy sessions pending later semantic migration.
- `ARCHITECTURE.md`, `MIGRATIONS.md`, `TESTING.md`, `SECURITY.md`, `HANDOFF.md` — current operational/handoff baseline.

### Files intentionally removed after references are eliminated

- `data/weights.json`
- `data/questions.json`
- `data/sessions.json`
- `data/schema/question.schema.json`
- `data/schema/session.schema.json`
- `data/schema/bank.schema.json`
- `src/logic/conceptFiles.js`
- `scripts/load_concepts.js`
- `scripts/verify_release.py`
- `src/logic/mastery.js`
- `src/logic/readiness.js`
- `src/logic/review.js`
- `src/logic/mission.js`
- their disconnected legacy unit tests

The old 121-question content is **moved**, not discarded, because semantic extraction/migration is a later content task. The disconnected learner-logic modules are removed from the active tree because Git history already preserves them and they are not the canonical future learner model.

---

### Task 1: Freeze the Production Baseline and Add Contract Fixtures

**Files:**
- Create: `tests/fixtures/runtime/current-profile.expected.json`
- Create: `tests/fixtures/runtime/current-bank-counts.expected.json`
- Modify: `README.md` (development section only; add baseline/migration note)

**Interfaces:**
- Consumes: current `main@362d35c697411d4eddcc4536c843df17161d3374`.
- Produces: immutable rollback reference and explicit pre-migration regression fixtures used by later tasks.

- [ ] **Step 1: Create the isolated implementation worktree and baseline tag**

At execution time, use `superpowers:using-git-worktrees`. Create `impl/programme-a-contract-stabilisation` from the commit that contains the approved spec/plan (the `design/platform-vnext-spec` head if PR #6 is still unmerged, otherwise the PR #6 merge commit). Separately verify the production baseline `main` ancestry still contains `362d35c697411d4eddcc4536c843df17161d3374` before creating/reusing the rollback tag.

Run:

```bash
git rev-parse main
git tag -a pre-programme-a-2026-09-23 362d35c697411d4eddcc4536c843df17161d3374 -m "Production baseline before Programme A contract stabilisation"
git show --no-patch --oneline pre-programme-a-2026-09-23
```

Expected: tag resolves to `362d35c697411d4eddcc4536c843df17161d3374`.

- [ ] **Step 2: Write regression fixtures for the currently shipped exam profile**

Create `tests/fixtures/runtime/current-profile.expected.json`:

```json
{
  "track_id": "sdaia-ai-engineer",
  "question_count": 200,
  "section_sizes": [25, 50, 100, "all"],
  "weights": {
    "MLOps / LLMOps": 18.0,
    "Data / ML / Evaluation": 17.3,
    "Core AI / Deep Learning / GenAI": 16.7,
    "Responsible AI / Security / Governance": 14.7,
    "AI Software Engineering": 14.0,
    "Architecture / Infrastructure": 12.6,
    "Business / Professional Practice": 6.7
  },
  "evidence_status": "project-reference-unverified"
}
```

Create `tests/fixtures/runtime/current-bank-counts.expected.json`:

```json
{
  "concepts": 140,
  "templates_per_concept": 8,
  "rendered_questions": 1120,
  "domains": 7
}
```

Also capture a digest of the **legacy rendered educational payload** (excluding the soon-to-change question ID) so Task 3 can prove stable-ID work did not silently change questions/options/answers for unfinished exams. Generate it from the current bank:

```bash
node --input-type=module <<'NODE'
import fs from 'node:fs';
import crypto from 'node:crypto';
import { expandConceptBank } from './src/logic/questionBank.js';
import { loadConcepts } from './scripts/load_concepts.js';

const questions = expandConceptBank(loadConcepts(process.cwd()));
const payload = questions.map(q => ({
  domain:q.domain, topic:q.topic, question:q.question, question_en:q.question_en,
  options:q.options, options_en:q.options_en, answer:q.answer,
  explanation:q.explanation, explanation_en:q.explanation_en, difficulty:q.difficulty
}));
const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
const path = 'tests/fixtures/runtime/current-bank-counts.expected.json';
const fixture = JSON.parse(fs.readFileSync(path,'utf8'));
fixture.legacy_payload_sha256 = hash;
fs.writeFileSync(path, JSON.stringify(fixture, null, 2) + '\n');
console.log(hash);
NODE
```

This digest is a regression fixture, not a permanent product identifier.

- [ ] **Step 3: Add a temporary baseline test before changing contracts**

Create `tests/baseline.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { loadConcepts } from '../scripts/load_concepts.js';

const root = new URL('..', import.meta.url).pathname;
const expected = JSON.parse(fs.readFileSync(new URL('./fixtures/runtime/current-bank-counts.expected.json', import.meta.url), 'utf8'));
const questions = expandConceptBank(loadConcepts(root));

test('pre-migration runtime baseline is captured', () => {
  assert.equal(questions.length, expected.rendered_questions);
  assert.equal(new Set(questions.map(q => q.domain)).size, expected.domains);
});
```

- [ ] **Step 4: Run the baseline test and current full suite**

Run:

```bash
node --test tests/baseline.test.js
npm test
node scripts/validate.js
```

Expected: all pass before migration work starts.

- [ ] **Step 5: Commit the baseline fixtures**

```bash
git add tests/fixtures/runtime tests/baseline.test.js README.md
git commit -m "test: capture pre-programme-a runtime baseline"
```

---

### Task 2: Introduce the Canonical Track Manifest and Exam Profile

**Files:**
- Create: `tracks/sdaia-ai-engineer/manifest.json`
- Create: `tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json`
- Create: `data/schema/track-manifest.schema.json`
- Create: `data/schema/exam-profile.schema.json`
- Create: `scripts/load_track.js`
- Create: `tests/track-contract.test.js`
- Modify: `scripts/validate.js`
- Modify: `package.json` only if adding a named validation script; do not add dependencies

**Interfaces:**
- Consumes: existing concept files, `data/learn.json`, `data/cases.json`.
- Produces:
  - `loadTrack(root, trackId) -> { manifest, examProfile, concepts, learn, cases }`
  - one source of exam count/weights/section sizes
  - one explicit `project-reference-unverified` status

- [ ] **Step 1: Write failing manifest/profile contract tests**

Create the first tests in `tests/track-contract.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTrack } from '../scripts/load_track.js';

const root = new URL('..', import.meta.url).pathname;

test('SDAIA track loads through one canonical manifest', () => {
  const bundle = loadTrack(root, 'sdaia-ai-engineer');
  assert.equal(bundle.manifest.id, 'sdaia-ai-engineer');
  assert.equal(bundle.manifest.schema_version, 1);
  assert.equal(bundle.examProfile.id, 'sdaia-ai-engineer.project-reference.v1');
  assert.equal(bundle.examProfile.question_count, 200);
  assert.equal(bundle.examProfile.evidence_status, 'project-reference-unverified');
  assert.equal(Object.values(bundle.examProfile.weights).reduce((a, b) => a + b, 0), 100);
  assert.equal(Object.values(bundle.concepts).flat().length, 140);
});

test('manifest content references are repository-relative and loadable', () => {
  const { manifest } = loadTrack(root, 'sdaia-ai-engineer');
  assert.equal(manifest.content.concept_files.length, 7);
  assert.equal(manifest.default_exam_profile, 'sdaia-ai-engineer.project-reference.v1');
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/track-contract.test.js
```

Expected: FAIL because `scripts/load_track.js` does not exist.

- [ ] **Step 3: Create the track manifest**

Create `tracks/sdaia-ai-engineer/manifest.json`:

```json
{
  "schema_version": 1,
  "id": "sdaia-ai-engineer",
  "version": "2026.09",
  "status": "active",
  "official_status": "unofficial-independent",
  "locales": ["ar", "en"],
  "core_contract": { "min": 2, "max": 2 },
  "capabilities": ["bilingual", "foundation-generated-bank", "exam-profile-v1"],
  "content": {
    "concept_files": [
      "data/concepts/data-ml.json",
      "data/concepts/core-ai.json",
      "data/concepts/ai-software-engineering.json",
      "data/concepts/mlops-llmops.json",
      "data/concepts/architecture-infrastructure.json",
      "data/concepts/responsible-ai-security-governance.json",
      "data/concepts/business-professional-practice.json"
    ],
    "learn": "data/learn.json",
    "cases": "data/cases.json"
  },
  "exam_profiles": [
    "tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json"
  ],
  "default_exam_profile": "sdaia-ai-engineer.project-reference.v1"
}
```

- [ ] **Step 4: Create the exam profile**

Create `tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json`:

```json
{
  "schema_version": 1,
  "id": "sdaia-ai-engineer.project-reference.v1",
  "track_id": "sdaia-ai-engineer",
  "version": "1",
  "evidence_status": "project-reference-unverified",
  "question_count": 200,
  "section_sizes": [25, 50, 100, "all"],
  "weights": {
    "MLOps / LLMOps": 18.0,
    "Data / ML / Evaluation": 17.3,
    "Core AI / Deep Learning / GenAI": 16.7,
    "Responsible AI / Security / Governance": 14.7,
    "AI Software Engineering": 14.0,
    "Architecture / Infrastructure": 12.6,
    "Business / Professional Practice": 6.7
  }
}
```

- [ ] **Step 5: Add JSON Schemas with explicit additional-property rules**

Create `data/schema/track-manifest.schema.json` so it requires:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "track-manifest.schema.json",
  "type": "object",
  "required": ["schema_version", "id", "version", "status", "official_status", "locales", "core_contract", "capabilities", "content", "exam_profiles", "default_exam_profile"],
  "properties": {
    "schema_version": { "const": 1 },
    "id": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "version": { "type": "string", "minLength": 1 },
    "status": { "enum": ["draft", "active", "deprecated", "retired"] },
    "official_status": { "enum": ["unofficial-independent", "official", "partner"] },
    "locales": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "type": "string" } },
    "core_contract": {
      "type": "object",
      "required": ["min", "max"],
      "properties": {
        "min": { "type": "integer", "minimum": 1 },
        "max": { "type": "integer", "minimum": 1 }
      },
      "additionalProperties": false
    },
    "capabilities": { "type": "array", "uniqueItems": true, "items": { "type": "string", "minLength": 1 } },
    "content": {
      "type": "object",
      "required": ["concept_files", "learn", "cases"],
      "properties": {
        "concept_files": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "type": "string" } },
        "learn": { "type": "string" },
        "cases": { "type": "string" }
      },
      "additionalProperties": false
    },
    "exam_profiles": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "type": "string" } },
    "default_exam_profile": { "type": "string", "minLength": 1 }
  },
  "additionalProperties": false
}
```

Create `data/schema/exam-profile.schema.json` with the complete active shape:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "exam-profile.schema.json",
  "type": "object",
  "required": ["schema_version", "id", "track_id", "version", "evidence_status", "question_count", "section_sizes", "weights"],
  "properties": {
    "schema_version": { "const": 1 },
    "id": { "type": "string", "minLength": 1 },
    "track_id": { "type": "string", "minLength": 1 },
    "version": { "type": "string", "minLength": 1 },
    "evidence_status": { "enum": ["official-verified", "project-reference-unverified", "observational"] },
    "question_count": { "type": "integer", "minimum": 1 },
    "section_sizes": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": { "anyOf": [{ "type": "integer", "minimum": 1 }, { "const": "all" }] }
    },
    "weights": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": { "type": "number", "minimum": 0 }
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 6: Implement the focused Node loader**

Create `scripts/load_track.js` with this interface:

```js
import fs from 'node:fs';
import path from 'node:path';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

export function loadTrack(root, trackId) {
  const manifestPath = path.join(root, 'tracks', trackId, 'manifest.json');
  const manifest = readJson(manifestPath);
  const profiles = manifest.exam_profiles.map(p => readJson(path.join(root, p)));
  const examProfile = profiles.find(p => p.id === manifest.default_exam_profile);
  if (!examProfile) throw new Error(`Missing default exam profile ${manifest.default_exam_profile}`);

  const conceptDocs = manifest.content.concept_files.map(p => readJson(path.join(root, p)));
  const concepts = Object.fromEntries(conceptDocs.map(doc => [doc.domain, doc.concepts]));
  return {
    manifest,
    examProfile,
    concepts,
    learn: readJson(path.join(root, manifest.content.learn)),
    cases: readJson(path.join(root, manifest.content.cases))
  };
}
```

- [ ] **Step 7: Validate the new JSON contracts with the already-installed Ajv**

In `scripts/validate.js`, instantiate Ajv Draft 7 validation using the existing `ajv` and `ajv-formats` dependencies. Validate the track manifest and active exam profile before using them:

```js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function assertSchema(schema, value, label) {
  const validate = ajv.compile(schema);
  if (!validate(value)) throw new Error(`${label}: ${ajv.errorsText(validate.errors)}`);
}
```

Load `track-manifest.schema.json` and `exam-profile.schema.json`, call `assertSchema`, and separately assert `examProfile.track_id === manifest.id`, `core_contract.min <= 2 <= core_contract.max`, and weights sum to 100.

- [ ] **Step 8: Replace duplicated weight loading in validation**

Update `scripts/validate.js` to call:

```js
const { manifest, examProfile, concepts } = loadTrack(root, 'sdaia-ai-engineer');
const weights = examProfile.weights;
const questions = expandConceptBank(concepts, { trackId: manifest.id });
const allocation = weightedAllocation(weights, examProfile.question_count);
```

Do not yet remove the old files in this task.

- [ ] **Step 9: Run contract + existing regression suite**

Run:

```bash
node --test tests/track-contract.test.js tests/baseline.test.js tests/bank.test.js tests/exam.test.js
node scripts/validate.js
```

Expected: PASS and still report 1,120 current foundation questions / 200 profile questions.

- [ ] **Step 10: Commit**

```bash
git add tracks data/schema scripts/load_track.js scripts/validate.js tests/track-contract.test.js
git commit -m "feat: add canonical track and exam profile contracts"
```

---

### Task 3: Give Current Concepts and Questions Stable IDs

**Files:**
- Modify: all seven `data/concepts/*.json`
- Modify: `src/logic/questionBank.js`
- Create: `data/schema/rendered-question.schema.json`
- Create: `data/migrations/sdaia-generated-v2-question-ids.json`
- Create: `scripts/build_question_id_map.js`
- Modify: `tests/bank.test.js`
- Modify: `tests/track-contract.test.js`

**Interfaces:**
- Consumes: track ID and concept `id`.
- Produces:
  - stable question `id`
  - stable `family_id`
  - legacy sequential ID map for migration
  - no dependence of canonical IDs on array order

- [ ] **Step 1: Write failing stable-ID tests**

At the top of `tests/bank.test.js`, stop loading concepts through the soon-to-be-retired `load_concepts.js`; use the canonical loader:

```js
import { loadTrack } from '../scripts/load_track.js';
const root = new URL('..', import.meta.url).pathname;
const bundle = loadTrack(root, 'sdaia-ai-engineer');
const concepts = bundle.concepts;
const q = expandConceptBank(concepts, { trackId: bundle.manifest.id });
```

Add:

```js
test('generated questions use stable namespaced runtime IDs', () => {
  const sample = q[0];
  assert.match(sample.id, /^sdaia-ai-engineer\.[a-z0-9.-]+\.v1$/);
  assert.match(sample.family_id, /^sdaia-ai-engineer\.[a-z0-9.-]+$/);
  assert.equal(sample.track_id, 'sdaia-ai-engineer');
  assert.equal('legacy_id' in sample, false);
});

test('stable IDs do not depend on concept array order', () => {
  const reversed = Object.fromEntries(Object.entries(concepts).map(([domain, list]) => [domain, [...list].reverse()]));
  const normalIds = new Set(expandConceptBank(concepts, { trackId: 'sdaia-ai-engineer' }).map(x => x.id));
  const reversedIds = new Set(expandConceptBank(reversed, { trackId: 'sdaia-ai-engineer' }).map(x => x.id));
  assert.deepEqual(reversedIds, normalIds);
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
node --test tests/bank.test.js
```

Expected: FAIL because current IDs are `qN` and concept objects have no stable IDs.

- [ ] **Step 3: Add explicit concept IDs**

Add an `id` and immutable `order` field to every concept using the existing domain slug plus concept slug; `order` records the current 1–20 position so the legacy rendered payload remains reproducible even if JSON array order changes later. Examples:

```json
{"id":"data-ml.accuracy","order":1,"term":"Accuracy", ...}
{"id":"data-ml.precision","order":2,"term":"Precision", ...}
{"id":"data-ml.recall-sensitivity","order":3,"term":"Recall / Sensitivity", ...}
```

Use one deterministic migration script or a one-time edit, then validate:

```js
for (const [domain, concepts] of Object.entries(bundle.concepts)) {
  for (const concept of concepts) {
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(concept.id)) {
      throw new Error(`Invalid concept id ${concept.id} in ${domain}`);
    }
  }
}
```

- [ ] **Step 4: Add stable template IDs and generated IDs**

Change `TEMPLATES` in `src/logic/questionBank.js` from anonymous entries to explicit IDs such as:

```js
const TEMPLATES = [
  { id: 'definition.best-description', order: 0, ar: 'أي وصف يطابق مفهوم «{term}» بشكل أدق؟', en: 'Which description best matches “{term}”?', kind: 'defs' },
  { id: 'definition.practical-meaning', order: 1, ar: 'ما المعنى العملي الأقرب لـ «{term}»؟', en: 'What is the closest practical meaning of “{term}”?', kind: 'defs' },
  { id: 'definition.choose-correct', order: 2, ar: 'اختر التعريف الصحيح لـ «{term}».', en: 'Choose the correct definition of “{term}”.', kind: 'defs' },
  { id: 'definition.technical-review', order: 3, ar: 'في مراجعة تقنية، سُئلت عن «{term}». أي عبارة هي الأدق؟', en: 'In a technical review, you are asked about “{term}”. Which statement is most accurate?', kind: 'defs' },
  { id: 'reverse.requirement', order: 4, ar: 'المطلوب هو: {def_ar} ما المفهوم الأنسب؟', en: 'The requirement is: {def_en} Which concept best fits?', kind: 'terms' },
  { id: 'reverse.describes-case', order: 5, ar: 'أي مصطلح يصف الحالة التالية؟ {def_ar}', en: 'Which term describes the following? {def_en}', kind: 'terms' },
  { id: 'reverse.team-choice', order: 6, ar: 'فريق يريد تطبيق فكرة معناها: {def_ar} ماذا يختار؟', en: 'A team wants to apply the idea meaning: {def_en} What should it choose?', kind: 'terms' },
  { id: 'reverse.recall-concept', order: 7, ar: 'إذا كان الهدف هو «{def_ar}»، فأي مفهوم يجب أن تتذكره؟', en: 'If the goal is “{def_en}”, which concept should you recall?', kind: 'terms' }
];
```

Before generation, canonicalise each domain's concepts by immutable `order`:

```js
const orderedConcepts = [...concepts].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
```

Use `orderedConcepts` for the concept loop **and for distractor selection**. To preserve the shipped RNG output exactly, keep the legacy seed semantics but replace the unstable template-array index with the explicit frozen template `order`:

```js
const rng = mulberry32(hashString(`${domain}|${concept.term}|${tpl.order}|20260909`));
```

This preserves the current educational payload while making JSON-array reorderings harmless. A future edit that changes concept semantics/term wording must create a new content/item version rather than silently mutating an active v1 item.

Change the generator signature to:

```js
export function expandConceptBank(conceptsByDomain, { trackId = 'sdaia-ai-engineer' } = {}) {
```

and emit only canonical runtime identity:

```js
const familyId = `${trackId}.${concept.id}.${tpl.id}`;
questions.push({
  id: `${familyId}.v1`,
  family_id: familyId,
  track_id: trackId,
  // keep current bilingual question/options/explanation fields unchanged
});
```

Do **not** emit `legacy_id` into runtime questions. Legacy IDs are migration metadata and belong only in the frozen mapping file.

The stable ID must use explicit `concept.id` and `tpl.id`; it must not use list position.

- [ ] **Step 5: Generate and freeze the old→new ID map**

Create `scripts/build_question_id_map.js` that walks the manifest concept-file order, sorts each domain by immutable `order`, and pairs the **pre-migration sequential position** with the stable generated ID:

```js
const questions = expandConceptBank(bundle.concepts, { trackId: bundle.manifest.id });
const map = Object.fromEntries(questions.map((q, index) => [`q${index + 1}`, q.id]));
```

Run and commit this map while the manifest/domain/concept `order` values still reproduce the shipped ordering. After commit, the map is frozen migration data and must not be regenerated casually.

Write it to `data/migrations/sdaia-generated-v2-question-ids.json` with sorted legacy keys by numeric suffix.

- [ ] **Step 6: Validate the map in tests**

Add:

```js
test('legacy generated ID map covers the full shipped bank exactly once', () => {
  const map = JSON.parse(fs.readFileSync(new URL('../data/migrations/sdaia-generated-v2-question-ids.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(map).length, 1120);
  assert.equal(new Set(Object.values(map)).size, 1120);
  assert.equal(map.q1, q[0].id);
  assert.equal(map.q1120, q[1119].id);
});
```

- [ ] **Step 7: Prove the educational payload did not change**

Add a helper in `tests/bank.test.js` that hashes only the old learner-visible fields in generated order:

```js
import crypto from 'node:crypto';
const payload = q.map(x => ({
  domain:x.domain, topic:x.topic, question:x.question, question_en:x.question_en,
  options:x.options, options_en:x.options_en, answer:x.answer,
  explanation:x.explanation, explanation_en:x.explanation_en, difficulty:x.difficulty
}));
const digest = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
assert.equal(digest, expected.legacy_payload_sha256);
```

Also strengthen the reorder test to compare `id -> learner-visible payload`, not just the ID set.

- [ ] **Step 8: Define and validate the rendered-question schema**

Create `data/schema/rendered-question.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "rendered-question.schema.json",
  "type": "object",
  "required": [
    "id", "family_id", "track_id", "domain", "topic",
    "question", "question_en", "options", "options_en",
    "answer", "explanation", "explanation_en", "difficulty"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9]+(?:[.-][a-z0-9]+)*\\.v[0-9]+$" },
    "family_id": { "type": "string", "pattern": "^[a-z0-9]+(?:[.-][a-z0-9]+)*$" },
    "track_id": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "domain": { "type": "string", "minLength": 1 },
    "topic": { "type": "string", "minLength": 1 },
    "question": { "type": "string", "minLength": 1 },
    "question_en": { "type": "string", "minLength": 1 },
    "options": { "type": "array", "minItems": 4, "maxItems": 4, "items": { "type": "string", "minLength": 1 } },
    "options_en": { "type": "array", "minItems": 4, "maxItems": 4, "items": { "type": "string", "minLength": 1 } },
    "answer": { "type": "integer", "minimum": 0, "maximum": 3 },
    "explanation": { "type": "string", "minLength": 1 },
    "explanation_en": { "type": "string", "minLength": 1 },
    "difficulty": { "enum": ["easy", "medium", "hard"] }
  },
  "additionalProperties": false
}
```

In `scripts/validate.js`, validate every generated question against it.

- [ ] **Step 9: Run the stable-ID tests and validation**

Run:

```bash
node --test tests/bank.test.js tests/track-contract.test.js
node scripts/validate.js
```

Expected: PASS, 1,120 stable IDs, one-to-one legacy mapping.

- [ ] **Step 10: Commit**

```bash
git add data/concepts data/migrations data/schema/rendered-question.schema.json src/logic/questionBank.js scripts/build_question_id_map.js tests/bank.test.js tests/track-contract.test.js
git commit -m "feat: assign stable content and question identifiers"
```

---

### Task 4: Introduce Learner State v2 and Neutral Storage Identity

**Files:**
- Create: `src/storage/identity.js`
- Create: `src/state/migrate.js`
- Create: `data/schema/state-v2.schema.json`
- Create: `tests/state-migration.test.js`
- Create: `tests/storage.api.test.js`
- Create: `tests/fixtures/state/current-exam-v2.json`
- Modify: `src/storage/browser.js`
- Modify: `src/storage/api.js`
- Modify: `src/storage/interface.js`
- Modify: `src/app.js`
- Modify: `feedback.html`
- Modify: `tests/storage.browser.test.js`
- Modify: `server/tests/test_api.py`
- Modify: `server/app/main.py`

**Interfaces:**
- Produces:
  - `getOrCreateAnonId() -> string`
  - `migrateState(raw, { anonId, questionIdMap, trackId, trackVersion, examProfileId, examProfileVersion }) -> StateV2`
  - storage key `learning-platform.state.v2`
  - identity key `learning-platform.anon-id.v1`
- Consumes: old keys `sdaia.state.v1`, `sdaia_adaptive_v3`, `sdaia.anon_id.v1`.

- [ ] **Step 1: Write migration tests for a current unfinished exam**

Create `tests/fixtures/state/current-exam-v2.json` with a representative old state:

```json
{
  "anon_id": "123e4567-e89b-42d3-a456-426614174000",
  "created_at": "2026-09-09T00:00:00Z",
  "updated_at": "2026-09-09T00:00:00Z",
  "examV2": {
    "lang": "en",
    "theme": "dark",
    "active": {
      "id": "exam-legacy",
      "mode": "full",
      "domain": null,
      "questionIds": ["q1", "q2"],
      "index": 1,
      "answers": {"q1": 0},
      "confidence": {"q1": "high"},
      "flags": {"q2": true},
      "optionOrders": {"q1": [0,1,2,3], "q2": [1,0,2,3]},
      "started_at": "2026-09-09T00:00:00Z",
      "submitted": false
    },
    "history": []
  }
}
```

Add `tests/state-migration.test.js` assertions that:
- result `version === 2`
- preferences are `en/dark`
- active exam lives under `tracks['sdaia-ai-engineer'].active_exam`
- `q1/q2` keys and values are remapped in `questionIds`, `answers`, `confidence`, `flags`, `optionOrders`
- source data is preserved under `legacy` when not represented canonically
- migration is idempotent when called twice.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/state-migration.test.js
```

Expected: FAIL because `src/state/migrate.js` does not exist.

- [ ] **Step 3: Implement shared identity**

Create `src/storage/identity.js`:

```js
export const ANON_KEY = 'learning-platform.anon-id.v1';
export const LEGACY_ANON_KEY = 'sdaia.anon_id.v1';

let memoryAnonId;

function defaultStorage() {
  try { return globalThis.localStorage; }
  catch { return null; }
}

export function getOrCreateAnonId(storage = defaultStorage()) {
  try {
    const existing = storage?.getItem?.(ANON_KEY) || storage?.getItem?.(LEGACY_ANON_KEY);
    if (existing) {
      storage?.setItem?.(ANON_KEY, existing);
      return existing;
    }
  } catch {}

  if (memoryAnonId) return memoryAnonId;
  const created = globalThis.crypto?.randomUUID?.();
  if (!created) throw new Error('crypto.randomUUID is required to create an anonymous identifier');
  memoryAnonId = created;
  try { storage?.setItem?.(ANON_KEY, created); } catch {}
  return created;
}
```

Use the same helper from browser, API, and interface code.

- [ ] **Step 4: Implement pure state migration**

Refactor the storage boundary so adapters load/save raw persisted state while the interface owns bootstrap/migration:

```js
// src/storage/interface.js
export async function loadState(context) {
  const raw = await adapter.loadState();
  const anonId = getOrCreateAnonId();
  const state = migrateState(raw, { anonId, ...context });
  await adapter.saveState(state);
  return state;
}
```

This is what closes the first-run API 404 identity bug: the interface and API adapter both use `getOrCreateAnonId()`.

Create `src/state/migrate.js` with helpers:

```js
function remapKeyedObject(value, map) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, item]) => [map[key] || key, item]));
}

function remapActiveExam(exam, map, meta) {
  if (!exam) return null;
  return {
    ...exam,
    track_id: meta.trackId,
    track_version: meta.trackVersion,
    exam_profile_id: meta.examProfileId,
    exam_profile_version: meta.examProfileVersion,
    questionIds: (exam.questionIds || []).map(id => map[id] || id),
    answers: remapKeyedObject(exam.answers, map),
    confidence: remapKeyedObject(exam.confidence, map),
    flags: remapKeyedObject(exam.flags, map),
    optionOrders: remapKeyedObject(exam.optionOrders, map)
  };
}

export function migrateState(raw, { anonId, questionIdMap, trackId, trackVersion, examProfileId, examProfileVersion }) {
  if (raw?.version === 2) return raw;

  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const exam = source.examV2 || {};
  const now = new Date().toISOString();

  return {
    version: 2,
    anon_id: source.anon_id || anonId,
    created_at: source.created_at || now,
    updated_at: source.updated_at || now,
    preferences: {
      lang: exam.lang === 'en' ? 'en' : 'ar',
      theme: exam.theme === 'dark' ? 'dark' : 'light'
    },
    tracks: {
      [trackId]: {
        track_version: trackVersion,
        active_exam: remapActiveExam(exam.active, questionIdMap, { trackId, trackVersion, examProfileId, examProfileVersion }),
        exam_history: Array.isArray(exam.history) ? exam.history : []
      }
    },
    legacy: {
      source_version: source.version ?? 1,
      preserved: Object.fromEntries(Object.entries(source).filter(([k]) => !['anon_id','created_at','updated_at','examV2'].includes(k)))
    }
  };
}
```

- [ ] **Step 5: Define state-v2 schema**

Create `data/schema/state-v2.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "state-v2.schema.json",
  "type": "object",
  "required": ["version", "anon_id", "created_at", "updated_at", "preferences", "tracks", "legacy"],
  "properties": {
    "version": { "const": 2 },
    "anon_id": { "type": "string", "format": "uuid" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "preferences": {
      "type": "object",
      "required": ["lang", "theme"],
      "properties": {
        "lang": { "enum": ["ar", "en"] },
        "theme": { "enum": ["light", "dark"] }
      },
      "additionalProperties": false
    },
    "tracks": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["track_version", "active_exam", "exam_history"],
        "properties": {
          "track_version": { "type": "string", "minLength": 1 },
          "active_exam": {
            "anyOf": [
              { "type": "null" },
              {
                "type": "object",
                "required": [
                  "id", "mode", "questionIds", "index", "answers", "confidence",
                  "flags", "optionOrders", "started_at", "submitted",
                  "track_id", "track_version", "exam_profile_id", "exam_profile_version"
                ],
                "properties": {
                  "id": { "type": "string", "minLength": 1 },
                  "mode": { "enum": ["full", "section"] },
                  "domain": { "type": ["string", "null"] },
                  "questionIds": { "type": "array", "items": { "type": "string", "minLength": 1 }, "uniqueItems": true },
                  "index": { "type": "integer", "minimum": 0 },
                  "answers": { "type": "object", "additionalProperties": { "type": "integer", "minimum": 0, "maximum": 3 } },
                  "confidence": { "type": "object", "additionalProperties": { "enum": ["low", "medium", "high"] } },
                  "flags": { "type": "object", "additionalProperties": { "type": "boolean" } },
                  "optionOrders": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "array", "minItems": 4, "maxItems": 4, "uniqueItems": true,
                      "items": { "type": "integer", "minimum": 0, "maximum": 3 }
                    }
                  },
                  "started_at": { "type": "string", "format": "date-time" },
                  "submitted": { "type": "boolean" },
                  "submitted_at": { "type": "string", "format": "date-time" },
                  "track_id": { "type": "string", "minLength": 1 },
                  "track_version": { "type": "string", "minLength": 1 },
                  "exam_profile_id": { "type": "string", "minLength": 1 },
                  "exam_profile_version": { "type": "string", "minLength": 1 }
                },
                "additionalProperties": false
              }
            ]
          },
          "exam_history": { "type": "array", "items": { "type": "object" } }
        },
        "additionalProperties": false
      }
    },
    "legacy": {
      "type": "object",
      "required": ["source_version", "preserved"],
      "properties": {
        "source_version": { "type": ["integer", "string"] },
        "preserved": { "type": "object" }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 6: Make browser storage read canonical key first, old keys second**

In `src/storage/browser.js` use:

```js
const STATE_KEY = 'learning-platform.state.v2';
const LEGACY_STATE_KEYS = ['sdaia.state.v1', 'sdaia_adaptive_v3'];
```

On first successful migration, write the canonical key but **do not delete** old keys in Programme A. That leaves a rollback path.

The browser adapter's `loadState()` returns the first available raw JSON object; it does not invent a second anonymous ID. The interface performs migration and persists the canonical state.

- [ ] **Step 7: Fix first-run API identity mismatch**

Write `tests/storage.api.test.js` with a fake localStorage and fake fetch:
- first GET `/progress/<id>` returns 404
- `loadState()` returns or bootstraps using that same `id`
- first `saveState()` sends the same path/header ID and succeeds.

Refactor `src/storage/api.js` to use `getOrCreateAnonId()` instead of its private `anonId()`.

Add a second test where access to `localStorage` throws; the identity helper must use one stable in-memory UUID for the session rather than creating a different ID on each call.

- [ ] **Step 8: Update the app to load migration context and pin every new attempt**

After `BANK=await loadBank()`, load the frozen ID map and call:

```js
state = await loadState({
  questionIdMap,
  trackId: BANK.track.id,
  trackVersion: BANK.track.version,
  examProfileId: BANK.exam_profile.id,
  examProfileVersion: BANK.exam_profile.version
});
```

When `createExam()` creates a new attempt, include:

```js
track_id: BANK.track.id,
track_version: BANK.track.version,
exam_profile_id: BANK.exam_profile.id,
exam_profile_version: BANK.exam_profile.version,
```

Stable `questionIds` plus persisted `optionOrders` then make the attempt reconstructable for Programme A.

Update the app to use state v2 locations:

Replace direct `state.examV2` access with helpers local to `src/app.js`:

```js
const TRACK_ID = 'sdaia-ai-engineer';
function trackState() { return state.tracks[TRACK_ID]; }

function save() {
  state.preferences.lang = lang;
  state.preferences.theme = document.documentElement.dataset.theme || 'light';
  trackState().active_exam = activeExam;
  state.updated_at = new Date().toISOString();
  void saveState(state);
}
```

History writes become `trackState().exam_history`.

- [ ] **Step 9: Migrate feedback-page preference reads/writes to the neutral state key**

In `feedback.html`, read `learning-platform.state.v2` first and fall back to `sdaia.state.v1`. For a v2 state, read/write `preferences.lang` and `preferences.theme`; for an old state, keep the existing `examV2.lang/theme` fallback. Do not delete the old key.

- [ ] **Step 10: Make server validation accept state v2**

Point the server's active state validator to `state-v2.schema.json`.

Keep the server explicitly documented/tested as dev/test scaffolding; do not add production auth here.

- [ ] **Step 11: Run state, browser-storage, API, and server tests**

```bash
node --test tests/state-migration.test.js tests/storage.browser.test.js tests/storage.api.test.js
PYTHONPATH=server pytest -q server/tests
```

Expected: all pass, including first-run API 404→save.

- [ ] **Step 12: Commit**

```bash
git add src/state src/storage src/app.js data/schema/state-v2.schema.json tests/state-migration.test.js tests/storage.api.test.js tests/storage.browser.test.js tests/fixtures/state server
git commit -m "feat: migrate learner state to versioned neutral storage"
```

---

### Task 5: Make Browser and API Use One Runtime Bundle Contract

**Files:**
- Create: `data/schema/runtime-bundle.schema.json`
- Create: `src/content/runtimeBundle.js`
- Modify: `src/storage/browser.js`
- Modify: `src/storage/api.js`
- Modify: `src/storage/interface.js`
- Modify: `server/app/main.py`
- Modify: `api/openapi.yaml`
- Modify: `scripts/contract_test.js`
- Modify: `server/tests/test_api.py`
- Modify: `tests/track-contract.test.js`

**Interfaces:**
- Produces identical `RuntimeBundleV2` from browser and API:
```ts
{
  contract_version: 2,
  track: TrackManifestV1,
  exam_profile: ExamProfileV1,
  concepts: Record<string, Concept[]>,
  learn: object,
  cases: object[]
}
```
- Removes active reliance on the old static 121-question bank.

- [ ] **Step 1: Write a failing browser/API equivalence contract test**

Update `scripts/contract_test.js` so both adapters must satisfy:

```js
assert.equal(bank.contract_version, 2);
assert.equal(bank.track.id, 'sdaia-ai-engineer');
assert.equal(bank.exam_profile.id, bank.track.default_exam_profile);
assert.equal(expandConceptBank(bank.concepts, { trackId: bank.track.id }).length, 1120);
assert.deepEqual(Object.keys(bank.exam_profile.weights), Object.keys(bank.concepts));
```

Remove the old branch:

```js
if(adapterName==='browser') ... else assert.ok(bank.questions.length>=121)
```

- [ ] **Step 2: Run contract tests and verify API failure**

Run browser contract, start the test server, then run API contract as CI does.

Expected: browser/API test fails because current API returns `questions` while browser returns `concepts`.

- [ ] **Step 3: Implement browser runtime bundle loading**

Create `data/schema/runtime-bundle.schema.json` first:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "runtime-bundle.schema.json",
  "type": "object",
  "required": ["contract_version", "track", "exam_profile", "concepts", "learn", "cases"],
  "properties": {
    "contract_version": { "const": 2 },
    "track": { "$ref": "track-manifest.schema.json" },
    "exam_profile": { "$ref": "exam-profile.schema.json" },
    "concepts": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": { "type": "array" }
    },
    "learn": { "type": "object" },
    "cases": { "type": "array" }
  },
  "additionalProperties": false
}
```

Create `src/content/runtimeBundle.js`:

```js
export async function loadRuntimeBundle(fetchJson, trackId = 'sdaia-ai-engineer') {
  const manifest = await fetchJson(`./tracks/${trackId}/manifest.json`);
  const examProfiles = await Promise.all(manifest.exam_profiles.map(fetchJson));
  const examProfile = examProfiles.find(x => x.id === manifest.default_exam_profile);
  if (!examProfile) throw new Error(`Missing exam profile ${manifest.default_exam_profile}`);

  const conceptDocs = await Promise.all(manifest.content.concept_files.map(fetchJson));
  return {
    contract_version: 2,
    track: manifest,
    exam_profile: examProfile,
    concepts: Object.fromEntries(conceptDocs.map(doc => [doc.domain, doc.concepts])),
    learn: await fetchJson(manifest.content.learn),
    cases: await fetchJson(manifest.content.cases)
  };
}
```

`browser.loadBank()` calls this function with its existing no-cache fetch helper.

- [ ] **Step 4: Make the server return the same bundle**

In `server/app/main.py`, add a server-side `load_runtime_bundle(track_id='sdaia-ai-engineer')` that reads the same manifest/profile/content references and returns the same keys.

Change `GET /v1/bank` to return that canonical public bundle. Because this repository states the backend is not deployed, this is a pre-production contract correction; document it in `MIGRATIONS.md`.

- [ ] **Step 5: Correct OpenAPI semantics around the anonymous identifier**

In `api/openapi.yaml`:
- stop describing `X-Anon-Id` as authentication/security;
- rename the reusable parameter description to clearly say “client-generated anonymous identifier; not authentication”;
- remove `security: [{ AnonId: [] }]` from public bank and other endpoints unless/until real authentication exists;
- make `/bank` response reference `runtime-bundle.schema.json`.

- [ ] **Step 6: Run equivalence tests**

```bash
node scripts/contract_test.js browser
PYTHONPATH=server DB_URL=sqlite:///./contract-ci.db python -m uvicorn app.main:app --app-dir server --host 127.0.0.1 --port 8000 &
pid=$!
trap 'kill "$pid"' EXIT
SDAIA_API_BASE=http://127.0.0.1:8000/v1 node scripts/contract_test.js api
PYTHONPATH=server pytest -q server/tests
```

Expected: browser and API pass the same contract.

- [ ] **Step 7: Commit**

```bash
git add data/schema/runtime-bundle.schema.json src/content src/storage server api scripts/contract_test.js tests/track-contract.test.js
git commit -m "fix: unify browser and API runtime bundle contracts"
```

---

### Task 6: Drive Exam Behaviour From the Exam Profile

**Files:**
- Modify: `src/app.js`
- Modify: `src/logic/exam.js`
- Modify: `index.html`
- Modify: `tests/exam.test.js`
- Modify: `scripts/browser_smoke.py`
- Modify: `scripts/validate.js`

**Interfaces:**
- Consumes: `BANK.exam_profile.question_count`, `section_sizes`, `weights`.
- Produces: no hard-coded 200/seven-domain assumptions in runtime selection/UI/tests.

- [ ] **Step 1: Rewrite exam tests to consume the profile fixture**

In `tests/exam.test.js`, load the canonical track via `loadTrack` and define:

```js
const total = examProfile.question_count;
const weights = examProfile.weights;
```

Replace test names/assertions tied to literal 200 with profile-driven equivalents.

For displayed correct-answer positions, assert general balance:

```js
assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, counts.join(','));
```

Also keep an explicit compatibility assertion that the current profile is 200 through the profile fixture, not through algorithm code.

- [ ] **Step 2: Make missing total an error instead of a hidden default**

Change:

```js
export function sampleWeightedExam(questions, weights, total = 200, rng = Math.random)
```

to:

```js
export function sampleWeightedExam(questions, weights, total, rng = Math.random) {
  if (!Number.isInteger(total) || total < 1) throw new Error('Exam total must be a positive integer');
  // existing allocation logic
}
```

- [ ] **Step 3: Use the profile in the app**

After bundle load:

```js
const PROFILE = BANK.exam_profile;
WEIGHTS = PROFILE.weights;
```

Use `PROFILE.question_count` in:
- allocation
- full-exam sampling
- home text
- start button
- any counter assumptions.

Build section-size select options from `PROFILE.section_sizes`, preserving `all`.

- [ ] **Step 4: Make translated strings dynamic**

Replace `weighted200` / `startFull` static strings with functions, for example:

```js
weightedExam: n => `اختبار كامل — ${n} سؤال موزون`,
startFull: n => `ابدأ اختبار ${n} سؤال`,
```

and equivalent English functions.

`weightedDesc` receives the actual number of domains instead of saying “seven”.

- [ ] **Step 5: Remove hard-coded initial HTML copy**

In `index.html`, keep neutral boot text such as:

```html
<h2 id="fullExamTitle">الاختبار الكامل</h2>
<button class="btn primary" id="startFullBtn">ابدأ الاختبار</button>
```

The app fills the profile-specific count after bundle load.

- [ ] **Step 6: Make browser smoke read expected values from manifest/profile**

In `scripts/browser_smoke.py`, read the profile JSON before browser launch:

```python
PROFILE = json.load(open(os.path.join(ROOT, 'tracks', 'sdaia-ai-engineer', 'exam-profiles', 'project-reference-v1.json'), encoding='utf-8'))
EXPECTED_FULL = PROFILE['question_count']
```

Read expected bank count from `tests/fixtures/runtime/current-bank-counts.expected.json` for Programme A compatibility. Do not embed `1120` or `200` as Python literals in assertions.

- [ ] **Step 7: Run exam + browser tests**

```bash
node --test tests/exam.test.js
node scripts/validate.js
python3 scripts/browser_smoke.py
```

Expected: current public behaviour remains a 200-question full exam because the profile says 200, not because code says 200.

- [ ] **Step 8: Commit**

```bash
git add src/app.js src/logic/exam.js index.html tests/exam.test.js scripts/browser_smoke.py scripts/validate.js
git commit -m "refactor: drive exam behaviour from versioned profile"
```

---

### Task 7: Fix Service Worker Registration and Replace Whole-Bank Precache Assumptions

**Files:**
- Create: `src/registerServiceWorker.js`
- Modify: `src/app.js`
- Modify: `sw.js`
- Modify: `src/storage/browser.js`
- Modify: `index.html`
- Modify: `scripts/verify_sw_assets.js`
- Create: `tests/service-worker-contract.test.js`

**Interfaces:**
- Produces shell precache + runtime on-demand caching.
- Removes broken inline-bank fallback.
- Guarantees SW registration is scheduled synchronously before asynchronous bank loading.

- [ ] **Step 1: Write failing service-worker contract tests**

Create `tests/service-worker-contract.test.js` that reads `sw.js` and asserts:

```js
test('service worker shell does not pre-cache concept-bank chunks', () => {
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.doesNotMatch(sw, /\.\/data\/concepts\//);
  assert.doesNotMatch(sw, /sdaia-ai-pages-v8/);
});

test('app imports synchronous service-worker registration helper', () => {
  const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /registerServiceWorker/);
});

test('non-navigation cache misses do not fall back to index html', () => {
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /event\.request\.mode\s*===\s*['"]navigate['"]/);
  assert.match(sw, /Response\.error\(\)/);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/service-worker-contract.test.js
```

Expected: FAIL on current concept precache / v8 cache name.

- [ ] **Step 3: Register before asynchronous init**

Create `src/registerServiceWorker.js`:

```js
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const register = () => navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => {
    console.warn('Service worker registration failed', error);
  });
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
```

At module evaluation time in `src/app.js`:

```js
import { registerServiceWorker } from './registerServiceWorker.js';
registerServiceWorker();
```

Delete SW registration from the end of async `init()`.

- [ ] **Step 4: Reduce precache to shell + canonical manifests**

The shell list must include every module needed to bootstrap without a network after a previously successful update, including `src/state/migrate.js`, `src/storage/identity.js`, `src/content/runtimeBundle.js`, and the frozen question-ID migration map. It may include the active manifest/profile because these are configuration, not the question bank.

`sw.js` shell `ASSETS` should include:
- `./`
- `index.html`
- `feedback.html`
- manifest/icons
- app modules
- `tracks/sdaia-ai-engineer/manifest.json`
- default exam profile

Do **not** list concept files, the future whole bank, or all track chunks.

Keep same-origin GET runtime caching so successful network responses for concept/content chunks become available offline after first use.

Do **not** fall back to `index.html` for missing JSON/JS/data requests. The offline fallback is navigation-only:

```js
event.respondWith(
  fetch(event.request)
    .then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    })
    .catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    })
);
```

- [ ] **Step 5: Remove the unusable inline bank**

Delete `#inline-bank` from `index.html`.

In browser storage, remove `inlineBank()`. For `file:` protocol throw a clear message:

```js
if (protocol === 'file:') {
  throw new Error('Run the study site through HTTP so track content can be loaded.');
}
```

For HTTPS/HTTP, let the service worker satisfy cached fetches; if no network/cache exists, surface the existing load error rather than pretending an empty bank is usable.

- [ ] **Step 6: Update SW asset verification**

`scripts/verify_sw_assets.js` must verify:
- every shell asset named in `ASSETS` exists in the Pages artifact;
- no `data/concepts/` path is in the precache list;
- the canonical track manifest/profile are present.

It must not assert a literal cache name such as `v8`.

- [ ] **Step 7: Run SW, browser, and offline-recovery checks**

```bash
node --test tests/service-worker-contract.test.js
node scripts/verify_sw_assets.js .
python3 scripts/browser_smoke.py
```

Add one browser-smoke sequence after an initial successful load: reload after the content responses are cached and verify the home still renders. If WebDriver network-offline emulation is unavailable in the current harness, stop the local HTTP server only after a controlled page/cache setup and test the cached navigation; do not claim offline coverage unless the test actually reproduces it.

- [ ] **Step 8: Commit**

```bash
git add src/registerServiceWorker.js src/app.js src/storage/browser.js index.html sw.js scripts/verify_sw_assets.js tests/service-worker-contract.test.js scripts/browser_smoke.py
git commit -m "fix: make offline shell and service worker migration safe"
```

---

### Task 8: Repair Feedback Submission Without Losing Typed Content

**Files:**
- Read: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/ISSUE_TEMPLATE/public-feedback.md`
- Modify: `feedback.html`
- Modify: `scripts/browser_smoke.py`
- Create: `tests/feedback-contract.test.js`

**Interfaces:**
- Produces a usable GitHub issue URL that preserves form title/body.
- Keeps structured issue forms available for users who enter through GitHub directly.

- [ ] **Step 1: Write the failing contract test**

Create `tests/feedback-contract.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = fs.readFileSync(new URL('../.github/ISSUE_TEMPLATE/config.yml', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../feedback.html', import.meta.url), 'utf8');

test('feedback page uses a defined template while blank issues remain disabled', () => {
  assert.match(config, /blank_issues_enabled:\s*false/);
  assert.match(page, /template:\s*['"]public-feedback\.md['"]/);
  assert.match(page, /issues\/new\?\$\{p\.toString\(\)\}/);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/feedback-contract.test.js
```

Expected: FAIL because the public page currently opens the generic issue path without a template.

- [ ] **Step 3: Add a dedicated Markdown issue template without enabling blank issues**

Keep `.github/ISSUE_TEMPLATE/config.yml` at:

```yaml
blank_issues_enabled: false
```

Create `.github/ISSUE_TEMPLATE/public-feedback.md`:

```markdown
---
name: Public feedback submission
about: Template used by the public feedback page to preserve prefilled title/body content
title: ''
labels: ''
assignees: ''
---

<!-- This template is normally opened by feedback.html with a prefilled body. Do not include personal, confidential, or sensitive information. -->
```

This gives the public page an allowed template path while keeping arbitrary blank issues disabled.

- [ ] **Step 4: Route the page through the defined template and keep the public-warning copy**

Change the helper in `feedback.html` to:

```js
function issue(title, body) {
  const p = new URLSearchParams({ template: 'public-feedback.md', title, body });
  window.open(
    `https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?${p.toString()}`,
    '_blank',
    'noopener'
  );
}
```

Keep the current public-warning copy and add no promise of private feedback.

- [ ] **Step 5: Extend browser smoke**

Assert that all three form submission handlers resolve to a URL beginning:

```text
https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?
```

and that the encoded URL includes the typed title/body text before opening the new tab.

- [ ] **Step 6: Run tests**

```bash
node --test tests/feedback-contract.test.js
python3 scripts/browser_smoke.py
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add .github/ISSUE_TEMPLATE/public-feedback.md feedback.html tests/feedback-contract.test.js scripts/browser_smoke.py
git commit -m "fix: preserve public feedback submissions"
```

---

### Task 9: Quarantine Legacy Content and Remove Active Dead Paths

**Files:**
- Create: `data/legacy/static-bank-v1/README.md`
- Move: `data/questions.json` → `data/legacy/static-bank-v1/questions.json`
- Move: `data/sessions.json` → `data/legacy/static-bank-v1/sessions.json`
- Remove after reference scan: `data/weights.json`
- Remove/replace: `data/schema/question.schema.json`, `data/schema/session.schema.json`, `data/schema/bank.schema.json`
- Remove after reference scan: `src/logic/conceptFiles.js`
- Remove after reference scan: `scripts/load_concepts.js`
- Remove: `scripts/verify_release.py`
- Remove after reference scan: `src/logic/mastery.js`, `src/logic/readiness.js`, `src/logic/review.js`, `src/logic/mission.js`
- Remove corresponding disconnected legacy tests after their current behaviour has been recorded in Git history
- Modify: `scripts/validate.js`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/server-tests.yml`

**Interfaces:**
- Produces no active-looking competing bank/schema/learner-logic source.
- Preserves unique 121-question content explicitly for later semantic migration.

- [ ] **Step 1: Add a no-active-legacy-reference test before moving files**

Create a test in `tests/track-contract.test.js` that scans active runtime files and fails if they reference:
- `data/questions.json`
- `data/sessions.json`
- `data/weights.json`
- `src/logic/conceptFiles.js`
after the migration is complete.

Run now and expect FAIL until later steps remove those references.

- [ ] **Step 2: Write the legacy disposition README**

Create `data/legacy/static-bank-v1/README.md` with explicit classification:

```markdown
# Static Bank v1 — Legacy Migration Input

Status: MIGRATE_PENDING  
Runtime: NOT ACTIVE  
Source: former data/questions.json + data/sessions.json  
Reason retained: contains unique authored training content that has not yet been semantically mapped into the vNext competency/objective/question-family model.

Rules:
- do not load this directory in the learner runtime;
- do not count these 121 items toward the current 1,120 foundation runtime;
- do not publish them as official SDAIA questions;
- Programme G/content migration must review, map, deduplicate, and either migrate or retire each useful item;
- Git history remains the source for prior code/schema behaviour.
```

- [ ] **Step 3: Move the 121 bank and sessions**

Use `git mv`:

```bash
mkdir -p data/legacy/static-bank-v1
git mv data/questions.json data/legacy/static-bank-v1/questions.json
git mv data/sessions.json data/legacy/static-bank-v1/sessions.json
```

No runtime code may reference the new legacy directory.

- [ ] **Step 4: Delete weights only after manifest/profile consumers are green**

Search:

```bash
git grep -n "data/weights.json\|weights.json"
```

Expected remaining references: documentation/legacy history only. Then remove `data/weights.json`.

- [ ] **Step 5: Remove old active schemas and stale release preflight**

After `runtime-bundle.schema.json`, `rendered-question.schema.json`, and `state-v2.schema.json` are active, remove:
- old question/session/bank schemas
- `scripts/verify_release.py`

Update any schema registry/tests so only active schemas are considered runtime contracts.

- [ ] **Step 6: Remove disconnected learner logic from active runtime**

Run:

```bash
git grep -n "mastery.js\|readiness.js\|review.js\|mission.js"
```

If only their own tests reference them, delete those four modules and tests. Do not rewrite them into the new learner engine in Programme A; that belongs to Programme C.

- [ ] **Step 7: Remove concept-file hard-code helper**

Once manifest-based loading is used everywhere, remove `src/logic/conceptFiles.js` and `scripts/load_concepts.js`.

- [ ] **Step 8: Run full Node/server validation**

```bash
npm test
node scripts/validate.js
PYTHONPATH=server pytest -q server/tests
node scripts/contract_test.js browser
```

Expected: PASS and no active runtime reference to the legacy static bank.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: remove competing legacy runtime paths"
```

---

### Task 10: Make CI and Pages Validation Manifest-Driven

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/pages.yml`
- Modify: `.github/workflows/server-tests.yml`
- Modify: `scripts/validate.js`
- Modify: `scripts/verify_sw_assets.js`
- Create: `scripts/verify_live_release.js`
- Modify: `package.json`

**Interfaces:**
- Consumes canonical manifest/profile.
- Produces one repeatable release gate with no duplicated 1,120/200/seven-domain/cache-v8 constants.

- [ ] **Step 1: Add named package scripts without new dependencies**

Update `package.json`:

```json
{
  "scripts": {
    "test": "node --test tests/*.test.js",
    "validate": "node scripts/validate.js",
    "verify:sw": "node scripts/verify_sw_assets.js ."
  }
}
```

Preserve existing devDependencies unchanged.

- [ ] **Step 2: Make CI call named scripts**

`.github/workflows/ci.yml` should run:

```yaml
- name: Validate canonical track contracts
  run: npm run validate
- name: Run Node tests
  run: npm test
- name: Browser smoke test
  run: python3 scripts/browser_smoke.py
```

- [ ] **Step 3: Publish the `tracks/` directory**

In Pages artifact build, include:

```bash
cp -R src tracks _site/
mkdir -p _site/data
cp -R data/concepts data/migrations _site/data/
cp data/learn.json data/cases.json _site/data/
```

Keep shell files/icons as today.

- [ ] **Step 4: Replace live hard-coded concept/cache verification**

Create `scripts/verify_live_release.js` accepting base URL and using the live manifest/profile:

```js
const base = process.argv[2].replace(/\/$/, '');
const get = async p => {
  const r = await fetch(`${base}/${p.replace(/^\.\//,'')}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
  return r.json();
};

const manifest = await get('tracks/sdaia-ai-engineer/manifest.json');
const profilePath = manifest.exam_profiles.find(p => p.endsWith('project-reference-v1.json'));
const profile = await get(profilePath);
if (profile.id !== manifest.default_exam_profile) throw new Error('Default profile mismatch');
for (const p of manifest.content.concept_files) await get(p);
console.log(`live track manifest: PASS ${manifest.id}@${manifest.version}`);
```

The Pages workflow runs this script against `${PAGE_URL}` after deployment. Remove:
- hard-coded seven concept filenames
- `20` concept-per-file arithmetic
- generated `>=1000` shell arithmetic
- `grep "sdaia-ai-pages-v8"`.

- [ ] **Step 5: Keep server tests as a separate gate**

`server-tests.yml` continues to run:
- server tests
- DB smoke
- browser adapter contract
- API adapter contract

but now both contract tests assert RuntimeBundleV2.

- [ ] **Step 6: Run workflow-equivalent commands locally**

```bash
npm ci --ignore-scripts
npm run validate
npm test
node --check src/app.js
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
node scripts/contract_test.js browser
```

Then run the API contract with local uvicorn as in CI.

Expected: every local equivalent passes.

- [ ] **Step 7: Commit**

```bash
git add package.json .github/workflows scripts
git commit -m "ci: derive release checks from canonical manifests"
```

---

### Task 11: Document the New Baseline and Governance

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Create: `ARCHITECTURE.md`
- Create: `MIGRATIONS.md`
- Create: `TESTING.md`
- Create: `DEPLOYMENT.md`
- Create: `DATA-MODEL.md`
- Create: `SECURITY.md`
- Create: `HANDOFF.md`
- Create: `CHANGELOG.md`
- Create: `docs/decisions/0001-canonical-track-runtime-contract.md`
- Create: `docs/decisions/0002-neutral-storage-namespace.md`
- Create: `docs/decisions/0003-public-vs-protected-content-boundary.md`
- Create: `docs/decisions/0004-legacy-static-bank-disposition.md`

**Interfaces:**
- Produces current-truth documentation and zero-tribal-knowledge handoff for Programme A.
- Records decisions without claiming future programmes are already implemented.

- [ ] **Step 1: Update README current facts from the manifest/profile**

README should say the current track still exposes 1,120 foundation practice items and a 200-question project-reference full exam **as current implementation facts**, while clearly separating that from the 14,000+ future target.

It must retain the independent/unofficial statement.

- [ ] **Step 2: Document architecture boundaries**

`ARCHITECTURE.md` must describe:
- browser shell
- canonical track manifest/profile
- current generated foundation bank
- browser/API identical runtime bundle
- state v2/storage migration
- public static content
- future protected-content boundary as not yet implemented.

- [ ] **Step 3: Document migrations**

`MIGRATIONS.md` must include:
- `sdaia.state.v1` → `learning-platform.state.v2`
- `sdaia.anon_id.v1` → `learning-platform.anon-id.v1`
- generated `q1..q1120` → stable IDs
- legacy static 121 bank disposition
- rollback tag `pre-programme-a-2026-09-23`
- explicit statement that old browser keys are read but not deleted in Programme A.

- [ ] **Step 4: Document deployment and active data contracts**

`DEPLOYMENT.md` documents the GitHub Pages artifact contents, validation/deploy workflow, rollback tag strategy, service-worker/cache recovery, and optional dev/test API startup. It explicitly says `data/legacy/` is not part of the Pages artifact.

`DATA-MODEL.md` documents the implemented Programme A objects only: TrackManifestV1, ExamProfileV1, RuntimeBundleV2, stable rendered-question identity, the legacy-ID map, and StateV2. Future question-family/learner-engine schemas remain in the architecture spec until their programmes are implemented.

`CHANGELOG.md` starts with an Unreleased Programme A entry and does not claim deployment until the implementation is merged/released.

- [ ] **Step 5: Document testing and release gates**

`TESTING.md` lists exact commands:

```bash
npm ci --ignore-scripts
npm run validate
npm test
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
```

plus API contract startup/run commands.

- [ ] **Step 6: Document security truthfully**

`SECURITY.md` must say:
- anonymous UUID is not authentication;
- current FastAPI/SQLite/in-process rate limit is dev/test scaffolding;
- public browser-shipped questions are public;
- protected-bank architecture is future work;
- no confidential/leaked exam questions;
- report secrets/security issues without putting credentials into public issues.

- [ ] **Step 7: Create handoff and ADRs**

`HANDOFF.md` gives a new maintainer:
- start/run/test/deploy commands
- canonical files
- what is legacy
- what is not yet implemented
- how to add a new track **conceptually** without claiming Programme B is built
- recovery baseline/tag
- current known evidence gap for official exam weights.

ADRs record the four decisions listed in the file section.

- [ ] **Step 8: Update contribution rules**

Add:
- stable IDs are immutable once active;
- exam rules live in exam profiles, not code;
- sources/evidence status required for changing claims;
- no new hard-coded track constants in core code;
- no active legacy path without an explicit disposition.

- [ ] **Step 9: Add repository-governance guidance without blindly locking the owner out**

Document target policy:
- CI required before merge;
- risky migrations require review;
- tags identify production baselines;
- enable branch protection when the owner's workflow is confirmed;
- add CODEOWNERS when multiple maintainers exist.

Do not change GitHub branch protection in this task unless separately approved during execution.

- [ ] **Step 9: Commit**

```bash
git add README.md CONTRIBUTING.md ARCHITECTURE.md MIGRATIONS.md TESTING.md DEPLOYMENT.md DATA-MODEL.md SECURITY.md HANDOFF.md CHANGELOG.md docs/decisions
git commit -m "docs: document stabilised platform baseline and handoff"
```

---

### Task 12: Whole-Branch Verification and Programme A Acceptance Gate

**Files:**
- No planned product-code creation.
- Modify only if verification exposes a defect attributable to Tasks 1–11.
- Update: `docs/superpowers/reviews/<programme-a-final-review>.md` only after implementation, not during plan writing.

**Interfaces:**
- Consumes all previous Programme A tasks.
- Produces evidence that the implementation matches this plan and the architecture spec.

- [ ] **Step 1: Run the complete fresh verification suite**

```bash
npm ci --ignore-scripts
npm run validate
npm test
node --check src/app.js
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
node scripts/contract_test.js browser
```

Start uvicorn exactly as CI does and run:

```bash
SDAIA_API_BASE=http://127.0.0.1:8000/v1 node scripts/contract_test.js api
```

Expected: zero failures.

- [ ] **Step 2: Verify no old active runtime contract remains**

Run:

```bash
git grep -n "data/questions.json\|data/sessions.json\|data/weights.json\|sdaia-ai-pages-v8" -- ':!docs/**' || true
git grep -n "sdaia.state.v1\|sdaia.anon_id.v1" src feedback.html
```

Expected:
- no active runtime reference to old data files/cache version;
- old storage keys appear only in explicit migration/fallback code.

- [ ] **Step 3: Verify hard-coded profile constants are isolated**

Run:

```bash
git grep -n "1120\|200-question\|200 سؤال\|seven domains\|المجالات السبعة" -- src scripts tests .github index.html feedback.html || true
```

Expected:
- no algorithm/release-gate dependency on those literals;
- compatibility fixtures/docs may still state current values.

- [ ] **Step 4: Verify schema and manifest integrity**

Run:

```bash
npm run validate
node --test tests/track-contract.test.js tests/state-migration.test.js
```

Expected: canonical manifest/profile/bundle/state contracts all pass.

- [ ] **Step 5: Verify repository diff against the baseline tag**

Run:

```bash
git diff --stat pre-programme-a-2026-09-23...HEAD
git diff --name-status pre-programme-a-2026-09-23...HEAD
```

Review every deletion/move against the Programme A disposition. No unexplained content loss is acceptable.

- [ ] **Step 6: Request code review using Superpowers**

Invoke `superpowers:requesting-code-review` against:
- BASE_SHA = `pre-programme-a-2026-09-23`
- HEAD_SHA = current implementation head
- requirements = this plan + vNext design spec

Fix all Critical/Important findings before proceeding.

If independent reviewer capability is unavailable, record that limitation explicitly rather than claiming an independent approval.

- [ ] **Step 7: Re-run the full suite after review fixes**

Repeat Step 1 after all accepted review fixes.

Expected: zero failures after the final changes.

- [ ] **Step 8: Record the final Programme A verification**

Create `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md` containing:
- exact HEAD SHA
- exact commands run
- pass/fail counts
- remaining known gaps
- confirmation that 14,000+ generation has **not** begun
- confirmation that official SDAIA weights remain unverified unless new primary evidence was obtained.

- [ ] **Step 9: Commit the final verification record**

```bash
git add docs/superpowers/reviews/2026-09-23-programme-a-final-review.md
git commit -m "docs: record Programme A verification"
```

---

## Programme A Exit Criteria

Programme A is complete only when all of these are evidenced, not merely claimed:

1. Browser and API use one RuntimeBundleV2 contract.
2. The active 1,120 foundation items have stable IDs independent of array order.
3. Current browser progress migrates to state v2 without losing an unfinished exam.
4. First-run API identity/bootstrap mismatch is fixed.
5. Exam count/weights/section sizes come from the profile, not runtime literals.
6. Current weights are labelled `project-reference-unverified`, not official.
7. The 121-question bank is outside the active runtime and retained only as an explicit migration input.
8. Old state keys are migration inputs only; canonical writes use the neutral namespace.
9. Broken inline fallback is removed and service-worker registration is race-safe.
10. Whole-bank/question-chunk precaching is absent.
11. Feedback typed content reaches the defined `public-feedback.md` GitHub issue template while blank issues remain disabled.
12. CI/Pages verification is manifest-driven, not tied to 1,120/200/seven files/cache-v8 constants.
13. Stale active schemas/scripts/dead learner-logic paths are removed after reference verification.
14. Current public learner behaviour passes browser smoke in Arabic/English, theme, resume, confidence, domain/full exam, navigation, results/review.
15. Current docs describe current truth and explicitly distinguish implemented Programme A from future Programmes B–H.
16. Final verification and review records exist with no unresolved Critical/Important findings.
