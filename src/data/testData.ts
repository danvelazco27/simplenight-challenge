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
