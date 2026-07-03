export interface Quote {
  author: string;
  quote: string;
}

export interface CachedQuote extends Quote {
  date: string;
}
