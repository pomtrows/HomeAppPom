export type Category = {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
};

export type ShoppingItem = {
  id: string;
  categoryId: string | null;
  name: string;
  checked: number;
  sortOrder: number;
  createdAt: string;
};

export type Meal = {
  id: string;
  name: string;
  checked: number;
  sortOrder: number;
  createdAt: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  faviconUrl: string | null;
  sortOrder: number;
  createdAt: string;
};

export type StockQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

export type CryptoQuote = { symbol: string; price: number };

export type StocksData = {
  stocks: StockQuote[];
  crypto: CryptoQuote[];
  cachedAt: string;
};

export type GasStation = {
  id: string;
  adresse: string;
  ville: string;
  cp: string;
  geom: { lat: number; lon: number };
  e10_prix: number;
  e10_maj: string;
  dist: number;
};
