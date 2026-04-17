export interface Summary {
  month_income: number;
  month_expenses: number;
  debt_payments: number;
  free_money: number;
  total_balance: number;
  total_debt: number;
  total_assets: number;
  net_worth: number;
  dti: number;
  emergency_months: number;
  freedom_date: string | null;
}

export interface StrategyResult {
  strategy: string;
  total_months: number;
  total_paid: number;
  total_interest: number;
  interest_saved: number;
  months_saved: number;
  closed_order: { name: string; month: number; id: string }[];
  timeline: { month: number; total_remaining: number; active_debts: number; closed_total: number }[];
}

export interface DebtDetail {
  id: string;
  name: string;
  debt_type: string;
  creditor: string;
  original_amount: number;
  remaining: number;
  rate: number;
  payment: number;
  next_payment_date: string | null;
  bank_name: string | null;
}

export interface AnalysisData {
  summary: Summary;
  health: { score: number; status: string; label: string };
  strategies: { avalanche: StrategyResult | null; snowball: StrategyResult | null; recommended: string | null };
  cashflow: unknown[];
  recommendations: unknown[];
  missing_data: unknown[];
  debts_detail: DebtDetail[];
  history: unknown[];
  budgets: unknown[];
  goals: unknown[];
}

export interface SimResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
}

export const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

export const DEBT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  mortgage: { label: 'Ипотека', icon: 'Home', color: '#3B82F6' },
  credit: { label: 'Кредит', icon: 'Banknote', color: '#EF4444' },
  credit_card: { label: 'Кредитная карта', icon: 'CreditCard', color: '#F97316' },
  car_loan: { label: 'Автокредит', icon: 'Car', color: '#F59E0B' },
  personal: { label: 'Личный долг', icon: 'Users', color: '#8B5CF6' },
  microloan: { label: 'Микрозайм', icon: 'Zap', color: '#EC4899' },
  installment: { label: 'Рассрочка', icon: 'ShoppingBag', color: '#14B8A6' },
};

export function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

export function formatMoney(n: number): string {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('ru-RU');
}

export function fm(n: number): string {
  return formatMoney(n) + ' \u20BD';
}

export function getDebtMeta(type: string) {
  return DEBT_TYPES[type] || { label: 'Долг', icon: 'Receipt', color: '#6B7280' };
}

export function simulatePayoff(remaining: number, rate: number, monthlyPayment: number, extraPayment: number): SimResult {
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  let months = 0;
  let totalInterest = 0;
  while (balance > 0.01 && months < 600) {
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment + extraPayment, balance + interest);
    const principal = payment - interest;
    if (principal <= 0) break;
    balance -= principal;
    totalInterest += interest;
    months++;
  }
  return { months, totalInterest: Math.round(totalInterest), totalPaid: Math.round(remaining + totalInterest) };
}

export function calcNewMonthlyPayment(
  remaining: number,
  rate: number,
  currentPayment: number,
  extraLumpSum: number
): { newPayment: number; newRemaining: number; fullyPaid: boolean } {
  const newRemaining = Math.max(0, remaining - extraLumpSum);
  if (newRemaining <= 0.01) {
    return { newPayment: 0, newRemaining: 0, fullyPaid: true };
  }
  const monthlyRate = rate / 100 / 12;
  // Оцениваем исходный срок кредита по текущему платежу (аннуитет)
  // n = -ln(1 - r*S/P) / ln(1+r)
  let months = 0;
  if (monthlyRate > 0 && currentPayment > remaining * monthlyRate) {
    const ratio = 1 - (monthlyRate * remaining) / currentPayment;
    if (ratio > 0) {
      months = Math.ceil(-Math.log(ratio) / Math.log(1 + monthlyRate));
    }
  } else if (monthlyRate === 0 && currentPayment > 0) {
    months = Math.ceil(remaining / currentPayment);
  }
  if (months <= 0) {
    // fallback — симулируем
    const sim = simulatePayoff(remaining, rate, currentPayment, 0);
    months = sim.months || 1;
  }
  // Новый платёж на тот же срок, но с уменьшенным остатком
  let newPayment: number;
  if (monthlyRate > 0) {
    const denom = 1 - Math.pow(1 + monthlyRate, -months);
    newPayment = (newRemaining * monthlyRate) / denom;
  } else {
    newPayment = newRemaining / months;
  }
  return {
    newPayment: Math.round(Math.min(newPayment, currentPayment)),
    newRemaining: Math.round(newRemaining),
    fullyPaid: false,
  };
}

export function simulateTimeline(remaining: number, rate: number, monthlyPayment: number, extraPayment: number): { month: number; balance: number }[] {
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  const points: { month: number; balance: number }[] = [{ month: 0, balance: Math.round(balance) }];
  let month = 0;
  while (balance > 0.01 && month < 600) {
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment + extraPayment, balance + interest);
    const principal = payment - interest;
    if (principal <= 0) break;
    balance -= principal;
    month++;
    if (month <= 24 || month % 3 === 0 || balance <= 0.01) {
      points.push({ month, balance: Math.round(Math.max(balance, 0)) });
    }
  }
  return points;
}