import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface DevelopmentFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  familyMembers: FamilyMember[];
  selectedMember: string;
  onMemberChange: (memberId: string) => void;
  isLoading: boolean;
}

export function DevelopmentFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  familyMembers,
  selectedMember,
  onMemberChange,
  isLoading
}: DevelopmentFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Filter" size={24} />
          Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Категория тестов</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(cat.id)}
                className="gap-2"
              >
                <Icon name={cat.icon as any} size={16} />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Кто проходит тест</h3>
          {isLoading ? (
            <div className="text-sm text-gray-500">Загрузка...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMember === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMemberChange('all')}
              >
                Все члены семьи
              </Button>
              {familyMembers?.map(member => (
                <Button
                  key={member.id}
                  variant={selectedMember === member.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onMemberChange(member.id)}
                  className="gap-2"
                >
                  {member.name}
                  {selectedMember === member.id && member.development && (
                    <Badge variant="secondary" className="ml-1">
                      {member.development.reduce((acc, d) => acc + d.tests.length, 0)}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}