import { test, expect } from './fixtures';
import { testDataCollection } from '../src/data/testData';

test.describe('Simplenight Hotel Booking Flow - Data-Driven Testing', () => {
  /**
   * Parametrized test using DDT (Data-Driven Testing)
   * Each dataset (search location + filters) is run as a separate test instance
   * Demonstrates test scalability and reusability with different parameters
   */
  testDataCollection.forEach((testData) => {
    test(`should complete full hotel booking search: ${testData.scenario}`, async ({
      page,
      app,
      logger,
    }) => {
      test.setTimeout(120000);

      // Step 1: Navigate to staging homepage
      await test.step('Navigate to staging homepage', async () => {
        logger.info('Navigating to Simplenight staging homepage');
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveTitle(/simplenight/i);
        logger.debug('Homepage title verified');
      });

      // Step 2: Select Hotels category
      await test.step('Select Hotels category from navbar', async () => {
        logger.info('Selecting Hotels category');
        await app.nav.clickHotels();
        logger.debug('Hotels category clicked');
      });

      // Step 3: Perform search with provided dataset
      await test.step(`Search for hotels in ${testData.search.location}`, async () => {
        logger.info('Performing hotel search', {
          location: testData.search.location,
          checkIn: testData.search.checkIn,
          checkOut: testData.search.checkOut,
          adults: testData.search.guests.adults,
          children: testData.search.guests.children,
        });
        await app.search.searchHotels(testData.search);
        logger.debug('Search completed');
      });

      // Step 4: Switch to Map view
      await test.step('Switch to Map view', async () => {
        logger.info('Switching to Map view for results');
        await app.results.switchToMapView();
        logger.debug('Map view activated');
      });

      // Step 5: Apply filters
      await test.step('Apply filters: Price Range and Guest Score', async () => {
        logger.info('Applying filters', {
          priceMin: testData.filter.priceRange.min,
          priceMax: testData.filter.priceRange.max,
          guestScoreLabel: testData.filter.guestScore.label,
          guestScoreMinValue: testData.filter.guestScore.minValue,
        });
        await app.filters.applyFilters(testData.filter);
        logger.debug('Filters applied successfully');
      });

      // Step 6: Zoom and select hotel from map
      await test.step('Zoom in on map and select hotel', async () => {
        logger.info('Zooming into map');
        await app.results.zoomIntoMap();
        logger.debug('Map zoomed, now selecting hotel');
        await app.results.selectHotelFromMap();
        logger.debug('Hotel selected from map');
      });

      // Step 7: Validate hotel card details
      await test.step('Validate hotel card Price and Guest Score', async () => {
        logger.info('Waiting for hotel card visibility');
        await app.hotelCard.waitForCardVisible();
        logger.debug('Hotel card is visible');

        logger.info('Verifying price is within range', {
          min: testData.filter.priceRange.min,
          max: testData.filter.priceRange.max,
        });
        await app.hotelCard.verifyPriceInRange(
          testData.filter.priceRange.min,
          testData.filter.priceRange.max,
        );
        logger.debug('Price validation passed');

        logger.info('Verifying guest score meets minimum threshold', {
          minScore: testData.filter.guestScore.minValue,
        });
        await app.hotelCard.verifyGuestScoreAtLeast(testData.filter.guestScore.minValue);
        logger.debug('Guest score validation passed');
      });

      // Log final test summary
      await test.step('Test summary', async () => {
        const summary = logger.getSummary();
        logger.info('Test completed successfully', summary);
      });
    });
  });
});
