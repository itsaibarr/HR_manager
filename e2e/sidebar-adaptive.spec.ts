import { test, expect } from '@playwright/test';

test.describe('Sidebar Adaptive Layout', () => {
  test('sidebar should toggle and main content should adjust width', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check initial state (should be expanded by default or from localStorage)
    // We'll force it to expanded for the test if needed, but let's assume it starts expanded
    const sidebar = page.locator('div.fixed.left-0');
    const main = page.locator('main');
    
    // Toggle to collapsed
    // The toggle button is the one with ChevronLeft/Right
    // In expanded mode, it's ChevronLeft
    await page.locator('button:has(svg.lucide-chevron-left)').click();
    
    // Verify collapsed width (56px)
    await expect(sidebar).toHaveCSS('width', '56px');
    await expect(main).toHaveCSS('margin-left', '56px');
    
    // Toggle back to expanded
    await page.locator('button:has(svg.lucide-chevron-right)').click();
    
    // Verify expanded width (240px)
    await expect(sidebar).toHaveCSS('width', '240px');
    await expect(main).toHaveCSS('margin-left', '240px');
  });

  test('job page adaptive layout', async ({ page }) => {
    // Navigate to a job page
    await page.goto('/dashboard');
    await page.locator('div.bg-card').first().click();
    
    const sidebar = page.locator('div.fixed.left-0');
    const main = page.locator('main');
    
    // Collapse sidebar
    await page.locator('button:has(svg.lucide-chevron-left)').click();
    
    // Check if main content expanded
    const mainBox = await main.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    
    expect(sidebarBox?.width).toBe(56);
    expect(mainBox?.x).toBe(56);
    
    // Verify icons in collapsed sidebar
    const jobsIcon = page.locator('nav a:has-text("Jobs")');
    // In collapsed mode, the text is hidden but the link remains
    // We used AnimatePresence/motion for labels, so they should be gone
    await expect(page.locator('nav a span:has-text("Jobs")')).not.toBeVisible();
  });
});
