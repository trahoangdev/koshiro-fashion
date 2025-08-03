export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  exchangeRate: number; // Tỷ giá so với VND
  position: 'before' | 'after'; // Vị trí của symbol
}

export const currencyConfigs: Record<string, CurrencyConfig> = {
  vi: {
    locale: 'vi-VN',
    currency: 'VND',
    symbol: '₫',
    exchangeRate: 1,
    position: 'after'
  },
  en: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 0.000041, // 1 USD ≈ 24,390 VND
    position: 'before'
  },
  ja: {
    locale: 'ja-JP',
    currency: 'JPY',
    symbol: '¥',
    exchangeRate: 6.1, // 1 JPY ≈ 164 VND
    position: 'before'
  }
};

// Convert VND amount to target currency
export const convertToCurrency = (vndAmount: number, targetLanguage: string): number => {
  const config = currencyConfigs[targetLanguage] || currencyConfigs.vi;
  return vndAmount * config.exchangeRate;
};

// Format currency with proper symbol positioning
export const formatCurrency = (vndAmount: number, language: string = 'vi'): string => {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  const convertedAmount = convertToCurrency(vndAmount, language);
  
  // Format number with proper locale
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
  
  // Add currency symbol based on position
  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
};

// Format price with more detailed options
export const formatPrice = (vndAmount: number, language: string = 'vi', options?: {
  showSymbol?: boolean;
  compact?: boolean;
}): string => {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  const convertedAmount = convertToCurrency(vndAmount, language);
  
  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  
  if (options?.compact) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }
  
  const formattedNumber = new Intl.NumberFormat(config.locale, formatOptions).format(convertedAmount);
  
  if (!options?.showSymbol) {
    return formattedNumber;
  }
  
  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
};

// Get currency symbol for a language
export function getCurrencySymbol(language: string = 'vi'): string {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  return config.symbol;
}

// Get currency code for a language
export function getCurrencyCode(language: string = 'vi'): string {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  return config.currency;
}

// Convert between currencies
export function convertCurrency(amount: number, fromLanguage: string, toLanguage: string): number {
  const fromConfig = currencyConfigs[fromLanguage] || currencyConfigs.vi;
  const toConfig = currencyConfigs[toLanguage] || currencyConfigs.vi;
  
  // Chuyển về VND trước, sau đó chuyển sang tiền tệ đích
  const vndAmount = amount / fromConfig.exchangeRate;
  return vndAmount * toConfig.exchangeRate;
}

// Format range (for price ranges)
export const formatPriceRange = (minVnd: number, maxVnd: number, language: string = 'vi'): string => {
  const minFormatted = formatCurrency(minVnd, language);
  const maxFormatted = formatCurrency(maxVnd, language);
  
  if (minVnd === maxVnd) {
    return minFormatted;
  }
  
  return `${minFormatted} - ${maxFormatted}`;
};

// Format discount percentage
export const formatDiscount = (originalPrice: number, salePrice: number, language: string = 'vi'): string => {
  const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `-${discountPercent}%`;
}; 