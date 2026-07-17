import { Page } from '@playwright/test';
import { NavigationBar } from './NavigationBar';
import { SearchPanel } from './SearchPanel';
import { SearchResultsPage } from './SearchResultsPage';
import { FiltersPanel } from './FiltersPanel';
import { HotelCardPage } from './HotelCardPage';

export class App {
  readonly page: Page;
  readonly nav: NavigationBar;
  readonly search: SearchPanel;
  readonly results: SearchResultsPage;
  readonly filters: FiltersPanel;
  readonly hotelCard: HotelCardPage;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavigationBar(page);
    this.search = new SearchPanel(page);
    this.results = new SearchResultsPage(page);
    this.filters = new FiltersPanel(page);
    this.hotelCard = new HotelCardPage(page);
  }
}
