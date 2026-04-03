import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { DashboardStats, DashboardPlan, DashboardData } from '@/data/dietProgressTypes';

interface StatsCardsProps {
  stats: DashboardStats;
  plan: DashboardPlan | null;
  tip: DashboardData['tip'];
  onWeightFormOpen: () => void;
}

export default function StatsCards({ stats, plan, tip, onWeightFormOpen }: StatsCardsProps) {
  return (
    <>
      {stats.days_since_log >= 3 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 flex items-center gap-3">
            <Icon name="AlertTriangle" size={20} className="text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Вы {stats.days_since_log} дн. не вносили вес</p>
              <p className="text-amber-700 text-xs">Без данных невозможно корректировать план</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto border-amber-300" onClick={onWeightFormOpen}>
              Внести
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden">
          <CardContent className="p-2.5 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-700 truncate">
              {stats.weight_lost > 0 ? `-${stats.weight_lost}` : stats.weight_lost} кг
            </div>
            <div className="text-[11px] sm:text-xs text-green-600">сброшено</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
          <CardContent className="p-2.5 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-700 truncate">{stats.adherence_pct}%</div>
            <div className="text-[11px] sm:text-xs text-blue-600">план выполнен</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 overflow-hidden">
          <CardContent className="p-2.5 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-violet-700 truncate">{stats.last_weight || '\u2014'}</div>
            <div className="text-[11px] sm:text-xs text-violet-600">текущий вес, кг</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden">
          <CardContent className="p-2.5 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-amber-700 truncate">{stats.streak || 0}</div>
            <div className="text-[11px] sm:text-xs text-amber-600">дней стрик</div>
          </CardContent>
        </Card>
      </div>

      {tip && (
        <Card className={`border ${
          tip.type === 'plateau' ? 'border-amber-200 bg-amber-50/50' :
          tip.type === 'sugar' ? 'border-pink-200 bg-pink-50/50' :
          tip.type === 'success' ? 'border-green-200 bg-green-50/50' :
          'border-blue-200 bg-blue-50/50'
        }`}>
          <CardContent className="p-3">
            <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Icon name={tip.type === 'plateau' ? 'TrendingUp' : tip.type === 'sugar' ? 'Candy' : tip.type === 'success' ? 'Trophy' : 'Lightbulb'} size={16} />
              {tip.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden">
        <div className="flex items-center justify-between mb-1 px-0.5">
          <span className="text-xs text-muted-foreground">День {stats.days_elapsed}</span>
          <span className="text-xs text-muted-foreground">День {plan?.duration_days}</span>
        </div>
        <Progress value={Math.min(100, (stats.days_elapsed / (plan?.duration_days || 1)) * 100)} className="h-2" />
      </div>
    </>
  );
}
