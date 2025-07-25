/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ElectronApplication, Page } from '@playwright/test';
import { _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ElectronTestHelper {
  private electronApp: ElectronApplication | null = null;
  private page: Page | null = null;

  async launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
    // Launch Electron app
    this.electronApp = await electron.launch({
      args: [
        path.join(__dirname, '..', '..', 'dist-electron', 'main', 'index.cjs'),
      ],
      timeout: 30000,
    });

    // Get the first window
    this.page = await this.electronApp.firstWindow();

    // Wait for the app to be ready
    await this.page.waitForLoadState('domcontentloaded');

    return { app: this.electronApp, page: this.page };
  }

  async closeApp(): Promise<void> {
    if (this.electronApp) {
      await this.electronApp.close();
      this.electronApp = null;
      this.page = null;
    }
  }

  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector: string, timeout = 5000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    const element = this.page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout });
    try {
      await element.click();
    } catch (error) {
      // If normal click fails due to interception, try force click
      console.log(`Normal click failed for ${selector}, trying force click`);
      await element.click({ force: true });
    }
  }

  async fillInput(
    selector: string,
    value: string,
    timeout = 5000,
  ): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    const input = this.page.locator(selector).first();
    await input.waitFor({ state: 'visible', timeout });
    await input.fill(value);
  }

  async isElementVisible(selector: string, timeout = 3000): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async waitForModal(timeout = 5000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(
      '.ant-modal, [data-testid="project-create-modal"], .modal',
      { timeout },
    );
  }

  async closeModal(timeout = 5000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Try different ways to close the modal
    const selectors = [
      'button:has-text("Cancel")',
      '.ant-btn:has-text("Cancel")',
      '[data-testid="cancel-button"]',
      '.ant-modal-close',
      '.modal-close',
    ];

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          break;
        }
      } catch {
        // Continue to next selector
      }
    }

    // Wait for modal to disappear
    await this.page.waitForSelector(
      '.ant-modal, [data-testid="project-create-modal"], .modal',
      {
        state: 'hidden',
        timeout,
      },
    );
  }

  getPage(): Page {
    if (!this.page) throw new Error('Page not initialized');
    return this.page;
  }

  getApp(): ElectronApplication {
    if (!this.electronApp) throw new Error('Electron app not initialized');
    return this.electronApp;
  }
}

export const commonSelectors = {
  createProjectButton:
    'button:has-text("Create Project"), button:has-text("New Project"), [data-testid="create-project"], .ant-btn:has-text("Create"), .create-project-btn',
  openProjectButton:
    'button:has-text("Open Project"), button:has-text("Open"), [data-testid="open-project"], .ant-btn:has-text("Open"), .open-project-btn',
  projectNameInput:
    'input[placeholder*="project name"], input[name="name"], [data-testid="project-name"], .ant-input[placeholder*="name"]',
  projectDescInput:
    'textarea[placeholder*="description"], textarea[name="description"], [data-testid="project-description"], .ant-input[placeholder*="description"]',
  projectTypeSelect:
    'select[name="type"], .ant-select, [data-testid="project-type"], .project-type-select',
  modal:
    '.ant-modal, [data-testid="project-create-modal"], .modal, .ant-modal-content',
  cancelButton:
    'button:has-text("Cancel"), .ant-btn:has-text("Cancel"), [data-testid="cancel-button"], .ant-modal-close-x',
  submitButton:
    'button:has-text("Create"), button:has-text("Submit"), .ant-btn-primary, [data-testid="submit-button"], button[type="submit"]',
  mainContent:
    '[data-testid="main-content"], .main-content, main, .ant-layout-content',
  // Better T Stack specific selectors
  betterTStackToggle:
    '[data-testid="better-t-stack-toggle"]',
  betterTStackConfig:
    '[data-testid="better-t-stack-config"], .better-t-stack-builder, .better-t-stack-configuration',
  frontendSelect:
    '[data-testid="frontend-select"], .frontend-select .ant-select, .better-t-stack-builder .ant-select',
  databaseSelect:
    '[data-testid="database-select"], .database-select .ant-select, .better-t-stack-builder .ant-select',
  commandPreview:
    '[data-testid="command-preview"], .command-preview, .generated-command, code',
  projectSummary:
    '[data-testid="project-summary"], .project-summary, .summary-section',
  betterTStackSubmitButton:
    'button:has-text("Create Better T Stack Project"), button:has(.anticon-thunderbolt), .better-t-stack-submit',
};
