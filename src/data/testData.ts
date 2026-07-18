export interface GuestInfo {
  adults: number;
  children: number;
  childrenAges?: number[];
}

export interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: GuestInfo;
}

export interface FilterData {
  priceRange: {
    min: number;
    max?: number;
  };
  guestScore: {
    label: string;
    minValue: number;
  };
}

// Dataset 1: Miami - Primary test case
export const searchData: SearchData = {
  location: 'Miami',
  checkIn: '2026-08-01',
  checkOut: '2026-08-03',
  guests: {
    adults: 1,
    children: 1,
    childrenAges: [8],
  },
};

export const filterData: FilterData = {
  priceRange: {
    min: 100,
    max: 1000,
  },
  guestScore: {
    label: 'Very Good',
    minValue: 6.5,
  },
};

// Dataset 2: Los Angeles - Alternative test case for DDT
export const searchDataAlternet: SearchData = {
  location: 'Los Angeles',
  checkIn: '2026-08-05',
  checkOut: '2026-08-07',
  guests: {
    adults: 1,
    children: 0,
    childrenAges: [],
  },
};

export const filterDataAlternate: FilterData = {
  priceRange: {
    min: 80,
    max: 1000,
  },
  guestScore: {
    label: 'Very Good',
    minValue: 6.5,
  },
};

// Test data collection for parametrization (DDT)
export const testDataCollection = [
  { search: searchData, filter: filterData, scenario: 'Miami - Budget Conscious' },
  { search: searchDataAlternet, filter: filterDataAlternate, scenario: 'Los Angeles - Mid-Range' },
];
