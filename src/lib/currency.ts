export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  exchangeRate: number; // Tỷ giá so với VND
}

export const currencyConfigs: Record<string, CurrencyConfig> = {
  vi: {
    locale: 'vi-VN',
    currency: 'VND',
    symbol: '₫',
    exchangeRate: 1
  },
  en: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 0.000041 // 1 USD ≈ 24,390 VND
  },
  ja: {
    locale: 'ja-JP',
    currency: 'JPY',
    symbol: '¥',
    exchangeRate: 6.1 // 1 JPY ≈ 164 VND
  }
};

export function formatCurrency(amount: number, language: string = 'vi'): string {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  
  // Chuyển đổi từ VND sang tiền tệ tương ứng
  const convertedAmount = amount * config.exchangeRate;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.currency === 'VND' ? 0 : 2,
    maximumFractionDigits: config.currency === 'VND' ? 0 : 2
  }).format(convertedAmount);
}

export function getCurrencySymbol(language: string = 'vi'): string {
  const config = currencyConfigs[language] || currencyConfigs.vi;
  return config.symbol;
}

export function convertCurrency(amount: number, fromLanguage: string, toLanguage: string): number {
  const fromConfig = currencyConfigs[fromLanguage] || currencyConfigs.vi;
  const toConfig = currencyConfigs[toLanguage] || currencyConfigs.vi;
  
  // Chuyển về VND trước, sau đó chuyển sang tiền tệ đích
  const vndAmount = amount / fromConfig.exchangeRate;
  return vndAmount * toConfig.exchangeRate;
} 