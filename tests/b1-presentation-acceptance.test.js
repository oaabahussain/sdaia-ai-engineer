import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const exists = p => fs.existsSync(new URL(p, import.meta.url));

test('B1 contract files exist', () => {
  for (const p of [
    '../data/schema/track-presentation.schema.json',
    '../tracks/sdaia-ai-engineer/presentation.json',
    '../src/presentation/coreI18n.js',
    '../src/presentation/trackPresentation.js'
  ]) assert.equal(exists(p), true, p);
});

test('core app no longer owns SDAIA presentation literals', () => {
  const app = read('../src/app.js');
  assert.doesNotMatch(app, /const DOMAIN_AR\s*=/);
  assert.doesNotMatch(app, /SDAIA AI Engineer/);
});

test('HTML shells are neutral while bootstrap track selection remains explicit', () => {
  assert.doesNotMatch(read('../index.html'), /SDAIA AI Engineer/);
  assert.doesNotMatch(read('../feedback.html'), /SDAIA AI Engineer/);
  assert.match(read('../src/config.js'), /ACTIVE_TRACK_ID\s*=\s*['"]sdaia-ai-engineer['"]/);
});

test('app imports namespaced generic core translations', async () => {
  const core = await import('../src/presentation/coreI18n.js');
  assert.deepEqual(core.CORE_LOCALES, ['ar','en']);
  assert.equal(core.CORE_DEFAULT_LOCALE, 'ar');
  assert.equal(core.CORE_I18N.ar.app.home, 'الرئيسية');
  assert.equal(core.CORE_I18N.en.app.home, 'Home');
  assert.equal(core.CORE_I18N.en.feedback.community, 'Community');
  const app = read('../src/app.js');
  assert.match(app, /from ['"]\.\/presentation\/coreI18n\.js['"]/);
  assert.doesNotMatch(app, /const I18N\s*=/);
});

test('app presentation load is best-effort after canonical bank load', () => {
  const app = read('../src/app.js');
  assert.match(app, /loadTrackPresentation/);
  assert.match(app, /let PRESENTATION\s*=\s*null/);
  assert.match(app, /BANK=await loadBank\(\)[\s\S]*?try\{PRESENTATION=await loadTrackPresentation/);
  assert.match(app, /catch\(presentationError\)\{console\.warn/);
  assert.match(app, /PRESENTATION=null/);
});

test('app presentation view falls back to a core locale and track id', () => {
  const app = read('../src/app.js');
  assert.match(app, /resolvePresentationLocale/);
  assert.match(app, /getPresentationLocale/);
  assert.match(app, /function presentationView\(\)/);
  assert.match(app, /Presentation locale fallback/);
  assert.match(app, /BANK\?\.track\?\.id/);
});

test('main page brand and hero are sourced from track presentation', () => {
  const app = read('../src/app.js');
  const html = read('../index.html');
  assert.doesNotMatch(app, /SDAIA AI Engineer/);
  assert.doesNotMatch(app, /تدرّب مثل الاختبار/);
  assert.doesNotMatch(app, /Practice like an exam/);
  assert.doesNotMatch(html, /SDAIA AI Engineer/);
  assert.doesNotMatch(html, /تدرّب مثل الاختبار/);
  assert.doesNotMatch(html, /Practice like an exam/);
  for (const id of ['brandText','heroEyebrow','heroTitle','heroText','statusNotice']) assert.ok(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), id);
  assert.match(app,/function applyTrackPresentation\(\)/);
  assert.match(app,/document\.title/);
});
