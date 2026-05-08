import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function TrustBlock() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="HandHeart" size={18} className="text-primary" fallback="Heart" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">
              Это не диагноз и не ярлык
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Портфолио — это карта развития, собранная на основе данных семьи: наблюдений,
              привычек, активностей и достижений. Она помогает увидеть сильные стороны, зоны
              внимания и следующий полезный шаг.
            </p>
            <Link
              to="/portfolio/about"
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
            >
              Как это работает
              <Icon name="ArrowRight" size={12} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
