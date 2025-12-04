import { Heart, Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/types/recipe.types';

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

const DIFFICULTIES = [
  { value: 'easy', label: 'Легко', color: 'bg-green-500' },
  { value: 'medium', label: 'Средне', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Сложно', color: 'bg-red-500' }
];

interface RecipeCardProps {
  recipe: Recipe;
  onCardClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onCardClick, onToggleFavorite }: RecipeCardProps) {
  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '🍴';
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.color || 'bg-gray-500';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onCardClick(recipe)}
    >
      {recipe.image_url && (
        <div className="h-48 overflow-hidden rounded-t-lg">
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(recipe.category)}</span>
              <h3 className="text-lg font-semibold line-clamp-2">{recipe.name}</h3>
            </div>
            {recipe.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe);
            }}
          >
            <Heart className={recipe.is_favorite ? 'fill-pink-600 text-pink-600' : 'text-gray-400'} size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white`}>
          {DIFFICULTIES.find(d => d.value === recipe.difficulty)?.label}
        </Badge>
        {recipe.cooking_time && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock size={14} />
            {recipe.cooking_time} мин
          </Badge>
        )}
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users size={14} />
          {recipe.servings} порций
        </Badge>
        {recipe.dietary_tags?.map(tag => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </CardFooter>
    </Card>
  );
}

export { DIFFICULTIES };
