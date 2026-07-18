import { test as base, Page } from '@playwright/test';
import { App } from '../src/pages/App';
import { logger, LogLevel } from '../src/utils/logger';

/**
 * Extended test fixture with pre-initialized App and Logger
 * Allows tests to access app object and logging utilities without boilerplate
 *
 * Usage:
 *   test('my test', async ({ page, app, logger }) => {
 *     await app.nav.clickHotels();
 *     logger.info('Hotels clicked');
 *   });
 */
export type TestFixtures = {
  app: App;
  logger: ReturnType<typeof createLogger>;
};

export interface LoggerContext {
  page: Page;
  testTitle: string;
}

function createLogger(context: LoggerContext) {
  return {
    /**
     * Log with test context automatically added
     */
    log: (level: LogLevel, message: string, ctx?: Record<string, unknown>) => {
      const fullContext = {
        test: context.testTitle,
        ...(ctx || {}),
      };
      logger.log(level, message, fullContext);
    },

    /**
     * Convenience methods with test context
     */
    info: (message: string, ctx?: Record<string, unknown>) => {
      const fullContext = { test: context.testTitle, ...(ctx || {}) };
      logger.info(message, fullContext);
    },

    debug: (message: string, ctx?: Record<string, unknown>) => {
      const fullContext = { test: context.testTitle, ...(ctx || {}) };
      logger.debug(message, fullContext);
    },

    warn: (message: string, ctx?: Record<string, unknown>) => {
      const fullContext = { test: context.testTitle, ...(ctx || {}) };
      logger.warn(message, fullContext);
    },

    error: (message: string, ctx?: Record<string, unknown>) => {
      const fullContext = { test: context.testTitle, ...(ctx || {}) };
      logger.error(message, fullContext);
    },

    /**
     * Get accumulated logs and summary
     */
    getLogs: () => logger.getLogs(),
    getSummary: () => logger.getLogsSummary(),
  };
}

export const test = base.extend<TestFixtures>({
  app: async ({ page }, use) => {
    const app = new App(page);
    await use(app);
  },

  logger: async ({ page }, use, testInfo) => {
    const testLogger = createLogger({
      page,
      testTitle: testInfo.title,
    });

    logger.info(`Test started: ${testInfo.title}`);

    await use(testLogger);

    const summary = testLogger.getSummary();
    logger.info(`Test completed: ${testInfo.title}`, summary);
  },
});

export { expect } from '@playwright/test';
