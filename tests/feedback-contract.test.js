import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = fs.readFileSync(new URL('../.github/ISSUE_TEMPLATE/config.yml', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../feedback.html', import.meta.url), 'utf8');
const feedbackModuleUrl = new URL('../src/feedback.js', import.meta.url);
const feedbackModule = fs.readFileSync(feedbackModuleUrl, 'utf8');

test('feedback page uses a defined template while blank issues remain disabled', () => {
  assert.match(config, /blank_issues_enabled:\s*false/);
  assert.match(feedbackModule, /template:\s*['"]public-feedback\.md['"]/);
  assert.match(feedbackModule, /issues\/new\?\$\{p\.toString\(\)\}/);
});

test('feedback page keeps the public submission warning', async () => {
  const core = await import('../src/presentation/coreI18n.js');
  assert.match(core.CORE_I18N.en.feedback.publicNotice, /public GitHub Issue/);
  assert.match(core.CORE_I18N.en.feedback.publicNotice, /personal, confidential, or sensitive information/);
  assert.match(page, /data-i18n=['"]publicNotice['"]/);
});

test('public feedback template is a named markdown issue template', () => {
  const template = fs.readFileSync(new URL('../.github/ISSUE_TEMPLATE/public-feedback.md', import.meta.url), 'utf8');
  assert.match(template, /^---\n[\s\S]*name:\s*Public feedback submission/m);
  assert.match(template, /Do not include personal, confidential, or sensitive information/);
});


test('feedback behavior is extracted to the shared ES module', () => {
  assert.equal(fs.existsSync(feedbackModuleUrl), true);
  assert.match(page, /<script\s+type=['"]module['"]\s+src=['"]\.\/src\/feedback\.js['"]><\/script>/);
  assert.doesNotMatch(page, /const TEXT\s*=/);
  assert.doesNotMatch(page, /function issue\(/);
  assert.match(feedbackModule, /CORE_I18N/);
  assert.match(feedbackModule, /public-feedback\.md/);
  assert.match(feedbackModule, /learning-platform\.state\.v2/);
  assert.match(feedbackModule, /sdaia\.state\.v1/);
});


test('feedback identity is sourced from active track presentation', () => {
  assert.doesNotMatch(page, /SDAIA AI Engineer/);
  assert.doesNotMatch(feedbackModule, /SDAIA AI Engineer/);
  assert.match(page, /id=['"]feedbackBrand['"]/);
  assert.match(feedbackModule, /ACTIVE_TRACK_ID/);
  assert.match(feedbackModule, /loadTrackPresentation/);
  assert.match(feedbackModule, /resolvePresentationLocale/);
  assert.match(feedbackModule, /document\.title/);
});


test('feedback submission semantics remain pinned after extraction', () => {
  assert.match(feedbackModule, /template:'public-feedback\.md'/);
  assert.match(feedbackModule, /\[Suggestion\] \$\{title\}/);
  assert.match(feedbackModule, /## Area\\n\$\{area\}\\n\\n## Suggestion/);
  assert.match(feedbackModule, /\[Contribution\] \$\{type\}/);
  assert.match(feedbackModule, /## Proposed contribution/);
  assert.match(feedbackModule, /## Source or reference/);
  assert.match(feedbackModule, /\[Rating\] \$\{rating\}\/5/);
  assert.match(feedbackModule, /## Most useful part/);
  assert.match(feedbackModule, /Submitted from the public feedback page\./);
  assert.match(feedbackModule, /const key='learning-platform\.state\.v2'/);
  assert.doesNotMatch(feedbackModule, /const key='sdaia\.state\.v1'/);
});
