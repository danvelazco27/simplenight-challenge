import { Page, Locator, expect } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;
  readonly mapViewToggle: Locator;
  readonly listViewToggle: Locator;
  readonly gridViewToggle: Locator;
  readonly hotelArticles: Locator;
  readonly progressBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapViewToggle = page
      .getByRole('radio', { name: 'Map' })
      .or(page.getByRole('button', { name: 'Map' }));
    this.listViewToggle = page
      .getByRole('radio', { name: 'List' })
      .or(page.getByRole('button', { name: 'List' }));
    this.gridViewToggle = page
      .getByRole('radio', { name: 'Grid' })
      .or(page.getByRole('button', { name: 'Grid' }));
    this.hotelArticles = page.getByRole('article');
    this.progressBar = page.getByRole('progressbar');
  }

  async switchToMapView(): Promise<void> {
    await this.waitForResults();
    await this.mapViewToggle.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async switchToListView(): Promise<void> {
    await this.waitForResults();
    await this.listViewToggle.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async switchToGridView(): Promise<void> {
    await this.waitForResults();
    await this.gridViewToggle.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForResults(): Promise<void> {
    await this.progressBar.waitFor({ state: 'hidden', timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getHotelCount(): Promise<number> {
    return this.hotelArticles.count();
  }

  getFirstHotelArticle(): Locator {
    return this.hotelArticles.first();
  }

  async zoomIntoMap(maxScrolls = 12): Promise<void> {
    const mapRegion = this.page.getByRole('region', { name: 'Map' });
    const box = await mapRegion.boundingBox();
    if (!box) return;

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const markers = this.page.locator('gmp-advanced-marker[role="button"][title]');
    const mapHotelButtons = mapRegion.getByRole('button').filter({ hasText: '$' });

    for (let i = 0; i < maxScrolls; i++) {
      await this.page.mouse.move(centerX, centerY);
      await this.page.mouse.wheel(0, -800);

      try {
        const discoveredTargets = (await markers.count()) + (await mapHotelButtons.count());
        if (discoveredTargets > 0) {
          break;
        }
        await markers.first().waitFor({ state: 'attached', timeout: 1500 });
        break;
      } catch {
        // Continue zooming until markers render.
      }
    }

    await expect
      .poll(async () => (await markers.count()) + (await mapHotelButtons.count()), {
        timeout: 15000,
      })
      .toBeGreaterThan(0);
  }

  async selectHotelFromMap(): Promise<void> {
    const mapRegion = this.page.getByRole('region', { name: 'Map' });
    const mapHotelButtons = mapRegion.getByRole('button').filter({ hasText: '$' });
    const mapMarkers = this.page.locator('gmp-advanced-marker[role="button"][title]');

    const surfacedCard = this.page
      .locator('[class*="sidebar"], [class*="detail"], [class*="card"], article')
      .filter({ hasText: '$' })
      .first();

    await expect
      .poll(async () => (await mapHotelButtons.count()) + (await mapMarkers.count()), {
        timeout: 15000,
      })
      .toBeGreaterThan(0);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const clickTarget =
          (await mapHotelButtons.count()) > 0 ? mapHotelButtons.first() : mapMarkers.first();

        await clickTarget.click({ trial: true });
        await clickTarget.click();

        // Some markers require a second interaction to open details after being selected.
        const cardVisibleAfterFirstClick = await surfacedCard.isVisible().catch(() => false);
        if (!cardVisibleAfterFirstClick) {
          await clickTarget.click().catch(() => {});
          await clickTarget.press('Enter').catch(() => {});
        }

        await expect
          .poll(async () => await surfacedCard.isVisible(), { timeout: 6000 })
          .toBeTruthy();

        return;
      } catch {
        // Re-render can detach map targets; retry with fresh lookup.
      }
    }

    throw new Error('Could not select a hotel from map and surface a hotel card.');
  }

  async clickHotelByIndex(index: number): Promise<void> {
    await this.hotelArticles.nth(index).click();
  }
}
