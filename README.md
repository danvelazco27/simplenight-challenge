# Simplenight Lead QA Take-Home Assignment

A production-ready Playwright + TypeScript test automation framework for the Simplenight hotel booking platform. Demonstrates enterprise-grade QA practices: **Data-Driven Testing (DDT)**, **Playwright Fixtures**, **structured logging**, **Docker containerization**, and **GitHub Actions CI/CD**.

## Quick Start

```bash
# Local: Install and run tests
npm install && npm test

# Docker: Build and run tests in container
npm run docker:build && npm run docker:test
```

## Overview

This framework implements a scalable, maintainable E2E test automation framework with:

- **Playwright** + **TypeScript** — Reliable, fast, maintainable tests
- **Page Object Model (POM)** — Clean separation of concerns
- **Data-Driven Testing** — 2 parametrized hotel booking scenarios (Miami, Los Angeles)
- **Playwright Fixtures** — Reusable test infrastructure (App, Logger)
- **Structured Logging** — 5 log levels, metrics, test observability
- **Docker** — Consistent environment, 1 worker for stability
- **GitHub Actions** — Automated lint, format, accessibility checks, and E2E tests

### Test Scenarios

Two parametrized test scenarios covering different booking flows:

| Scenario                 | Location    | Dates   | Price      | Guests                  |
| ------------------------ | ----------- | ------- | ---------- | ----------------------- |
| Miami - Budget Conscious | Miami       | Aug 1–3 | $100–1000+ | 1 Adult + 1 Child (8yo) |
| Los Angeles - Mid-Range  | Los Angeles | Aug 5–7 | $80–1000+  | 1 Adult                 |

Both execute the complete booking flow:

1. Navigate to Simplenight staging
2. Select Hotels category
3. Perform location + date search
4. Switch to Map view
5. Apply filters (Price Range + Guest Score: "Very Good")
6. Zoom map and select hotel from markers
7. Validate hotel card (price, guest score within filters)

## Architecture

```
├── .github/workflows/e2e-tests.yml    # CI/CD pipeline
├── src/
│   ├── config/environments.ts         # Environment config
│   ├── data/testData.ts               # DDT datasets
│   ├── pages/                         # Page Object Model
│   │   ├── App.ts                     # Main app composition
│   │   ├── BasePage.ts                # Base class for shared page logic
│   │   ├── NavigationBar.ts           # Navbar navigation
│   │   ├── SearchPanel.ts             # Search form
│   │   ├── SearchResultsPage.ts       # Results + map
│   │   ├── FiltersPanel.ts            # Price & score filters
│   │   ├── HotelCardPage.ts           # Hotel card validation
│   │   └── index.ts                   # Barrel exports
│   └── utils/logger.ts                # Structured logging
├── tests/
│   ├── hotel-booking.spec.ts          # Main test (parametrized)
│   └── fixtures.ts                    # Playwright fixtures
├── Dockerfile                         # Container image
├── playwright.config.ts               # Playwright settings
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # This file
```

## Installation & Setup

### Requirements

- **Node.js** 20+ (18 supported but not recommended)
- **npm** or yarn
- **Docker** (optional, for containerized execution)

### Local Setup

```bash
npm install                              # Install dependencies
npx playwright install chromium          # Install Playwright browsers
npm run lint && npm run format:check     # Verify code quality
```

## Running Tests

### Locally

```bash
npm test                    # Run all tests (2 scenarios)
npm run test:headed         # Run with visible browser
npm run test:ui             # Interactive mode
npm run test:debug          # Debug with Playwright Inspector
npm run report              # View HTML report after execution
```

### In Docker (Recommended)

```bash
npm run docker:build        # Build image (one-time setup)
npm run docker:test         # Run tests in container
npm run docker:test:headed  # Run headed tests in container
npm run docker:clean        # Remove image
```

**Docker runs tests with:**

- Single worker (CI=true) for sequential, stable execution
- Base URL: https://wl.stg.simplenight.com
- Reports mounted to host: `html-report/`, `junit-report/`, `test-results/`

### Test Output

Tests generate:

- **html-report/index.html** — Interactive report with screenshots, videos, nested steps
- **junit-report/results.xml** — JUnit XML for CI/CD integration
- **test-results/** — Artifacts on failure (screenshots, videos, traces)

Console output includes structured logs:

```
[2026-07-18T16:05:52.894Z] INFO: Navigating to Simplenight staging homepage
[2026-07-18T16:05:52.899Z] DEBUG: Price validation passed | { min: 100, max: 1000 }
```

## Code Quality

### Available Commands

| Command                | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm test`             | Run all tests                    |
| `npm run lint`         | Run ESLint                       |
| `npm run lint:fix`     | Fix ESLint errors automatically  |
| `npm run format`       | Format code with Prettier        |
| `npm run format:check` | Check formatting without changes |
| `npm run docker:build` | Build Docker image               |
| `npm run docker:test`  | Run tests in Docker              |
| `npm run report`       | View HTML report                 |

### Pre-commit Checks

All code is checked locally before push:

- **ESLint**: TypeScript syntax, style, Playwright best practices
- **Prettier**: Code formatting consistency

## Configuration

### Environment Variables

Configured in `src/config/environments.ts` and CI:

- `BASE_URL` — Test app URL (defaults to staging)
- `CI` — Set in Docker and GitHub Actions (enables 1 worker, 2 retries)
- `TEST_ENV` — Environment name (staging, production, local)

### Playwright Settings

Key configuration in `playwright.config.ts`:

| Setting         | Value                    | Purpose                                |
| --------------- | ------------------------ | -------------------------------------- |
| **Browser**     | Chromium                 | Consistent cross-platform              |
| **Reports**     | HTML + JUnit             | Human-readable + CI integration        |
| **Screenshots** | On failure               | Storage optimization                   |
| **Retries**     | 0 local / 2 CI           | Fail fast locally, handle CI flakiness |
| **Workers**     | Auto local / 1 CI        | Parallel local, stable CI              |
| **Geolocation** | Miami (25.76°N, 80.19°W) | Realistic hotel search context         |

## CI/CD Pipeline

### GitHub Actions Workflow

Runs on: `push` to main/master, `pull_request`, `workflow_dispatch`

**3 Sequential Jobs:**

1. **Lint & Format Check**
   - ESLint validation
   - Prettier formatting check
   - ❌ Fails if code quality issues detected

2. **Check Staging Access**
   - Health check: `curl https://wl.stg.simplenight.com/`
   - ❌ Fails if staging unreachable (403, timeout, etc.)

   > **Note:** This job currently fails in GitHub Actions with `HTTP/2 403` from CloudFront (`x-cache: Error from cloudfront`). The staging URL blocks requests originating from GitHub Actions IP ranges (AWS). This is an infrastructure restriction, not a test framework issue. Tests run successfully locally and in Docker where the staging environment is accessible.



3. **E2E Tests** (depends on 1 & 2)
   - Setup Node.js 20
   - Install dependencies (npm cache)
   - Cache Playwright browsers (~350MB, saves ~2 min per run)
   - Install/update browser system dependencies
   - Run E2E tests (Chromium, 1 worker)
   - Upload HTML & JUnit reports (30-day retention)
   - Upload test artifacts on failure (7-day retention)
   - Publish JUnit results to GitHub PR checks

**Artifacts:**

- Accessible via GitHub Actions tab
- Test results published to PR checks
- Reports linked in job summary

## Key Design Decisions

### Why Playwright?

Web-first assertions (auto-wait), traces, multi-browser support, built-in test runner, strong TypeScript integration.

### Page Object Model (POM)

All locators encapsulated in page classes. Spec files contain only test logic, not selectors. Easy to maintain when UI changes.

### Data-Driven Testing

2 test scenarios share the same test logic. New scenarios require only adding data to `testData.ts`, not duplicating test code.

### Playwright Fixtures

Custom `app` and `logger` fixtures eliminate boilerplate:

- `app` — Pre-initialized App object
- `logger` — Test-aware logger with automatic context injection

### Structured Logging

Custom logger (`src/utils/logger.ts`) provides:

- **5 log levels** — ERROR, WARN, INFO, DEBUG, TRACE
- **Structured context** — Every log includes test name, metadata
- **Metrics** — `getSummary()` returns log count by level
- **Test integration** — Uses `test.step()` for nested HTML report sections
- **Output** — Logs print to console during execution; captured in the Playwright HTML report

### Docker for Consistency

- Official Playwright image (`mcr.microsoft.com/playwright:latest`)
- Chromium headless shell installed during build
- `npm ci` for reproducible dependency resolution
- Single worker (CI=true) for sequential, stable test execution
- Volumes mount reports to host machine

### Single Worker in CI

Docker and GitHub Actions use 1 worker (`CI=true`) for:

- Stable, deterministic test execution
- Reduced flakiness from browser contention
- Predictable resource usage
- Easier debugging of failures

## AI Tools Usage

This framework was developed with AI assistance for code generation, architecture design, logging patterns, Docker configuration, and GitHub Actions workflows. Quality was maintained through:

- Manual code review before committing
- ESLint and TypeScript checks before push
- Test execution verification against staging
- Iterative refinement based on test feedback
- Cross-checking against Playwright and TypeScript documentation

## Requirements Coverage (from 03_Lead-QA-Take-Home-Assignment.pdf)

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
