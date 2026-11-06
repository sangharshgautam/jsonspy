import { test, expect } from '@playwright/test';

test('JSONSpy Workbench loads and displays version badge', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=JSONSpy v1.0.2')).toBeVisible();
});

test('Switch between workbench views', async ({ page }) => {
  await page.goto('/');

  // Click Grid View tab
  await page.click('text=Grid');
  await expect(page.locator('text=Interactive Hierarchical Tree Grid')).toBeVisible();

  // Click Schema View tab
  await page.click('text=Schema');
  await expect(page.locator('text=Visual JSON Schema Designer')).toBeVisible();

  // Click Query View tab
  await page.click('text=Query');
  await expect(page.locator('text=JSONata Transformation & Query Engine')).toBeVisible();
});
