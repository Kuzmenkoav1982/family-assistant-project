export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // курс к рублю
}

export const CURRENCIES: Currency[] = [
  { code: 'RUB', name: 'Российский рубль', symbol: '₽', flag: '🇷🇺', rate: 1 },
  { code: 'USD', name: 'Доллар США', symbol: '$', flag: '🇺🇸', rate: 95 },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺', rate: 105 },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', flag: '🇬🇧', rate: 120 },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥', flag: '🇨🇳', rate: 13 },
  { code: 'JPY', name: 'Японская иена', symbol: '¥', flag: '🇯🇵', rate: 0.65 },
  { code: 'TRY', name: 'Турецкая лира', symbol: '₺', flag: '🇹🇷', rate: 3.2 },
  { code: 'AED', name: 'Дирхам ОАЭ', symbol: 'د.إ', flag: '🇦🇪', rate: 26 },
  { code: 'THB', name: 'Тайский бат', symbol: '฿', flag: '🇹🇭', rate: 2.8 },
  { code: 'VND', name: 'Вьетнамский донг', symbol: '₫', flag: '🇻🇳', rate: 0.0038 },
  { code: 'EGP', name: 'Египетский фунт', symbol: 'E£', flag: '🇪🇬', rate: 2 },
  { code: 'INR', name: 'Индийская рупия', symbol: '₹', flag: '🇮🇳', rate: 1.15 },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', flag: '🇰🇿', rate: 0.21 },
  { code: 'BYN', name: 'Белорусский рубль', symbol: 'Br', flag: '🇧🇾', rate: 29 },
  { code: 'UAH', name: 'Украинская гривна', symbol: '₴', flag: '🇺🇦', rate: 2.3 },
  { code: 'GEL', name: 'Грузинский лари', symbol: '₾', flag: '🇬🇪', rate: 36 },
  { code: 'QAR', name: 'Катарский риал', symbol: 'ر.ق', flag: '🇶🇦', rate: 26 },
  { code: 'SAR', name: 'Саудовский риал', symbol: 'ر.س', flag: '🇸🇦', rate: 25 },
  { code: 'KWD', name: 'Кувейтский динар', symbol: 'د.ك', flag: '🇰🇼', rate: 310 },
  { code: 'BHD', name: 'Бахрейнский динар', symbol: 'د.ب', flag: '🇧🇭', rate: 252 },
  { code: 'OMR', name: 'Оманский риал', symbol: 'ر.ع.', flag: '🇴🇲', rate: 247 },
  { code: 'JOD', name: 'Иорданский динар', symbol: 'د.ا', flag: '🇯🇴', rate: 134 },
  { code: 'ILS', name: 'Израильский шекель', symbol: '₪', flag: '🇮🇱', rate: 26 },
  { code: 'AMD', name: 'Армянский драм', symbol: '֏', flag: '🇦🇲', rate: 0.24 },
  { code: 'AZN', name: 'Азербайджанский манат', symbol: '₼', flag: '🇦🇿', rate: 56 },
  { code: 'UZS', name: 'Узбекский сум', symbol: "so'm", flag: '🇺🇿', rate: 0.0075 },
  { code: 'KGS', name: 'Киргизский сом', symbol: 'с', flag: '🇰🇬', rate: 1.1 },
  { code: 'TJS', name: 'Таджикский сомони', symbol: 'ЅМ', flag: '🇹🇯', rate: 8.9 },
  { code: 'TMT', name: 'Туркменский манат', symbol: 'm', flag: '🇹🇲', rate: 27 },
  { code: 'CHF', name: 'Швейцарский франк', symbol: 'Fr', flag: '🇨🇭', rate: 110 },
  { code: 'SEK', name: 'Шведская крона', symbol: 'kr', flag: '🇸🇪', rate: 9.2 },
  { code: 'NOK', name: 'Норвежская крона', symbol: 'kr', flag: '🇳🇴', rate: 9 },
  { code: 'DKK', name: 'Датская крона', symbol: 'kr', flag: '🇩🇰', rate: 14 },
  { code: 'PLN', name: 'Польский злотый', symbol: 'zł', flag: '🇵🇱', rate: 24 },
  { code: 'CZK', name: 'Чешская крона', symbol: 'Kč', flag: '🇨🇿', rate: 4.2 },
  { code: 'HUF', name: 'Венгерский форинт', symbol: 'Ft', flag: '🇭🇺', rate: 0.27 },
  { code: 'RON', name: 'Румынский лей', symbol: 'lei', flag: '🇷🇴', rate: 21 },
  { code: 'BGN', name: 'Болгарский лев', symbol: 'лв', flag: '🇧🇬', rate: 54 },
  { code: 'HRK', name: 'Хорватская куна', symbol: 'kn', flag: '🇭🇷', rate: 14 },
  { code: 'RSD', name: 'Сербский динар', symbol: 'дин', flag: '🇷🇸', rate: 0.89 },
  { code: 'CAD', name: 'Канадский доллар', symbol: 'C$', flag: '🇨🇦', rate: 70 },
  { code: 'AUD', name: 'Австралийский доллар', symbol: 'A$', flag: '🇦🇺', rate: 62 },
  { code: 'NZD', name: 'Новозеландский доллар', symbol: 'NZ$', flag: '🇳🇿', rate: 57 },
  { code: 'SGD', name: 'Сингапурский доллар', symbol: 'S$', flag: '🇸🇬', rate: 71 },
  { code: 'HKD', name: 'Гонконгский доллар', symbol: 'HK$', flag: '🇭🇰', rate: 12 },
  { code: 'KRW', name: 'Южнокорейская вона', symbol: '₩', flag: '🇰🇷', rate: 0.073 },
  { code: 'TWD', name: 'Тайваньский доллар', symbol: 'NT$', flag: '🇹🇼', rate: 3 },
  { code: 'MYR', name: 'Малайзийский ринггит', symbol: 'RM', flag: '🇲🇾', rate: 21 },
  { code: 'IDR', name: 'Индонезийская рупия', symbol: 'Rp', flag: '🇮🇩', rate: 0.006 },
  { code: 'PHP', name: 'Филиппинское песо', symbol: '₱', flag: '🇵🇭', rate: 1.7 },
  { code: 'PKR', name: 'Пакистанская рупия', symbol: '₨', flag: '🇵🇰', rate: 0.34 },
  { code: 'BDT', name: 'Бангладешская така', symbol: '৳', flag: '🇧🇩', rate: 0.87 },
  { code: 'LKR', name: 'Шри-ланкийская рупия', symbol: 'Rs', flag: '🇱🇰', rate: 0.32 },
  { code: 'NPR', name: 'Непальская рупия', symbol: 'Rs', flag: '🇳🇵', rate: 0.71 },
  { code: 'MVR', name: 'Мальдивская руфия', symbol: 'Rf', flag: '🇲🇻', rate: 6.2 },
  { code: 'MXN', name: 'Мексиканское песо', symbol: 'Mex$', flag: '🇲🇽', rate: 5.5 },
  { code: 'BRL', name: 'Бразильский реал', symbol: 'R$', flag: '🇧🇷', rate: 19 },
  { code: 'ARS', name: 'Аргентинское песо', symbol: '$', flag: '🇦🇷', rate: 0.095 },
  { code: 'CLP', name: 'Чилийское песо', symbol: '$', flag: '🇨🇱', rate: 0.1 },
  { code: 'COP', name: 'Колумбийское песо', symbol: '$', flag: '🇨🇴', rate: 0.024 },
  { code: 'PEN', name: 'Перуанский соль', symbol: 'S/', flag: '🇵🇪', rate: 25 },
  { code: 'ZAR', name: 'Южноафриканский рэнд', symbol: 'R', flag: '🇿🇦', rate: 5.2 },
  { code: 'MAD', name: 'Марокканский дирхам', symbol: 'د.م.', flag: '🇲🇦', rate: 9.5 },
  { code: 'TND', name: 'Тунисский динар', symbol: 'د.ت', flag: '🇹🇳', rate: 31 },
  { code: 'DZD', name: 'Алжирский динар', symbol: 'د.ج', flag: '🇩🇿', rate: 0.71 },
  { code: 'KES', name: 'Кенийский шиллинг', symbol: 'KSh', flag: '🇰🇪', rate: 0.74 },
  { code: 'NGN', name: 'Нигерийская найра', symbol: '₦', flag: '🇳🇬', rate: 0.062 },
  { code: 'GHS', name: 'Ганский седи', symbol: 'GH₵', flag: '🇬🇭', rate: 6.3 },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === code);
};

export const getExchangeRate = (fromCurrency: string, toCurrency: string = 'RUB'): number => {
  const from = getCurrencyByCode(fromCurrency);
  const to = getCurrencyByCode(toCurrency);
  
  if (!from || !to) return 1;
  
  return from.rate / to.rate;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'RUB'): number => {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

export const formatCurrencyOptions = () => {
  return CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.flag} ${currency.code} - ${currency.name}`
  }));
};

const COUNTRY_TO_CURRENCY: { [key: string]: string } = {
  'россия': 'RUB', 'russia': 'RUB',
  'сша': 'USD', 'usa': 'USD', 'америка': 'USD', 'america': 'USD',
  'франция': 'EUR', 'france': 'EUR', 'германия': 'EUR', 'germany': 'EUR',
  'испания': 'EUR', 'spain': 'EUR', 'италия': 'EUR', 'italy': 'EUR',
  'греция': 'EUR', 'greece': 'EUR', 'австрия': 'EUR', 'austria': 'EUR',
  'португалия': 'EUR', 'portugal': 'EUR', 'нидерланды': 'EUR', 'netherlands': 'EUR',
  'бельгия': 'EUR', 'belgium': 'EUR', 'финляндия': 'EUR', 'finland': 'EUR',
  'ирландия': 'EUR', 'ireland': 'EUR', 'эстония': 'EUR', 'estonia': 'EUR',
  'латвия': 'EUR', 'latvia': 'EUR', 'литва': 'EUR', 'lithuania': 'EUR',
  'великобритания': 'GBP', 'uk': 'GBP', 'англия': 'GBP', 'england': 'GBP',
  'китай': 'CNY', 'china': 'CNY',
  'япония': 'JPY', 'japan': 'JPY',
  'турция': 'TRY', 'turkey': 'TRY',
  'оаэ': 'AED', 'дубай': 'AED', 'uae': 'AED', 'dubai': 'AED', 'абу-даби': 'AED', 'abu dhabi': 'AED',
  'таиланд': 'THB', 'thailand': 'THB',
  'вьетнам': 'VND', 'vietnam': 'VND',
  'египет': 'EGP', 'egypt': 'EGP',
  'индия': 'INR', 'india': 'INR',
  'казахстан': 'KZT', 'kazakhstan': 'KZT',
  'беларусь': 'BYN', 'belarus': 'BYN', 'белоруссия': 'BYN',
  'украина': 'UAH', 'ukraine': 'UAH',
  'грузия': 'GEL', 'georgia': 'GEL',
  'катар': 'QAR', 'qatar': 'QAR',
  'саудовская аравия': 'SAR', 'saudi arabia': 'SAR', 'саудия': 'SAR',
  'кувейт': 'KWD', 'kuwait': 'KWD',
  'бахрейн': 'BHD', 'bahrain': 'BHD',
  'оман': 'OMR', 'oman': 'OMR',
  'иордания': 'JOD', 'jordan': 'JOD',
  'израиль': 'ILS', 'israel': 'ILS',
  'армения': 'AMD', 'armenia': 'AMD',
  'азербайджан': 'AZN', 'azerbaijan': 'AZN',
  'узбекистан': 'UZS', 'uzbekistan': 'UZS',
  'киргизия': 'KGS', 'kyrgyzstan': 'KGS', 'кыргызстан': 'KGS',
  'таджикистан': 'TJS', 'tajikistan': 'TJS',
  'туркменистан': 'TMT', 'turkmenistan': 'TMT',
  'швейцария': 'CHF', 'switzerland': 'CHF',
  'швеция': 'SEK', 'sweden': 'SEK',
  'норвегия': 'NOK', 'norway': 'NOK',
  'дания': 'DKK', 'denmark': 'DKK',
  'польша': 'PLN', 'poland': 'PLN',
  'чехия': 'CZK', 'czech': 'CZK', 'чешская республика': 'CZK',
  'венгрия': 'HUF', 'hungary': 'HUF',
  'румыния': 'RON', 'romania': 'RON',
  'болгария': 'BGN', 'bulgaria': 'BGN',
  'хорватия': 'HRK', 'croatia': 'HRK',
  'сербия': 'RSD', 'serbia': 'RSD',
  'канада': 'CAD', 'canada': 'CAD',
  'австралия': 'AUD', 'australia': 'AUD',
  'новая зеландия': 'NZD', 'new zealand': 'NZD',
  'сингапур': 'SGD', 'singapore': 'SGD',
  'гонконг': 'HKD', 'hong kong': 'HKD',
  'южная корея': 'KRW', 'south korea': 'KRW', 'корея': 'KRW',
  'тайвань': 'TWD', 'taiwan': 'TWD',
  'малайзия': 'MYR', 'malaysia': 'MYR',
  'индонезия': 'IDR', 'indonesia': 'IDR', 'бали': 'IDR', 'bali': 'IDR',
  'филиппины': 'PHP', 'philippines': 'PHP',
  'пакистан': 'PKR', 'pakistan': 'PKR',
  'бангладеш': 'BDT', 'bangladesh': 'BDT',
  'шри-ланка': 'LKR', 'sri lanka': 'LKR',
  'непал': 'NPR', 'nepal': 'NPR',
  'мальдивы': 'MVR', 'maldives': 'MVR',
  'мексика': 'MXN', 'mexico': 'MXN',
  'бразилия': 'BRL', 'brazil': 'BRL',
  'аргентина': 'ARS', 'argentina': 'ARS',
  'чили': 'CLP', 'chile': 'CLP',
  'колумбия': 'COP', 'colombia': 'COP',
  'перу': 'PEN', 'peru': 'PEN',
  'юар': 'ZAR', 'south africa': 'ZAR', 'южная африка': 'ZAR',
  'марокко': 'MAD', 'morocco': 'MAD',
  'тунис': 'TND', 'tunisia': 'TND',
  'алжир': 'DZD', 'algeria': 'DZD',
  'кения': 'KES', 'kenya': 'KES',
  'нигерия': 'NGN', 'nigeria': 'NGN',
  'гана': 'GHS', 'ghana': 'GHS',
};

export const detectCurrencyByCountry = (country: string): string => {
  if (!country) return 'RUB';
  
  const normalized = country.toLowerCase().trim();
  return COUNTRY_TO_CURRENCY[normalized] || 'RUB';
};