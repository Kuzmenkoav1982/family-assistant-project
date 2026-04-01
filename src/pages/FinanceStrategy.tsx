import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

// ===========================
// CONSTANTS & HELPERS
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

const DEBT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  mortgage: { label: 'Ипотека', icon: 'Home', color: '#3B82F6' },
  credit: { label: 'Кредит', icon: 'Banknote', color: '#EF4444' },
  credit_card: { label: 'Кредитная карта', icon: 'CreditCard', color: '#F97316' },
  car_loan: { label: 'Автокредит', icon: 'Car', color: '#F59E0B' },
  personal: { label: 'Личный долг', icon: 'Users', color: '#8B5CF6' },
  microloan: { label: 'Микрозайм', icon: 'Zap', color: '#EC4899' },
  installment: { label: 'Рассрочка', icon: 'ShoppingBag', color: '#14B8A6' },
};

function getDebtMeta(type: string) {
  return DEBT_TYPES[type] || { label: 'Долг', icon: 'Receipt', color: '#6B7280' };
}

// ===========================
// TYPES
// ===========================

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

// ===========================
// SIMULATION ENGINE
// ===========================

interface SimResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
}

function simulatePayoff(remaining: number, rate: number, monthlyPayment: number, extraPayment: number): SimResult {
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
  return {
    months,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(remaining + totalInterest),
  };
}

function simulateTimeline(remaining: number, rate: number, monthlyPayment: number, extraPayment: number): { month: number; balance: number }[] {
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

// ===========================
// SUB-COMPONENTS
// ===========================

function StrategyCard({
  strategy, label, description, icon, theme, isRecommended, isWinner,
}: {
  strategy: StrategyResult | null;
  label: string;
  description: string;
  icon: string;
  theme: 'blue' | 'purple';
  isRecommended: boolean;
  isWinner: boolean;
}) {
  if (!strategy) {
    return (
      <Card className="border-0 shadow-md opacity-50">
        <CardContent className="p-4 text-center text-sm text-muted-foreground py-8">
          Недостаточно данных
        </CardContent>
      </Card>
    );
  }

  const colors = theme === 'blue'
    ? { bg: 'from-blue-500/10 to-indigo-500/5', accent: '#3b82f6', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }
    : { bg: 'from-purple-500/10 to-violet-500/5', accent: '#8b5cf6', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };

  return (
    <Card className={`border-0 shadow-md bg-gradient-to-br ${colors.bg} relative overflow-hidden ${isWinner ? 'ring-2 ring-amber-400' : ''}`}>
      {isRecommended && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 gap-1">
            <Icon name="Star" size={10} /> Лучшая
          </Badge>
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.accent + '20' }}>
            <Icon name={icon} size={16} style={{ color: colors.accent }} />
          </div>
          <div>
            <h3 className="text-sm font-bold">{label}</h3>
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-lg font-bold" style={{ color: colors.accent }}>{strategy.total_months}</p>
            <p className="text-[10px] text-muted-foreground">месяцев</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-lg font-bold text-green-600">{fm(strategy.interest_saved)}</p>
            <p className="text-[10px] text-muted-foreground">экономия</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-sm font-semibold">{fm(strategy.total_interest)}</p>
            <p className="text-[10px] text-muted-foreground">проценты</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-sm font-semibold text-amber-600">{strategy.months_saved} мес</p>
            <p className="text-[10px] text-muted-foreground">сэкономлено</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DebtRow({ debt, priority, isTarget }: { debt: DebtDetail; priority: number; isTarget: boolean }) {
  const meta = getDebtMeta(debt.debt_type);
  const paidPct = debt.original_amount > 0
    ? ((debt.original_amount - debt.remaining) / debt.original_amount) * 100
    : 0;

  return (
    <div className={`rounded-xl p-3 space-y-2 transition-colors ${isTarget ? 'bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-300' : 'bg-muted/30'}`}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: isTarget ? '#f59e0b22' : meta.color + '18', color: isTarget ? '#d97706' : meta.color }}>
          {priority}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">{debt.name}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0" style={{ borderColor: meta.color, color: meta.color }}>
              {meta.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{fm(debt.remaining)}</span>
            <span>{debt.rate}%</span>
            <span>{fm(debt.payment)}/мес</span>
          </div>
        </div>
        {isTarget && <Icon name="Target" size={16} className="text-amber-500 shrink-0" />}
      </div>
      <Progress value={paidPct} className="h-1.5" />
      <p className="text-[10px] text-muted-foreground text-right">Погашено {paidPct.toFixed(0)}%</p>
    </div>
  );
}

function ClosedOrderTimeline({ items }: { items: { name: string; month: number; id: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-start gap-3 relative">
          {/* Vertical line */}
          {i < items.length - 1 && (
            <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-green-200 dark:bg-green-800" />
          )}
          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0 z-10">
            <Icon name="Check" size={14} className="text-green-600" />
          </div>
          <div className="pb-4 flex-1">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">Закрыт на {item.month}-м месяце</p>
          </div>
          <Badge variant="outline" className="text-[10px] mt-0.5 text-green-600 border-green-300">
            {item.month} мес
          </Badge>
        </div>
      ))}
      {/* Final celebration */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <Icon name="Trophy" size={14} className="text-amber-600" />
        </div>
        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Финансовая свобода!</p>
      </div>
    </div>
  );
}

// ===========================
// MAIN COMPONENT
// ===========================

export default function FinanceStrategy() {
  const navigate = useNavigate();
  useIsFamilyOwner();

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulator state
  const [simDebtId, setSimDebtId] = useState('');
  const [simExtra, setSimExtra] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState<'avalanche' | 'snowball'>('avalanche');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}?section=financial_analysis`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
      setData(json);
      // Default simulator to highest-rate debt
      if (json.debts_detail?.length) {
        const sorted = [...json.debts_detail].sort((a: DebtDetail, b: DebtDetail) => b.rate - a.rate);
        setSimDebtId(sorted[0].id);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
      toast.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived
  const debts = data?.debts_detail || [];
  const strategies = data?.strategies;
  const summary = data?.summary;
  const recommended = strategies?.recommended || 'avalanche';
  const activeStrategy = recommended === 'snowball' ? strategies?.snowball : strategies?.avalanche;

  // Sort debts by active strategy order
  const sortedDebts = useMemo(() => {
    if (!activeStrategy?.closed_order || !debts.length) return debts;
    const orderMap = new Map(activeStrategy.closed_order.map((c, i) => [c.id, i]));
    return [...debts].sort((a, b) => {
      const ia = orderMap.get(a.id) ?? 999;
      const ib = orderMap.get(b.id) ?? 999;
      return ia - ib;
    });
  }, [debts, activeStrategy]);

  // First target debt in strategy
  const targetDebtId = activeStrategy?.closed_order?.[0]?.id || '';

  // Simulator calculations
  const simDebt = debts.find(d => d.id === simDebtId);
  const simMaxExtra = Math.max(0, Math.round(summary?.free_money || 0));

  const simWithout = useMemo(() => {
    if (!simDebt) return null;
    return simulatePayoff(simDebt.remaining, simDebt.rate, simDebt.payment, 0);
  }, [simDebt]);

  const simWith = useMemo(() => {
    if (!simDebt || simExtra <= 0) return null;
    return simulatePayoff(simDebt.remaining, simDebt.rate, simDebt.payment, simExtra);
  }, [simDebt, simExtra]);

  const simChartData = useMemo(() => {
    if (!simDebt) return [];
    const without = simulateTimeline(simDebt.remaining, simDebt.rate, simDebt.payment, 0);
    const withExtra = simExtra > 0 ? simulateTimeline(simDebt.remaining, simDebt.rate, simDebt.payment, simExtra) : [];
    const maxMonth = Math.max(
      without.length ? without[without.length - 1].month : 0,
      withExtra.length ? withExtra[withExtra.length - 1].month : 0
    );
    const result: { month: number; without: number; withExtra: number | null }[] = [];
    const wMap = new Map(without.map(p => [p.month, p.balance]));
    const eMap = new Map(withExtra.map(p => [p.month, p.balance]));
    for (let m = 0; m <= maxMonth; m++) {
      const hasW = wMap.has(m);
      const hasE = eMap.has(m);
      if (hasW || hasE) {
        result.push({
          month: m,
          without: wMap.get(m) ?? 0,
          withExtra: simExtra > 0 ? (eMap.get(m) ?? 0) : null,
        });
      }
    }
    return result;
  }, [simDebt, simExtra]);

  // Quick scenario amounts
  const incomeScenarios = useMemo(() => {
    const income = summary?.month_income || 0;
    return [
      { label: '10% дохода', amount: Math.round(income * 0.1) },
      { label: '25% дохода', amount: Math.round(income * 0.25) },
      { label: '50% дохода', amount: Math.round(income * 0.5) },
    ];
  }, [summary]);

  // Total debt progress
  const totalOriginal = debts.reduce((s, d) => s + d.original_amount, 0);
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const totalPaidPct = totalOriginal > 0 ? ((totalOriginal - totalRemaining) / totalOriginal) * 100 : 0;
  const closedDebtsCount = activeStrategy?.closed_order
    ? debts.filter(d => d.remaining <= 0.01).length
    : 0;

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <SectionHero title="Стратегии погашения" subtitle="Загрузка..." imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80" backPath="/finance/analytics" />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Рассчитываем стратегии...</p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !data) {
    return (
      <div className="space-y-4 pb-24">
        <SectionHero title="Стратегии погашения" subtitle="Ошибка" imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80" backPath="/finance/analytics" />
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

  // --- No debts ---
  if (!debts.length) {
    return (
      <div className="space-y-4 pb-24">
        <SectionHero title="Стратегии погашения" subtitle="Нет активных долгов" imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80" backPath="/finance/analytics" />
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center space-y-3">
            <Icon name="PartyPopper" size={48} className="mx-auto text-green-500" />
            <h2 className="text-xl font-bold">Поздравляем!</h2>
            <p className="text-sm text-muted-foreground">У вас нет активных долгов. Стратегии не требуются.</p>
            <Button onClick={() => navigate('/finance/analytics')}>К аналитике</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <SectionHero
        title="Стратегии погашения"
        subtitle="Сравнение стратегий и симулятор досрочных платежей"
        imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
        backPath="/finance/analytics"
        rightAction={
          <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={() => navigate('/finance/analytics')}>
            <Icon name="BarChart3" size={14} /> Аналитика
          </Button>
        }
      />

      {/* === 1. STRATEGY COMPARISON === */}
      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="Swords" size={18} className="text-indigo-500" /> Сравнение стратегий
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StrategyCard
            strategy={strategies?.avalanche || null}
            label="Лавина"
            description="Сначала самые дорогие по ставке"
            icon="TrendingDown"
            theme="blue"
            isRecommended={recommended === 'avalanche'}
            isWinner={recommended === 'avalanche'}
          />
          <StrategyCard
            strategy={strategies?.snowball || null}
            label="Снежный ком"
            description="Сначала самые маленькие долги"
            icon="Snowflake"
            theme="purple"
            isRecommended={recommended === 'snowball'}
            isWinner={recommended === 'snowball'}
          />
        </div>
        {strategies?.avalanche && strategies?.snowball && (
          <p className="text-xs text-muted-foreground text-center">
            {recommended === 'avalanche'
              ? 'Лавина экономит больше на процентах - рекомендуем'
              : 'Снежный ком даёт быстрые победы - мотивация выше'}
          </p>
        )}
      </section>

      {/* === 2. DEBT PRIORITY TABLE === */}
      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="ListOrdered" size={18} className="text-red-500" /> Приоритет погашения
        </h2>
        <div className="space-y-2">
          {sortedDebts.map((d, i) => (
            <DebtRow key={d.id} debt={d} priority={i + 1} isTarget={d.id === targetDebtId} />
          ))}
        </div>
      </section>

      {/* === 3. PAYOFF TIMELINE === */}
      {(strategies?.avalanche?.timeline || strategies?.snowball?.timeline) && (
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="LineChart" size={18} className="text-blue-500" /> График погашения
          </h2>
          <Tabs value={activeTimeline} onValueChange={v => setActiveTimeline(v as 'avalanche' | 'snowball')}>
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="avalanche" className="text-xs" disabled={!strategies?.avalanche}>Лавина</TabsTrigger>
              <TabsTrigger value="snowball" className="text-xs" disabled={!strategies?.snowball}>Снежный ком</TabsTrigger>
            </TabsList>
            {(['avalanche', 'snowball'] as const).map(key => {
              const st = strategies?.[key];
              if (!st?.timeline?.length) return <TabsContent key={key} value={key} />;
              return (
                <TabsContent key={key} value={key}>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={st.timeline} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                            <defs>
                              <linearGradient id={`g_${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={key === 'avalanche' ? '#3b82f6' : '#8b5cf6'} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={key === 'avalanche' ? '#3b82f6' : '#8b5cf6'} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                            <Tooltip formatter={(v: number) => fm(v)} labelFormatter={(l) => `${l} мес`} />
                            <Area
                              type="monotone" dataKey="total_remaining"
                              stroke={key === 'avalanche' ? '#3b82f6' : '#8b5cf6'}
                              fill={`url(#g_${key})`} strokeWidth={2}
                              name="Остаток долга"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      )}

      {/* === 4. DEBT CLOSURE ORDER === */}
      {activeStrategy?.closed_order && activeStrategy.closed_order.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="Route" size={18} className="text-green-500" /> Порядок закрытия
          </h2>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <ClosedOrderTimeline items={activeStrategy.closed_order} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* === 5. INTERACTIVE SIMULATOR === */}
      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="FlaskConical" size={18} className="text-amber-500" /> Симулятор: Что если?
        </h2>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/5">
          <CardContent className="p-4 space-y-5">
            {/* Debt selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Выберите кредит для досрочного погашения</p>
              <div className="flex flex-wrap gap-2">
                {debts.filter(d => d.remaining > 0 && d.payment > 0).map(d => (
                  <Button
                    key={d.id}
                    size="sm"
                    variant={simDebtId === d.id ? 'default' : 'outline'}
                    className="h-8 text-xs"
                    onClick={() => setSimDebtId(d.id)}
                  >
                    {d.name} ({d.rate}%)
                  </Button>
                ))}
              </div>
            </div>

            {/* Extra payment slider */}
            {simDebt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Дополнительный платёж</p>
                  <span className="text-sm font-bold text-amber-600">{fm(simExtra)}/мес</span>
                </div>
                <Slider
                  value={[simExtra]}
                  onValueChange={([v]) => setSimExtra(v)}
                  min={0}
                  max={Math.max(simMaxExtra, 1000)}
                  step={Math.max(100, Math.round(simMaxExtra / 50) * 100) || 100}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 {'\u20BD'}</span>
                  <span>{fm(Math.max(simMaxExtra, 1000))}</span>
                </div>

                {/* Quick scenarios */}
                <div className="flex flex-wrap gap-2">
                  {incomeScenarios.map((sc, i) => (
                    <Button key={i} size="sm" variant="outline" className="h-7 text-[11px]"
                      onClick={() => setSimExtra(Math.min(sc.amount, Math.max(simMaxExtra, 1000)))}>
                      +{sc.label} ({fm(sc.amount)})
                    </Button>
                  ))}
                  {simExtra > 0 && (
                    <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground"
                      onClick={() => setSimExtra(0)}>
                      Сбросить
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Comparison results */}
            {simDebt && simWithout && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Without */}
                  <div className="rounded-xl bg-background/70 p-3 space-y-1 border">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Без досрочных</p>
                    <p className="text-lg font-bold">{simWithout.months} <span className="text-xs font-normal text-muted-foreground">мес</span></p>
                    <p className="text-xs text-muted-foreground">Проценты: {fm(simWithout.totalInterest)}</p>
                  </div>
                  {/* With */}
                  <div className={`rounded-xl p-3 space-y-1 border ${simWith ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-background/70'}`}>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">С досрочными</p>
                    {simWith ? (
                      <>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400">
                          {simWith.months} <span className="text-xs font-normal text-muted-foreground">мес</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Проценты: {fm(simWith.totalInterest)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground pt-1">Передвиньте ползунок</p>
                    )}
                  </div>
                </div>

                {/* Savings highlight */}
                {simWith && simWithout.months > simWith.months && (
                  <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Icon name="Sparkles" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        Экономия: {fm(simWithout.totalInterest - simWith.totalInterest)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Закроете на {simWithout.months - simWith.months} мес. раньше
                      </p>
                    </div>
                  </div>
                )}

                {/* Comparison chart */}
                {simChartData.length > 1 && (
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simChartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                        <defs>
                          <linearGradient id="gSimW" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gSimE" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                        <Tooltip formatter={(v: number) => fm(v)} labelFormatter={l => `${l} мес`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="without" stroke="#ef4444" fill="url(#gSimW)" strokeWidth={2} name="Без досрочных" strokeDasharray="5 5" />
                        {simExtra > 0 && (
                          <Area type="monotone" dataKey="withExtra" stroke="#22c55e" fill="url(#gSimE)" strokeWidth={2} name="С досрочными" />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Comparison bar */}
                {simWith && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Сравнение сроков</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-24 text-muted-foreground shrink-0">Без досрочных</span>
                        <div className="flex-1 h-5 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-medium"
                            style={{ width: '100%' }}>
                            {simWithout.months} мес
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-24 text-muted-foreground shrink-0">С досрочными</span>
                        <div className="flex-1 h-5 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-medium transition-all duration-500"
                            style={{ width: `${Math.max(5, (simWith.months / simWithout.months) * 100)}%` }}>
                            {simWith.months} мес
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* === 6. GAMIFICATION === */}
      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="Trophy" size={18} className="text-amber-500" /> Путь к свободе
        </h2>

        {/* Overall progress */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Общий прогресс</h3>
              <Badge variant="outline" className="text-xs">
                {closedDebtsCount} из {debts.length} долгов
              </Badge>
            </div>
            <Progress value={totalPaidPct} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Погашено {totalPaidPct.toFixed(1)}%</span>
              <span>Осталось {fm(totalRemaining)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Было: {fm(totalOriginal)}</span>
              <span className="font-medium text-green-600">Выплачено: {fm(totalOriginal - totalRemaining)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="grid grid-cols-2 gap-3">
          <AchievementCard
            icon="Zap"
            title="Первый шаг"
            description="Досрочный платёж по кредиту"
            unlocked={totalOriginal > totalRemaining}
          />
          <AchievementCard
            icon="Medal"
            title="Победитель"
            description="Закрыт первый долг"
            unlocked={closedDebtsCount > 0}
          />
          <AchievementCard
            icon="Shield"
            title="Стратег"
            description="Выбрана стратегия погашения"
            unlocked={!!activeStrategy}
          />
          <AchievementCard
            icon="Crown"
            title="Свобода"
            description="Все долги закрыты"
            unlocked={totalRemaining <= 0.01 && debts.length > 0}
          />
        </div>
      </section>

      {/* === NAV === */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/analytics')}>
          <Icon name="BarChart3" size={20} className="text-indigo-500" />
          <span className="text-xs">Аналитика</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/debts')}>
          <Icon name="Receipt" size={20} className="text-red-500" />
          <span className="text-xs">Кредиты</span>
        </Button>
      </div>
    </div>
  );
}

// ===========================
// ACHIEVEMENT CARD
// ===========================

function AchievementCard({ icon, title, description, unlocked }: {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}) {
  return (
    <Card className={`border-0 shadow-sm transition-all ${unlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20' : 'opacity-50 grayscale'}`}>
      <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${unlocked ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted'}`}>
          {unlocked
            ? <Icon name={icon} size={20} className="text-amber-600" />
            : <Icon name="Lock" size={16} className="text-muted-foreground" />}
        </div>
        <p className="text-xs font-bold">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}