import { test, expect } from '@playwright/test';

const STATE_KEY = 'sdaia.state.v1';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('Level 0 boot, entry, persistence and zero runtime errors', async ({ page }, testInfo) => {
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#enterBtn')).toBeVisible();

  await page.locator('#enterBtn').click();
  await expect(page.locator('#onboarding')).toHaveClass(/active/);
  await page.locator('#startMode').selectOption('plan');
  await page.locator('#finishOnboard').click();

  const stateKeyPresent = await page.evaluate(key => localStorage.getItem(key) !== null, STATE_KEY);
  expect(stateKeyPresent).toBe(true);

  const state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STATE_KEY);
  expect(state).not.toBeNull();
  expect(state.anon_id).toMatch(UUID_V4);
  expect(state.onboarded).toBe(true);

  await page.reload({ waitUntil: 'networkidle' });

  const reloaded = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STATE_KEY);
  expect(reloaded).not.toBeNull();
  expect(reloaded.anon_id).toBe(state.anon_id);
  expect(reloaded.onboarded).toBe(true);

  await page.screenshot({
    path: `docs/screens/level-0/${testInfo.project.name}.png`,
    fullPage: true,
  });

  expect(pageErrors, `pageerror: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `console.error: ${consoleErrors.join(' | ')}`).toEqual([]);
});
