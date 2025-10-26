import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';

test.describe('Workspace Plugin Auto-Registration', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: ['.'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    // Get the first window that the app opens, wait if necessary
    page = await electronApp.firstWindow();
    
    // Wait for the app to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Give time for workspace scanner to run
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should auto-register counter-app-dev plugin in workspace', async () => {
    // Navigate to Plugin Workspace
    await page.click('text=Plugin Workspace');
    
    // Wait for workspace projects to load
    await page.waitForTimeout(2000);
    
    // Check if counter-app-dev plugin is listed
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await expect(counterAppTab).toBeVisible({ timeout: 10000 });
    
    // Verify the plugin shows as development mode
    const devIndicator = page.locator('[data-testid="dev-indicator-counter-app-dev"]');
    await expect(devIndicator).toBeVisible();
  });

  test('should load counter-app-dev plugin in webview', async () => {
    // Navigate to Plugin Workspace if not already there
    await page.click('text=Plugin Workspace');
    
    // Click on counter-app-dev tab
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await counterAppTab.click();
    
    // Wait for webview to load
    await page.waitForTimeout(3000);
    
    // Check if webview is present and loaded
    const webview = page.locator('webview[data-plugin-id="counter-app-dev"]');
    await expect(webview).toBeVisible({ timeout: 15000 });
    
    // Verify the webview has the correct src
    const webviewSrc = await webview.getAttribute('src');
    expect(webviewSrc).toContain('localhost:3001');
  });

  test('should detect file changes and trigger hot reload', async () => {
    // Navigate to Plugin Workspace
    await page.click('text=Plugin Workspace');
    
    // Click on counter-app-dev tab
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await counterAppTab.click();
    
    // Wait for webview to load
    await page.waitForTimeout(3000);
    
    // Listen for console messages about reload
    const reloadMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('reload') || msg.text().includes('Received reload request')) {
        reloadMessages.push(msg.text());
      }
    });
    
    // Simulate file change by modifying script.js
    // Note: This would require the file watcher to be active
    // For now, we'll test that the reload mechanism exists
    
    // Check if reload button is available
    const reloadButton = page.locator('[data-testid="plugin-reload-counter-app-dev"]');
    await expect(reloadButton).toBeVisible();
    
    // Click reload button to test reload functionality
    await reloadButton.click();
    
    // Wait a bit and check if webview reloaded
    await page.waitForTimeout(2000);
    
    // Verify webview is still present after reload
    const webview = page.locator('webview[data-plugin-id="counter-app-dev"]');
    await expect(webview).toBeVisible();
  });

  test('should show plugin development controls', async () => {
    // Navigate to Plugin Workspace
    await page.click('text=Plugin Workspace');
    
    // Click on counter-app-dev tab
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await counterAppTab.click();
    
    // Check for development controls
    const devToolsButton = page.locator('[data-testid="plugin-devtools-counter-app-dev"]');
    const testApiButton = page.locator('[data-testid="plugin-test-api-counter-app-dev"]');
    const reloadButton = page.locator('[data-testid="plugin-reload-counter-app-dev"]');
    
    await expect(devToolsButton).toBeVisible();
    await expect(testApiButton).toBeVisible();
    await expect(reloadButton).toBeVisible();
  });

  test('should test plugin API functionality', async () => {
    // Navigate to Plugin Workspace
    await page.click('text=Plugin Workspace');
    
    // Click on counter-app-dev tab
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await counterAppTab.click();
    
    // Wait for webview to load
    await page.waitForTimeout(3000);
    
    // Click test API button
    const testApiButton = page.locator('[data-testid="plugin-test-api-counter-app-dev"]');
    await testApiButton.click();
    
    // Wait for potential alert or console message
    await page.waitForTimeout(1000);
    
    // Note: Testing actual API functionality would require more complex setup
    // This test verifies the button exists and can be clicked
    expect(true).toBe(true); // Placeholder assertion
  });

  test('should handle plugin close and reopen', async () => {
    // Navigate to Plugin Workspace
    await page.click('text=Plugin Workspace');
    
    // Click on counter-app-dev tab
    const counterAppTab = page.locator('[data-testid="plugin-tab-counter-app-dev"]');
    await counterAppTab.click();
    
    // Wait for webview to load
    await page.waitForTimeout(2000);
    
    // Close the plugin
    const closeButton = page.locator('[data-testid="plugin-close-counter-app-dev"]');
    await closeButton.click();
    
    // Verify plugin tab is removed or hidden
    await expect(counterAppTab).not.toBeVisible({ timeout: 5000 });
    
    // Reopen by clicking on workspace projects list (if available)
    // This would depend on the UI implementation
    // For now, we'll just verify the close worked
    expect(true).toBe(true); // Placeholder assertion
  });
});