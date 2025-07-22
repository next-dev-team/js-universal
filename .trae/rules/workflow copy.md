# AI Agent Development Workflow

## Core Rules
1. Atomic Development: Complete features end-to-end before moving on
2. Follow CRUD sequence with tests at each step
3. Verify with `npm run type:check && npm test && npm run e2e`

## Pre-Flight
- Review project_rules.md & plan.md
- Run verification commands

## Project Structure
Key directories:
- main/: Electron main process
- renderer/: UI components & pages
- e2e/: End-to-end tests

Each feature page includes:
- Component, types, tests (unit & e2e), styles

### File Naming Conventions

- **Pages**: PascalCase folders (`UserManagement/`)
- **Components**: PascalCase folders (`CreateUserForm/`)
- **Services**: camelCase files (`userService.ts`)
- **Tests**: Match source file (`index.test.tsx`, `index.e2e.ts`)

## Implementation Flow

### 1. Setup

Create `README.md` with checklist:

```markdown
# [Feature] Checklist

## Create: [ ] Database [ ] IPC [ ] Service [ ] Component [ ] Unit Tests [ ] E2E Tests

## Read: [ ] Database [ ] IPC [ ] Service [ ] List [ ] Unit Tests [ ] E2E Tests

...
```

### 2. Database Setup (better-sqlite3)

```typescript
// File: main/services/database.ts
import Database from 'better-sqlite3';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'app.db');
export const db = new Database(dbPath);

// Initialize tables
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
...
)`);

// Prepared statements
export const userQueries = {
  create: db.prepare('INSERT INTO users (name, email) VALUES (?, ?)'),
...
};
```

### 3. CRUD Implementation Pattern

#### Create Operation

```typescript
// 1. Main Process Handler
ipcMain.handle('user:create', async (_, userData) => {
  const result = userQueries.create.run(userData.name, userData.email);
  return { id: result.lastInsertRowid, ...userData };
});

// 2. Renderer Service
export const createUser = async (userData: CreateUserDto) => {
  return await window.electron.ipc.invoke('user:create', userData);
};

// 3. Component
const CreateUserForm = () => {
  const handleSubmit = async (values) => {
    await createUser(values);
    message.success('User created');
  };
  return <Form onFinish={handleSubmit}>...</Form>;
};
```

#### Read Operation

```typescript
// Handler
ipcMain.handle('user:list', async () => userQueries.getAll.all());

// Service
export const getUsers = () => window.electron.ipc.invoke('user:list');

// Component
const UserList = () => {
  const { data, loading } = useQuery(['users'], getUsers);
  return <Table dataSource={data} loading={loading} />;
};
```

#### Update Operation

```typescript
// Handler
ipcMain.handle('user:update', async (_, { id, data }) => {
  userQueries.update.run(data.name, data.email, id);
  return { id, ...data };
});

// Service & Component follow same pattern...
```

#### Delete Operation

```typescript
// Handler
ipcMain.handle('user:delete', async (_, id) => {
  userQueries.delete.run(id);
  return { deleted: true, id };
});

// Component with confirmation
const DeleteButton = ({ user }) => {
  const handleDelete = () => {
    Modal.confirm({
      title: `Delete ${user.name}?`,
      onOk: () => deleteUser(user.id)
    });
  };
  return <Button danger onClick={handleDelete}>Delete</Button>;
};
```

## Testing Strategy

### Unit Tests

```typescript
// Component test
test('creates user successfully', async () => {
  render(<CreateUserForm />);
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
  fireEvent.click(screen.getByText('Submit'));
  await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
});
```

### E2E Tests (Playwright)

```typescript
// e2e/user-management.spec.ts
test('user CRUD workflow', async ({ page }) => {
  await page.goto('/users');

  // Create
  await page.click('[data-testid="add-user"]');
...
  await expect(page.locator('text=User created')).toBeVisible();

  // Read
  await expect(page.locator('text=John Doe')).toBeVisible();

  // Update

  // Delete

});
```

## Verification Checklist

After each CRUD step:

- [ ] `npm run type:check` (0 errors)
- [ ] `npm test -- --testPathPattern=[feature]` (80%+ coverage)
- [ ] `npm run e2e -- --grep=[feature]` (all scenarios pass)
- [ ] `npm run build` (no errors)
- [ ] Manual smoke test

## Definition of Done

- [ ] TypeScript compiles
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass (critical paths)
- [ ] Build succeeds
- [ ] Runtime works without errors
- [ ] Error handling implemented

## Database Migration Pattern

```typescript
const migrations = [
  { version: 1, up: () => db.exec(`CREATE TABLE users...`) },
  { version: 2, up: () => db.exec(`ALTER TABLE users ADD...`) },
];

export const runMigrations = () => {
  const currentVersion = db.pragma('user_version', { simple: true });
  migrations.slice(currentVersion).forEach((migration) => {
    migration.up();
    db.pragma(`user_version = ${migration.version}`);
  });
};
```

## Quick Commands

```json
{
  "verify": "npm run type:check && npm run build && npm test && npm run e2e",
  "verify:feature": "npm test -- --testPathPattern=$FEATURE && npm run e2e -- --grep=$FEATURE"
}
```

## Troubleshooting

- **Type errors**: `npx tsc --noEmit --pretty`
- **Test failures**: `npm test -- --verbose --no-coverage`
- **E2E failures**: `npm run e2e -- --headed --debug`
- **Build issues**: `rm -rf dist/ && npm run build`

## Key Points for AI Agents

- Complete one CRUD operation fully (including E2E) before next
- Always verify after each step - don't accumulate issues
- Use feature checklist to track progress
- E2E tests cover critical user workflows
- Test coverage >80% is mandatory for unit tests
