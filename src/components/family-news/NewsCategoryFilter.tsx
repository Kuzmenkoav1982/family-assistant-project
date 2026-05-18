import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NewsCategory } from './newsData';

interface NewsCategoryFilterProps {
  categories: NewsCategory[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function NewsCategoryFilter({ categories, selected, onSelect }: NewsCategoryFilterProps) {
  return (
    <Card className="bg-gradient-to-r from-red-50 to-orange-50">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selected === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(cat.id)}
              className="text-sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
