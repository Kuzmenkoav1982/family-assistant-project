export interface Debt {
  id: string;
  debt_type: string;
  name: string;
  creditor: string;
  original_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string;
  credit_limit?: number | null;
  grace_period_days?: number | null;
  grace_period_end?: string | null;
  grace_amount?: number | null;
  min_payment_pct?: number | null;
  bank_name?: string | null;
  show_in_budget?: boolean;
  is_priority?: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  is_extra: boolean;
  notes: string;
}

export interface DebtFormState {
  name: string;
  debt_type: string;
  creditor: string;
  original_amount: string;
  remaining_amount: string;
  interest_rate: string;
  monthly_payment: string;
  next_payment_date: string;
  start_date: string;
  end_date: string;
  notes: string;
  credit_limit: string;
  grace_period_days: string;
  grace_period_end: string;
  grace_amount: string;
  min_payment_pct: string;
  bank_name: string;
  show_in_budget: boolean;
  is_priority: boolean;
}

export const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

export const DEBT_TYPES = [
  { value: 'mortgage', label: 'Ипотека', icon: 'Home', color: '#3B82F6' },
  { value: 'credit', label: 'Кредит', icon: 'Banknote', color: '#EF4444' },
  { value: 'credit_card', label: 'Кредитная карта', icon: 'CreditCard', color: '#F97316' },
  { value: 'car_loan', label: 'Автокредит', icon: 'Car', color: '#F59E0B' },
  { value: 'personal', label: 'Личный долг', icon: 'Users', color: '#8B5CF6' },
  { value: 'microloan', label: 'Микрозайм', icon: 'Zap', color: '#EC4899' },
  { value: 'installment', label: 'Рассрочка', icon: 'ShoppingBag', color: '#14B8A6' },
];

export const DEFAULT_RATES: Record<string, number> = {
  credit_card: 30, microloan: 292, credit: 18, car_loan: 18,
  mortgage: 12, personal: 0, installment: 0,
};

export function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

export function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function getDebtMeta(type: string) {
  return DEBT_TYPES.find(t => t.value === type) || DEBT_TYPES[1];
}

export function isCC(type: string) {
  return type === 'credit_card';
}

export function getEffectiveRate(d: Debt): { rate: number; estimated: boolean } {
  if (d.interest_rate > 0) return { rate: d.interest_rate, estimated: false };
  const defaultRate = DEFAULT_RATES[d.debt_type] || 0;
  return { rate: defaultRate, estimated: defaultRate > 0 };
}

export function calcLoanPayoff(remaining: number, rate: number, monthly: number) {
  if (monthly <= 0 || remaining <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 600;
  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const principal = Math.min(monthly - interest, balance);
    if (principal <= 0) return { months: Infinity, totalPaid: Infinity, overpayment: Infinity };
    balance -= principal;
    totalPaid += monthly;
    months++;
  }
  return { months, totalPaid, overpayment: totalPaid - remaining };
}

export function calcCreditCardPayoff(remaining: number, rate: number, minPct: number) {
  if (remaining <= 0 || minPct <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 600;
  while (balance > 1 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const payment = Math.max(balance * (minPct / 100), 500);
    if (payment <= interest) return { months: Infinity, totalPaid: Infinity, overpayment: Infinity };
    balance = balance + interest - payment;
    totalPaid += payment;
    months++;
  }
  return { months, totalPaid, overpayment: totalPaid - remaining };
}

export function formatMonths(m: number) {
  if (m === Infinity) return 'Не погасить';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y > 0 && mo > 0) return `${y} г. ${mo} мес.`;
  if (y > 0) return `${y} г.`;
  return `${mo} мес.`;
}

export function getDebtPayoff(d: Debt) {
  if (d.status === 'paid' || d.remaining_amount <= 0) return null;
  const { rate } = getEffectiveRate(d);
  if (isCC(d.debt_type) && d.min_payment_pct) {
    return calcCreditCardPayoff(d.remaining_amount, rate, d.min_payment_pct);
  }
  if (d.monthly_payment > 0) {
    return calcLoanPayoff(d.remaining_amount, rate, d.monthly_payment);
  }
  return null;
}

export const INITIAL_FORM: DebtFormState = {
  name: '', debt_type: 'credit', creditor: '', original_amount: '',
  remaining_amount: '', interest_rate: '', monthly_payment: '',
  next_payment_date: '', start_date: '', end_date: '', notes: '',
  credit_limit: '', grace_period_days: '', grace_period_end: '',
  grace_amount: '', min_payment_pct: '', bank_name: '',
  show_in_budget: false, is_priority: false,
};
