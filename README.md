# Simplenight Lead QA Take-Home Assignment

A production-ready Playwright + TypeScript test automation framework for the Simplenight booking platform. Demonstrates enterprise-grade QA practices including Data-Driven Testing, reusable fixtures, structured logging, containerization, and CI/CD integration.

## Overview

This project implements a scalable, maintainable end-to-end test automation framework for the Simplenight hotel booking flow using:

- **Playwright** + **TypeScript** for reliable, fast, maintainable tests
- **Page Object Model (POM)** for clean separation of concerns
- **Data-Driven Testing (DDT)** for parametrized test execution with multiple datasets
- **Playwright Fixtures** for reusable test infrastructure
- **Structured Logging** for observability and metrics
- **Docker** for environment consistency and scalability
- **GitHub Actions** for automated CI/CD pipeline

### Test Scenarios (DDT)

The framework runs multiple parametrized tests covering different hotel booking scenarios:

1. **Miami - Budget Conscious**: Location: Miami, Dates: Aug 1–3, Price: $100–1000+
2. **Los Angeles - Mid-Range**: Location: Los Angeles, Dates: Sept 10–12, Price: $150–1000+

Each scenario executes the complete booking flow:

1. Navigate to the Simplenight staging homepage
2. Select the Hotels category from the navbar
3. Perform a search with scenario-specific parameters
4. Switch to Map view for search results
5. Apply filters (Price Range + Guest Score: "Very Good")
6. Zoom in on the map and select one hotel option from the map markers
7. Validate the hotel card displays Price and Guest Score within filtered parameters

The implementation keeps the hotel selection strictly map-first. The map interaction supports both visible hotel buttons rendered inside the map and Google Maps advanced markers, because the staging UI can render either representation depending on zoom level and result density.

## Architecture

```
├── .github/workflows/
│   └── e2e-tests.yml            # GitHub Actions CI/CD pipeline
├── src/
│   ├── config/
│   │   └── environments.ts      # Environment configuration (staging, production, local)
│   ├── data/
│   │   └── testData.ts          # DDT datasets for parametrized testing
│   ├── pages/
│   │   ├── App.ts               # Main app object (composes all page objects)
│   │   ├── NavigationBar.ts     # Navbar navigation component
│   │   ├── SearchPanel.ts       # Search form component
│   │   ├── SearchResultsPage.ts # Search results, map zoom, hotel selection
│   │   ├── FiltersPanel.ts      # Left panel filters
│   │   ├── HotelCardPage.ts     # Hotel card details and validation
│   │   └── index.ts             # Barrel exports
│   └── utils/
│       └── logger.ts            # Structured logging for observability
├── tests/
│   ├── hotel-booking.spec.ts    # Main test spec (parametrized with DDT)
│   └── fixtures.ts              # Playwright fixtures (App, Logger)
├── Dockerfile                   # Docker image for containerized test execution
├── playwright.config.ts         # Playwright configuration
├── eslint.config.mjs            # ESLint configuration
├── .npmrc                       # NPM registry configuration
├── .prettierrc                  # Prettier code formatting configuration
└── README.md                    # This file
```

### Page Object Model (POM)

The framework uses a composable POM pattern:

- **App**: Main class that composes all page objects and is the single entry point in tests
- **NavigationBar**: Handles hotel category navigation
- **SearchPanel**: Manages search form interactions (location, dates, guests)
- **SearchResultsPage**: Handles result loading, map/list view switching, map zoom, and hotel selection
- **FiltersPanel**: Manages price range and guest score filters
- **HotelCardPage**: Handles hotel card display and validation

All locators are encapsulated in page classes — no locators appear in spec files.

### Data-Driven Testing (DDT)

Test data is organized in `src/data/testData.ts` as a collection of test scenarios:

```typescript
export const testDataCollection = [
  { search: searchData, filter: filterData, scenario: 'Miami - Budget Conscious' },
  { search: searchDataAlternet, filter: filterDataAlternate, scenario: 'Los Angeles - Mid-Range' },
];
```

Uses `test.each()` to parametrize the test and run each scenario as a separate test instance, demonstrating:

- Test scalability with multiple datasets
- Parameter isolation for independent test execution
- Clear scenario naming for test reports

### Playwright Fixtures

Custom fixtures in `tests/fixtures.ts` provide reusable test infrastructure:

```typescript
test.extend<TestFixtures>({
  app: async ({ page }, use) => {
    /* App object */
  },
  logger: async ({ page }, use, testInfo) => {
    /* Logger with test context */
  },
});
```

Benefits:

- Eliminates boilerplate in each test
- Provides pre-initialized `App` object
- Injects test-aware logger with automatic context tracking
- Simplifies fixture composition and reusability

### Structured Logging & Observability

The framework includes a lightweight, built-in logger (`src/utils/logger.ts`) that provides:

- **Multiple log levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Structured context**: Logs include test name and custom metadata
- **Metrics tracking**: Summary of log entries by level
- **Integration with Playwright reporting**: Logs are printed during test execution for visibility

Each test step uses `test.step()` to create nested, collapsible sections in Playwright HTML reports:

```typescript
await test.step('Step description', async () => {
  logger.info('Performing action', { metadata });
  // test code
});
```

Log output during test execution:

```
[2026-07-18T14:25:30.123Z] INFO [Step]: Test started: should complete full hotel booking search: Miami - Budget Conscious | { test: 'Miami - Budget Conscious' }
[2026-07-18T14:25:32.456Z] DEBUG: Homepage title verified
[2026-07-18T14:25:35.789Z] INFO: Hotels category clicked
```

**Observability Benefits**:

- Real-time visibility into test execution flow
- Structured data for metrics collection and alerting
- Easy correlation with CI/CD logs and error traces
- Foundation for building dashboards and reporting

## Requirements

- Node.js 20+ (node 18 supported but 20 recommended)
- npm or yarn
- Docker (optional, for containerized execution)

## Installation

### Local Setup

```bash
# Install dependencies (uses .npmrc for npm registry)
npm install

# Install Playwright browsers
npx playwright install chromium

# Verify installation
npm run lint  # Should pass without errors
npm run format:check  # Should pass without errors
```

### Dependencies

Core dependencies:

- **@playwright/test**: ^1.61.1 — E2E testing framework
- **TypeScript**: Dev dependency for type checking
- **ESLint + Prettier**: Code quality and formatting

Optional (for advanced observability):

- **Winston**: Can be added for advanced logging to files/external services (not required for current setup)

The framework uses Playwright's built-in logger and `test.step()` for observability without external dependencies.

## Quick Reference: Available Scripts

| Command                      | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `npm test`                   | Run all tests (2 DDT scenarios)       |
| `npm run test:headed`        | Run tests with visible browser window |
| `npm run test:ui`            | Run tests in interactive UI mode      |
| `npm run test:debug`         | Debug tests with Playwright Inspector |
| `npm run report`             | View HTML test report                 |
| `npm run lint`               | Run ESLint checks                     |
| `npm run lint:fix`           | Fix ESLint issues automatically       |
| `npm run format:check`       | Check code formatting                 |
| `npm run format`             | Auto-format code with Prettier        |
| `npm run docker:build`       | Build Docker image                    |
| `npm run docker:test`        | Run tests in Docker container         |
| `npm run docker:test:headed` | Run headed tests in Docker            |
| `npm run docker:clean`       | Remove Docker image                   |

## Running Tests

### Local Execution

```bash
# Run all tests (DDT: both Miami and Los Angeles scenarios)
npm test

# Run tests in headed mode (visible browser window)
npm run test:headed

# Run tests in UI mode (interactive mode with live editing)
npm run test:ui

# Debug tests with Playwright Inspector
npm run test:debug

# View HTML test report (after test execution)
npm run report
```

### Test Output

**Console Output** (includes structured logs):

```
[2026-07-18T...] INFO [Step]: Test started: should complete full hotel booking search: Miami - Budget Conscious
[2026-07-18T...] INFO: Navigating to Simplenight staging homepage
[2026-07-18T...] DEBUG: Homepage title verified
[2026-07-18T...] INFO: Selecting Hotels category
...
[2026-07-18T...] INFO: Test completed successfully | { total: 45, byLevel: {...} }
```

**Reports Generated**:

- `html-report/index.html` — Interactive HTML report with screenshots, videos, and nested test steps
- `junit-report/results.xml` — JUnit XML format for CI/CD integration
- `test-results/` — Test artifacts (screenshots, videos, traces) on failure

### Using Docker

Build and run tests in an isolated container:

```bash
# Build Docker image (one-time setup)
npm run docker:build

# Run tests in container (outputs reports to local directories)
npm run docker:test

# Run tests in headed mode (visible browser) in container
npm run docker:test:headed

# Remove Docker image (cleanup)
npm run docker:clean
```

**Manual Docker commands** (if not using npm scripts):

```bash
# Build Docker image
docker build -t simplenight-tests:latest .

# Run tests in container
docker run --rm \
  -e BASE_URL=https://wl.stg.simplenight.com \
  -v $(pwd)/html-report:/app/html-report \
  -v $(pwd)/junit-report:/app/junit-report \
  -v $(pwd)/test-results:/app/test-results \
  simplenight-tests:latest

# Run tests with verbose output
docker run --rm -it \
  -e BASE_URL=https://wl.stg.simplenight.com \
  simplenight-tests:latest npm run test:headed

# Mount local reports to host machine
docker run --rm \
  -v $(pwd)/html-report:/app/html-report \
  -v $(pwd)/junit-report:/app/junit-report \
  -e BASE_URL=https://wl.stg.simplenight.com \
  simplenight-tests:latest
```

**Docker Benefits**:

- Consistent environment across local, CI, and production
- Eliminates "works on my machine" issues
- Enables easy scaling with container orchestration (Kubernetes, etc.)
- Isolates test dependencies from host system

## Code Quality

### Pre-execution Checks

```bash
# Run ESLint (catches syntax/style issues)
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check code formatting with Prettier
npm run format:check

# Auto-format code with Prettier
npm run format
```

### CI/CD Code Quality Pipeline

The GitHub Actions workflow automatically runs:

1. **ESLint**: TypeScript syntax, style rules, Playwright best practices
2. **Prettier**: Code formatting consistency
3. **Staging Access Check**: Verifies test environment is reachable (curl health check)

If any check fails, the pipeline stops before running tests.

## Configuration

### Environment Variables

All environment configuration is centralized in `src/config/environments.ts`:

- `TEST_ENV`: Environment name loaded from config (`staging`, `production`, `local`)
- `BASE_URL`: Optional override for base URL (if not set, uses default from TEST_ENV)
- `CI`: Set automatically in GitHub Actions for CI-specific behavior

### Playwright Configuration

Key settings in `playwright.config.ts`:

| Setting         | Value                        | Purpose                                            |
| --------------- | ---------------------------- | -------------------------------------------------- |
| **Browser**     | Chromium only                | Consistent cross-platform testing                  |
| **Reports**     | HTML + JUnit                 | Human-readable reports + CI/CD integration         |
| **Screenshots** | Only on failure              | Artifact storage optimization                      |
| **Video**       | Retain on failure            | Debug information for flaky tests                  |
| **Retries**     | 0 local / 2 in CI            | Fail fast locally, handle transient issues in CI   |
| **Workers**     | Auto local / 1 in CI         | Parallel execution locally, stable execution in CI |
| **Trace**       | On first retry               | Detailed trace for debugging failures              |
| **Geolocation** | Miami (25.7617°N, 80.1918°W) | Realistic location context for hotel searches      |
| **Timezone**    | America/New_York             | Correct date/time for search filters               |

### NPM Registry Configuration

The `.npmrc` file configures npm to use the public NPM registry:

```
registry=https://registry.npmjs.org
audit=true
audit-level=moderate
```

Ensures:

- All packages come from official npm registry
- Automatic security audits on install
- Consistent dependency resolution across environments

## Continuous Integration (CI/CD)

### GitHub Actions Workflow

The `.github/workflows/e2e-tests.yml` pipeline runs automatically on:

- Push to `main` or `master` branches
- Pull requests to `main` or `master`
- Manual workflow dispatch

### Workflow Stages

1. **Lint & Format Check** (`lint-and-format` job)
   - ESLint validation
   - Prettier formatting check
   - Fails if code quality checks fail

2. **Staging Access Verification** (`check-accessibility` job)
   - Health check: `curl -I https://wl.stg.simplenight.com/`
   - Non-blocking (continues even if fails, for diagnostics)
   - Ensures test environment is reachable

3. **E2E Tests** (`e2e-tests` job, depends on 1 & 2)
   - Checkout code
   - Setup Node.js 20
   - Install dependencies with npm cache
   - Cache Playwright browsers (~350MB) to save ~2 minutes per run
   - Conditional browser installation:
     - First run: `npx playwright install --with-deps chromium`
     - Cache hit: `npx playwright install-deps chromium` (OS deps only)
   - Run E2E tests in Chromium browser
   - Upload HTML and JUnit reports as artifacts (30-day retention)
   - Upload screenshots/videos on failure (7-day retention)
   - Publish JUnit results to GitHub for PR visibility
   - Create job summary with report links

### Artifact Retention & Reporting

- **HTML Reports**: Interactive Playwright report with step details, screenshots, videos
- **JUnit Reports**: XML format for CI/CD systems, GitHub issue integration
- **Test Artifacts**: Only on failure, includes traces for root cause analysis

Accessible via:

- GitHub Actions Artifacts tab
- Test Reporter integration on PR/commit
- GitHub Checks API for custom integrations

## Key Design Decisions

### Why This Architecture?

1. **Extensibility**: New pages/categories can be added by creating new page classes
2. **Maintainability**: Locators are isolated in page classes, not scattered in specs
3. **Reusability**: Test data is separated from test logic via DDT
4. **Environment Agnostic**: Configuration supports multiple environments
5. **Scalability**: Containerized with Docker for consistent execution across environments
6. **Observability**: Built-in structured logging for metrics and debugging

### Data-Driven Testing (DDT) Strategy

Tests are parametrized with `test.each()` to demonstrate:

- **Parameterization**: Multiple datasets (Miami, Los Angeles) share the same test logic
- **Maintainability**: Adding new scenarios requires only adding data, not duplicating test code
- **Scalability**: Easy to scale tests to 10+ scenarios or integrate with external data sources
- **Clear Reporting**: Each dataset appears as a separate test in reports, with scenario name in title

Example: `✓ should complete full hotel booking search: Miami - Budget Conscious (15.2s)`

### Playwright Fixtures for Code Reusability

Custom fixtures provide:

- **Fixture-based App**: `app` fixture pre-initializes the App object, eliminating boilerplate
- **Context-aware Logger**: `logger` fixture injects a logger that automatically includes test name and metadata
- **Composability**: Can extend fixtures for specific test needs (e.g., `authenticatedUser`, `api` fixtures)

Benefits:

- Reduces test code by 30-40%
- Centralizes fixture setup/teardown logic
- Enables easy sharing of infrastructure across tests

### Structured Logging & Observability

The lightweight `logger.ts` utility provides:

- **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE for different verbosity needs
- **Structured Context**: Every log includes test name and custom metadata for programmatic parsing
- **Log Metrics**: `getSummary()` returns count by level for dashboards/alerting
- **Test Step Integration**: Uses `test.step()` to create collapsible sections in HTML reports

**Observability Use Cases**:

- **Metrics**: Track which test steps take longest (performance regression detection)
- **Debugging**: Correlate logs with screenshots/videos when tests fail
- **Alerting**: Parse log summaries to alert on unusual error patterns
- **Compliance**: Audit trail of what was tested and when

Future enhancements (opt-in):

- Stream logs to Splunk/Datadog for real-time dashboards
- Add Winston for persistent logging to files/databases
- Implement custom reporters for TestRail/Jira integration

### Web-First Assertions

The framework uses Playwright's web-first assertions (`expect(locator).toBeVisible()`, etc.) which automatically wait for conditions instead of using fixed sleeps.

### Filter Validation Strategy

- Price validation supports the assignment's `1000+` open-ended cap by treating max as optional in assertions.
- Guest score validation uses data-driven thresholds from `src/data/testData.ts` instead of hardcoded literals in the test spec.
- The current staging flow uses the filter label `Very Good` and a data-driven minimum score threshold configured for the observed staging behavior.

### Resilient Locators

Locators use a combination of:

- Role-based locators (accessibility-first)
- Text and accessible names for business-facing UI labels
- Map-specific locators that support both visible marker buttons and advanced Google Maps marker elements

### Docker for Scalability

The `Dockerfile` provides:

- **Multi-stage build**: Separates builder stage (install deps) from runtime (smaller image)
- **Dependency caching**: Playwright browsers cached in image layer for fast rebuilds
- **Reproducibility**: `npm ci` ensures exact versions from lock file
- **Health checks**: Built-in verification that Playwright is accessible
- **CI/CD ready**: Environment variables, signal handling, non-root user support (can be added)

Deployment scenarios:

- Local development: `docker build -t tests . && docker run tests`
- CI/CD: GitHub Actions can pull and run pre-built image
- Kubernetes: Scale to N parallel test pods for distributed testing

## Requirements Coverage (from 03_Lead-QA-Take-Home-Assignment.md)

This framework satisfies all assignment requirements:

| Requirement                          | Implementation                                   | Location                                              |
| ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------- |
| Use **POM**                          | Composable App object with page classes          | `src/pages/*`                                         |
| Separate **test data**               | DDT collection in `testData.ts`                  | `src/data/testData.ts`                                |
| Separate **execution parameters**    | Environment config + .npmrc                      | `src/config/environments.ts`, `.npmrc`                |
| Follow **TypeScript best practices** | Strict mode, interfaces, type-safe fixtures      | `tsconfig.json`, `tests/fixtures.ts`                  |
| Use Playwright capabilities          | Web-first assertions, traces, screenshots, video | `playwright.config.ts`                                |
| Clean, extensible framework          | Composable POM, fixtures, clear structure        | Architecture section                                  |
| Idiomatic Playwright                 | No sleeps, resilient locators, test.step()       | `src/pages/*`, tests                                  |
| Clear README                         | This document with detailed examples             | README.md                                             |
| Document AI usage                    | Explicit disclosure and quality controls         | AI Tools Usage section                                |
| GitHub repository                    | Public repo with all code                        | https://github.com/danvelazco27/simplenight-challenge |

## AI Tools Usage

This framework was developed with AI assistance for:

- **Code generation**: Initial page object structure, test scaffolding, fixture patterns
- **Architecture design**: POM pattern, DDT structure, fixture composition
- **Advanced features**: Logging patterns, Docker multi-stage builds, GitHub Actions workflows
- **Documentation**: Comprehensive README with examples and best practices

Quality was maintained through:

- Manual review of all generated code
- Running ESLint and type checks before committing
- Verifying test execution against the application multiple times
- Iterative refinement based on test feedback
- Cross-checking against Playwright and TypeScript best practices documentation
