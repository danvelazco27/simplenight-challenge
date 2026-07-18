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

    // Reset filters to default state first (this sets min to 0, max to 1000)
    await this.resetButtons.first().click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(200);
    console.log(`🔄 Filters reset to defaults`);

    // Verify both range values after reset
    let currentMin = parseInt((await this.minPriceSlider.getAttribute('aria-valuenow')) ?? '0', 10);
    let currentMax = parseInt(
      (await this.maxPriceSlider.getAttribute('aria-valuenow')) ?? '1000',
      10,
    );
    console.log(`📊 After reset - Min: ${currentMin}, Max: ${currentMax}`);

    // Only move minimum if it's not at target
    if (currentMin !== min) {
      console.log(`🎚️ Moving min from ${currentMin} to ${min}`);
      await this.setSliderValue(this.minPriceSlider, min);
      currentMin = parseInt((await this.minPriceSlider.getAttribute('aria-valuenow')) ?? '0', 10);
      console.log(`✅ Min price final: ${currentMin}`);
    } else {
      console.log(`✨ Min price already at target: ${min}`);
    }

    // Verify max is at target (usually shouldn't need to move after reset)
    if (typeof max === 'number') {
      currentMax = parseInt(
        (await this.maxPriceSlider.getAttribute('aria-valuenow')) ?? '1000',
        10,
      );
      console.log(`📊 Max price verified: ${currentMax} (target: ${max})`);

      if (currentMax !== max) {
        console.log(`🎚️ Moving max from ${currentMax} to ${max}`);
        await this.setSliderValue(this.maxPriceSlider, max);
        currentMax = parseInt(
          (await this.maxPriceSlider.getAttribute('aria-valuenow')) ?? '1000',
          10,
        );
        console.log(`✅ Max price final: ${currentMax}`);
      }
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
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(100);

    const minValue = parseInt((await slider.getAttribute('aria-valuemin')) ?? '0', 10);
    const maxValue = parseInt((await slider.getAttribute('aria-valuemax')) ?? '1000', 10);
    const clampedTarget = Math.min(Math.max(targetValue, minValue), maxValue);

    let currentValue = parseInt((await slider.getAttribute('aria-valuenow')) ?? '0', 10);
    console.log(
      `🎚️ Slider: current=${currentValue}, target=${clampedTarget}, min=${minValue}, max=${maxValue}`,
    );

    // If already at target, do nothing
    if (currentValue === clampedTarget) {
      console.log(`✨ Slider already at target value: ${currentValue}`);
      return;
    }

    let attempts = 0;
    const distance = Math.abs(clampedTarget - currentValue);
    const maxAttempts = distance + 50; // exact moves needed based on distance + safety buffer

    while (currentValue !== clampedTarget && attempts < maxAttempts) {
      const diff = clampedTarget - currentValue;
      const direction = diff > 0 ? 'ArrowRight' : 'ArrowLeft';

      // Press one step at a time and check
      await slider.press(direction);
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await this.page.waitForTimeout(100);

      const prevValue = currentValue;
      currentValue = parseInt((await slider.getAttribute('aria-valuenow')) ?? '0', 10);

      // Log every 10 attempts to avoid spam
      if (attempts % 10 === 0) {
        console.log(
          `🎚️ Att ${attempts}: ${prevValue} → ${currentValue} (target: ${clampedTarget})`,
        );
      }

      attempts++;
    }

    if (currentValue === clampedTarget) {
      console.log(`✅ Slider reached exact target: ${currentValue}`);
    } else {
      console.log(
        `⚠️ Slider stopped at: ${currentValue} (target was: ${clampedTarget}, attempts: ${attempts})`,
      );
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
