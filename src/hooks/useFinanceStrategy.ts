import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import type { AnalysisData, DebtDetail } from '@/data/financeStrategyTypes';
import { API, getHeaders, simulatePayoff, simulateTimeline } from '@/data/financeStrategyTypes';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ANALYSIS } from '@/data/demoFinanceData';

export default function useFinanceStrategy() {
  useIsFamilyOwner();
  const { isDemoMode } = useDemoMode();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTimeline, setActiveTimeline] = useState<'avalanche' | 'snowball'>('avalanche');
  const [simDebtId, setSimDebtId] = useState<string>('');
  const [simExtra, setSimExtra] = useState(0);

  const fetchData = useCallback(async () => {
    if (isDemoMode) {
      setData(DEMO_ANALYSIS as unknown as AnalysisData);
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
      toast.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const debts = data?.debts_detail || [];
  const strategies = data?.strategies;
  const recommended = strategies?.recommended || null;
  const summary = data?.summary;

  const activeStrategy = recommended === 'snowball' ? strategies?.snowball : strategies?.avalanche;

  const sortedDebts = useMemo(() => {
    if (!recommended || debts.length === 0) return debts;
    const order = (recommended === 'snowball' ? strategies?.snowball : strategies?.avalanche)?.closed_order || [];
    const orderMap = new Map(order.map((c, i) => [c.id, i]));
    return [...debts].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [debts, recommended, strategies]);

  const targetDebtId = sortedDebts.length > 0 ? sortedDebts[0].id : '';

  useEffect(() => {
    if (debts.length > 0 && !simDebtId) {
      setSimDebtId(debts[0].id);
    }
  }, [debts]);

  const simDebt = debts.find(d => d.id === simDebtId) || null;
  const simMaxExtra = Math.max(0, (summary?.free_money || 0));

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
    const maxMonth = Math.max(...without.map(p => p.month), ...(withExtra.length ? withExtra.map(p => p.month) : [0]));
    const points: { month: number; without: number; withExtra: number | null }[] = [];
    for (let m = 0; m <= maxMonth; m++) {
      const w = without.find(p => p.month === m);
      const e = withExtra.find(p => p.month === m);
      if (w || e) {
        points.push({ month: m, without: w?.balance ?? 0, withExtra: e?.balance ?? null });
      }
    }
    return points;
  }, [simDebt, simExtra]);

  const incomeScenarios = useMemo(() => {
    const base = summary?.free_money || 0;
    return [
      { label: '10%', amount: Math.round(base * 0.1) },
      { label: '25%', amount: Math.round(base * 0.25) },
      { label: '50%', amount: Math.round(base * 0.5) },
    ].filter(s => s.amount > 0);
  }, [summary]);

  const totalOriginal = debts.reduce((s, d) => s + d.original_amount, 0);
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const totalPaidPct = totalOriginal > 0 ? ((totalOriginal - totalRemaining) / totalOriginal) * 100 : 0;
  const closedDebtsCount = debts.filter(d => d.remaining <= 0.01).length;

  return {
    data, loading, error, fetchData,
    debts, strategies, recommended, summary, activeStrategy,
    sortedDebts, targetDebtId,
    activeTimeline, setActiveTimeline,
    simDebtId, setSimDebtId, simExtra, setSimExtra,
    simDebt, simMaxExtra, simWithout, simWith, simChartData,
    incomeScenarios,
    totalOriginal, totalRemaining, totalPaidPct, closedDebtsCount,
  };
}