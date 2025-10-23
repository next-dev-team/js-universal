# Pinokio Terminal API Tests

This directory contains Vitest tests for the Pinokio Terminal API routes.

## Test File

- **`pterm-routes.test.ts`** - Complete test suite for all `/api/pterm` endpoints

## Running Tests

### Run All API Tests
```bash
npm run test:api
```

### Run Tests in Watch Mode
```bash
npm run test -- tests/api
```

### Run Tests with UI
```bash
npm run test:ui
```

Then navigate to the `tests/api` folder in the Vitest UI.

### Run All Tests
```bash
npm run test:run
```

## Test Coverage

The test suite covers:

### ✅ Version Endpoints
- `GET /api/pterm/version` - Get all version information
- `GET /api/pterm/version/:component` - Get specific component version
- Invalid component error handling

### ✅ Clipboard Endpoints
- `POST /api/pterm/clipboard/copy` - Copy text to clipboard
- `GET /api/pterm/clipboard/paste` - Paste text from clipboard
- Validation for required fields

### ✅ Notification Endpoints
- `POST /api/pterm/push` - Send desktop notifications
- With minimal and full options
- Validation for required fields

### ✅ Script Management Endpoints
- `POST /api/pterm/start` - Start Pinokio scripts
- `POST /api/pterm/stop` - Stop Pinokio scripts
- `POST /api/pterm/run` - Run Pinokio launchers
- Validation for required fields
- Arguments formatting

### ✅ Error Handling
- 404 responses for non-existent endpoints
- 400 responses for validation errors
- Malformed JSON handling

### ✅ Health Check
- `GET /api/health` - Server health check

## Test Setup

The tests:
1. **Start a test server** on port 3002 before running tests
2. **Make real HTTP requests** to the API endpoints
3. **Clean up** by closing the server after all tests complete

## Important Notes

### Server Must Be Running
The tests start their own test server on port **3002** (different from the dev server on port 3001), so you don't need to run `npm run server:dev` separately.

### Real Commands
The tests execute real `pterm` commands via `npx`. Some tests may fail if:
- `pterm` is not properly installed (`npm install` required)
- Pinokio daemon is not running (for some features)
- Scripts referenced in tests don't exist

### Environment
Tests run in a **Node.js environment** (not browser), so they have access to:
- `fetch` API (Node 18+)
- File system
- Child process execution
- Network requests

## Test Structure

```typescript
describe("Pinokio Terminal API Routes", () => {
  beforeAll(async () => {
    // Start test server on port 3002
  });

  afterAll(async () => {
    // Close test server
  });

  describe("Version Endpoints", () => {
    it("should get all version information", async () => {
      // Test implementation
    });
  });

  // More test suites...
});
```

## Debugging Tests

### Verbose Output
Tests include console.log statements for successful operations:
```bash
✅ Version response: { success: true, data: {...} }
✅ Terminal version: pterm@0.0.14
✅ Clipboard copy successful
```

### Individual Test
Run a specific test:
```bash
npm run test -- tests/api/pterm-routes.test.ts -t "should get all version information"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/vitest tests/api
```

## CI/CD Integration

To run these tests in CI/CD:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm install

- name: Run API tests
  run: npm run test:api
```

### Considerations for CI
- Some tests may need to be skipped if Pinokio daemon isn't available
- Notification tests won't display actual notifications in headless environments
- Clipboard tests may fail in some CI environments without display

## Adding New Tests

To add tests for new endpoints:

1. Add the test suite to `pterm-routes.test.ts`:
```typescript
describe("New Feature Endpoints", () => {
  it("should test new endpoint", async () => {
    const response = await fetch(`${API_BASE}/api/pterm/new-endpoint`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

2. Run the tests:
```bash
npm run test:api
```

## Mocking (Optional)

For tests that shouldn't execute real `pterm` commands, you can mock the `execAsync` function:

```typescript
import { vi } from 'vitest';

vi.mock('child_process', () => ({
  exec: vi.fn((cmd, callback) => {
    callback(null, { stdout: 'mocked output', stderr: '' });
  })
}));
```

## Troubleshooting

### Port Already in Use
If port 3002 is already in use:
- Change `TEST_PORT` in the test file
- Kill the process using port 3002

### Tests Timing Out
- Increase timeout in `vitest.config.ts`:
```typescript
testTimeout: 30000, // 30 seconds
```

### Module Import Errors
- Ensure `type: "module"` is in `package.json`
- Use `.js` extensions in imports for ESM compatibility

## Example Output

```bash
$ npm run test:api

 ✓ tests/api/pterm-routes.test.ts (15)
   ✓ Pinokio Terminal API Routes (15)
     ✓ Version Endpoints (4)
       ✓ should get all version information
       ✓ should get specific terminal version
       ✓ should get specific script version
       ✓ should return 400 for invalid component
     ✓ Clipboard Endpoints (3)
       ✓ should copy text to clipboard
       ✓ should return 400 when copying without text
       ✓ should paste text from clipboard
     ✓ Notification Endpoint (3)
       ✓ should send desktop notification with minimal data
       ✓ should send desktop notification with all options
       ✓ should return 400 when sending notification without message
     ✓ Script Management Endpoints (4)
       ✓ should return 400 when starting script without path
       ✓ should return 400 when stopping script without path
       ✓ should return 400 when running launcher without path
       ✓ should handle script start with arguments format correctly
     ✓ API Error Handling (2)
       ✓ should return 404 for non-existent endpoint
       ✓ should handle malformed JSON in POST requests
     ✓ Health Check (1)
       ✓ should respond to health check endpoint

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  [timestamp]
   Duration  [duration]
```

---

**Happy Testing! 🧪✅**

