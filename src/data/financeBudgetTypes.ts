export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  member_id: string | null;
  account_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
}

export interface PlannedItem {
  id: string;
  source_id: string;
  source: 'recurring' | 'debt';
  amount: number;
  type: string;
  description: string;
  date: string;
  is_planned: true;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
  debt_type?: string;
  bank_name?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  is_system: boolean;
}

export interface BudgetItem {
  id: string;
  category_id: string | null;
  month: string;
  planned: number;
  spent: number;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
}

export interface CashGapWarning {
  show: boolean;
  gapDate: string;
  gapAmount: number;
  action: 'add' | 'edit' | 'confirm';
  confirmData?: PlannedItem;
}

export type TimelineItem = {
  id: string;
  date: string;
  dateStr: string;
  amount: number;
  type: string;
  description: string;
  isPlanned: boolean;
  source?: 'recurring' | 'debt';
  debt_type?: string;
  bank_name?: string;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
  originalPlanned?: PlannedItem;
  originalTx?: Transaction;
  runningBalance: number;
  isGap: boolean;
};

export interface TimelineGroup {
  dateKey: string;
  dateLabel: string;
  isToday: boolean;
  isPast: boolean;
  items: TimelineItem[];
}

export interface TimelineData {
  groups: TimelineGroup[];
  cashGap: { date: string; amount: number } | null;
  todayDate: string;
}

export const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

export const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': localStorage.getItem('authToken') || ''
  };
}

export function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatShort(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}М`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}т`;
  return String(n);
}
