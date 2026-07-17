import { test, expect } from '@playwright/test';
import { App } from '../src/pages/App';
import { searchData, filterData } from '../src/data/testData';

test.describe('Simplenight Hotel Booking Flow', () => {
  let app: App;

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    app = new App(page);
  });

  test('should complete full hotel booking search and validate results', async ({ page }) => {
    test.setTimeout(120000);
    // Step 1: Go to staging homepage
    await expect(page).toHaveTitle(/simplenight/i);

    // Step 2: Select Hotels category
    await app.nav.clickHotels();

    // Step 3: Search with Miami, Aug 1-3, 1 Adult + 1 Child
    await app.search.searchHotels(searchData);

    // Step 4: Select Map view
    await app.results.switchToMapView();

    // Step 5: Filter by Price Range (100-1000+) and Guest Score ("Very Good")
    await app.filters.applyFilters(filterData);

    // Step 6: Zoom in on map and select 1 hotel
    await app.results.zoomIntoMap();
    await app.results.selectHotelFromMap();

    // Step 7: Validate Price and Guest Score on the hotel card
    await app.hotelCard.waitForCardVisible();
    await app.hotelCard.verifyPriceInRange(filterData.priceRange.min, filterData.priceRange.max);
    await app.hotelCard.verifyGuestScoreAtLeast(filterData.guestScore.minValue);
  });
});
