import { test, expect } from '@playwright/test';

test('Level 0 browser harness boots the public entry', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#enterBtn')).toBeVisible();
});
