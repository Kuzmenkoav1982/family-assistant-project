import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  onShowAIIdeas: () => void;
}

export default function IdeasTab({ onShowAIIdeas }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Lightbulb" className="text-yellow-500" />
            ИИ Идеи и рекомендации
          </CardTitle>
          <Button onClick={onShowAIIdeas} className="w-full md:w-auto">
            <Icon name="Wand2" size={16} />
            Генерировать идеи
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm md:text-base">
          Используйте ИИ для генерации идей меню, декора, активностей и распределения бюджета
        </p>
      </CardContent>
    </Card>
  );
}
