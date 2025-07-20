import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Launch browser to set up MSW
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Navigate to app to trigger MSW setup
  await page.goto('http://localhost:3000')
  
  // Wait for MSW to be ready if enabled
  await page.evaluate(() => {
    if (window.msw?.worker) {
      return window.msw.worker.start()
    }
  }).catch(() => {
    // MSW not enabled, that's fine
  })
  
  await browser.close()
}

export default globalSetup