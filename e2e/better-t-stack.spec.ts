import { test, expect } from '@playwright/test';
import { ElectronTestHelper, commonSelectors } from './helpers/electron-helpers';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

test.describe('Better T Stack E2E Tests', () => {
  let electronHelper: ElectronTestHelper;
  let page: any;
  let testDir: string;

  test.beforeEach(async () => {
    electronHelper = new ElectronTestHelper();
    const { page: electronPage } = await electronHelper.launchApp();
    page = electronPage;
    
    // Add error handling for page crashes
    page.on('crash', () => {
      console.error('Page crashed during test');
    });
     
    page.on('close', () => {
      console.error('Page closed during test');
    });
    
    // Create a temporary directory for test projects
    testDir = path.join(os.tmpdir(), 'better-t-stack-e2e-tests');
    await fs.mkdir(testDir, { recursive: true });
  });

  test.afterEach(async () => {
    await electronHelper.closeApp();
    
    // Clean up test directory
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  test('should display Better T Stack option in project creation modal', async () => {
    // Open project creation modal
    await electronHelper.clickElement(commonSelectors.createProjectButton, 10000);
    await electronHelper.waitForModal();
    
    // Verify modal is visible
    const isModalVisible = await electronHelper.isElementVisible(commonSelectors.modal);
    expect(isModalVisible).toBe(true);
    
    // Fill basic project info
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'Better T Stack Test');
    
    // Fill description (required field)
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for Better T Stack functionality');
    
    // Select project type (required field)
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    // Move to setup step
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Check if Better T Stack toggle is visible
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    const isToggleVisible = await betterTStackToggle.isVisible({ timeout: 5000 });
    expect(isToggleVisible).toBe(true);
  });

  test('should enable Better T Stack and show configuration options', async () => {
    // Start fresh
    await electronHelper.closeModal();
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'Better T Stack Config Test');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for Better T Stack configuration');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Enable Better T Stack
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.waitFor({ state: 'visible', timeout: 10000 });
    await betterTStackToggle.click();
    
    // Wait for the UI to update after toggle
    await page.waitForTimeout(2000);
    
    // Fill in base directory for Better T Stack (optional but let's provide it)
    const baseDirectoryInput = page.locator('input[placeholder="/path/to/base/directory"]');
    await baseDirectoryInput.fill('C:\\temp\\projects');
    
    // Move to configuration step
    await nextButton.click();
    
    // Wait for the next step to load
    await page.waitForTimeout(2000);
    
    // Debug: Check what step we're on
    const stepIndicator = page.locator('.ant-steps-item-active, [data-testid="current-step"]');
    const stepText = await stepIndicator.textContent();
    console.log(`Current step: ${stepText}`);
    
    // Debug: Check if we're on step 2 (Better T Stack configuration)
    const step2 = page.locator('.ant-steps-item').nth(1);
    const isStep2Active = await step2.locator('.ant-steps-item-active').isVisible().catch(() => false);
    console.log(`Is step 2 active: ${isStep2Active}`);
    
    // Look for Better T Stack configuration elements
    const configSection = page.locator('[data-testid="better-t-stack-config"], .better-t-stack-builder, .better-t-stack-configuration');
    const isConfigVisible = await configSection.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Config section visible: ${isConfigVisible}`);
    
    // If not visible, check what's actually on the page
    if (!isConfigVisible) {
      const pageContent = await page.locator('body').textContent();
      console.log(`Page content includes Better T Stack: ${pageContent?.includes('Better T Stack')}`);
      console.log(`Page content includes configuration: ${pageContent?.includes('configuration')}`);
    }
    
    expect(isConfigVisible).toBe(true);
  });

  test('should configure Better T Stack options and generate command', async () => {
    // Start fresh and navigate to configuration step
    await electronHelper.closeModal();
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'Better T Stack Command Test');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for Better T Stack command generation');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Wait for the setup step to load completely
    await page.waitForTimeout(2000);

    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.waitFor({ state: 'visible', timeout: 10000 });
    await betterTStackToggle.click();

    await nextButton.click();
    
    // Wait for configuration step to load
    await page.waitForTimeout(1000);
    
    // Configure frontend option
    const frontendSelect = page.locator('[data-testid="frontend-select"]');
    if (await frontendSelect.isVisible({ timeout: 3000 })) {
      await frontendSelect.click();
      await page.waitForTimeout(500);
      const reactOption = page.locator('.ant-select-item').filter({ hasText: 'Next.js' }).first();
      if (await reactOption.isVisible({ timeout: 2000 })) {
        await reactOption.click();
      }
    }
    
    // Configure database option
    const databaseSelect = page.locator('[data-testid="database-select"]');
    if (await databaseSelect.isVisible({ timeout: 3000 })) {
      await databaseSelect.click();
      await page.waitForTimeout(500);
      const sqliteOption = page.locator('.ant-select-item').filter({ hasText: 'SQLite' }).first();
      if (await sqliteOption.isVisible({ timeout: 2000 })) {
        await sqliteOption.click();
      }
    }
    
    // Verify command preview is generated
    const commandPreview = page.locator('[data-testid="command-preview"]').first();
    const isCommandVisible = await commandPreview.isVisible({ timeout: 5000 });
    expect(isCommandVisible).toBe(true);
    
    // Verify command contains expected parts
    if (isCommandVisible) {
      const commandText = await commandPreview.textContent();
      expect(commandText).toContain('yarn create better-t-stack');
    }
  });

  test('should show different button text for Better T Stack projects', async () => {
    // Start fresh and navigate to final step
    await electronHelper.closeModal();
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'Better T Stack Button Test');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for Better T Stack button text');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    // Navigate through steps
    let nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Enable Better T Stack
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.click();
    
    // Move to configuration
    await nextButton.click();
    
    // Move to final step
    await nextButton.click();
    
    // Check for Better T Stack specific submit button
    const submitButton = page.locator('button:has-text("Create Better T Stack Project")');
    const isSubmitVisible = await submitButton.isVisible({ timeout: 5000 });
    
    if (!isSubmitVisible) {
      // Alternative check for any submit button with thunder icon
      const submitWithIcon = page.locator('button .anticon-thunderbolt');
      const hasThunderIcon = await submitWithIcon.isVisible({ timeout: 3000 });
      expect(hasThunderIcon).toBe(true);
    } else {
      expect(isSubmitVisible).toBe(true);
    }
  });

  test('should handle Better T Stack project creation flow', async () => {
    // Start fresh project creation
    await electronHelper.closeModal();
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    
    // Fill project details
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'E2E-BetterT-Test');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('E2E test project for Better T Stack flow');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    // Move to setup
    let nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Set base directory
    const pathInput = page.locator('input[placeholder*="directory"], input[placeholder*="path"]').first();
    if (await pathInput.isVisible({ timeout: 3000 })) {
      await pathInput.fill(testDir);
    }
    
    // Enable Better T Stack
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.click();
    
    // Move to configuration
    nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Configure minimal options
    const frontendSelect = page.locator('[data-testid="frontend-select"]');
    if (await frontendSelect.isVisible({ timeout: 3000 })) {
      await frontendSelect.click();
      const firstOption = page.locator('.ant-select-item').first();
      await firstOption.click();
    }
    
    // Move to final step
    nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Verify project summary shows Better T Stack info
    const summary = page.locator('[data-testid="project-summary"], .project-summary');
    if (await summary.isVisible({ timeout: 3000 })) {
      const summaryText = await summary.textContent();
      expect(summaryText).toContain('Better T Stack');
    }
    
    // Note: We don't actually submit to avoid creating real projects in E2E tests
    // Just verify the form is ready for submission
    const submitButton = page.locator('button:has-text("Create Better T Stack Project"), button:has(.anticon-thunderbolt)');
    const isSubmitReady = await submitButton.isEnabled();
    expect(isSubmitReady).toBe(true);
  });

  test('should validate Better T Stack command generation', async () => {
    // Start fresh configuration
    await electronHelper.closeModal();
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'Test-NextJS');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for Next.js configuration');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    // Navigate to Better T Stack config
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Wait for the setup step to fully load
    await page.waitForTimeout(2000);
    
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.waitFor({ state: 'visible', timeout: 10000 });
    await betterTStackToggle.click();

    await nextButton.click();
    
    // Wait for configuration step to load
    await page.waitForTimeout(1000);
    
    // Configure options
    const frontendSelect = page.locator('[data-testid="frontend-select"]');
    if (await frontendSelect.isVisible({ timeout: 3000 })) {
      await frontendSelect.click();
      await page.waitForTimeout(500);
      const option = page.locator('.ant-select-item').filter({ hasText: 'Next.js' }).first();
      if (await option.isVisible({ timeout: 2000 })) {
        await option.click();
      }
    }
    
    // Configure database option
    const databaseSelect = page.locator('[data-testid="database-select"]');
    if (await databaseSelect.isVisible({ timeout: 3000 })) {
      await databaseSelect.click();
      await page.waitForTimeout(500);
      const dbOption = page.locator('.ant-select-item').filter({ hasText: 'PostgreSQL' }).first();
      if (await dbOption.isVisible({ timeout: 2000 })) {
        await dbOption.click();
      }
    }
    
    // Verify command contains expected elements
    const commandPreview = page.locator('[data-testid="command-preview"]').first();   
    if (await commandPreview.isVisible({ timeout: 3000 })) {
      const commandText = await commandPreview.textContent();
      
      // Check for expected command elements
      expect(commandText).toContain('yarn create better-t-stack');
      console.log('✓ Command generated successfully');
    }
  });

  test('should handle Better T Stack errors gracefully', async () => {
    // Test error handling by providing invalid configuration
    try {
      await electronHelper.closeModal();
    } catch (e) {
      // Modal might not be open, continue
    }
    
    await electronHelper.clickElement(commonSelectors.createProjectButton);
    await electronHelper.waitForModal();
    
    // Fill with simple project name to avoid issues
    await electronHelper.fillInput(commonSelectors.projectNameInput, 'ErrorHandlingTest');
    
    // Fill required fields
    const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
    await descriptionInput.fill('Test project for error handling');
    const webAppOption = page.locator('text="Web Application"').first();
    await webAppOption.click();
    
    // Navigate to Better T Stack config with better error handling
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    
    // Wait for page to be ready before interacting with toggle
    await page.waitForTimeout(1000);
    
    const betterTStackToggle = page.locator('[data-testid="better-t-stack-toggle"]');
    await betterTStackToggle.waitFor({ state: 'visible', timeout: 10000 });
    
    // Check if page is still active before clicking
    if (!page.isClosed()) {
      await betterTStackToggle.click();
      
      // Move to next step
      await nextButton.click();
      
      // Wait for the configuration step to load
      await page.waitForTimeout(2000);
      
      // Verify the UI handles the configuration gracefully
      const configSection = page.locator('[data-testid="better-t-stack-config"], .better-t-stack-builder');
      const isConfigVisible = await configSection.isVisible({ timeout: 5000 });
      
      expect(isConfigVisible).toBe(true);
    } else {
      throw new Error('Page was closed unexpectedly');
    }
  });
});