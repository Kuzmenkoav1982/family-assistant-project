import type { Transaction, PlannedItem, Category, BudgetItem } from '@/data/financeBudgetTypes';
import type { Debt, Payment } from '@/data/financeDebtsTypes';
import type { AnalysisData } from '@/data/financeAnalyticsTypes';

const CURRENT_MONTH = '2026-04';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Зарплата', icon: 'Briefcase', color: '#22C55E', type: 'income', is_system: false },
  { id: 'cat-2', name: 'Подработка', icon: 'Laptop', color: '#14B8A6', type: 'income', is_system: false },
  { id: 'cat-3', name: 'Пенсия', icon: 'Heart', color: '#6366F1', type: 'income', is_system: false },
  { id: 'cat-4', name: 'Продукты', icon: 'ShoppingCart', color: '#F59E0B', type: 'expense', is_system: false },
  { id: 'cat-5', name: 'ЖКХ', icon: 'Home', color: '#3B82F6', type: 'expense', is_system: false },
  { id: 'cat-6', name: 'Транспорт', icon: 'Car', color: '#EF4444', type: 'expense', is_system: false },
  { id: 'cat-7', name: 'Образование', icon: 'GraduationCap', color: '#8B5CF6', type: 'expense', is_system: false },
  { id: 'cat-8', name: 'Здоровье', icon: 'Stethoscope', color: '#EC4899', type: 'expense', is_system: false },
  { id: 'cat-9', name: 'Развлечения', icon: 'Gamepad2', color: '#F97316', type: 'expense', is_system: false },
  { id: 'cat-10', name: 'Одежда', icon: 'Shirt', color: '#A855F7', type: 'expense', is_system: false },
  { id: 'cat-11', name: 'Техника', icon: 'Smartphone', color: '#6366F1', type: 'expense', is_system: false },
  { id: 'cat-12', name: 'Связь', icon: 'Wifi', color: '#0EA5E9', type: 'expense', is_system: false },
  { id: 'cat-13', name: 'Подписки', icon: 'Tv', color: '#D946EF', type: 'expense', is_system: false },
  { id: 'cat-14', name: 'Кафе и рестораны', icon: 'UtensilsCrossed', color: '#FB923C', type: 'expense', is_system: false },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', amount: 95000, type: 'income', description: 'Зарплата Алексей', date: '2026-04-05', member_id: null, account_id: 'acc-1', category_name: 'Зарплата', category_icon: 'Briefcase', category_color: '#22C55E', account_name: 'Сбербанк' },
  { id: 'tx-2', amount: 78000, type: 'income', description: 'Зарплата Анастасия', date: '2026-04-05', member_id: null, account_id: 'acc-1', category_name: 'Зарплата', category_icon: 'Briefcase', category_color: '#22C55E', account_name: 'Сбербанк' },
  { id: 'tx-3', amount: 24000, type: 'income', description: 'Пенсия бабушка Нина', date: '2026-04-03', member_id: null, account_id: 'acc-1', category_name: 'Пенсия', category_icon: 'Heart', category_color: '#6366F1', account_name: 'Сбербанк' },
  { id: 'tx-4', amount: 8700, type: 'expense', description: 'Пятёрочка — продукты на неделю', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Сбербанк' },
  { id: 'tx-5', amount: 6200, type: 'expense', description: 'Перекрёсток — мясо, молочка', date: '2026-04-04', member_id: null, account_id: 'acc-1', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Сбербанк' },
  { id: 'tx-6', amount: 4300, type: 'expense', description: 'ВкусВилл — фрукты, овощи', date: '2026-04-08', member_id: null, account_id: 'acc-1', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Сбербанк' },
  { id: 'tx-7', amount: 7800, type: 'expense', description: 'Лента — закупка на выходные', date: '2026-04-12', member_id: null, account_id: 'acc-1', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Сбербанк' },
  { id: 'tx-8', amount: 5100, type: 'expense', description: 'Магнит — бытовая химия', date: '2026-04-15', member_id: null, account_id: 'acc-3', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Наличные' },
  { id: 'tx-9', amount: 12400, type: 'expense', description: 'Квартплата апрель', date: '2026-04-02', member_id: null, account_id: 'acc-1', category_name: 'ЖКХ', category_icon: 'Home', category_color: '#3B82F6', account_name: 'Сбербанк' },
  { id: 'tx-10', amount: 3200, type: 'expense', description: 'Электричество', date: '2026-04-02', member_id: null, account_id: 'acc-1', category_name: 'ЖКХ', category_icon: 'Home', category_color: '#3B82F6', account_name: 'Сбербанк' },
  { id: 'tx-11', amount: 2800, type: 'expense', description: 'Бензин АИ-95', date: '2026-04-03', member_id: null, account_id: 'acc-1', category_name: 'Транспорт', category_icon: 'Car', category_color: '#EF4444', account_name: 'Сбербанк' },
  { id: 'tx-12', amount: 3100, type: 'expense', description: 'Бензин АИ-95', date: '2026-04-10', member_id: null, account_id: 'acc-1', category_name: 'Транспорт', category_icon: 'Car', category_color: '#EF4444', account_name: 'Сбербанк' },
  { id: 'tx-13', amount: 1800, type: 'expense', description: 'Метро — проездной Матвей', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Транспорт', category_icon: 'Car', category_color: '#EF4444', account_name: 'Сбербанк' },
  { id: 'tx-14', amount: 4500, type: 'expense', description: 'Репетитор английский — Даша', date: '2026-04-07', member_id: null, account_id: 'acc-1', category_name: 'Образование', category_icon: 'GraduationCap', category_color: '#8B5CF6', account_name: 'Сбербанк' },
  { id: 'tx-15', amount: 3800, type: 'expense', description: 'Курсы программирования — Матвей', date: '2026-04-06', member_id: null, account_id: 'acc-2', category_name: 'Образование', category_icon: 'GraduationCap', category_color: '#8B5CF6', account_name: 'Тинькофф' },
  { id: 'tx-16', amount: 5600, type: 'expense', description: 'Стоматолог — Анастасия', date: '2026-04-09', member_id: null, account_id: 'acc-1', category_name: 'Здоровье', category_icon: 'Stethoscope', category_color: '#EC4899', account_name: 'Сбербанк' },
  { id: 'tx-17', amount: 2300, type: 'expense', description: 'Аптека — витамины', date: '2026-04-11', member_id: null, account_id: 'acc-3', category_name: 'Здоровье', category_icon: 'Stethoscope', category_color: '#EC4899', account_name: 'Наличные' },
  { id: 'tx-18', amount: 4200, type: 'expense', description: 'Кинотеатр — всей семьёй', date: '2026-04-06', member_id: null, account_id: 'acc-2', category_name: 'Развлечения', category_icon: 'Gamepad2', category_color: '#F97316', account_name: 'Тинькофф' },
  { id: 'tx-19', amount: 2500, type: 'expense', description: 'Боулинг с друзьями', date: '2026-04-13', member_id: null, account_id: 'acc-2', category_name: 'Развлечения', category_icon: 'Gamepad2', category_color: '#F97316', account_name: 'Тинькофф' },
  { id: 'tx-20', amount: 8900, type: 'expense', description: 'Куртка зимняя — Матвей', date: '2026-04-04', member_id: null, account_id: 'acc-1', category_name: 'Одежда', category_icon: 'Shirt', category_color: '#A855F7', account_name: 'Сбербанк' },
  { id: 'tx-21', amount: 3400, type: 'expense', description: 'Кроссовки — Даша', date: '2026-04-08', member_id: null, account_id: 'acc-2', category_name: 'Одежда', category_icon: 'Shirt', category_color: '#A855F7', account_name: 'Тинькофф' },
  { id: 'tx-22', amount: 890, type: 'expense', description: 'Мобильная связь — семейный', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Связь', category_icon: 'Wifi', category_color: '#0EA5E9', account_name: 'Сбербанк' },
  { id: 'tx-23', amount: 1100, type: 'expense', description: 'Домашний интернет Ростелеком', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Связь', category_icon: 'Wifi', category_color: '#0EA5E9', account_name: 'Сбербанк' },
  { id: 'tx-24', amount: 399, type: 'expense', description: 'Яндекс Плюс', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Подписки', category_icon: 'Tv', category_color: '#D946EF', account_name: 'Сбербанк' },
  { id: 'tx-25', amount: 599, type: 'expense', description: 'Кинопоиск', date: '2026-04-01', member_id: null, account_id: 'acc-1', category_name: 'Подписки', category_icon: 'Tv', category_color: '#D946EF', account_name: 'Сбербанк' },
  { id: 'tx-26', amount: 3200, type: 'expense', description: 'Якитория — ужин семейный', date: '2026-04-05', member_id: null, account_id: 'acc-2', category_name: 'Кафе и рестораны', category_icon: 'UtensilsCrossed', category_color: '#FB923C', account_name: 'Тинькофф' },
  { id: 'tx-27', amount: 1850, type: 'expense', description: 'Кофейня — обед с коллегами', date: '2026-04-09', member_id: null, account_id: 'acc-2', category_name: 'Кафе и рестораны', category_icon: 'UtensilsCrossed', category_color: '#FB923C', account_name: 'Тинькофф' },
  { id: 'tx-28', amount: 15000, type: 'expense', description: 'Наушники Sony WH-1000XM5', date: '2026-04-07', member_id: null, account_id: 'acc-2', category_name: 'Техника', category_icon: 'Smartphone', category_color: '#6366F1', account_name: 'Тинькофф' },
  { id: 'tx-29', amount: 2900, type: 'expense', description: 'Бензин АИ-95', date: '2026-04-14', member_id: null, account_id: 'acc-1', category_name: 'Транспорт', category_icon: 'Car', category_color: '#EF4444', account_name: 'Сбербанк' },
  { id: 'tx-30', amount: 5400, type: 'expense', description: 'Ашан — продукты на неделю', date: '2026-04-15', member_id: null, account_id: 'acc-1', category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B', account_name: 'Сбербанк' },
];

export const DEMO_PLANNED: PlannedItem[] = [
  { id: 'pl-1', source_id: 'rec-1', source: 'debt', amount: 28500, type: 'expense', description: 'Ипотека — ежемесячный платёж', date: '2026-04-20', is_planned: true, category_name: null, category_icon: null, category_color: null, account_name: 'Сбербанк', debt_type: 'mortgage', bank_name: 'Сбербанк' },
  { id: 'pl-2', source_id: 'rec-2', source: 'debt', amount: 15200, type: 'expense', description: 'Автокредит — ежемесячный платёж', date: '2026-04-22', is_planned: true, category_name: null, category_icon: null, category_color: null, account_name: 'Сбербанк', debt_type: 'car_loan', bank_name: 'ВТБ' },
  { id: 'pl-3', source_id: 'rec-3', source: 'recurring', amount: 1100, type: 'expense', description: 'Интернет Ростелеком', date: '2026-04-25', is_planned: true, category_name: 'Связь', category_icon: 'Wifi', category_color: '#0EA5E9', account_name: 'Сбербанк' },
  { id: 'pl-4', source_id: 'rec-4', source: 'recurring', amount: 890, type: 'expense', description: 'Мобильная связь семейный', date: '2026-04-25', is_planned: true, category_name: 'Связь', category_icon: 'Wifi', category_color: '#0EA5E9', account_name: 'Сбербанк' },
  { id: 'pl-5', source_id: 'rec-5', source: 'recurring', amount: 12400, type: 'expense', description: 'Квартплата', date: '2026-04-28', is_planned: true, category_name: 'ЖКХ', category_icon: 'Home', category_color: '#3B82F6', account_name: 'Сбербанк' },
  { id: 'pl-6', source_id: 'rec-6', source: 'debt', amount: 5000, type: 'expense', description: 'Минимальный платёж Тинькофф КК', date: '2026-04-18', is_planned: true, category_name: null, category_icon: null, category_color: null, account_name: 'Сбербанк', debt_type: 'credit_card', bank_name: 'Тинькофф' },
];

export const DEMO_BUDGETS_LIST: BudgetItem[] = [
  { id: 'bud-1', category_id: 'cat-4', month: CURRENT_MONTH, planned: 35000, spent: 32200, category_name: 'Продукты', category_icon: 'ShoppingCart', category_color: '#F59E0B' },
  { id: 'bud-2', category_id: 'cat-5', month: CURRENT_MONTH, planned: 18000, spent: 15600, category_name: 'ЖКХ', category_icon: 'Home', category_color: '#3B82F6' },
  { id: 'bud-3', category_id: 'cat-6', month: CURRENT_MONTH, planned: 12000, spent: 8600, category_name: 'Транспорт', category_icon: 'Car', category_color: '#EF4444' },
  { id: 'bud-4', category_id: 'cat-7', month: CURRENT_MONTH, planned: 10000, spent: 8300, category_name: 'Образование', category_icon: 'GraduationCap', category_color: '#8B5CF6' },
  { id: 'bud-5', category_id: 'cat-8', month: CURRENT_MONTH, planned: 10000, spent: 7900, category_name: 'Здоровье', category_icon: 'Stethoscope', category_color: '#EC4899' },
  { id: 'bud-6', category_id: 'cat-9', month: CURRENT_MONTH, planned: 8000, spent: 6700, category_name: 'Развлечения', category_icon: 'Gamepad2', category_color: '#F97316' },
  { id: 'bud-7', category_id: 'cat-10', month: CURRENT_MONTH, planned: 10000, spent: 12300, category_name: 'Одежда', category_icon: 'Shirt', category_color: '#A855F7' },
  { id: 'bud-8', category_id: 'cat-12', month: CURRENT_MONTH, planned: 3000, spent: 1990, category_name: 'Связь', category_icon: 'Wifi', category_color: '#0EA5E9' },
  { id: 'bud-9', category_id: 'cat-13', month: CURRENT_MONTH, planned: 1500, spent: 998, category_name: 'Подписки', category_icon: 'Tv', category_color: '#D946EF' },
  { id: 'bud-10', category_id: 'cat-14', month: CURRENT_MONTH, planned: 7000, spent: 5050, category_name: 'Кафе и рестораны', category_icon: 'UtensilsCrossed', category_color: '#FB923C' },
];

export const DEMO_ACCOUNTS = [
  { id: 'acc-1', name: 'Сбербанк', account_type: 'debit', bank_name: 'Сбер', last4: '4276', balance: 142500, currency: 'RUB', color: '#22C55E', icon: 'CreditCard', is_active: true },
  { id: 'acc-2', name: 'Тинькофф', account_type: 'credit_card', bank_name: 'Т-Банк', last4: '7890', balance: -85000, currency: 'RUB', color: '#F97316', icon: 'CreditCard', is_active: true },
  { id: 'acc-3', name: 'Наличные', account_type: 'cash', bank_name: '', last4: '', balance: 18700, currency: 'RUB', color: '#F59E0B', icon: 'Banknote', is_active: true },
  { id: 'acc-4', name: 'Накопительный счёт', account_type: 'deposit', bank_name: 'Сбер', last4: '5531', balance: 320000, currency: 'RUB', color: '#3B82F6', icon: 'PiggyBank', is_active: true },
];

export const DEMO_DEBTS: Debt[] = [
  {
    id: 'debt-1', debt_type: 'mortgage', name: 'Ипотека', creditor: 'Сбербанк',
    original_amount: 5200000, remaining_amount: 3200000, interest_rate: 8.5,
    monthly_payment: 28500, next_payment_date: '2026-04-20',
    start_date: '2022-03-15', end_date: '2042-03-15', status: 'active',
    notes: '', show_in_budget: true, is_priority: false,
    credit_limit: null, grace_period_days: null, grace_period_end: null,
    grace_amount: null, min_payment_pct: null, bank_name: 'Сбербанк',
  },
  {
    id: 'debt-2', debt_type: 'car_loan', name: 'Автокредит', creditor: 'ВТБ',
    original_amount: 1200000, remaining_amount: 450000, interest_rate: 12,
    monthly_payment: 15200, next_payment_date: '2026-04-22',
    start_date: '2023-09-01', end_date: '2027-09-01', status: 'active',
    notes: 'Hyundai Tucson 2022', show_in_budget: true, is_priority: false,
    credit_limit: null, grace_period_days: null, grace_period_end: null,
    grace_amount: null, min_payment_pct: null, bank_name: 'ВТБ',
  },
  {
    id: 'debt-3', debt_type: 'credit_card', name: 'Кредитная карта Тинькофф', creditor: 'Тинькофф',
    original_amount: 200000, remaining_amount: 85000, interest_rate: 29.9,
    monthly_payment: 5000, next_payment_date: '2026-04-18',
    start_date: '2024-06-01', end_date: null, status: 'active',
    notes: '', show_in_budget: true, is_priority: true,
    credit_limit: 200000, grace_period_days: 55, grace_period_end: '2026-04-25',
    grace_amount: 42000, min_payment_pct: 5, bank_name: 'Тинькофф',
  },
];

export const DEMO_PAYMENTS: Record<string, Payment[]> = {
  'debt-1': [
    { id: 'pay-1', amount: 28500, date: '2026-03-20', is_extra: false, notes: '' },
    { id: 'pay-2', amount: 28500, date: '2026-02-20', is_extra: false, notes: '' },
    { id: 'pay-3', amount: 28500, date: '2026-01-20', is_extra: false, notes: '' },
    { id: 'pay-4', amount: 28500, date: '2025-12-20', is_extra: false, notes: '' },
    { id: 'pay-5', amount: 50000, date: '2025-12-30', is_extra: true, notes: 'Досрочное погашение с премии' },
  ],
  'debt-2': [
    { id: 'pay-6', amount: 15200, date: '2026-03-22', is_extra: false, notes: '' },
    { id: 'pay-7', amount: 15200, date: '2026-02-22', is_extra: false, notes: '' },
    { id: 'pay-8', amount: 15200, date: '2026-01-22', is_extra: false, notes: '' },
  ],
  'debt-3': [
    { id: 'pay-9', amount: 5000, date: '2026-03-18', is_extra: false, notes: '' },
    { id: 'pay-10', amount: 10000, date: '2026-02-18', is_extra: false, notes: '' },
  ],
};

function buildCashflow(): { month: number; income: number; expenses: number; debt_payments: number; free_money: number; active_debts: number; total_remaining: number }[] {
  const items = [];
  let remaining = 3735000;
  let activeDebts = 3;

  for (let i = 0; i < 24; i++) {
    const income = 197000;
    const expenses = 120000 + Math.round((Math.random() - 0.5) * 10000);
    let debtPayments = 48700;

    if (i >= 18) {
      debtPayments = 28500;
      activeDebts = 1;
    } else if (i >= 10) {
      debtPayments = 33500;
      activeDebts = 2;
    }

    remaining = Math.max(0, remaining - (debtPayments - remaining * 0.008));
    const freeMoney = income - expenses - debtPayments;

    items.push({
      month: i,
      income,
      expenses,
      debt_payments: debtPayments,
      free_money: Math.round(freeMoney),
      active_debts: activeDebts,
      total_remaining: Math.round(Math.max(0, remaining)),
    });
  }

  return items;
}

export const DEMO_ANALYSIS: AnalysisData = {
  summary: {
    month_income: 197000,
    month_expenses: 120000,
    debt_payments: 48700,
    free_money: 28300,
    total_balance: 396200,
    total_debt: 3735000,
    total_assets: 10420000,
    net_worth: 6685000,
    dti: 24.7,
    emergency_months: 3.3,
    freedom_date: '2042-03',
  },
  health: {
    score: 62,
    status: 'fair',
    label: 'Удовлетворительно',
  },
  strategies: {
    recommended: 'avalanche',
    avalanche: {
      strategy: 'avalanche',
      total_months: 196,
      total_paid: 6842000,
      total_interest: 3107000,
      interest_saved: 245000,
      months_saved: 8,
      closed_order: [
        { id: 'debt-3', name: 'Кредитная карта Тинькофф', month: 10 },
        { id: 'debt-2', name: 'Автокредит', month: 18 },
        { id: 'debt-1', name: 'Ипотека', month: 196 },
      ],
      timeline: [
        { month: 0, total_remaining: 3735000, active_debts: 3, closed_total: 0 },
        { month: 3, total_remaining: 3590000, active_debts: 3, closed_total: 0 },
        { month: 6, total_remaining: 3440000, active_debts: 3, closed_total: 0 },
        { month: 10, total_remaining: 3200000, active_debts: 2, closed_total: 85000 },
        { month: 12, total_remaining: 3100000, active_debts: 2, closed_total: 85000 },
        { month: 18, total_remaining: 2750000, active_debts: 1, closed_total: 535000 },
        { month: 24, total_remaining: 2500000, active_debts: 1, closed_total: 535000 },
        { month: 60, total_remaining: 1800000, active_debts: 1, closed_total: 535000 },
        { month: 120, total_remaining: 800000, active_debts: 1, closed_total: 535000 },
        { month: 196, total_remaining: 0, active_debts: 0, closed_total: 3735000 },
      ],
    },
    snowball: {
      strategy: 'snowball',
      total_months: 204,
      total_paid: 7087000,
      total_interest: 3352000,
      interest_saved: 0,
      months_saved: 0,
      closed_order: [
        { id: 'debt-3', name: 'Кредитная карта Тинькофф', month: 10 },
        { id: 'debt-2', name: 'Автокредит', month: 20 },
        { id: 'debt-1', name: 'Ипотека', month: 204 },
      ],
      timeline: [
        { month: 0, total_remaining: 3735000, active_debts: 3, closed_total: 0 },
        { month: 3, total_remaining: 3600000, active_debts: 3, closed_total: 0 },
        { month: 6, total_remaining: 3460000, active_debts: 3, closed_total: 0 },
        { month: 10, total_remaining: 3220000, active_debts: 2, closed_total: 85000 },
        { month: 12, total_remaining: 3120000, active_debts: 2, closed_total: 85000 },
        { month: 20, total_remaining: 2800000, active_debts: 1, closed_total: 535000 },
        { month: 24, total_remaining: 2600000, active_debts: 1, closed_total: 535000 },
        { month: 60, total_remaining: 1900000, active_debts: 1, closed_total: 535000 },
        { month: 120, total_remaining: 900000, active_debts: 1, closed_total: 535000 },
        { month: 204, total_remaining: 0, active_debts: 0, closed_total: 3735000 },
      ],
    },
  },
  cashflow: buildCashflow(),
  recommendations: [
    {
      priority: 'high',
      icon: 'CreditCard',
      title: 'Погасите кредитную карту до окончания льготного периода',
      text: 'Оплатите 42 000 ₽ до 25 апреля, чтобы не платить 29.9% годовых. Это сэкономит ~12 700 ₽ процентов за год.',
      action: 'pay_debt',
      debt_id: 'debt-3',
      extra_amount: 42000,
      interest_saved: 12700,
    },
    {
      priority: 'high',
      icon: 'TrendingDown',
      title: 'Направьте свободные средства на автокредит',
      text: 'Доплачивая 10 000 ₽/мес сверх платежа, закроете автокредит на 14 месяцев раньше и сэкономите ~32 000 ₽ на процентах.',
      action: 'extra_payment',
      debt_id: 'debt-2',
      extra_amount: 10000,
      months_saved: 14,
      interest_saved: 32000,
    },
    {
      priority: 'medium',
      icon: 'PiggyBank',
      title: 'Увеличьте подушку безопасности до 6 месяцев',
      text: 'Сейчас запас покрывает 3.3 месяца расходов. Рекомендуем накопить ещё 280 000 ₽ для финансовой устойчивости.',
      action: 'save_more',
      target_amount: 280000,
    },
    {
      priority: 'low',
      icon: 'Shirt',
      title: 'Превышен бюджет на одежду',
      text: 'Расходы на одежду превысили план на 2 300 ₽ в этом месяце. Рассмотрите перенос крупных покупок на следующий месяц.',
      potential_savings: 2300,
    },
  ],
  missing_data: [],
  debts_detail: [
    { id: 'debt-1', name: 'Ипотека', debt_type: 'mortgage', creditor: 'Сбербанк', original_amount: 5200000, remaining: 3200000, rate: 8.5, payment: 28500, next_payment_date: '2026-04-20', bank_name: 'Сбербанк' },
    { id: 'debt-2', name: 'Автокредит', debt_type: 'car_loan', creditor: 'ВТБ', original_amount: 1200000, remaining: 450000, rate: 12, payment: 15200, next_payment_date: '2026-04-22', bank_name: 'ВТБ' },
    { id: 'debt-3', name: 'Кредитная карта Тинькофф', debt_type: 'credit_card', creditor: 'Тинькофф', original_amount: 200000, remaining: 85000, rate: 29.9, payment: 5000, next_payment_date: '2026-04-18', bank_name: 'Тинькофф' },
  ],
  history: [
    { month: 'Ноя', income: 195000, expense: 118000 },
    { month: 'Дек', income: 245000, expense: 158000 },
    { month: 'Янв', income: 197000, expense: 112000 },
    { month: 'Фев', income: 197000, expense: 125000 },
    { month: 'Мар', income: 197000, expense: 117000 },
    { month: 'Апр', income: 197000, expense: 120000 },
  ],
  budgets: [
    { category: 'Продукты', planned: 35000, spent: 32200 },
    { category: 'ЖКХ', planned: 18000, spent: 15600 },
    { category: 'Транспорт', planned: 12000, spent: 8600 },
    { category: 'Образование', planned: 10000, spent: 8300 },
    { category: 'Здоровье', planned: 10000, spent: 7900 },
    { category: 'Развлечения', planned: 8000, spent: 6700 },
    { category: 'Одежда', planned: 10000, spent: 12300 },
    { category: 'Связь', planned: 3000, spent: 1990 },
  ],
  goals: [
    { name: 'Отпуск в Турцию', target: 150000, current: 80000 },
    { name: 'Ремонт кухни', target: 300000, current: 45000 },
    { name: 'Подушка безопасности', target: 600000, current: 320000 },
  ],
};

export const DEMO_GOALS = [
  { id: 'goal-1', name: 'Отпуск в Турцию', target_amount: 150000, current_amount: 80000, target_date: '2026-08-01', icon: 'Plane', color: '#F59E0B', status: 'active', progress: 53 },
  { id: 'goal-2', name: 'Ремонт кухни', target_amount: 300000, current_amount: 45000, target_date: '2027-03-01', icon: 'Paintbrush', color: '#EC4899', status: 'active', progress: 15 },
  { id: 'goal-3', name: 'Подушка безопасности', target_amount: 600000, current_amount: 320000, target_date: null, icon: 'Shield', color: '#22C55E', status: 'active', progress: 53 },
];

export const DEMO_ASSETS = [
  { id: 'asset-1', name: 'Квартира 2-комн. Москва', asset_type: 'property', purchase_date: '2022-03-15', purchase_price: 7200000, current_value: 8500000, description: 'ул. Ленина, д. 42, кв. 15', location: 'Москва', icon: 'Home', color: '#3B82F6', status: 'active' },
  { id: 'asset-2', name: 'Hyundai Tucson 2022', asset_type: 'vehicle', purchase_date: '2023-09-01', purchase_price: 2400000, current_value: 1800000, description: 'Чёрный, 150 л.с., пробег 45 000 км', location: '', icon: 'Car', color: '#EF4444', status: 'active' },
  { id: 'asset-3', name: 'MacBook Pro 14" M3', asset_type: 'electronics', purchase_date: '2025-01-10', purchase_price: 180000, current_value: 120000, description: '16 ГБ, 512 ГБ SSD', location: '', icon: 'Laptop', color: '#8B5CF6', status: 'active' },
];

export const DEMO_HISTORY = [
  { month: 'Ноя', income: 195000, expense: 118000 },
  { month: 'Дек', income: 245000, expense: 158000 },
  { month: 'Янв', income: 197000, expense: 112000 },
  { month: 'Фев', income: 197000, expense: 125000 },
  { month: 'Мар', income: 197000, expense: 117000 },
  { month: 'Апр', income: 197000, expense: 120000 },
];
