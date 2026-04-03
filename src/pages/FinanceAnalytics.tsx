import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { FinanceAnalyticsInstructions } from '@/components/finance/FinanceInstructions';
import useFinanceAnalytics from '@/hooks/useFinanceAnalytics';
import { HealthGauge, MetricCard, RecCard } from '@/components/finance-analytics/AnalyticsWidgets';
import OverviewTab from '@/components/finance-analytics/OverviewTab';
import DebtsTab from '@/components/finance-analytics/DebtsTab';
import CashflowTab from '@/components/finance-analytics/CashflowTab';
import BudgetTab from '@/components/finance-analytics/BudgetTab';
import AIAdvisor from '@/components/finance-analytics/AIAdvisor';
import { fmCompact, MISSING_LINKS } from '@/data/financeAnalyticsTypes';

const HERO_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed32438d-48c6-4c91-a57e-42f73472a180.jpg';

export default function FinanceAnalytics() {
  const navigate = useNavigate();
  const a = useFinanceAnalytics();

  if (a.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Финансовая аналитика" subtitle="Загрузка данных..." imageUrl={HERO_IMG} backPath="/finance" />
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Анализируем финансы...</p>
          </div>
        </div>
      </div>
    );
  }

  if (a.error || !a.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Финансовая аналитика" subtitle="Ошибка загрузки" imageUrl={HERO_IMG} backPath="/finance" />
          <Card className="border-destructive">
            <CardContent className="py-10 text-center space-y-3">
              <Icon name="AlertTriangle" size={40} className="mx-auto text-destructive" />
              <p className="font-medium">{a.error || 'Не удалось загрузить данные'}</p>
              <Button onClick={a.fetchData}>Повторить</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary: s, health, strategies, cashflow, recommendations, missing_data, debts_detail, history, budgets, goals } = a.data;

  const historyChart = history.map(h => ({ name: h.month.slice(5), income: h.income, expense: h.expense }));
  const cashflowChart = cashflow.filter((_, i) => i < 12).map(c => ({
    name: `${c.month} мес`, free: c.free_money, debt: c.debt_payments, remaining: c.total_remaining,
  }));
  const incomeBreakdown = [
    { name: 'Жизнь', value: s.month_expenses, fill: '#f59e0b' },
    { name: 'Кредиты', value: s.debt_payments, fill: '#ef4444' },
    { name: 'Свободные', value: Math.max(0, s.free_money), fill: '#22c55e' },
  ].filter(x => x.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
        <SectionHero
          title="Финансовая аналитика"
          subtitle="Полный анализ вашей финансовой ситуации"
          imageUrl={HERO_IMG}
          backPath="/finance"
          rightAction={
            <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={a.fetchData}>
              <Icon name="RefreshCw" size={14} /> Обновить
            </Button>
          }
        />

        <FinanceAnalyticsInstructions />

        <HealthGauge {...health} />

        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon="Wallet" label="Свободные средства" value={fmCompact(s.free_money)} color={s.free_money >= 0 ? '#22c55e' : '#ef4444'} sub="в месяц" />
          <MetricCard icon="Percent" label="Долговая нагрузка" value={`${s.dti.toFixed(1)}%`} color={s.dti > 40 ? '#ef4444' : s.dti > 30 ? '#f59e0b' : '#22c55e'} sub="DTI" />
          <MetricCard icon="Shield" label="Подушка безопасности" value={`${s.emergency_months.toFixed(1)} мес`} color={s.emergency_months >= 3 ? '#22c55e' : s.emergency_months >= 1 ? '#f59e0b' : '#ef4444'} sub={s.emergency_months >= 6 ? 'Отлично' : s.emergency_months >= 3 ? 'Нормально' : 'Мало'} />
          <MetricCard icon="TrendingUp" label="Чистая стоимость" value={fmCompact(s.net_worth)} color={s.net_worth >= 0 ? '#3b82f6' : '#ef4444'} sub="net worth" />
        </div>

        {recommendations.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Icon name="Lightbulb" size={18} className="text-amber-500" /> Рекомендации
            </h2>
            {recommendations.map((r, i) => (
              <RecCard key={i} r={r} onAction={(rec) => { if (rec.debt_id) navigate('/finance/debts'); }} />
            ))}
          </section>
        )}

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

        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs">Обзор</TabsTrigger>
            <TabsTrigger value="debts" className="text-xs">Долги</TabsTrigger>
            <TabsTrigger value="cashflow" className="text-xs">Прогноз</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">Бюджет</TabsTrigger>
          </TabsList>

          <OverviewTab s={s} incomeBreakdown={incomeBreakdown} historyChart={historyChart} goals={goals} navigate={navigate} />
          <DebtsTab debts_detail={debts_detail} strategies={strategies} />
          <CashflowTab cashflowChart={cashflowChart} cashflow={cashflow} />
          <BudgetTab budgets={budgets} navigate={navigate} />
        </Tabs>

        <AIAdvisor aiQ={a.aiQ} setAiQ={a.setAiQ} aiLoading={a.aiLoading} aiResponse={a.aiResponse} aiRef={a.aiRef} askAI={a.askAI} />

        <div className="grid grid-cols-2 gap-3">
          {[
            { path: '/finance/debts', icon: 'Receipt', color: 'text-red-500', label: 'Кредиты и долги' },
            { path: '/finance/recurring', icon: 'RefreshCw', color: 'text-blue-500', label: 'Регулярные' },
            { path: '/finance/accounts', icon: 'CreditCard', color: 'text-indigo-500', label: 'Счета' },
            { path: '/finance/goals', icon: 'Target', color: 'text-amber-500', label: 'Цели' },
          ].map(link => (
            <Button key={link.path} variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate(link.path)}>
              <Icon name={link.icon} size={20} className={link.color} />
              <span className="text-xs">{link.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
