import { Page, Locator } from '@playwright/test';

export class NavigationBar {
  readonly page: Page;
  readonly hotelsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hotelsLink = page.getByRole('link', { name: 'Hotels' });
  }

  async clickHotels(): Promise<void> {
    await this.hotelsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isHotelsVisible(): Promise<boolean> {
    return this.hotelsLink.isVisible();
  }
}
