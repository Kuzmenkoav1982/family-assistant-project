import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { RecipeCategory, CuisineType } from '@/types/recipe.types';

const CATEGORIES = [
  { value: 'all', label: 'Все категории', icon: '🍽️' },
  { value: 'breakfast', label: 'Завтрак', icon: '🥐' },
  { value: 'soup', label: 'Супы', icon: '🍜' },
  { value: 'main', label: 'Основное', icon: '🍖' },
  { value: 'side', label: 'Гарниры', icon: '🥔' },
  { value: 'salad', label: 'Салаты', icon: '🥗' },
  { value: 'dessert', label: 'Десерты', icon: '🍰' },
  { value: 'snack', label: 'Закуски', icon: '🧀' },
  { value: 'drink', label: 'Напитки', icon: '☕' },
  { value: 'other', label: 'Другое', icon: '🍴' }
];

const CUISINES = [
  { value: 'all', label: 'Все кухни' },
  { value: 'russian', label: 'Русская' },
  { value: 'italian', label: 'Итальянская' },
  { value: 'asian', label: 'Азиатская' },
  { value: 'american', label: 'Американская' },
  { value: 'french', label: 'Французская' },
  { value: 'mexican', label: 'Мексиканская' },
  { value: 'mediterranean', label: 'Средиземноморская' },
  { value: 'other', label: 'Другая' }
];

interface RecipesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: RecipeCategory | 'all';
  onCategoryChange: (value: RecipeCategory | 'all') => void;
  selectedCuisine: CuisineType | 'all';
  onCuisineChange: (value: CuisineType | 'all') => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export function RecipesFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCuisine,
  onCuisineChange,
  showFavoritesOnly,
  onToggleFavorites
}: RecipesFiltersProps) {
  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск по названию или ингредиентам..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(v) => onCategoryChange(v as RecipeCategory | 'all')}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCuisine} onValueChange={(v) => onCuisineChange(v as CuisineType | 'all')}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUISINES.map(cuisine => (
                <SelectItem key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={onToggleFavorites}
            className="w-full md:w-auto"
          >
            <Icon name="Heart" className={showFavoritesOnly ? 'fill-current' : ''} size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { CATEGORIES, CUISINES };
