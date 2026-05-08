import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { PortfolioData } from '@/types/portfolio.types';

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
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {sphereLabel}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm">{plan.title}</h4>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{plan.progress}%</p>
                    </div>
                  </div>

                  <Progress value={plan.progress} className="h-1.5 mb-3" />

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

                  {plan.target_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Icon name="Calendar" size={11} />
                      <span>До {new Date(plan.target_date).toLocaleDateString('ru-RU')}</span>
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