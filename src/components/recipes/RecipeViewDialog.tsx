import { useState } from 'react';
import { Heart, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onEdit?: (recipe: Recipe) => void;
  isDeleting: boolean;
}

export function RecipeViewDialog({
  open,
  onOpenChange,
  recipe,
  onToggleFavorite,
  onDelete,
  onEdit,
  isDeleting
}: RecipeViewDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '🍴';
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.color || 'bg-gray-500';
  };
  
  const getImages = () => {
    if (!recipe) return [];
    const images = recipe.images || [];
    if (recipe.image_url && !images.includes(recipe.image_url)) {
      return [recipe.image_url, ...images];
    }
    return images;
  };
  
  const images = getImages();
  const hasMultipleImages = images.length > 1;
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
            {images.length > 0 && (
              <div className="w-full relative">
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${recipe.name} - фото ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {hasMultipleImages && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={nextImage}
                    >
                      <ChevronRight size={20} />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
                
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                          idx === currentImageIndex ? 'border-orange-500' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt={`Миниатюра ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
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
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => onToggleFavorite(recipe)}>
                <Heart className={recipe.is_favorite ? 'fill-current text-pink-600' : ''} size={20} />
                {recipe.is_favorite ? 'Убрать из избранного' : 'В избранное'}
              </Button>
              {onEdit && (
                <Button onClick={() => onEdit(recipe)}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Изменить
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => onDelete(recipe.id)}
                disabled={isDeleting}
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}