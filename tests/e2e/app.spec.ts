import { test, expect } from '@playwright/test';

test.describe('Tetraspore App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the app has a navigation bar
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that the Planet Selection heading is visible
    await expect(page.locator('h1')).toContainText('Planet Selection');
    
    // Check that navigation buttons exist
    const planetSelectionButton = page.locator('button:has-text("Planet Selection")');
    await expect(planetSelectionButton).toBeVisible();
    
    const mapButton = page.locator('button:has-text("Map")');
    await expect(mapButton).toBeVisible();
    
    const evolutionButton = page.locator('button:has-text("Evolution")');
    await expect(evolutionButton).toBeVisible();
    
    const technologyButton = page.locator('button:has-text("Technology")');
    await expect(technologyButton).toBeVisible();
  });

  test('should display planet selection cards', async ({ page }) => {
    await page.goto('/');
    
    // Check that planet cards are visible by targeting the heading specifically
    await expect(page.getByRole('heading', { name: 'Planet 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Planet 2' })).toBeVisible(); 
    await expect(page.getByRole('heading', { name: 'Planet 3' })).toBeVisible();
    
    // Check that instruction text exists
    await expect(page.locator('text=Select a planet to begin exploration')).toBeVisible();
  });

  test('should have functional navigation', async ({ page }) => {
    await page.goto('/');
    
    // Click on Map button
    await page.locator('button:has-text("Map")').click();
    
    // Check that Map button is now active (should have different styling)
    const mapButton = page.locator('button:has-text("Map")');
    await expect(mapButton).toHaveClass(/bg-blue-600/);
    
    // Click back to Planet Selection
    await page.locator('button:has-text("Planet Selection")').click();
    
    // Check that Planet Selection button is now active
    const planetButton = page.locator('button:has-text("Planet Selection")');
    await expect(planetButton).toHaveClass(/bg-blue-600/);
  });
});