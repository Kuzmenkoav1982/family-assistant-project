export function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

export function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export const FREQ_LABELS: Record<string, string> = {
  monthly: 'Ежемесячно',
  weekly: 'Еженедельно',
  quarterly: 'Ежеквартально',
  yearly: 'Ежегодно',
};

export const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const MONTH_FULL_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Понедельник', 2: 'Вторник', 3: 'Среда',
  4: 'Четверг', 5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье',
};

export const PRESETS = [
  { label: 'Зарплата', type: 'income', icon: 'Banknote', desc: 'Зарплата' },
  { label: 'Премия кварт.', type: 'income', icon: 'Award', desc: 'Квартальная премия', freq: 'quarterly' },
  { label: 'Премия год.', type: 'income', icon: 'Trophy', desc: 'Годовая премия', freq: 'yearly' },
  { label: 'ЖКХ', type: 'expense', icon: 'Home', desc: 'Коммунальные платежи' },
  { label: 'Аренда', type: 'expense', icon: 'Key', desc: 'Аренда жилья' },
  { label: 'Интернет', type: 'expense', icon: 'Wifi', desc: 'Интернет и ТВ' },
  { label: 'Телефон', type: 'expense', icon: 'Smartphone', desc: 'Мобильная связь' },
  { label: 'Подписки', type: 'expense', icon: 'Repeat', desc: 'Подписки (сервисы)' },
  { label: 'Кредит', type: 'expense', icon: 'CreditCard', desc: 'Платёж по кредиту' },
  { label: 'Садик/школа', type: 'expense', icon: 'GraduationCap', desc: 'Детский сад / школа' },
  { label: 'Страховка', type: 'expense', icon: 'Shield', desc: 'Страхование' },
  { label: 'Транспорт', type: 'expense', icon: 'Car', desc: 'Проездной / бензин' },
];

export interface RecurringItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  day_of_month: number | null;
  next_date: string | null;
  is_active: boolean;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
  active_months: number[] | null;
  category_id: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

export interface FormState {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  frequency: string;
  day_of_month: string;
  next_date: string;
  category_id: string;
  active_months: number[];
}

export const emptyForm: FormState = {
  type: 'expense',
  amount: '',
  description: '',
  frequency: 'monthly',
  day_of_month: '',
  next_date: new Date().toISOString().split('T')[0],
  category_id: '',
  active_months: [],
};

export function monthlyAmount(item: RecurringItem): number {
  if (item.frequency === 'monthly') return item.amount;
  if (item.frequency === 'weekly') return item.amount * 4.33;
  if (item.active_months && item.active_months.length > 0) return (item.amount * item.active_months.length) / 12;
  if (item.frequency === 'quarterly') return item.amount / 3;
  if (item.frequency === 'yearly') return item.amount / 12;
  return item.amount;
}

export function monthlyExplanation(item: RecurringItem): string | null {
  if (item.frequency === 'monthly') return null;
  if (item.frequency === 'weekly') return `${formatMoney(item.amount)} x 4.33 нед`;
  if (item.active_months && item.active_months.length > 0) return `${formatMoney(item.amount)} x ${item.active_months.length} мес / 12`;
  if (item.frequency === 'quarterly') return `${formatMoney(item.amount)} / 3`;
  if (item.frequency === 'yearly') return `${formatMoney(item.amount)} / 12`;
  return null;
}
