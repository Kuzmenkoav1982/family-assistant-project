import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { FinanceStrategyInstructions } from '@/components/finance/FinanceInstructions';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useFinanceStrategy from '@/hooks/useFinanceStrategy';
import { StrategyCard, DebtRow, ClosedOrderTimeline, AchievementCard } from '@/components/finance-strategy/StrategyCards';
import SimulatorSection from '@/components/finance-strategy/SimulatorSection';
import BonusPayoffPlanner from '@/components/finance-strategy/BonusPayoffPlanner';
import { fm } from '@/data/financeStrategyTypes';

const HERO_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed32438d-48c6-4c91-a57e-42f73472a180.jpg';

export default function FinanceStrategy() {
  const navigate = useNavigate();
  const s = useFinanceStrategy();

  if (s.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Стратегия погашения" subtitle="Загрузка..." imageUrl={HERO_IMG} backPath="/finance" />
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Анализируем долги...</p>
          </div>
        </div>
      </div>
    );
  }

  if (s.error || !s.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Стратегия погашения" subtitle="Ошибка" imageUrl={HERO_IMG} backPath="/finance" />
          <Card className="border-destructive">
            <CardContent className="py-10 text-center space-y-3">
              <Icon name="AlertTriangle" size={40} className="mx-auto text-destructive" />
              <p className="font-medium">{s.error || 'Не удалось загрузить'}</p>
              <Button onClick={s.fetchData}>Повторить</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (s.debts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <SectionHero title="Стратегия погашения" subtitle="Управление долгами" imageUrl={HERO_IMG} backPath="/finance" />
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center space-y-3">
              <Icon name="PartyPopper" size={48} className="mx-auto text-green-500" />
              <h2 className="text-lg font-bold">У вас нет долгов!</h2>
              <p className="text-sm text-muted-foreground">Добавьте кредиты для анализа стратегий</p>
              <Button onClick={() => navigate('/finance/debts')}>Добавить кредит</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
        <SectionHero title="Стратегия погашения" subtitle="Оптимальный план выплаты долгов" imageUrl={HERO_IMG} backPath="/finance" />
        <FinanceStrategyInstructions />

        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="Swords" size={18} className="text-indigo-500" /> Сравнение стратегий
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StrategyCard strategy={s.strategies?.avalanche || null} label="Лавина" description="Сначала самые дорогие долги" icon="TrendingDown" theme="blue" isRecommended={s.recommended === 'avalanche'} isWinner={s.recommended === 'avalanche'} />
            <StrategyCard strategy={s.strategies?.snowball || null} label="Снежный ком" description="Сначала самые маленькие долги" icon="Snowflake" theme="purple" isRecommended={s.recommended === 'snowball'} isWinner={s.recommended === 'snowball'} />
          </div>
          {s.strategies?.avalanche && s.strategies?.snowball && (
            <p className="text-xs text-muted-foreground text-center">
              {s.recommended === 'avalanche' ? 'Лавина экономит больше на процентах - рекомендуем' : 'Снежный ком даёт быстрые победы - мотивация выше'}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="ListOrdered" size={18} className="text-red-500" /> Приоритет погашения
          </h2>
          <div className="space-y-2">
            {s.sortedDebts.map((d, i) => <DebtRow key={d.id} debt={d} priority={i + 1} isTarget={d.id === s.targetDebtId} />)}
          </div>
        </section>

        {(s.strategies?.avalanche?.timeline || s.strategies?.snowball?.timeline) && (
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Icon name="LineChart" size={18} className="text-blue-500" /> График погашения
            </h2>
            <Tabs value={s.activeTimeline} onValueChange={v => s.setActiveTimeline(v as 'avalanche' | 'snowball')}>
              <TabsList className="w-full grid grid-cols-2 h-8">
                <TabsTrigger value="avalanche" className="text-xs" disabled={!s.strategies?.avalanche}>Лавина</TabsTrigger>
                <TabsTrigger value="snowball" className="text-xs" disabled={!s.strategies?.snowball}>Снежный ком</TabsTrigger>
              </TabsList>
              {(['avalanche', 'snowball'] as const).map(key => {
                const st = s.strategies?.[key];
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
                              <Area type="monotone" dataKey="total_remaining" stroke={key === 'avalanche' ? '#3b82f6' : '#8b5cf6'} fill={`url(#g_${key})`} strokeWidth={2} name="Остаток долга" />
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

        {s.activeStrategy?.closed_order && s.activeStrategy.closed_order.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Icon name="Route" size={18} className="text-green-500" /> Порядок закрытия
            </h2>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <ClosedOrderTimeline items={s.activeStrategy.closed_order} />
              </CardContent>
            </Card>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="Gift" size={18} className="text-emerald-500" /> Калькулятор премии / крупной суммы
          </h2>
          <BonusPayoffPlanner debts={s.debts} onSuccess={s.fetchData} />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="FlaskConical" size={18} className="text-amber-500" /> Симулятор: Что если?
          </h2>
          <SimulatorSection
            debts={s.debts} simDebtId={s.simDebtId} setSimDebtId={s.setSimDebtId}
            simExtra={s.simExtra} setSimExtra={s.setSimExtra}
            simDebt={s.simDebt} simMaxExtra={s.simMaxExtra}
            simWithout={s.simWithout} simWith={s.simWith}
            simChartData={s.simChartData} incomeScenarios={s.incomeScenarios}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="Trophy" size={18} className="text-amber-500" /> Путь к свободе
          </h2>
          <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Общий прогресс</h3>
                <Badge variant="outline" className="text-xs">{s.closedDebtsCount} из {s.debts.length} долгов</Badge>
              </div>
              <Progress value={s.totalPaidPct} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Погашено {s.totalPaidPct.toFixed(1)}%</span>
                <span>Осталось {fm(s.totalRemaining)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Было: {fm(s.totalOriginal)}</span>
                <span className="font-medium text-green-600">Выплачено: {fm(s.totalOriginal - s.totalRemaining)}</span>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <AchievementCard icon="Zap" title="Первый шаг" description="Досрочный платёж по кредиту" unlocked={s.totalOriginal > s.totalRemaining} />
            <AchievementCard icon="Medal" title="Победитель" description="Закрыт первый долг" unlocked={s.closedDebtsCount > 0} />
            <AchievementCard icon="Shield" title="Стратег" description="Выбрана стратегия погашения" unlocked={!!s.activeStrategy} />
            <AchievementCard icon="Crown" title="Свобода" description="Все долги закрыты" unlocked={s.totalRemaining <= 0.01 && s.debts.length > 0} />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/analytics')}>
            <Icon name="BarChart3" size={20} className="text-indigo-500" /><span className="text-xs">Аналитика</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/finance/debts')}>
            <Icon name="Receipt" size={20} className="text-red-500" /><span className="text-xs">Кредиты</span>
          </Button>
        </div>
      </div>
    </div>
  );
}