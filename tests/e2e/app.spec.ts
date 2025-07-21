import { test, expect } from '@playwright/test';

test.describe('Tetraspore App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the app title is visible
    await expect(page.locator('h1')).toContainText('Tetraspore Evolution Game');
    
    // Check that the turn counter is visible
    await expect(page.locator('h2')).toContainText('Turn 0');
    
    // Check that the End Turn button exists
    const endTurnButton = page.locator('button:has-text("End Turn")');
    await expect(endTurnButton).toBeVisible();
    await expect(endTurnButton).toBeEnabled();
    
    // Check that Reset Game button exists
    const resetButton = page.locator('button:has-text("Reset Game")');
    await expect(resetButton).toBeVisible();
  });

  test('should display Tree of Life visualization', async ({ page }) => {
    await page.goto('/');
    
    // Check that the Tree of Life container exists
    const treeContainer = page.locator('.tree-of-life-container');
    await expect(treeContainer).toBeVisible();
    
    // Check that the SVG element exists within the tree
    const treeSvg = treeContainer.locator('svg');
    await expect(treeSvg).toBeVisible();
  });

  test('should advance turn when End Turn is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Check initial turn
    await expect(page.locator('h2')).toContainText('Turn 0');
    
    // Click End Turn
    await page.locator('button:has-text("End Turn")').click();
    
    // Wait for turn to advance (includes loading state)
    await expect(page.locator('h2')).toContainText('Turn 1', { timeout: 10000 });
    
    // Check that species list has been updated
    await expect(page.locator('text=Living Species')).toBeVisible();
  });
});