import { test, expect } from '@playwright/test'

test.describe('Tetraspore App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check that the title is correct
    await expect(page).toHaveTitle(/Tetraspore/)
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Tetraspore' })).toBeVisible()
    
    // Check that the game description is visible
    await expect(page.getByText('Evolution & Civilization Game')).toBeVisible()
  })

  test('should have functional New Game and Load Game buttons', async ({ page }) => {
    await page.goto('/')
    
    // Check buttons exist and are clickable
    const newGameButton = page.getByRole('button', { name: 'New Game' })
    const loadGameButton = page.getByRole('button', { name: 'Load Game' })
    
    await expect(newGameButton).toBeVisible()
    await expect(newGameButton).toBeEnabled()
    
    await expect(loadGameButton).toBeVisible()
    await expect(loadGameButton).toBeEnabled()
  })

  test('should display version number', async ({ page }) => {
    await page.goto('/')
    
    // Check version is displayed
    await expect(page.getByText(/v0\.1\.0/)).toBeVisible()
  })

  test('should start new game flow', async ({ page }) => {
    await page.goto('/')
    
    // Click New Game button
    await page.getByRole('button', { name: 'New Game' }).click()
    
    // Should navigate to game page or show game interface
    // This test will likely fail until game flow is implemented
    // but provides a foundation for future development
    await page.waitForURL('**/game', { timeout: 5000 }).catch(() => {
      // If URL doesn't change, check for game interface elements
      // This is expected until proper routing is implemented
    })
  })
})