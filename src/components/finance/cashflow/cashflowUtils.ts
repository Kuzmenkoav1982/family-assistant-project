// ===========================
// HELPERS
// ===========================

const MONTH_FULL = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function formatMoney(n: number): string {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('ru-RU');
}

export function fm(n: number): string {
  return formatMoney(n) + ' ₽';
}

export function getMonthName(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function getMonthShort(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return MONTH_SHORT[d.getMonth()];
}

export function getMonthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

// ===========================
// TYPES
// ===========================

export interface CashflowItem {
  month: number;
  income: number;
  expenses: number;
  debt_payments: number;
  free_money: number;
  active_debts: number;
  total_remaining: number;
}

export interface AnalysisResponse {
  summary: {
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
  };
  cashflow: CashflowItem[];
  debts_detail: { id: string; name: string; remaining: number; rate: number; payment: number }[];
  [key: string]: unknown;
}

export interface CashflowInsights {
  avgFree: number;
  worstMonth: CashflowItem | null;
  finalRemaining: number;
  firstDebtClosed: number | null;
  allDebtsFree: number | null;
  totalDebtPayments: number;
  debtDecrease: number;
  totalOverpay: number;
  gapMonths: number[];
  closedEvents: { month: number; prevDebts: number; newDebts: number }[];
  freeDrop: { month: number; drop: number } | null;
}

// ===========================
// ANALYSIS
// ===========================

export function analyzeData(cf: CashflowItem[]): CashflowInsights {
  if (!cf.length) {
    return { avgFree: 0, worstMonth: null, finalRemaining: 0, firstDebtClosed: null, allDebtsFree: null, totalDebtPayments: 0, debtDecrease: 0, totalOverpay: 0, gapMonths: [], closedEvents: [], freeDrop: null };
  }

  const avgFree = cf.reduce((s, c) => s + c.free_money, 0) / cf.length;
  const worstMonth = cf.reduce((w, c) => (c.free_money < w.free_money ? c : w), cf[0]);
  const finalRemaining = cf[cf.length - 1].total_remaining;
  const totalDebtPayments = cf.reduce((s, c) => s + c.debt_payments, 0);
  const debtDecrease = cf[0].total_remaining - finalRemaining;
  const totalOverpay = totalDebtPayments - debtDecrease;
  const gapMonths = cf.filter(c => c.free_money < 0).map(c => c.month);

  let firstDebtClosed: number | null = null;
  let allDebtsFree: number | null = null;
  const closedEvents: { month: number; prevDebts: number; newDebts: number }[] = [];

  for (let i = 1; i < cf.length; i++) {
    if (cf[i].active_debts < cf[i - 1].active_debts) {
      if (firstDebtClosed === null) firstDebtClosed = cf[i].month;
      closedEvents.push({ month: cf[i].month, prevDebts: cf[i - 1].active_debts, newDebts: cf[i].active_debts });
    }
    if (cf[i].active_debts === 0 && cf[i - 1].active_debts > 0) {
      allDebtsFree = cf[i].month;
    }
  }
  if (cf[0].active_debts === 0) allDebtsFree = 0;

  let freeDrop: { month: number; drop: number } | null = null;
  for (let i = 1; i < cf.length; i++) {
    const drop = cf[i - 1].free_money - cf[i].free_money;
    if (drop > avgFree * 0.5 && (!freeDrop || drop > freeDrop.drop)) {
      freeDrop = { month: cf[i].month, drop };
    }
  }

  return { avgFree, worstMonth, finalRemaining, firstDebtClosed, allDebtsFree, totalDebtPayments, debtDecrease, totalOverpay, gapMonths, closedEvents, freeDrop };
}
