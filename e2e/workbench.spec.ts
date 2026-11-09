import { test, expect } from '@playwright/test';

test('JSONSpy Workbench loads and displays version badge', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('JSONSpy v1.0.2')).toBeVisible();
});

test('Switch between workbench views', async ({ page }) => {
  await page.goto('/');

  // Click Grid View tab
  await page.click('button:has-text("Grid View")');
  await expect(page.getByPlaceholder('Search keys or values...')).toBeVisible();

  // Click Schema Designer tab
  await page.click('button:has-text("Schema Designer")');
  await expect(page.getByText('Infer Schema')).toBeVisible();

  // Click Query Workbench tab
  await page.click('button:has-text("Query Workbench")');
  await expect(page.getByText('JSONata Transformation')).toBeVisible();
});
