import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  onAdd: () => void;
}

export default function TreeEmptyState({ onAdd }: Props) {
  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/50">
      <CardContent className="py-12 text-center">
        <Icon name="TreePine" size={48} className="text-amber-300 mx-auto mb-3" />
        <p className="text-amber-700 font-medium mb-1">Древо пока пустое</p>
        <p className="text-amber-500 text-sm mb-4">Добавьте первого члена семьи, чтобы начать строить историю рода</p>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={onAdd}>
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить первого
        </Button>
      </CardContent>
    </Card>
  );
}
