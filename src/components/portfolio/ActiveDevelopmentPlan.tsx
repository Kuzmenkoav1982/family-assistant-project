import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { PortfolioData, DevelopmentPlan } from '@/types/portfolio.types';

interface ActiveDevelopmentPlanProps {
  data: PortfolioData;
}

function pluralGoals(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'цель';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'цели';
  return 'целей';
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
}

interface PlanStatus {
  label: string;
  icon: string;
  className: string;
}

function getPlanStatus(plan: DevelopmentPlan): PlanStatus {
  const p = plan.progress ?? 0;
  if (plan.target_date) {
    const days = Math.floor(
      (new Date(plan.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days < 0 && p < 100) {
      return {
        label: 'Просрочен',
        icon: 'AlertCircle',
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      };
    }
  }
  if (p >= 100) {
    return {
      label: 'Завершён',
      icon: 'CheckCircle2',
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };
  }
  if (p >= 75) {
    return {
      label: 'На финише',
      icon: 'Flag',
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    };
  }
  if (p >= 25) {
    return {
      label: 'В работе',
      icon: 'Loader',
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    };
  }
  return {
    label: 'Старт',
    icon: 'Sparkles',
    className: 'bg-primary/10 text-primary border-primary/20',
  };
}

function formatDeadline(targetDate: string): { text: string; tone: string } {
  const days = Math.floor(
    (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      text: `просрочен на ${overdue} ${pluralDays(overdue)}`,
      tone: 'text-red-600',
    };
  }
  if (days === 0) return { text: 'срок сегодня', tone: 'text-amber-600' };
  if (days === 1) return { text: 'остался 1 день', tone: 'text-amber-600' };
  if (days <= 7) return { text: `осталось ${days} ${pluralDays(days)}`, tone: 'text-amber-600' };
  if (days <= 30) return { text: `осталось ${days} ${pluralDays(days)}`, tone: 'text-muted-foreground' };
  const date = new Date(targetDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return { text: `до ${date}`, tone: 'text-muted-foreground' };
}

export default function ActiveDevelopmentPlan({ data }: ActiveDevelopmentPlanProps) {
  const plans = data.plans.slice(0, 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="Target" size={20} className="text-primary" />
          Активный план развития
          <Badge variant="secondary" className="ml-auto text-xs">
            {plans.length} {pluralGoals(plans.length)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Sparkles" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Активных целей пока нет</p>
            <p className="text-xs">Создайте первый план развития</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const icon = data.sphere_icons[plan.sphere_key];
              const sphereLabel = data.sphere_labels_child[plan.sphere_key];
              const status = getPlanStatus(plan);
              const deadline = plan.target_date ? formatDeadline(plan.target_date) : null;
              const progress = plan.progress ?? 0;
              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border bg-gradient-to-br from-background to-muted/20 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={icon} size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {sphereLabel}
                        </Badge>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${status.className}`}
                        >
                          <Icon name={status.icon} size={10} />
                          {status.label}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm">{plan.title}</h4>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-primary leading-none">
                        {progress}%
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">пройдено</p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-1.5 mb-3" />

                  {plan.next_step && (
                    <div className="flex items-start gap-2 text-xs">
                      <Icon
                        name="ArrowRight"
                        size={12}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span className="text-foreground/80">
                        <span className="font-medium">Следующий шаг:</span> {plan.next_step}
                      </span>
                    </div>
                  )}

                  {plan.milestone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Icon name="Flag" size={11} />
                      <span>Веха: {plan.milestone}</span>
                    </div>
                  )}

                  {deadline && (
                    <div className={`flex items-center gap-1 text-xs mt-2 ${deadline.tone}`}>
                      <Icon name="Calendar" size={11} />
                      <span>{deadline.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
