import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { PortfolioData } from '@/types/portfolio.types';

interface PortfolioHeaderProps {
  data: PortfolioData;
}

const AGE_GROUP_LABELS: Record<string, string> = {
  '0-3': 'Младенец / ясли',
  '4-6': 'Дошкольник',
  '7-10': 'Младшая школа',
  '11-14': 'Ранний подросток',
  '15-17': 'Старшая школа',
  '18+': 'Взрослый',
};

export default function PortfolioHeader({ data }: PortfolioHeaderProps) {
  const navigate = useNavigate();
  const m = data.member;
  const initials = m.name?.slice(0, 2).toUpperCase() || '??';

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-purple-500/5 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full -ml-2"
          >
            <Icon name="ArrowLeft" size={18} className="mr-1" />
            Назад
          </Button>
          <Badge variant="outline" className="text-xs">
            <Icon name="Sparkles" size={12} className="mr-1" />
            Паспорт развития
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
            <AvatarImage src={m.photo_url || undefined} alt={m.name} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{m.name}</h1>
            <div className="flex flex-wrap gap-2 items-center text-muted-foreground mb-4">
              {m.age !== null && <span>{m.age} лет</span>}
              {m.role && <span>·</span>}
              {m.role && <span>{m.role}</span>}
              <span>·</span>
              <span className="text-xs">
                {AGE_GROUP_LABELS[data.age_group] || data.age_group}
              </span>
            </div>

            {/* Сильные стороны и зоны роста */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Icon name="Star" size={12} className="text-amber-500" />
                  Сильные стороны
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.strengths.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      Накапливаем данные…
                    </span>
                  )}
                  {data.strengths.map((s) => (
                    <Badge
                      key={s.sphere}
                      variant="secondary"
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                    >
                      <Icon name={s.icon} size={12} className="mr-1" />
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} className="text-blue-500" />
                  Зоны роста
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.growth_zones.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      Нет явных просадок
                    </span>
                  )}
                  {data.growth_zones.map((s) => (
                    <Badge
                      key={s.sphere}
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                    >
                      <Icon name={s.icon} size={12} className="mr-1" />
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Заполненность портфолио */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Заполненность портфолио
                </span>
                <span className="text-sm font-semibold">{data.completeness}%</span>
              </div>
              <Progress value={data.completeness} className="h-2" />
              {data.completeness < 60 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Добавляйте данные в хабах платформы — анализ будет точнее
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
