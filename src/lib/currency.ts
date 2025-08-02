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

export const formatCurrency = (amount: number, language: string = 'vi'): string => {
  const formatters: { [key: string]: Intl.NumberFormat } = {
    vi: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    ja: new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  const formatter = formatters[language] || formatters.vi;
  return formatter.format(amount);
};

export const formatPrice = (amount: number, language: string = 'vi'): string => {
  if (language === 'vi') {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  } else if (language === 'en') {
    return `$${(amount / 24000).toFixed(2)}`; // Convert VND to USD
  } else if (language === 'ja') {
    return `¥${(amount / 160).toFixed(0)}`; // Convert VND to JPY
  }
  
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

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