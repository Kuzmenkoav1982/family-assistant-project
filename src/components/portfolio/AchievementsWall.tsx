import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { PortfolioData } from '@/types/portfolio.types';

interface AchievementsWallProps {
  data: PortfolioData;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  milestone: 'from-amber-400 to-orange-500',
  path: 'from-emerald-400 to-teal-500',
  rhythm: 'from-pink-400 to-rose-500',
};

export default function AchievementsWall({ data }: AchievementsWallProps) {
  const achievements = data.achievements.slice(0, 12);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="Trophy" size={20} className="text-amber-500" />
          Стена достижений
          <Badge variant="secondary" className="ml-auto text-xs">
            {data.achievements.length} {data.achievements.length === 1 ? 'бейдж' : 'бейджей'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Award" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Достижений пока нет</p>
            <p className="text-xs">Они появятся, когда будут пройдены первые этапы</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map((a) => {
              const gradient = CATEGORY_GRADIENTS[a.category] || 'from-primary to-purple-500';
              return (
                <div
                  key={a.id}
                  className="group relative p-3 rounded-xl border bg-card hover:shadow-md transition-all hover:-translate-y-0.5"
                  title={a.description || a.title}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mb-2 mx-auto shadow-sm`}
                  >
                    <Icon name={a.icon} size={22} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-center leading-tight line-clamp-2">
                    {a.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">
                    {new Date(a.earned_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
