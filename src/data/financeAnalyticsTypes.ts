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

export interface Health {
  score: number;
  status: string;
  label: string;
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

export interface Recommendation {
  priority: string;
  icon: string;
  title: string;
  text: string;
  action?: string;
  debt_id?: string;
  extra_amount?: number;
  months_saved?: number;
  interest_saved?: number;
  potential_savings?: number;
  target_amount?: number;
}

export interface MissingData {
  type: string;
  icon: string;
  text: string;
}

export interface CashflowItem {
  month: number;
  income: number;
  expenses: number;
  debt_payments: number;
  free_money: number;
  active_debts: number;
  total_remaining: number;
}

export interface HistoryItem {
  month: string;
  income: number;
  expense: number;
}

export interface BudgetItem {
  category: string;
  planned: number;
  spent: number;
}

export interface GoalItem {
  name: string;
  target: number;
  current: number;
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
  health: Health;
  strategies: { avalanche: StrategyResult | null; snowball: StrategyResult | null; recommended: string | null };
  cashflow: CashflowItem[];
  recommendations: Recommendation[];
  missing_data: MissingData[];
  debts_detail: DebtDetail[];
  history: HistoryItem[];
  budgets: BudgetItem[];
  goals: GoalItem[];
}

export const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

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

export function fmCompact(n: number): string {
  if (n == null || isNaN(n)) return '0 \u20BD';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1).replace('.0', '') + '\u041C \u20BD';
  if (abs >= 10_000) return sign + Math.round(abs / 1000) + '\u041A \u20BD';
  return Math.round(n).toLocaleString('ru-RU') + ' \u20BD';
}

export function formatFreedomDate(d: string): string {
  try {
    const [y, m] = d.split('-');
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${months[parseInt(m) - 1]} ${y}`;
  } catch { return d; }
}

export const MISSING_LINKS: Record<string, string> = {
  budgets: '/finance/budget',
  recurring_income: '/finance/recurring',
  recurring_expense: '/finance/recurring',
  goals: '/finance/goals',
  accounts: '/finance/accounts',
  essential_expenses: '/finance/budget',
};

export const QUICK_QUESTIONS = [
  'Как быстрее закрыть все долги?',
  'Где можно сэкономить?',
  'Как создать подушку безопасности?',
  'Оцени мою финансовую ситуацию',
];
