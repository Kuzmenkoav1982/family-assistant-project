export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  memberId: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export const DEMO_FINANCE_RECORDS: FinanceRecord[] = [
  {
    id: 'fin-1',
    type: 'income',
    category: 'Зарплата',
    amount: 85000,
    description: 'Зарплата за октябрь',
    date: '2025-11-05',
    memberId: 'dad'
  },
  {
    id: 'fin-2',
    type: 'income',
    category: 'Зарплата',
    amount: 65000,
    description: 'Зарплата за октябрь',
    date: '2025-11-05',
    memberId: 'mom'
  },
  {
    id: 'fin-3',
    type: 'expense',
    category: 'Продукты',
    amount: 18500,
    description: 'Продукты на неделю',
    date: '2025-11-10',
    memberId: 'mom'
  },
  {
    id: 'fin-4',
    type: 'expense',
    category: 'Коммунальные услуги',
    amount: 8500,
    description: 'ЖКХ за октябрь',
    date: '2025-11-08',
    memberId: 'dad'
  },
  {
    id: 'fin-5',
    type: 'expense',
    category: 'Транспорт',
    amount: 3200,
    description: 'Бензин',
    date: '2025-11-12',
    memberId: 'dad'
  },
  {
    id: 'fin-6',
    type: 'expense',
    category: 'Образование',
    amount: 5000,
    description: 'Кружок по рисованию - София',
    date: '2025-11-01',
    memberId: 'mom'
  },
  {
    id: 'fin-7',
    type: 'expense',
    category: 'Здоровье',
    amount: 2800,
    description: 'Лекарства для бабушки',
    date: '2025-11-15',
    memberId: 'mom'
  },
  {
    id: 'fin-8',
    type: 'expense',
    category: 'Развлечения',
    amount: 4500,
    description: 'Кино всей семьей',
    date: '2025-11-16',
    memberId: 'dad'
  },
  {
    id: 'fin-9',
    type: 'expense',
    category: 'Одежда',
    amount: 6200,
    description: 'Куртка для Максима',
    date: '2025-11-18',
    memberId: 'mom'
  },
  {
    id: 'fin-10',
    type: 'income',
    category: 'Пенсия',
    amount: 22000,
    description: 'Пенсия',
    date: '2025-11-10',
    memberId: 'grandma'
  },
  {
    id: 'fin-11',
    type: 'income',
    category: 'Пенсия',
    amount: 25000,
    description: 'Пенсия',
    date: '2025-11-10',
    memberId: 'grandpa'
  },
  {
    id: 'fin-12',
    type: 'expense',
    category: 'Хозяйственные товары',
    amount: 1850,
    description: 'Бытовая химия',
    date: '2025-11-20',
    memberId: 'grandma'
  }
];

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    category: 'Продукты',
    limit: 25000,
    spent: 18500,
    month: '2025-11'
  },
  {
    id: 'budget-2',
    category: 'Транспорт',
    limit: 8000,
    spent: 3200,
    month: '2025-11'
  },
  {
    id: 'budget-3',
    category: 'Развлечения',
    limit: 10000,
    spent: 4500,
    month: '2025-11'
  },
  {
    id: 'budget-4',
    category: 'Образование',
    limit: 15000,
    spent: 5000,
    month: '2025-11'
  },
  {
    id: 'budget-5',
    category: 'Здоровье',
    limit: 5000,
    spent: 2800,
    month: '2025-11'
  }
];

export const getTotalIncome = (records: FinanceRecord[]): number => {
  return records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);
};

export const getTotalExpense = (records: FinanceRecord[]): number => {
  return records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
};

export const getBalance = (records: FinanceRecord[]): number => {
  return getTotalIncome(records) - getTotalExpense(records);
};
