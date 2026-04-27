# Testing & Verification

To ensure system stability, this project adopts a **Test-Driven Development (TDD)** workflow and uses **Vitest** as the framework for unit and integration tests.

Developers are strongly encouraged to ensure all automated tests pass before committing any code or feature modifications.

## Running Automated Tests
Ensure you are in the `travelagent` directory, then use the following commands to run tests:

### 1. Run All Tests (Once)
The basic test command scans all `*.test.ts` and `*.test.tsx` files in the project and executes them:
```bash
npx vitest run
```
*(In our Conductor workflow, the AI usually adds the `CI=true` flag to ensure non-interactive execution: `CI=true npx vitest run`)*

### 2. Run Specific Tests
If you only modified a specific component and want to test that file alone, you can add keywords or paths:
```bash
npx vitest run actions.test.ts
```

### 3. Watch Mode
During local development, you can use watch mode. Tests will automatically re-run whenever you save a file:
```bash
npx vitest
```

### 4. Generate Coverage Report
To view the current test coverage (our project target is >80%), run:
```bash
npx vitest run --coverage
```
This prints a detailed report in the terminal and generates an HTML report in the coverage folder for browser viewing.

---

## Manual Verification & Debugging
Besides automated tests, some UI interactions and visual effects require manual confirmation:
1. **Component Checks**: Ensure Loading screens (like `GlobalLoader`) correctly block background interactions.
2. **Terminal Logs**: We use a `logger` utility on the server side. If AI errors occur during development, you can view detailed `console.error` or `logger.info` outputs in the terminal running `npm run dev`. These logs will contain the specific reasons for API failures.