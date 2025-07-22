# E2E Testing with Playwright

This directory contains end-to-end tests for the Electron application using Playwright.

## Setup

The E2E testing setup includes:

- **Playwright**: For browser automation and testing
- **Electron support**: Custom configuration for testing Electron applications
- **Test helpers**: Reusable utilities for common testing operations

## Running Tests

### Prerequisites

1. Build the application first:
   ```bash
   npm run build:dev
   ```

2. Install Playwright browsers (if not already done):
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# List all available tests
npx playwright test --list

# Run specific test file
npx playwright test project-creation.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed
```

## Test Structure

### Test Files

- `project-creation.spec.ts`: Focused tests for project creation functionality
- `project-workflows.spec.ts`: Comprehensive workflow tests
- `helpers/electron-helpers.ts`: Reusable test utilities

### Test Coverage

The E2E tests cover:

1. **Application Loading**
   - Main window initialization
   - IPC communication verification
   - Console error detection

2. **Project Creation**
   - Modal opening/closing
   - Form field validation
   - Project type selection
   - Form submission behavior

3. **Project Opening**
   - File dialog interactions
   - Project detection functionality

4. **IPC Functionality**
   - Renderer-to-main process communication
   - ElectronAPI availability

## Configuration

The Playwright configuration is in `playwright.config.ts` and includes:

- **Electron-specific settings**: Custom launch options for Electron
- **Test directory**: Points to the `e2e` folder
- **Reporters**: HTML reporter for test results
- **Timeouts**: Appropriate timeouts for Electron app startup

## Helper Utilities

The `ElectronTestHelper` class provides:

- `launchApp()`: Start the Electron application
- `closeApp()`: Clean shutdown of the application
- `waitForElement()`: Wait for UI elements
- `clickElement()`: Click on elements with proper waiting
- `fillInput()`: Fill form inputs
- `isElementVisible()`: Check element visibility
- `waitForModal()`: Wait for modal dialogs
- `closeModal()`: Close modal dialogs

## Common Selectors

Predefined selectors for common UI elements:

```typescript
const commonSelectors = {
  createProjectButton: 'button:has-text("Create Project")',
  projectNameInput: 'input[name="name"]',
  modal: '.ant-modal',
  // ... more selectors
};
```

## Best Practices

1. **Build before testing**: Always run `npm run build:dev` before E2E tests
2. **Use helpers**: Leverage the `ElectronTestHelper` class for common operations
3. **Robust selectors**: Use multiple selector strategies for reliability
4. **Proper cleanup**: Ensure apps are closed after tests
5. **Error handling**: Handle missing elements gracefully

## Troubleshooting

### Common Issues

1. **"Electron not found" error**:
   - Ensure the build completed successfully
   - Check that `dist-electron/main/index.cjs` exists

2. **Timeout errors**:
   - Increase timeouts in test configuration
   - Ensure the application builds without errors

3. **Element not found**:
   - Check if selectors match the actual UI
   - Use `--headed` mode to see what's happening

4. **IPC communication issues**:
   - Verify that `initIpcMain()` is called in the main process
   - Check console for IPC-related errors

### Debug Mode

Use debug mode to step through tests:

```bash
npm run test:e2e:debug
```

This opens the Playwright inspector for interactive debugging.

## CI/CD Integration

For continuous integration:

1. Ensure all dependencies are installed
2. Run the build step
3. Execute tests in headless mode
4. Generate and store test reports

Example CI command:
```bash
npm run build:dev && npm run test:e2e
```