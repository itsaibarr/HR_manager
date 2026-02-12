import { test, expect } from '@playwright/test';

test('password visibility toggle', async ({ page }) => {
  await page.goto('http://localhost:3000/auth');
  
  const passwordInput = page.locator('input[name="password"]');
  const toggleButton = page.locator('button[aria-label="Show password"]');
  
  // Initial state: password
  await expect(passwordInput).toHaveAttribute('type', 'password');
  
  // Click to show
  await toggleButton.click();
  await expect(passwordInput).toHaveAttribute('type', 'text');
  await expect(page.locator('button[aria-label="Hide password"]')).toBeVisible();
  
  // Click to hide
  await page.locator('button[aria-label="Hide password"]').click();
  await expect(passwordInput).toHaveAttribute('type', 'password');
});
