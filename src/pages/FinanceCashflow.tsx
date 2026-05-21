import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceCashflowInstructions } from '@/components/finance/FinanceInstructions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ANALYSIS } from '@/data/demoFinanceData';
import {
  analyzeData, getMonthShort, getMonthLabel, getMonthName, getMonthShort as _gs,
  fm, formatMoney,
  type AnalysisResponse, type CashflowInsights,
} from '@/components/finance/cashflow/cashflowUtils';
import { SummaryCard, InsightRow } from '@/components/finance/cashflow/CashflowWidgets';
import { CashFlowChart, BurndownChart, CashflowTable } from '@/components/finance/cashflow/CashflowCharts';
import { CashflowAlerts } from '@/components/finance/cashflow/CashflowAlerts';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';
const HERO_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/93aa5f51-a753-462f-bb64-e7bd50d54c9f.jpg';
const BG = 'bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': localStorage.getItem('authToken') || '',
  };
}

export default function FinanceCashflow() {
  const navigate = useNavigate();
  useIsFamilyOwner();
  const { isDemoMode } = useDemoMode();

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (isDemoMode) {
      setData(DEMO_ANALYSIS as unknown as AnalysisResponse);
      setLoading(false);
      return;
    }
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
  }, [isDemoMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cashflow = data?.cashflow || [];
  const insights = useMemo(() => analyzeData(cashflow), [cashflow]);

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

  const burndownData = useMemo(() => {
    const closedSet = new Set(insights.closedEvents.map(e => e.month));
    return chartData.map(c => ({
      label: c.label,
      remaining: c.total_remaining,
      debts: c.active_debts,
      isClosed: closedSet.has(c.month),
    }));
  }, [chartData, insights]);

  const refreshBtn = (
    <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={fetchData}>
      <Icon name="RefreshCw" size={14} /> Обновить
    </Button>
  );

  if (loading) {
    return (
      <SectionPageFrame title="Прогноз денежного потока" subtitle="Загрузка..." imageUrl={HERO_IMG} backPath="/finance/analytics" backgroundClass={BG}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Строим прогноз на 24 месяца...</p>
        </div>
      </SectionPageFrame>
    );
  }

  if (error || !data) {
    return (
      <SectionPageFrame title="Прогноз денежного потока" subtitle="Ошибка" imageUrl={HERO_IMG} backPath="/finance/analytics" backgroundClass={BG}>
        <Card className="border-destructive">
          <CardContent className="py-10 text-center space-y-3">
            <Icon name="AlertTriangle" size={40} className="mx-auto text-destructive" />
            <p className="font-medium">{error || 'Не удалось загрузить данные'}</p>
            <Button onClick={fetchData}>Повторить</Button>
          </CardContent>
        </Card>
      </SectionPageFrame>
    );
  }

  if (!cashflow.length) {
    return (
      <SectionPageFrame title="Прогноз денежного потока" subtitle="Нет данных" imageUrl={HERO_IMG} backPath="/finance/analytics" backgroundClass={BG}>
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center space-y-3">
            <Icon name="BarChart3" size={44} className="mx-auto text-muted-foreground" />
            <p className="font-medium">Недостаточно данных для прогноза</p>
            <p className="text-sm text-muted-foreground">Добавьте доходы, расходы и кредиты для построения прогноза</p>
            <Button onClick={() => navigate('/finance')}>К финансам</Button>
          </CardContent>
        </Card>
      </SectionPageFrame>
    );
  }

  const { avgFree, worstMonth, finalRemaining } = insights;

  return (
    <SectionPageFrame
      title="Прогноз денежного потока"
      subtitle="24-месячная проекция доходов, расходов и долгов"
      imageUrl={HERO_IMG}
      backPath="/finance/analytics"
      rightAction={refreshBtn}
      backgroundClass={BG}
    >
      <FinanceCashflowInstructions />

      <div className="grid grid-cols-3 gap-2">
        <SummaryCard icon="TrendingUp" label="Свободные (ср.)" value={fm(avgFree)} color={avgFree >= 0 ? '#22c55e' : '#ef4444'} sub="в месяц" />
        <SummaryCard icon={worstMonth && worstMonth.free_money < 0 ? 'AlertTriangle' : 'ArrowDown'} label="Мин. остаток" value={fm(worstMonth?.free_money || 0)} color={worstMonth && worstMonth.free_money < 0 ? '#ef4444' : '#f59e0b'} sub={worstMonth ? _gs(worstMonth.month) : ''} />
        <SummaryCard icon="Landmark" label="Долг (мес. 24)" value={fm(finalRemaining)} color={finalRemaining <= 0 ? '#22c55e' : '#6366f1'} sub={finalRemaining <= 0 ? 'Закрыт!' : 'остаток'} />
      </div>

      <CashflowAlerts insights={insights} />

      <Tabs defaultValue="cashflow" className="space-y-3">
        <TabsList className="w-full grid grid-cols-3 h-9">
          <TabsTrigger value="cashflow" className="text-xs">Кэш-флоу</TabsTrigger>
          <TabsTrigger value="burndown" className="text-xs">Долг</TabsTrigger>
          <TabsTrigger value="table" className="text-xs">Таблица</TabsTrigger>
        </TabsList>
        <TabsContent value="cashflow"><CashFlowChart chartData={chartData} /></TabsContent>
        <TabsContent value="burndown"><BurndownChart burndownData={burndownData} closedEvents={insights.closedEvents} /></TabsContent>
        <TabsContent value="table"><CashflowTable cashflow={cashflow} insights={insights} /></TabsContent>
      </Tabs>

      <section className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="Brain" size={18} className="text-indigo-500" /> Ключевые выводы
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <InsightRow icon="Calendar" color="#22c55e" label="Первый кредит закроется" value={insights.firstDebtClosed != null ? getMonthName(insights.firstDebtClosed) : 'Более 24 мес.'} />
          <InsightRow icon="Flag" color={insights.allDebtsFree != null ? '#22c55e' : '#6366f1'} label="Все долги закрыты" value={insights.allDebtsFree === 0 ? 'Уже свободны!' : insights.allDebtsFree != null ? getMonthName(insights.allDebtsFree) : 'Более 24 мес.'} />
          <InsightRow icon="Wallet" color={avgFree >= 0 ? '#22c55e' : '#ef4444'} label="Средний свободный остаток" value={fm(avgFree) + '/мес'} />
          <InsightRow icon="Banknote" color="#f59e0b" label="Переплата за 24 мес." value={fm(Math.max(0, insights.totalOverpay))} />
          <InsightRow icon="TrendingDown" color="#8b5cf6" label="Долг уменьшится на" value={fm(insights.debtDecrease)} />
        </div>
      </section>

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
    </SectionPageFrame>
  );
}
