import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exists = path => fs.existsSync(new URL(path, import.meta.url));

test('canonical governance files are present on the current branch', () => {
  for (const path of [
    '../docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md',
    '../docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md',
    '../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md'
  ]) {
    assert.equal(exists(path), true, path);
  }
});

test('learning outcomes outrank engagement mechanics without making retrieval dogma', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /learning, retention, transfer, readiness/i);
  assert.match(doc, /gamification.*secondary|secondary.*gamification/i);
  assert.match(doc, /MUST NOT.*retrieval/i);
  assert.match(doc, /universally optimal/i);
});

test('AI tutor rules require grounded, optional, scaffolded help', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /canonical content|canonical track/i);
  assert.match(doc, /deterministic.*manual|manual.*deterministic/i);
  assert.match(doc, /abstain|abstention/i);
  assert.match(doc, /scaffold|hint/i);
});

test('AI content activation requires the staged quality pipeline', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.ok(doc.includes('Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire'));
  assert.match(doc, /never.*single generation step|must not.*single generation step/i);
});

test('question scale stays separate from quality and empirical behavior', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /14,000\+.*future|future.*14,000\+/i);
  for (const phrase of ['intended difficulty','observed difficulty','learning value','exam representativeness']) assert.ok(doc.includes(phrase), phrase);
});

test('psychometric claims wait for real response data and remain versioned', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /no psychometric calibration claim.*real response data/i);
  assert.match(doc, /versioned calibration/i);
  assert.match(doc, /raw learner evidence/i);
});

test('learner analytics answer where, what next, and why with uncertainty', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  for (const q of ['Where am I now?','What should I do next?','Why is that the recommended next action?']) assert.ok(doc.includes(q), q);
  assert.match(doc, /uncertainty.*weak evidence|weak evidence.*uncertainty/i);
});

test('AI transformations preserve source control and community reports stay signals', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /preserve.*user-authored|preserve.*source material/i);
  assert.match(doc, /AI.*disabled|disable.*AI/i);
  assert.match(doc, /generated.*label|label.*generated/i);
  assert.match(doc, /community.*signals.*not prevalence|signals.*not prevalence/i);
});

test('material redesigns measure learner-path friction', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  for (const metric of ['time-to-start-learning','actions-to-resume','actions-to-weak-topic','actions-to-exam','mobile/RTL','recovery after refresh/offline interruption']) assert.ok(doc.includes(metric), metric);
});

test('reliability offline mobile and accessibility are release quality', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /release-quality.*reliability.*offline.*mobile.*accessibility/i);
  assert.match(doc, /WCAG 2\.2/);
});

test('personalization avoids content overload', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /smallest.*next learning action/i);
  assert.match(doc, /progressive disclosure/i);
});

test('evidence discipline preserves source classes and current SDAIA uncertainty', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  for (const phrase of ['official/primary evidence','independent research','implementation evidence','community signals','project-reference-unverified','dated evidence ledger']) assert.ok(doc.includes(phrase), phrase);
});
