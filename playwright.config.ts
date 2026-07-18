import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './src/config/environments';

const envConfig = getEnvironment();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'html-report', open: 'never' }],
    ['junit', { outputFile: 'junit-report/results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    permissions: ['geolocation'],
    geolocation: { latitude: 25.7617, longitude: -80.1918 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  outputDir: 'test-results/',
});
