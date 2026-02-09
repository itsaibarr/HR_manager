import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('dashboard redirects to auth when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('candidates page redirects to auth when unauthenticated', async ({ page }) => {
    await page.goto('/candidates');
    await expect(page).toHaveURL(/\/auth/);
  });
});
