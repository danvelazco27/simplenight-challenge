import { Page, Locator } from '@playwright/test';
import { SearchData } from '../data/testData';

export class SearchPanel {
  readonly page: Page;
  readonly locationInput: Locator;
  readonly datesInput: Locator;
  readonly travelersInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locationInput = page.getByRole('textbox', { name: 'Going to' });
    this.datesInput = page.getByRole('textbox', { name: 'Dates' });
    this.travelersInput = page.getByRole('textbox', { name: 'Travelers' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async searchHotels(data: SearchData): Promise<void> {
    await this.locationInput.click();
    const locationDialog = this.page.getByRole('dialog');
    await locationDialog.getByRole('textbox').first().fill(data.location);
    await locationDialog.getByRole('option', { name: data.location }).first().click();
    await locationDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    await this.datesInput.click();
    await this.page.waitForLoadState('domcontentloaded');
    const checkInDate = new Date(data.checkIn + 'T12:00:00');
    const checkOutDate = new Date(data.checkOut + 'T12:00:00');
    const checkInLabel = `${checkInDate.getDate()} ${checkInDate.toLocaleString('en-US', { month: 'long' })} ${checkInDate.getFullYear()}`;
    const checkOutLabel = `${checkOutDate.getDate()} ${checkOutDate.toLocaleString('en-US', { month: 'long' })} ${checkOutDate.getFullYear()}`;
    await this.page.getByRole('button', { name: checkInLabel, exact: true }).click();
    await this.page.getByRole('button', { name: checkOutLabel, exact: true }).click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByRole('button', { name: 'Done' }).click();

    await this.travelersInput.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.configureGuests(data.guests);
    await this.page.keyboard.press('Escape');
    await this.page.waitForLoadState('domcontentloaded');

    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async configureGuests(guests: {
    adults: number;
    children: number;
    childrenAges?: number[];
  }): Promise<void> {
    if (guests.children > 0) {
      await this.page.getByRole('button', { name: 'Add Child' }).click();
      if (guests.childrenAges && guests.childrenAges[0] !== undefined) {
        await this.page.getByRole('textbox', { name: 'Child' }).click();
        await this.page
          .getByRole('option', { name: guests.childrenAges[0].toString(), exact: true })
          .click();
      }
    }
  }
}
