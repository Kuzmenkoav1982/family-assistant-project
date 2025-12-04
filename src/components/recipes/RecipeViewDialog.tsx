import { Heart, Clock, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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

interface RecipeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  onToggleFavorite: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function RecipeViewDialog({
  open,
  onOpenChange,
  recipe,
  onToggleFavorite,
  onDelete,
  isDeleting
}: RecipeViewDialogProps) {
  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '🍴';
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.color || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {recipe && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <span className="text-3xl">{getCategoryIcon(recipe.category)}</span>
                {recipe.name}
              </DialogTitle>
            </DialogHeader>
            {recipe.image_url && (
              <div className="w-full h-64 overflow-hidden rounded-lg">
                <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
              </div>
            )}
            {recipe.description && (
              <p className="text-gray-600">{recipe.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
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
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ингредиенты:</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                {recipe.ingredients}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Приготовление:</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                {recipe.instructions}
              </pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onToggleFavorite(recipe)}>
                <Heart className={recipe.is_favorite ? 'fill-current text-pink-600' : ''} size={20} />
                {recipe.is_favorite ? 'Убрать из избранного' : 'В избранное'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(recipe.id)}
                disabled={isDeleting}
              >
                Удалить
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
