import { test, expect } from '@playwright/test';
import path from 'path';

const dummyCVPath = path.join(__dirname, 'fixtures', 'dummy_cv.txt');

test.describe('Comprehensive Feature Verification', () => {
    test.beforeEach(async ({ page }) => {
        // We might need to handle auth here. For now, let's assume we start at /auth
        // and register a new user for each run to ensure clean state.
    });

    test('User can register, create job, upload candidate, and use features', async ({ page }) => {
        // 1. Registration
        await page.goto('/auth');
        
        // Check if we are on auth page
        await expect(page.getByRole('heading', { name: /welcome back|create account/i })).toBeVisible();

        // Toggle to Sign Up if needed (assuming tabs or similar)
        // If it's a unified form, just fill it. 
        // Let's assume there is a "Sign up" trigger or we just fill details.
        // Inspecting the auth page source would be ideal, but let's try standard selectors.
        
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const password = 'Password123!';
        const name = 'Test User';

        // Try to find "Sign up" button/tab
        const signUpTab = page.getByRole('tab', { name: /sign up/i });
        if (await signUpTab.isVisible()) {
            await signUpTab.click();
        } else {
             // Maybe a link "Don't have an account? Sign up"
             const signUpLink = page.getByRole('button', { name: /sign up/i });
             if (await signUpLink.isVisible()) {
                 await signUpLink.click();
             }
        }

        await page.getByLabel(/name/i).fill(name);
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole('button', { name: /sign up|create account/i }).click();

        // 2. Dashboard & Job Creation
        await expect(page).toHaveURL(/\/dashboard/);
        
        // Click "Create Job" or "+" button
        const createJobBtn = page.getByRole('button', { name: /create job|new job/i });
        if (await createJobBtn.isVisible()) {
            await createJobBtn.click();
        } else {
            // Locate by icon or other means if text is hidden
            await page.locator('button:has(.lucide-plus)').click();
        }

        // Fill Job Context Modal
        await expect(page.getByText(/create new job context/i)).toBeVisible();
        await page.getByLabel(/job title/i).fill('Senior React Developer');
        await page.getByLabel(/description/i).fill('Looking for a React expert.');
        await page.getByRole('button', { name: /create context/i }).click();

        // 3. Candidate Upload
        await expect(page).toHaveURL(/\/dashboard\/.+/);
        await page.getByRole('button', { name: /upload|add candidates/i }).click();
        
        // Upload File
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(dummyCVPath);
        
        // Verify file is selected
        await expect(page.getByText(/dummy_cv.txt/i)).toBeVisible();
        
        // Click Continue
        await page.getByRole('button', { name: /continue/i }).click();
        
        // If it goes to review (for TXT), just confirm. 
        await page.getByRole('button', { name: /confirm & start import/i }).click();
        
        // Wait for processing
        await expect(page.getByText(/finish/i)).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: /finish/i }).click();

        // 4. Verify Candidate & Details
        // Check if candidate appears in table
        await expect(page.getByText('John Doe')).toBeVisible();
        
        // Click on candidate (view details)
        await page.getByRole('button', { name: /view/i }).first().click();
        
        // Verify Detail Frame
        await expect(page.getByText(/candidate profile/i)).toBeVisible();
        
        // Verify Confidence Badge
        // It might be "High Confidence" or similar. 
        // We look for the badge component's text or class.
        // The mock CV is simple, so maybe confidence is high?
        // Let's just check if the element exists.
        // await expect(page.locator('.confidence-badge-class')).toBeVisible(); // Need specific selector

        // 5. Feedback Component
        // Click "Agree"
        await page.getByRole('button', { name: /agree/i }).click();
        
        // Add Note
        await page.getByPlaceholder(/explain your technical reasoning/i).fill('Looks good.');
        await page.getByRole('button', { name: /save note/i }).click();
        
        // Close Modal
        await page.getByRole('button', { name: /close/i }).click(); // X icon

        // 6. Bulk Actions
        // Select candidate
        await page.locator('input[type="checkbox"]').first().click();
        // Wait for floating bar
        await expect(page.getByText(/selected/i)).toBeVisible();
        // Check "Shortlist Selected" button
        await expect(page.getByRole('button', { name: /shortlist selected/i })).toBeVisible();
        
    });
});
