# Use official Playwright Docker image - latest stable version
FROM mcr.microsoft.com/playwright:latest

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json .npmrc ./

# Install Node dependencies
RUN npm ci

# Install Playwright browsers with dependencies - chromium only (all we need)
RUN npx playwright install chromium --with-deps

# Copy application source code
COPY . .

# Lint and format checks (after copying source)
RUN npm run lint && npm run format:check

# Verify Playwright installation
RUN npx playwright --version

# Default command: run tests
CMD ["npm", "test"]

# Health check: verify playwright and browser are accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD npx playwright browsers list | grep -q chromium || exit 1

# Labels for metadata
LABEL maintainer="Simplenight QA"
LABEL description="Playwright E2E test automation for Simplenight booking platform"
LABEL version="1.0.0"
