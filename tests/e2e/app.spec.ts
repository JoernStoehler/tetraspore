import { test, expect } from '@playwright/test';

test.describe('Tetraspore App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // The app should at least render a root element
    await expect(page.locator('#root')).toBeVisible();
    
    // Due to WebGL limitations in headless browsers, we can't test 
    // the full 3D galaxy view. This is a known limitation.
  });

  test.skip('3D galaxy view tests - requires WebGL', async () => {
    // These tests are skipped in CI because headless browsers don't support WebGL
    // They can be run locally with headed browsers
  });
});