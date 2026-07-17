import { Page, Locator, expect } from '@playwright/test';

export class HotelCardPage {
  readonly page: Page;
  readonly card: Locator;
  readonly hotelName: Locator;
  readonly hotelPrice: Locator;
  readonly guestScore: Locator;

  constructor(page: Page) {
    this.page = page;
    this.card = page
      .locator('[class*="sidebar"], [class*="detail"], [class*="card"], article')
      .filter({ hasText: '$' })
      .first();
    this.hotelName = this.card.locator('h2, h3, [class*="name"], [class*="title"]').first();
    this.hotelPrice = this.card.getByText(/\$\d+/).first();
    this.guestScore = this.card.getByText(/^\d+\.\d+$/).first();
  }

  async waitForCardVisible(timeout = 15000): Promise<void> {
    await expect(this.card).toBeVisible({ timeout });
  }

  async getPriceValue(): Promise<number> {
    const text = await this.hotelPrice.textContent();
    const match = (text ?? '').match(/\$(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getScoreValue(): Promise<number> {
    const text = await this.guestScore.textContent();
    const match = (text ?? '').match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async verifyPriceInRange(min: number, max?: number): Promise<void> {
    const price = await this.getPriceValue();
    expect(price).toBeGreaterThanOrEqual(min);
    if (typeof max === 'number') {
      expect(price).toBeLessThanOrEqual(max);
    }
  }

  async verifyGuestScoreAtLeast(minScore: number): Promise<void> {
    const score = await this.getScoreValue();
    expect(score).toBeGreaterThanOrEqual(minScore);
  }
}
