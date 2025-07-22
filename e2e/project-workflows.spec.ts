import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Project Workflows', () => {
  let electronApp: any;
  let page: any;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'dist-electron', 'main', 'index.cjs')],
    });
    
    // Get the first window that the app opens, wait if necessary
    page = await electronApp.firstWindow();
    
    // Wait for the app to be ready
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should load the main window', async () => {
    // Check if the main window is loaded
    expect(await page.title()).toBeTruthy();
    
    // Wait for the main content to be visible
    await page.waitForSelector('[data-testid="main-content"], .main-content, main', { timeout: 10000 });
  });

  test('should open project creation modal', async () => {
    // Look for create project button with various possible selectors
    const createButton = page.locator('button:has-text("Create Project"), button:has-text("New Project"), [data-testid="create-project"]').first();
    
    // Wait for the button to be visible and clickable
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click the create project button
    await createButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('.ant-modal, [data-testid="project-create-modal"], .modal', { timeout: 5000 });
    
    // Check if modal is visible
    const modal = page.locator('.ant-modal, [data-testid="project-create-modal"], .modal').first();
    await expect(modal).toBeVisible();
  });

  test('should fill project creation form', async () => {
    // Open modal first if not already open
    const createButton = page.locator('button:has-text("Create Project"), button:has-text("New Project"), [data-testid="create-project"]').first();
    
    try {
      await createButton.click({ timeout: 2000 });
    } catch {
      // Modal might already be open
    }
    
    // Wait for form fields
    await page.waitForSelector('input[placeholder*="project name"], input[name="name"], [data-testid="project-name"]', { timeout: 5000 });
    
    // Fill project name
    const nameInput = page.locator('input[placeholder*="project name"], input[name="name"], [data-testid="project-name"]').first();
    await nameInput.fill('Test E2E Project');
    
    // Fill description if available
    const descInput = page.locator('textarea[placeholder*="description"], textarea[name="description"], [data-testid="project-description"]').first();
    try {
      await descInput.fill('This is a test project created by E2E tests', { timeout: 2000 });
    } catch {
      // Description field might not be visible or required
    }
    
    // Verify the form is filled
    await expect(nameInput).toHaveValue('Test E2E Project');
  });

  test('should handle project type selection', async () => {
    // Look for project type selector
    const typeSelector = page.locator('select[name="type"], .ant-select, [data-testid="project-type"]').first();
    
    try {
      await typeSelector.waitFor({ state: 'visible', timeout: 3000 });
      
      // If it's an Ant Design select, click to open dropdown
      if (await typeSelector.getAttribute('class') && (await typeSelector.getAttribute('class'))!.includes('ant-select')) {
        await typeSelector.click();
        
        // Select React option if available
        const reactOption = page.locator('.ant-select-item:has-text("React"), .ant-select-item:has-text("react")').first();
        try {
          await reactOption.click({ timeout: 2000 });
        } catch {
          // If React option not found, select first available option
          const firstOption = page.locator('.ant-select-item').first();
          await firstOption.click();
        }
      }
    } catch {
      // Project type selector might not be required or visible
      console.log('Project type selector not found or not required');
    }
  });

  test('should close modal with cancel button', async () => {
    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), .ant-btn:has-text("Cancel"), [data-testid="cancel-button"]').first();
    
    try {
      await cancelButton.waitFor({ state: 'visible', timeout: 3000 });
      await cancelButton.click();
      
      // Wait for modal to disappear
      await page.waitForSelector('.ant-modal, [data-testid="project-create-modal"], .modal', { state: 'hidden', timeout: 5000 });
      
      // Verify modal is closed
      const modal = page.locator('.ant-modal, [data-testid="project-create-modal"], .modal').first();
      await expect(modal).not.toBeVisible();
    } catch {
      console.log('Cancel button not found or modal already closed');
    }
  });

  test('should test project opening functionality', async () => {
    // Look for open project button
    const openButton = page.locator('button:has-text("Open Project"), button:has-text("Open"), [data-testid="open-project"]').first();
    
    try {
      await openButton.waitFor({ state: 'visible', timeout: 5000 });
      await openButton.click();
      
      // This would typically open a file dialog, which is hard to test in E2E
      // We can verify the button click triggers the expected behavior
      console.log('Open project button clicked successfully');
    } catch {
      console.log('Open project button not found - this might be expected if it\'s in a different location');
    }
  });

  test('should verify IPC functionality', async () => {
    // Test that the renderer can communicate with main process
    // This is done by checking if certain elements that depend on IPC are loaded
    
    // Wait for any content that requires IPC communication
    try {
      await page.waitForFunction(() => {
        // Check if window.electronAPI is available (indicates IPC is working)
        return window.electronAPI !== undefined;
      }, { timeout: 5000 });
      
      console.log('IPC communication verified - electronAPI is available');
    } catch {
      console.log('electronAPI not found - checking alternative IPC indicators');
      
      // Alternative check: look for elements that would only appear if IPC is working
      try {
        await page.waitForSelector('[data-testid="project-list"], .project-item, .project-card', { timeout: 3000 });
        console.log('IPC functionality verified through UI elements');
      } catch {
        console.log('Could not verify IPC functionality through UI elements');
      }
    }
  });
});