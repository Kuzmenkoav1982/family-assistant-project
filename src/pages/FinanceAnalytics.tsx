import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

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

// --- Types ---

interface Summary {
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

interface Health {
  score: number;
  status: string;
  label: string;
}

interface StrategyResult {
  strategy: string;
  total_months: number;
  total_paid: number;
  total_interest: number;
  interest_saved: number;
  months_saved: number;
  closed_order: { name: string; month: number; id: string }[];
  timeline: { month: number; total_remaining: number; active_debts: number; closed_total: number }[];
}

interface Recommendation {
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

interface MissingData {
  type: string;
  icon: string;
  text: string;
}

interface CashflowItem {
  month: number;
  income: number;
  expenses: number;
  debt_payments: number;
  free_money: number;
  active_debts: number;
  total_remaining: number;
}

interface HistoryItem {
  month: string;
  income: number;
  expense: number;
}

interface BudgetItem {
  category: string;
  planned: number;
  spent: number;
}

interface GoalItem {
  name: string;
  target: number;
  current: number;
}

interface DebtDetail {
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

interface AnalysisData {
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

// --- Health Gauge ---

function HealthGauge({ score, label, status }: Health) {
  const clr = status === 'good' ? '#22c55e' : status === 'warning' ? '#eab308' : '#ef4444';
  const bg = status === 'good' ? 'from-green-500/20 to-emerald-500/10' : status === 'warning' ? 'from-yellow-500/20 to-amber-500/10' : 'from-red-500/20 to-rose-500/10';
  const pct = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference * 0.75;

  return (
    <Card className={`bg-gradient-to-br ${bg} border-0 shadow-lg`}>
      <CardContent className="flex flex-col items-center py-6 gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Финансовое здоровье</p>
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={clr} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: clr }}>{score}</span>
            <span className="text-[10px] text-muted-foreground">из 100</span>
          </div>
        </div>
        <Badge variant="outline" className="text-sm font-medium" style={{ borderColor: clr, color: clr }}>{label}</Badge>
      </CardContent>
    </Card>
  );
}

// --- Metric Card ---

function MetricCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: (color || '#6366f1') + '18' }}>
          <Icon name={icon} size={20} style={{ color: color || '#6366f1' }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-bold truncate" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Recommendation Card ---

function RecCard({ r, onAction }: { r: Recommendation; onAction?: (r: Recommendation) => void }) {
  const cfg: Record<string, { bg: string; border: string; icon_clr: string }> = {
    critical: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', icon_clr: '#ef4444' },
    high: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900', icon_clr: '#f97316' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900', icon_clr: '#eab308' },
    low: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', icon_clr: '#3b82f6' },
  };
  const c = cfg[r.priority] || cfg.low;

  return (
    <div className={`rounded-xl p-4 ${c.bg} border ${c.border} space-y-2`}>
      <div className="flex items-start gap-3">
        <Icon name={r.icon || 'Info'} size={20} style={{ color: c.icon_clr }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{r.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
        </div>
      </div>
      {r.action === 'extra_payment' && r.interest_saved && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-green-600">
            Экономия: {fm(r.interest_saved)}
          </span>
          {onAction && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAction(r)}>Подробнее</Button>}
        </div>
      )}
    </div>
  );
}

// --- Missing data card ---

const MISSING_LINKS: Record<string, string> = {
  budgets: '/finance/budget',
  recurring_income: '/finance/recurring',
  recurring_expense: '/finance/recurring',
  goals: '/finance/goals',
  accounts: '/finance/accounts',
  essential_expenses: '/finance/budget',
};

// --- Quick Q buttons ---
const QUICK_QUESTIONS = [
  'Как быстрее закрыть все долги?',
  'Где можно сэкономить?',
  'Как создать подушку безопасности?',
  'Оцени мою финансовую ситуацию',
];

// ===========================
// MAIN COMPONENT
// ===========================

export default function FinanceAnalytics() {
  const navigate = useNavigate();
  useIsFamilyOwner();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI
  const [aiQ, setAiQ] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const aiRef = useRef<HTMLDivElement>(null);

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
      toast.error('Не удалось загрузить аналитику');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const askAI = useCallback(async (question: string) => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action: 'ai_advice', question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка');
      setAiResponse(json.advice || 'Нет ответа');
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка ИИ');
    } finally {
      setAiLoading(false);
    }
  }, []);

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <SectionHero title="Финансовая аналитика" subtitle="Загрузка данных..." imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed32438d-48c6-4c91-a57e-42f73472a180.jpg" backPath="/finance" />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Анализируем финансы...</p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !data) {
    return (
      <div className="space-y-4 pb-24">
        <SectionHero title="Финансовая аналитика" subtitle="Ошибка загрузки" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed32438d-48c6-4c91-a57e-42f73472a180.jpg" backPath="/finance" />
        <Card className="border-destructive">
          <CardContent className="py-10 text-center space-y-3">
            <Icon name="AlertTriangle" size={40} className="mx-auto text-destructive" />
            <p className="font-medium">{error || 'Не удалось загрузить данные'}</p>
            <Button onClick={fetchData}>Повторить</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary: s, health, strategies, cashflow, recommendations, missing_data, debts_detail, history, budgets, goals } = data;

  // Prep chart data
  const historyChart = history.map(h => ({ name: h.month.slice(5), income: h.income, expense: h.expense }));
  const cashflowChart = cashflow.filter((_, i) => i < 12).map(c => ({
    name: `${c.month} мес`,
    free: c.free_money,
    debt: c.debt_payments,
    remaining: c.total_remaining,
  }));

  const incomeBreakdown = [
    { name: 'Жизнь', value: s.month_expenses, fill: '#f59e0b' },
    { name: 'Кредиты', value: s.debt_payments, fill: '#ef4444' },
    { name: 'Свободные', value: Math.max(0, s.free_money), fill: '#22c55e' },
  ].filter(x => x.value > 0);

  return (
    <div className="space-y-5 pb-24">
      <SectionHero
        title="Финансовая аналитика"
        subtitle="Полный анализ вашей финансовой ситуации"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed32438d-48c6-4c91-a57e-42f73472a180.jpg"
        backPath="/finance"
        rightAction={
          <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={fetchData}>
            <Icon name="RefreshCw" size={14} /> Обновить
          </Button>
        }
      />

      {/* === HEALTH GAUGE === */}
      <HealthGauge {...health} />

      {/* === KEY METRICS === */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="Wallet" label="Свободные средства"
          value={fm(s.free_money)}
          color={s.free_money >= 0 ? '#22c55e' : '#ef4444'}
          sub="в месяц"
        />
        <MetricCard
          icon="Percent" label="Долговая нагрузка"
          value={`${s.dti.toFixed(1)}%`}
          color={s.dti > 40 ? '#ef4444' : s.dti > 30 ? '#f59e0b' : '#22c55e'}
          sub="DTI"
        />
        <MetricCard
          icon="Shield" label="Подушка безопасности"
          value={`${s.emergency_months.toFixed(1)} мес`}
          color={s.emergency_months >= 3 ? '#22c55e' : s.emergency_months >= 1 ? '#f59e0b' : '#ef4444'}
          sub={s.emergency_months >= 6 ? 'Отлично' : s.emergency_months >= 3 ? 'Нормально' : 'Мало'}
        />
        <MetricCard
          icon="TrendingUp" label="Чистая стоимость"
          value={fm(s.net_worth)}
          color={s.net_worth >= 0 ? '#3b82f6' : '#ef4444'}
          sub="net worth"
        />
      </div>

      {/* === RECOMMENDATIONS === */}
      {recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="Lightbulb" size={18} className="text-amber-500" /> Рекомендации
          </h2>
          {recommendations.map((r, i) => (
            <RecCard key={i} r={r} onAction={(rec) => {
              if (rec.debt_id) navigate('/finance/debts');
            }} />
          ))}
        </section>
      )}

      {/* === MISSING DATA === */}
      {missing_data.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Icon name="Info" size={15} /> Для точности анализа добавьте
          </h2>
          {missing_data.map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors" onClick={() => navigate(MISSING_LINKS[m.type] || '/finance')}>
              <Icon name={m.icon || 'Plus'} size={18} className="text-amber-600 shrink-0" />
              <p className="text-xs flex-1">{m.text}</p>
              <Icon name="ChevronRight" size={16} className="text-amber-400" />
            </div>
          ))}
        </section>
      )}

      {/* === TABS: Details === */}
      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="overview" className="text-xs">Обзор</TabsTrigger>
          <TabsTrigger value="debts" className="text-xs">Долги</TabsTrigger>
          <TabsTrigger value="cashflow" className="text-xs">Прогноз</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">Бюджет</TabsTrigger>
        </TabsList>

        {/* --- Overview Tab --- */}
        <TabsContent value="overview" className="space-y-4">
          {/* Income breakdown pie */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Структура дохода</h3>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={incomeBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} strokeWidth={0}>
                        {incomeBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1 text-xs">
                  <Row label="Доход" value={fm(s.month_income)} color="#3b82f6" />
                  <Row label="Расходы" value={fm(s.month_expenses)} color="#f59e0b" />
                  <Row label="Кредиты" value={fm(s.debt_payments)} color="#ef4444" />
                  <Row label="Свободные" value={fm(s.free_money)} color="#22c55e" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6-month history */}
          {historyChart.length > 1 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold">Доходы и расходы за 6 месяцев</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyChart} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                      <defs>
                        <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                      <Tooltip formatter={(v: number) => fm(v)} />
                      <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#gIncome)" strokeWidth={2} name="Доходы" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} name="Расходы" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals quick view */}
          {goals.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Цели</h3>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate('/finance/goals')}>Все <Icon name="ChevronRight" size={14} /></Button>
                </div>
                {goals.slice(0, 3).map((g, i) => {
                  const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-muted-foreground">{fm(g.current)} / {fm(g.target)}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Freedom date */}
          {s.freedom_date && (
            <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Icon name="CalendarCheck" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Дата финансовой свободы</p>
                  <p className="font-bold text-green-700 dark:text-green-400">{formatFreedomDate(s.freedom_date)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- Debts Tab --- */}
        <TabsContent value="debts" className="space-y-4">
          {debts_detail.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-10 text-center">
                <Icon name="PartyPopper" size={36} className="mx-auto text-green-500 mb-2" />
                <p className="font-medium">Нет активных долгов!</p>
                <p className="text-xs text-muted-foreground mt-1">Вы финансово свободны</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Strategy summary */}
              {strategies.recommended && (
                <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Zap" size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-bold">Лучшая стратегия: {strategies.recommended === 'avalanche' ? 'Лавина' : 'Снежный ком'}</h3>
                    </div>
                    {(() => {
                      const st = strategies.recommended === 'avalanche' ? strategies.avalanche : strategies.snowball;
                      if (!st) return null;
                      return (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold text-indigo-600">{st.total_months}</p>
                            <p className="text-[10px] text-muted-foreground">мес. до свободы</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{fm(st.interest_saved)}</p>
                            <p className="text-[10px] text-muted-foreground">экономия</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-amber-600">{st.months_saved}</p>
                            <p className="text-[10px] text-muted-foreground">мес. сэкономлено</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Debt cards */}
              <div className="space-y-2">
                {debts_detail.map(d => {
                  const paidPct = d.original_amount > 0 ? ((d.original_amount - d.remaining) / d.original_amount) * 100 : 0;
                  return (
                    <Card key={d.id} className="border-0 shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon name="Receipt" size={16} className="text-red-500" />
                            <span className="font-semibold text-sm">{d.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{d.rate}%</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Остаток: {fm(d.remaining)}</span>
                          <span>Платёж: {fm(d.payment)}/мес</span>
                        </div>
                        <Progress value={paidPct} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground text-right">Погашено {paidPct.toFixed(0)}%</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Payoff timeline chart */}
              {strategies.avalanche?.timeline && strategies.avalanche.timeline.length > 1 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-bold">График погашения (Лавина)</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={strategies.avalanche.timeline} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                          <defs>
                            <linearGradient id="gDebt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: 'мес', position: 'insideBottomRight', fontSize: 10, offset: -5 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                          <Tooltip formatter={(v: number) => fm(v)} />
                          <Area type="monotone" dataKey="total_remaining" stroke="#ef4444" fill="url(#gDebt)" strokeWidth={2} name="Остаток долга" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Closed order */}
              {strategies.avalanche?.closed_order && strategies.avalanche.closed_order.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-bold">Порядок закрытия долгов</h3>
                    {strategies.avalanche.closed_order.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[10px] font-bold text-green-700">{i + 1}</div>
                        <span className="flex-1 font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{c.month} мес</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* --- Cashflow Tab --- */}
        <TabsContent value="cashflow" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Свободные средства (12 мес)</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowChart} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                    <Tooltip formatter={(v: number) => fm(v)} />
                    <Bar dataKey="free" fill="#22c55e" radius={[4, 4, 0, 0]} name="Свободные" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Остаток долга (12 мес)</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowChart} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gRemaining" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                    <Tooltip formatter={(v: number) => fm(v)} />
                    <Area type="monotone" dataKey="remaining" stroke="#8b5cf6" fill="url(#gRemaining)" strokeWidth={2} name="Остаток долга" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly projection table */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-bold">Помесячный прогноз</h3>
              <div className="max-h-60 overflow-y-auto text-xs">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-1 font-medium">Мес</th>
                      <th className="text-right py-1 font-medium">Кредиты</th>
                      <th className="text-right py-1 font-medium">Свободные</th>
                      <th className="text-right py-1 font-medium">Остаток</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflow.filter((_, i) => i < 24).map(c => (
                      <tr key={c.month} className="border-b border-dashed last:border-0">
                        <td className="py-1.5">{c.month}</td>
                        <td className="text-right text-red-600">{formatMoney(c.debt_payments)}</td>
                        <td className="text-right text-green-600">{formatMoney(c.free_money)}</td>
                        <td className="text-right">{formatMoney(c.total_remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Budget Tab --- */}
        <TabsContent value="budget" className="space-y-4">
          {budgets.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-10 text-center space-y-2">
                <Icon name="PieChart" size={36} className="mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Бюджеты не заданы</p>
                <Button size="sm" onClick={() => navigate('/finance/budget')}>Настроить бюджет</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-bold">Лимиты по категориям</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgets.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={70} />
                        <Tooltip formatter={(v: number) => fm(v)} />
                        <Bar dataKey="planned" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Лимит" opacity={0.3} />
                        <Bar dataKey="spent" fill="#ef4444" radius={[0, 4, 4, 0]} name="Потрачено" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {budgets.map((b, i) => {
                const pct = b.planned > 0 ? Math.min(100, (b.spent / b.planned) * 100) : 0;
                const over = b.spent > b.planned;
                return (
                  <div key={i} className="space-y-1 px-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{b.category}</span>
                      <span className={over ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                        {formatMoney(b.spent)} / {formatMoney(b.planned)} {'\u20BD'}
                      </span>
                    </div>
                    <Progress value={pct} className={`h-2 ${over ? '[&>div]:bg-red-500' : ''}`} />
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* === AI ADVISOR === */}
      <div ref={aiRef}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="Bot" size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">ИИ Финансовый советник</h3>
                <p className="text-[10px] text-muted-foreground">Задайте вопрос о ваших финансах</p>
              </div>
            </div>

            {/* Quick questions */}
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <Button key={i} size="sm" variant="outline" className="h-7 text-[11px] rounded-full" disabled={aiLoading} onClick={() => { setAiQ(q); askAI(q); }}>
                  {q}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ваш вопрос..."
                value={aiQ}
                onChange={e => setAiQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askAI(aiQ)}
                className="text-sm h-9"
                disabled={aiLoading}
              />
              <Button size="sm" className="h-9 px-4" disabled={aiLoading || !aiQ.trim()} onClick={() => askAI(aiQ)}>
                {aiLoading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
              </Button>
            </div>

            {/* Response */}
            {aiLoading && (
              <div className="flex items-center gap-2 py-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-muted-foreground ml-2">Анализирую...</span>
              </div>
            )}
            {aiResponse && !aiLoading && (
              <div className="rounded-xl bg-background/80 p-4 text-sm whitespace-pre-wrap leading-relaxed border animate-in fade-in slide-in-from-bottom-2 duration-300">
                {aiResponse}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === NAV LINKS === */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/debts')}>
          <Icon name="Receipt" size={20} className="text-red-500" />
          <span className="text-xs">Кредиты и долги</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/recurring')}>
          <Icon name="RefreshCw" size={20} className="text-blue-500" />
          <span className="text-xs">Регулярные</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/accounts')}>
          <Icon name="CreditCard" size={20} className="text-indigo-500" />
          <span className="text-xs">Счета</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/goals')}>
          <Icon name="Target" size={20} className="text-amber-500" />
          <span className="text-xs">Цели</span>
        </Button>
      </div>
    </div>
  );
}

// --- Helper components ---

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-muted-foreground flex-1">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function formatFreedomDate(d: string): string {
  try {
    const [y, m] = d.split('-');
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${months[parseInt(m) - 1]} ${y}`;
  } catch {
    return d;
  }
}