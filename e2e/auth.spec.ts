import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads and links to auth', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /intelligent screening/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('auth page loads', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /welcome back|create account/i })).toBeVisible({
      timeout: 5000,
    });
  });
});
