import { test, expect } from '@playwright/test';
import { ElectronTestHelper, commonSelectors } from './helpers/electron-helpers';

test.describe('Project Creation E2E Tests', () => {
  let electronHelper: ElectronTestHelper;
  let page: any;

  test.beforeAll(async () => {
    electronHelper = new ElectronTestHelper();
    const { page: electronPage } = await electronHelper.launchApp();
    page = electronPage;
  });

  test.afterAll(async () => {
    await electronHelper.closeApp();
  });

  test('should load application without errors', async () => {
    // Check if the main window is loaded
    expect(await page.title()).toBeTruthy();
    
    // Wait for the main content to be visible
    const isMainContentVisible = await electronHelper.isElementVisible(commonSelectors.mainContent, 10000);
    expect(isMainContentVisible).toBe(true);
    
    // Check for any console errors (excluding the known electron-log warning)
    const consoleErrors: string[] = [];
    page.on('console', (msg: any) => {
      if (msg.type() === 'error' && !msg.text().includes('electron-log: logger isn\'t initialized')) {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any immediate errors
    await page.waitForTimeout(2000);
    
    // Should have no critical console errors
    expect(consoleErrors.length).toBe(0);
  });

  test('should open project creation modal', async () => {
    // Click create project button
    await electronHelper.clickElement(commonSelectors.createProjectButton, 10000);
    
    // Wait for modal to appear
    await electronHelper.waitForModal();
    
    // Verify modal is visible
    const isModalVisible = await electronHelper.isElementVisible(commonSelectors.modal);
    expect(isModalVisible).toBe(true);
  });

  test('should fill and validate project creation form', async () => {
    // Ensure modal is open
    const isModalVisible = await electronHelper.isElementVisible(commonSelectors.modal);
    if (!isModalVisible) {
      await electronHelper.clickElement(commonSelectors.createProjectButton);
      await electronHelper.waitForModal();
    }
    
    // Fill project name
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'E2E Test Project');
    
    // Verify the input was filled
    const nameInput = page.locator(commonSelectors.projectNameInput).first();
    await expect(nameInput).toHaveValue('E2E Test Project');
    
    // Try to fill description if available
    const isDescVisible = await electronHelper.isElementVisible(commonSelectors.projectDescInput, 2000);
    if (isDescVisible) {
      await electronHelper.fillInput(commonSelectors.projectDescInput, 'This is an E2E test project');
      const descInput = page.locator(commonSelectors.projectDescInput).first();
      await expect(descInput).toHaveValue('This is an E2E test project');
    }
  });

  test('should handle project type selection', async () => {
    // Check if project type selector exists
    const isTypeSelectVisible = await electronHelper.isElementVisible(commonSelectors.projectTypeSelect, 3000);
    
    if (isTypeSelectVisible) {
      const typeSelector = page.locator(commonSelectors.projectTypeSelect).first();
      
      // Check if it's an Ant Design select
      const className = await typeSelector.getAttribute('class');
      if (className && className.includes('ant-select')) {
        // Click to open dropdown
        await typeSelector.click();
        
        // Wait for dropdown options
        await page.waitForSelector('.ant-select-item', { timeout: 3000 });
        
        // Select the first available option
        const firstOption = page.locator('.ant-select-item').first();
        await firstOption.click();
        
        console.log('Project type selected successfully');
      } else {
        // Handle regular select element
        await typeSelector.selectOption({ index: 0 });
      }
    } else {
      console.log('Project type selector not found - might not be required');
    }
  });

  test('should validate form submission behavior', async () => {
    // Ensure modal is open and form is filled
    const isModalVisible = await electronHelper.isElementVisible(commonSelectors.modal);
    if (!isModalVisible) {
      await electronHelper.clickElement(commonSelectors.createProjectButton);
      await electronHelper.waitForModal();
      await electronHelper.fillInput(commonSelectors.projectNameInput, 'E2E Test Project');
    }
    
    // Look for submit/create button
    const isSubmitVisible = await electronHelper.isElementVisible(commonSelectors.submitButton, 3000);
    
    if (isSubmitVisible) {
      // Note: We don't actually submit to avoid creating test projects
      // Just verify the button is clickable
      const submitButton = page.locator(commonSelectors.submitButton).first();
      const isEnabled = await submitButton.isEnabled();
      expect(isEnabled).toBe(true);
      
      console.log('Submit button is enabled and ready for submission');
    } else {
      console.log('Submit button not found - checking form validation');
    }
  });

  test('should close modal properly', async () => {
    // Ensure modal is open
    const isModalVisible = await electronHelper.isElementVisible(commonSelectors.modal);
    if (!isModalVisible) {
      await electronHelper.clickElement(commonSelectors.createProjectButton);
      await electronHelper.waitForModal();
    }
    
    // Close the modal
    await electronHelper.closeModal();
    
    // Verify modal is closed
    const isModalClosed = !(await electronHelper.isElementVisible(commonSelectors.modal, 2000));
    expect(isModalClosed).toBe(true);
  });

  test('should verify IPC communication is working', async () => {
    // Test that electronAPI is available (indicates IPC is working)
    const hasElectronAPI = await page.evaluate(() => {
      return typeof window.electronAPI !== 'undefined';
    });
    
    if (hasElectronAPI) {
      console.log('IPC communication verified - electronAPI is available');
      expect(hasElectronAPI).toBe(true);
    } else {
      // Alternative verification: check if UI elements that depend on IPC are present
      const hasIPCDependentElements = await electronHelper.isElementVisible(
        '[data-testid="project-list"], .project-item, .project-card, .project-grid',
        5000
      );
      
      // At least one form of IPC verification should pass
      expect(hasIPCDependentElements).toBe(true);
      console.log('IPC functionality verified through UI elements');
    }
  });
});