import { Page, Locator } from '@playwright/test';
import { FilterData } from '../data/testData';

export class FiltersPanel {
  readonly page: Page;
  readonly priceRangeSection: Locator;
  readonly priceSliders: Locator;
  readonly minPriceSlider: Locator;
  readonly maxPriceSlider: Locator;
  readonly guestScoreSection: Locator;
  readonly resetButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.priceRangeSection = page.getByText('Price Range');
    this.priceSliders = page.getByRole('slider');
    this.minPriceSlider = this.priceSliders.nth(0);
    this.maxPriceSlider = this.priceSliders.nth(1);
    this.guestScoreSection = page.getByText('Guest Score');
    this.resetButtons = page.getByRole('button', { name: 'Reset' });
  }

  async setPriceRange(min: number, max?: number): Promise<void> {
    await this.priceRangeSection.scrollIntoViewIfNeeded();
    await this.setSliderValue(this.minPriceSlider, min);

    // 1000+ behaves as an open-ended cap, so moving max to its highest value is valid.
    if (typeof max === 'number') {
      await this.setSliderValue(this.maxPriceSlider, max);
    }

    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectGuestScore(score: string): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name: score }).first();
    await checkbox.click();
  }

  async applyFilters(data: FilterData): Promise<void> {
    await this.setPriceRange(data.priceRange.min, data.priceRange.max);
    await this.selectGuestScore(data.guestScore.label);
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async setSliderValue(slider: Locator, targetValue: number): Promise<void> {
    await slider.focus();

    const currentValue = parseInt((await slider.getAttribute('aria-valuenow')) ?? '0', 10);
    const minValue = parseInt((await slider.getAttribute('aria-valuemin')) ?? '0', 10);
    const maxValue = parseInt((await slider.getAttribute('aria-valuemax')) ?? '1000', 10);
    const clampedTarget = Math.min(Math.max(targetValue, minValue), maxValue);

    // Sliders in this app move in 100-unit increments.
    const stepsNeeded = Math.round((clampedTarget - currentValue) / 100);
    const key = stepsNeeded >= 0 ? 'ArrowRight' : 'ArrowLeft';

    for (let i = 0; i < Math.abs(stepsNeeded); i++) {
      await slider.press(key);
    }
  }

  async clearFilters(): Promise<void> {
    await this.resetButtons.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isFilterPanelVisible(): Promise<boolean> {
    return this.priceRangeSection.isVisible();
  }
}
