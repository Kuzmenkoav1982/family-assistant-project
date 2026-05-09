import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AtlasComingSoonTabProps {
  step: string;
  title: string;
  description: string;
  bullets: string[];
}

export default function AtlasComingSoonTab({
  step,
  title,
  description,
  bullets,
}: AtlasComingSoonTabProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-violet-100 items-center justify-center mb-3">
          <Icon name="Hourglass" size={26} className="text-violet-600" />
        </div>
        <div className="text-xs font-semibold text-violet-700 uppercase tracking-widest mb-1">{step}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4">{description}</p>
        <ul className="inline-block text-left text-sm space-y-1 text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Icon name="ChevronRight" size={14} className="mt-0.5 text-violet-500 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
