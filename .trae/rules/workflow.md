# Enhanced AI Agent Development Workflow

## Core Principles

1. **Atomic Development**: Each feature must be complete (logic + UI + tests) before moving to next
2. **CRUD Sequential Implementation**: Create → Read → Update → Delete
3. **Continuous Verification**: Test at each step, not just at the end
4. **Documentation-Driven**: Always sync docs with implementation

## Pre-Development Checklist

Before starting any feature:

- [ ] Review `project_rules.md` and `plan.md`
- [ ] Run baseline checks: `npm run type:check && npm test`

## Project Structure

```
src/
src/
├── main/               # Main process code
│   ├── index.ts       # Main entry point
│   ├── ipc/           # IPC handlers
│   └── services/      # Main process services
├── renderer/          # Renderer process code
│   ├── components/    # Global reusable components
│   ├── pages/         # Application pages/routes
│   │   ├── [PageName]/
│   │   │   ├── README.md     # Feature documentation
│   │   │   ├── index.tsx     # Page component
│   │   │   ├── index.d.ts    # Type definitions
│   │   │   ├── index.test.tsx # Tests
│   │   │   ├── index.css     # Styles
│   │   │   ├── preload.ts    # Page-specific preload script
│   │   │   ├── hooks/        # Page hooks
│   │   │   ├── services/     # IPC communication
│   │   │   └── components/   # Page components
│   │   │       ├── [Component]/
│   │   │       │   ├── index.tsx
│   │   │       │   ├── index.test.tsx
│   │   │       │   └── index.css
│   └── utils/
│       ├── test-utils.tsx    # Testing utilities
│       └── constants.ts      # App constants
└── preload/           # Preload scripts
    ├── index.ts      # Main preload script
    └── api.ts        # Exposed API definitions

├── components/           # Global reusable components
├── pages/
│   ├── [PageName]/
│   │   ├── README.md     # Feature checklist & documentation
│   │   ├── index.tsx     # Main page component
│   │   ├── index.d.ts    # Type definitions
│   │   ├── index.test.tsx # Page-level tests
│   │   ├── index.css     # Tailwind + AntD styles
│   │   ├── hooks/        # Page-specific hooks
│   │   ├── services/     # API calls and business logic
│   │   └── components/   # Page-specific components
│   │       ├── [Component]/
│   │       │   ├── index.tsx
│   │       │   ├── index.test.tsx
│   │       │   └── index.css
└── utils/
    ├── test-utils.tsx    # Testing utilities
    └── constants.ts      # App constants
```

## Feature Implementation Workflow

### Phase 1: Planning & Setup

1. **Create Feature Documentation**

   ```bash
   # Create README.md for the feature
   touch pages/[FeatureName]/README.md
   ```

2. **Define Feature Checklist in README.md**

   ```markdown
   # [Feature Name] Implementation Checklist

   ## Create Operations

   - [ ] API service method
   - [ ] Component implementation
   - [ ] Form validation
   - [ ] Error handling
   - [ ] Unit tests (>80% coverage)
   - [ ] Integration tests

   ## Read Operations

   - [ ] API service method
   - [ ] List/Grid component
   - [ ] Pagination/filtering
   - [ ] Loading states
   - [ ] Empty states
   - [ ] Unit tests

   ## Update Operations

   - [ ] API service method
   - [ ] Edit form component
   - [ ] Optimistic updates
   - [ ] Conflict resolution
   - [ ] Unit tests

   ## Delete Operations

   - [ ] API service method
   - [ ] Confirmation modal
   - [ ] Bulk delete (if needed)
   - [ ] Undo functionality
   - [ ] Unit tests
   ```

### Phase 2: Implementation (CRUD Sequential)

#### Step 1: Create Functionality

```bash
# 1. Implement service layer
npm run type:check
npm test -- --testPathPattern=services/[feature].test

# 2. Implement component
npm test -- --testPathPattern=components/[CreateComponent].test

# 3. Integration test
npm test -- --testPathPattern=pages/[Feature].test

# 4. Verify build
npm run build
```

#### Step 2: Read Functionality

```bash
# Follow same pattern as Create
# Focus on list rendering, pagination, search
```

#### Step 3: Update Functionality

```bash
# Implement edit forms, validation, optimistic updates
```

#### Step 4: Delete Functionality

```bash
# Implement delete with confirmation, bulk operations
```

## Enhanced Verification Process

### Continuous Verification (After Each CRUD Step)

1. **Type Safety Check**

   ```bash
   npm run type:check
   # Must pass with 0 errors before proceeding
   ```

2. **Unit Test Verification**

   ```bash
   # Test only current feature files
   npm test -- --testPathPattern=[current-feature] --coverage --watchAll=false
   # Require minimum 80% coverage for new code
   ```

3. **Build Verification**

   ```bash
   npm run build
   # Must complete without errors or warnings
   ```

4. **Runtime Verification**

   ```bash
   npm start
   # Manually test the implemented functionality
   # Check browser console for errors
   # Test responsive behavior
   ```

### End-of-Feature Verification

1. **Full Test Suite**

   ```bash
   npm test -- --coverage --watchAll=false
   # All tests must pass
   # Coverage report should show adequate coverage
   ```

2. **E2E Testing** (if applicable)

   ```bash
   npm run test:e2e
   ```

### Definition of Done Checklist

For each feature to be considered "DONE":

#### Technical Requirements

- [ ] TypeScript compilation passes (`npm run type:check`)
- [ ] All unit tests pass with >80% coverage
- [ ] Build completes successfully (`npm run build`)
- [ ] Application runs without console errors (`npm start`)
- [ ] ESLint and Prettier checks pass

#### Functional Requirements

- [ ] Feature works as specified in requirements
- [ ] Error handling implemented for all failure scenarios
- [ ] Loading states implemented for async operations
- [ ] Responsive design works on mobile and desktop
- [ ] Form validation provides clear user feedback

#### Documentation Requirements

- [ ] README.md updated with feature description
- [ ] API documentation updated (if applicable)
- [ ] Type definitions are comprehensive
- [ ] Code comments explain complex business logic

## Automated Scripts

Create these npm scripts for streamlined workflow:

```json
{
  "scripts": {
    "verify": "npm run type:check && npm run build && npm test -- --watchAll=false",
    "verify:feature": "npm test -- --testPathPattern=$FEATURE --coverage --watchAll=false",
    "dev:clean": "rm -rf node_modules/.cache && npm start",
    "test:watch:feature": "npm test -- --testPathPattern=$FEATURE --watch",
    "pre-commit": "lint-staged && npm run verify"
  }
}
```

## Debugging and Troubleshooting

### Common Issues and Solutions

1. **Type Errors**

   ```bash
   # Generate detailed type report
   npx tsc --noEmit --pretty
   ```

2. **Test Failures**

   ```bash
   # Run tests with detailed output
   npm test -- --verbose --no-coverage
   ```

3. **Build Failures**

   ```bash
   # Clean build
   rm -rf dist/ && npm run build
   ```

4. **Runtime Errors**

   ```bash
   # Start with error overlay
   REACT_APP_DEV_MODE=true npm start
   ```

## Workflow Optimization Tips

1. **Use Feature Flags**: Implement features behind flags for safer deployments
2. **Parallel Development**: Use separate branches for different CRUD operations
3. **Mock Services**: Create mock implementations for faster frontend development
4. **Automated Testing**: Set up CI/CD pipeline to run verification automatically
5. **Code Review**: Use pull request templates to ensure all verification steps are completed

## Monitoring and Metrics

Track these metrics to improve your workflow:

- Time to complete each CRUD operation
- Number of bugs found in each phase
- Test coverage trends
- Build time optimization
- Developer satisfaction scores
