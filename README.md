# Simplenight Lead QA Take-Home Assignment

A Playwright + TypeScript test automation framework for the Simplenight booking platform.

## Overview

This project implements an end-to-end test automation framework for the Simplenight hotel booking flow using Playwright and TypeScript. The framework follows the Page Object Model (POM) pattern for maintainability and scalability.

### Test Scenario

The automated test covers the complete hotel booking search flow:

1. Navigate to the Simplenight staging homepage
2. Select the Hotels category from the navbar
3. Perform a search with:
   - Location: Miami
   - Dates: August 1–3
   - Guests: 1 Adult + 1 Child (age 8)
4. Switch to Map view for search results
5. Apply filters:
   - Price Range: 100–1000+
   - Guest Score: "Very Good"
6. Zoom in on the map and select one hotel option from the map markers
7. Validate the hotel card displays Price and Guest Score within filtered parameters

The current implementation keeps the hotel selection strictly map-first. The map interaction supports both visible hotel buttons rendered inside the map and Google Maps advanced markers, because the staging UI can render either representation depending on zoom level and result density.

## Architecture

```
├── src/
│   ├── config/
│   │   └── environments.ts      # Environment configuration
│   ├── data/
│   │   └── testData.ts          # Test data (search params, filters)
│   ├── pages/
│   │   ├── App.ts               # Main app object (composes page objects)
│   │   ├── NavigationBar.ts     # Navbar navigation component
│   │   ├── SearchPanel.ts       # Search form component
│   │   ├── SearchResultsPage.ts # Search results, map zoom, and map hotel selection
│   │   ├── FiltersPanel.ts      # Left panel filters
│   │   ├── HotelCardPage.ts     # Hotel card details and validation
│   │   └── index.ts             # Barrel exports
│   └── utils/
├── tests/
│   └── hotel-booking.spec.ts    # Main test spec
├── playwright.config.ts         # Playwright configuration
├── eslint.config.mjs            # ESLint configuration
└── .prettierrc                  # Prettier configuration
```

### Page Object Model (POM)

The framework uses a composable POM pattern:

- **App** (main class): Composes all page objects and is the single class instantiated in tests
- **NavigationBar**: Handles hotel category navigation
- **SearchPanel**: Manages search form interactions (location, dates, guests)
- **SearchResultsPage**: Handles result loading, map/list view switching, map zoom, and hotel selection from the map
- **FiltersPanel**: Manages price range and guest score filters
- **HotelCardPage**: Handles hotel card display and validation

All locators are encapsulated in page classes — no locators appear in spec files.

## Requirements

- Node.js 18+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode (interactive)
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run report
```

## Code Quality

```bash
# Run ESLint
npm run lint

# Fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format
```

## Configuration

### Environment Variables

- `TEST_ENV`: Environment name (`staging`, `production`, `local`) loaded from `src/config/environments.ts`
- `BASE_URL`: Optional override for `baseURL` regardless of selected `TEST_ENV`

### Playwright Config

- **Browser**: Chromium only
- **Reports**: HTML + JUnit
- **Screenshots**: Captured on test failure
- **Video**: Retained on test failure
- **Retries**: 0 by default
- **Workers**: Auto (local machine default)

## Key Design Decisions

### Why This Architecture?

1. **Extensibility**: New pages/categories can be added by creating new page classes
2. **Maintainability**: Locators are isolated in page classes, not scattered in specs
3. **Reusability**: Test data is separated from test logic
4. **Environment Agnostic**: Configuration supports multiple environments

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

## AI Tools Usage

This framework was developed with AI assistance for:

- **Code generation**: Initial page object structure and test scaffolding
- **Pattern recognition**: POM architecture decisions
- **Best practices**: Web-first assertions, resilient locators

Quality was maintained through:

- Manual review of all generated code
- Running ESLint and type checks
- Verifying test execution against the application
