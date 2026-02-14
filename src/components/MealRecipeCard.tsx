import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ImageLightbox from '@/components/ImageLightbox';

const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';

interface MealPlan {
  type: string;
  time: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  ingredients: string[];
  cooking_time_min: number;
  emoji: string;
}

const mealTypeNames: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

interface Props {
  meal: MealPlan;
  accentColor?: 'green' | 'emerald';
}

export default function MealRecipeCard({ meal, accentColor = 'green' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [recipe, setRecipe] = useState<string[] | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const bgColor = meal.type === 'breakfast' ? 'bg-amber-100' :
    meal.type === 'lunch' ? 'bg-green-100' :
    meal.type === 'dinner' ? 'bg-blue-100' : 'bg-purple-100';

  const generateRecipe = async () => {
    if (recipe) return;
    setLoadingRecipe(true);

    try {
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recipe',
          dishName: meal.name,
          ingredients: meal.ingredients,
        }),
      });
      const data = await res.json();

      if (data.status === 'started' && data.operationId) {
        const steps = await pollRecipe(data.operationId);
        if (steps) setRecipe(steps);
      } else if (data.recipe) {
        setRecipe(data.recipe);
      }
    } catch {
      setRecipe(['Не удалось загрузить рецепт. Попробуйте позже.']);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const pollRecipe = async (opId: string): Promise<string[] | null> => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_recipe', operationId: opId }),
        });
        const data = await res.json();
        if (data.status === 'processing') continue;
        if (data.status === 'done' && data.recipe) return data.recipe;
        if (data.status === 'error') return ['Ошибка: ' + (data.error || 'неизвестная')];
      } catch {
        return null;
      }
    }
    return ['Рецепт генерируется слишком долго. Попробуйте позже.'];
  };

  const generatePhoto = async () => {
    if (photoUrl || loadingPhoto) return;
    setLoadingPhoto(true);

    try {
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_photo',
          dishName: meal.name,
          description: meal.description,
        }),
      });
      const data = await res.json();

      if (data.status === 'started' && data.operationId) {
        const url = await pollPhoto(data.operationId);
        if (url) setPhotoUrl(url);
      } else if (data.imageUrl) {
        setPhotoUrl(data.imageUrl);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPhoto(false);
    }
  };

  const pollPhoto = async (opId: string): Promise<string | null> => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_photo', operationId: opId }),
        });
        const data = await res.json();
        if (data.status === 'processing') continue;
        if (data.status === 'done' && data.imageUrl) return data.imageUrl;
        return null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && !recipe) {
      generateRecipe();
    }
  };

  return (
    <>
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          className="flex items-stretch cursor-pointer"
          onClick={handleExpand}
        >
          <div className={`w-14 flex items-center justify-center flex-shrink-0 ${bgColor}`}>
            <span className="text-2xl">{meal.emoji || '🍽'}</span>
          </div>
          <div className="flex-1 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {mealTypeNames[meal.type] || meal.type}
              </Badge>
              {meal.time && (
                <span className="text-[10px] text-muted-foreground">{meal.time}</span>
              )}
              {meal.cooking_time_min > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Icon name="Clock" size={10} /> {meal.cooking_time_min} мин
                </span>
              )}
              <Icon
                name={expanded ? 'ChevronUp' : 'ChevronDown'}
                size={14}
                className="ml-auto text-muted-foreground"
              />
            </div>
            <h3 className="font-semibold text-sm">{meal.name}</h3>
            {meal.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{meal.description}</p>
            )}
            <div className="flex gap-3 mt-2 text-[10px]">
              <span className="text-green-700 font-medium">{meal.calories} ккал</span>
              <span className="text-blue-600">Б: {meal.protein}г</span>
              <span className="text-amber-600">Ж: {meal.fats}г</span>
              <span className="text-orange-600">У: {meal.carbs}г</span>
            </div>
            {!expanded && meal.ingredients && meal.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {meal.ingredients.slice(0, 4).map((ing, j) => (
                  <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50">
                    {ing}
                  </Badge>
                ))}
                {meal.ingredients.length > 4 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50">
                    +{meal.ingredients.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="border-t px-4 py-3 space-y-3 bg-gray-50/50">
            {photoUrl && (
              <img
                src={photoUrl}
                alt={meal.name}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              />
            )}

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Icon name="ShoppingBasket" size={14} />
                  Ингредиенты
                </h4>
                <div className="flex flex-wrap gap-1">
                  {meal.ingredients.map((ing, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                <Icon name="ChefHat" size={14} />
                Пошаговый рецепт
              </h4>
              {loadingRecipe ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ИИ готовит рецепт...
                </div>
              ) : recipe ? (
                <ol className="space-y-2">
                  {recipe.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-xs">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full ${accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'} flex items-center justify-center text-[10px] font-bold`}>
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-muted-foreground">Загрузка...</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {!photoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={(e) => { e.stopPropagation(); generatePhoto(); }}
                  disabled={loadingPhoto}
                >
                  {loadingPhoto ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                      Генерирую фото...
                    </>
                  ) : (
                    <>
                      <Icon name="Camera" size={14} className="mr-1" />
                      Сгенерировать фото
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {photoUrl && (
      <ImageLightbox
        src={photoUrl}
        alt={meal.name}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  );
}