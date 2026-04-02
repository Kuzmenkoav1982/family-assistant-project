import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceCashflowInstructions } from '@/components/finance/FinanceInstructions';
import {
  AreaChart, Area, ComposedChart, Line, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

// ===========================
// HELPERS
// ===========================

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': localStorage.getItem('authToken') || '',
  };
}

function formatMoney(n: number): string {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('ru-RU');
}

function fm(n: number): string {
  return formatMoney(n) + ' \u20BD';
}

const MONTH_FULL = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function getMonthName(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function getMonthShort(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return MONTH_SHORT[d.getMonth()];
}

function getMonthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

// ===========================
// TYPES
// ===========================

interface CashflowItem {
  month: number;
  income: number;
  expenses: number;
  debt_payments: number;
  free_money: number;
  active_debts: number;
  total_remaining: number;
}

interface AnalysisResponse {
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

// Derived analysis
interface CashflowInsights {
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

function analyzeData(cf: CashflowItem[]): CashflowInsights {
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

// ===========================
// MAIN COMPONENT
// ===========================

export default function FinanceCashflow() {
  const navigate = useNavigate();
  useIsFamilyOwner();

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}?section=financial_analysis`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
      toast.error('Не удалось загрузить прогноз');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cashflow = data?.cashflow || [];
  const insights = useMemo(() => analyzeData(cashflow), [cashflow]);

  // Chart data with month labels
  const chartData = useMemo(() =>
    cashflow.map(c => ({
      ...c,
      label: getMonthLabel(c.month),
      shortLabel: getMonthShort(c.month),
      monthName: getMonthName(c.month),
      totalSpend: c.expenses + c.debt_payments,
    })),
    [cashflow]
  );

  // Burndown chart data with annotations
  const burndownData = useMemo(() => {
    const closedSet = new Set(insights.closedEvents.map(e => e.month));
    return chartData.map(c => ({
      label: c.label,
      remaining: c.total_remaining,
      debts: c.active_debts,
      isClosed: closedSet.has(c.month),
    }));
  }, [chartData, insights]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Прогноз денежного потока" subtitle="Загрузка..." imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/93aa5f51-a753-462f-bb64-e7bd50d54c9f.jpg" backPath="/finance/analytics" />
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Строим прогноз на 24 месяца...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Прогноз денежного потока" subtitle="Ошибка" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/93aa5f51-a753-462f-bb64-e7bd50d54c9f.jpg" backPath="/finance/analytics" />
          <Card className="border-destructive">
            <CardContent className="py-10 text-center space-y-3">
              <Icon name="AlertTriangle" size={40} className="mx-auto text-destructive" />
              <p className="font-medium">{error || 'Не удалось загрузить данные'}</p>
              <Button onClick={fetchData}>Повторить</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cashflow.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Прогноз денежного потока" subtitle="Нет данных" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/93aa5f51-a753-462f-bb64-e7bd50d54c9f.jpg" backPath="/finance/analytics" />
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center space-y-3">
              <Icon name="BarChart3" size={44} className="mx-auto text-muted-foreground" />
              <p className="font-medium">Недостаточно данных для прогноза</p>
              <p className="text-sm text-muted-foreground">Добавьте доходы, расходы и кредиты для построения прогноза</p>
              <Button onClick={() => navigate('/finance')}>К финансам</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { avgFree, worstMonth, finalRemaining, gapMonths } = insights;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
      <SectionHero
        title="Прогноз денежного потока"
        subtitle="24-месячная проекция доходов, расходов и долгов"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/93aa5f51-a753-462f-bb64-e7bd50d54c9f.jpg"
        backPath="/finance/analytics"
        rightAction={
          <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={fetchData}>
            <Icon name="RefreshCw" size={14} /> Обновить
          </Button>
        }
      />

      <FinanceCashflowInstructions />

      {/* === 1. TOP SUMMARY === */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard
          icon="TrendingUp"
          label="Свободные (ср.)"
          value={fm(avgFree)}
          color={avgFree >= 0 ? '#22c55e' : '#ef4444'}
          sub="в месяц"
        />
        <SummaryCard
          icon={worstMonth && worstMonth.free_money < 0 ? 'AlertTriangle' : 'ArrowDown'}
          label="Мин. остаток"
          value={fm(worstMonth?.free_money || 0)}
          color={worstMonth && worstMonth.free_money < 0 ? '#ef4444' : '#f59e0b'}
          sub={worstMonth ? getMonthShort(worstMonth.month) : ''}
        />
        <SummaryCard
          icon="Landmark"
          label="Долг (мес. 24)"
          value={fm(finalRemaining)}
          color={finalRemaining <= 0 ? '#22c55e' : '#6366f1'}
          sub={finalRemaining <= 0 ? 'Закрыт!' : 'остаток'}
        />
      </div>

      {/* === RISK ALERTS === */}
      {gapMonths.length > 0 && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
          <Icon name="AlertOctagon" size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              Кассовый разрыв прогнозируется!
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              В {gapMonths.length === 1 ? 'месяце' : 'месяцах'}{' '}
              {gapMonths.map(m => getMonthShort(m)).join(', ')}{' '}
              расходы превысят доходы. Накопите резерв заранее или сократите расходы.
            </p>
          </div>
        </div>
      )}

      {insights.closedEvents.length > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 flex items-start gap-3">
          <Icon name="PartyPopper" size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              {insights.closedEvents.length === 1 ? 'Кредит закроется' : `${insights.closedEvents.length} кредита закроются`} в прогнозном периоде!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {insights.closedEvents.map(e =>
                `${getMonthShort(e.month)}: ${e.prevDebts} \u2192 ${e.newDebts} долгов`
              ).join(' | ')}
            </p>
          </div>
        </div>
      )}

      {insights.freeDrop && !gapMonths.length && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-3">
          <Icon name="TrendingDown" size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Свободные средства заметно снижаются в {getMonthShort(insights.freeDrop.month)} (на {fm(insights.freeDrop.drop)}). Проверьте запланированные расходы.
          </p>
        </div>
      )}

      {/* === 2. MAIN CHART === */}
      <Tabs defaultValue="cashflow" className="space-y-3">
        <TabsList className="w-full grid grid-cols-3 h-9">
          <TabsTrigger value="cashflow" className="text-xs">Кэш-флоу</TabsTrigger>
          <TabsTrigger value="burndown" className="text-xs">Долг</TabsTrigger>
          <TabsTrigger value="table" className="text-xs">Таблица</TabsTrigger>
        </TabsList>

        {/* --- Cash Flow Chart --- */}
        <TabsContent value="cashflow">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-bold">Доходы, расходы и свободные средства</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="gDebt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtAxis} />
                    <Tooltip content={<CfTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                    <Bar dataKey="expenses" stackId="spend" fill="url(#gExp)" name="Расходы" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="debt_payments" stackId="spend" fill="url(#gDebt)" name="Кредиты" radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} name="Доходы" />
                    <Line type="monotone" dataKey="free_money" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Свободные" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Burndown Chart --- */}
        <TabsContent value="burndown">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-bold">Остаток долга</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={burndownData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gBurn" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtAxis} />
                    <Tooltip formatter={(v: number) => fm(v)} />
                    <Area type="monotone" dataKey="remaining" stroke="#8b5cf6" fill="url(#gBurn)" strokeWidth={2} name="Остаток долга" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Closed events markers */}
              {insights.closedEvents.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {insights.closedEvents.map((e, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-green-600 border-green-300 gap-1">
                      <Icon name="Check" size={10} /> {getMonthShort(e.month)}: {e.prevDebts}&rarr;{e.newDebts}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Table --- */}
        <TabsContent value="table">
          <Card className="border-0 shadow-md">
            <CardContent className="p-2">
              <div className="max-h-[420px] overflow-auto rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Месяц</th>
                      <th className="text-right py-2 px-1 font-semibold">Доходы</th>
                      <th className="text-right py-2 px-1 font-semibold">Расходы</th>
                      <th className="text-right py-2 px-1 font-semibold">Кредиты</th>
                      <th className="text-right py-2 px-1 font-semibold">Свободные</th>
                      <th className="text-right py-2 px-2 font-semibold">Долг</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflow.map(c => {
                      const isGap = c.free_money < 0;
                      const closedEvt = insights.closedEvents.find(e => e.month === c.month);
                      return (
                        <tr key={c.month} className={`border-b border-dashed last:border-0 ${isGap ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{getMonthShort(c.month)}</span>
                              {closedEvt && <Icon name="PartyPopper" size={11} className="text-green-500" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{c.active_debts} долг.</span>
                          </td>
                          <td className="text-right py-2 px-1 text-green-600">{formatMoney(c.income)}</td>
                          <td className="text-right py-2 px-1">{formatMoney(c.expenses)}</td>
                          <td className="text-right py-2 px-1 text-orange-600">{formatMoney(c.debt_payments)}</td>
                          <td className={`text-right py-2 px-1 font-semibold ${isGap ? 'text-red-600' : 'text-green-600'}`}>
                            {formatMoney(c.free_money)}
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">{formatMoney(c.total_remaining)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === 6. INSIGHTS === */}
      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="Brain" size={18} className="text-indigo-500" /> Ключевые выводы
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <InsightRow
            icon="Calendar"
            color="#22c55e"
            label="Первый кредит закроется"
            value={insights.firstDebtClosed != null ? getMonthName(insights.firstDebtClosed) : 'Более 24 мес.'}
          />
          <InsightRow
            icon="Flag"
            color={insights.allDebtsFree != null ? '#22c55e' : '#6366f1'}
            label="Все долги закрыты"
            value={
              insights.allDebtsFree === 0
                ? 'Уже свободны!'
                : insights.allDebtsFree != null
                  ? getMonthName(insights.allDebtsFree)
                  : 'Более 24 мес.'
            }
          />
          <InsightRow
            icon="Wallet"
            color={avgFree >= 0 ? '#22c55e' : '#ef4444'}
            label="Средний свободный остаток"
            value={fm(avgFree) + '/мес'}
          />
          <InsightRow
            icon="Banknote"
            color="#f59e0b"
            label="Переплата за 24 мес."
            value={fm(Math.max(0, insights.totalOverpay))}
          />
          <InsightRow
            icon="TrendingDown"
            color="#8b5cf6"
            label="Долг уменьшится на"
            value={fm(insights.debtDecrease)}
          />
        </div>
      </section>

      {/* === NAV === */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/analytics')}>
          <Icon name="BarChart3" size={20} className="text-indigo-500" />
          <span className="text-xs">Аналитика</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/strategy')}>
          <Icon name="Swords" size={20} className="text-blue-500" />
          <span className="text-xs">Стратегии</span>
        </Button>
      </div>
      </div>
    </div>
  );
}

// ===========================
// SUB-COMPONENTS
// ===========================

function SummaryCard({ icon, label, value, color, sub }: {
  icon: string; label: string; value: string; color: string; sub: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-3 flex flex-col items-center text-center gap-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon name={icon} size={16} style={{ color }} />
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function InsightRow({ icon, color, label, value }: {
  icon: string; color: string; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

// Custom tooltip for ComposedChart
function CfTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 border rounded-lg shadow-lg p-3 text-xs space-y-1 max-w-48">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-medium">{fm(p.value)}</span>
        </div>
      ))}
    </div>
  );
}