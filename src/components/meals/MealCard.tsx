import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ImageLightbox from '@/components/ImageLightbox';

const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';
const SHOPPING_API_URL = 'https://functions.poehali.dev/3f85241b-6c17-4d3d-a5f2-99b3af90af1b';

interface MealPlan {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  description?: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
  emoji?: string;
  ingredients?: string[];
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин'
};

const MEAL_TYPE_TIMES: Record<string, string> = {
  breakfast: '08:00',
  lunch: '13:00',
  dinner: '19:00'
};

const MEAL_TYPE_BG: Record<string, string> = {
  breakfast: 'bg-amber-100',
  lunch: 'bg-green-100',
  dinner: 'bg-blue-100'
};

interface MealCardProps {
  meal: MealPlan;
  onEdit: (meal: MealPlan) => void;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [recipe, setRecipe] = useState<string[] | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToShopping, setAddedToShopping] = useState(false);
  const [addingShopping, setAddingShopping] = useState(false);
  const [shoppingCount, setShoppingCount] = useState(0);

  const bgColor = MEAL_TYPE_BG[meal.mealType] || 'bg-gray-100';

  const generateRecipe = async () => {
    if (recipe) return;
    setLoadingRecipe(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'recipe',
          dishName: meal.dishName,
          ingredients: [],
        }),
      });
      if (res.status === 402) { setRecipe(['Недостаточно средств. Пополните кошелёк.']); return; }
      const data = await res.json();
      if (data.status === 'started' && data.operationId) {
        const steps = await pollResult(data.operationId, 'check_recipe', 'recipe');
        if (steps) setRecipe(steps as string[]);
      } else if (data.recipe) {
        setRecipe(data.recipe);
      }
    } catch {
      setRecipe(['Не удалось загрузить рецепт. Попробуйте позже.']);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const generatePhoto = async () => {
    if (photoUrl || loadingPhoto) return;
    setLoadingPhoto(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'generate_photo',
          dishName: meal.dishName,
          description: meal.description || '',
        }),
      });
      if (res.status === 402) return;
      const data = await res.json();
      if (data.status === 'started' && data.operationId) {
        const url = await pollResult(data.operationId, 'check_photo', 'imageUrl');
        if (url) setPhotoUrl(url as string);
      } else if (data.imageUrl) {
        setPhotoUrl(data.imageUrl);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPhoto(false);
    }
  };

  const pollResult = async (opId: string, action: string, resultKey: string): Promise<unknown> => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, operationId: opId }),
        });
        const data = await res.json();
        if (data.status === 'processing') continue;
        if (data.status === 'done' && data[resultKey]) return data[resultKey];
        if (data.status === 'error') return action === 'check_recipe' ? ['Ошибка: ' + (data.error || 'неизвестная')] : null;
      } catch {
        return null;
      }
    }
    return action === 'check_recipe' ? ['Рецепт генерируется слишком долго. Попробуйте позже.'] : null;
  };

  const parseIngredient = (raw: string): { name: string; quantity: string } => {
    const cleaned = raw.replace(/^\d+[.)]\s*/, '').trim();
    const separators = [' — ', ' - ', ' – ', ': '];
    for (const sep of separators) {
      const idx = cleaned.indexOf(sep);
      if (idx > 0) {
        return { name: cleaned.slice(0, idx).trim(), quantity: cleaned.slice(idx + sep.length).trim() };
      }
    }
    const match = cleaned.match(/^(.+?)\s+(\d+\s*(?:г|гр|кг|мл|л|шт|ст\.?\s*л|ч\.?\s*л|пучок|зубчик|щепотк)\.?\s*.*)$/i);
    if (match) return { name: match[1].trim(), quantity: match[2].trim() };
    return { name: cleaned, quantity: '' };
  };

  const addToShopping = async () => {
    const ingredients = meal.ingredients || [];
    if (ingredients.length === 0) {
      alert('У этого блюда нет списка ингредиентов. Сначала сгенерируйте диету через ИИ.');
      return;
    }
    setAddingShopping(true);
    const authToken = localStorage.getItem('authToken') || '';
    let addedCount = 0;
    try {
      for (const raw of ingredients) {
        const { name, quantity } = parseIngredient(raw);
        if (!name) continue;
        await fetch(SHOPPING_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
          body: JSON.stringify({
            name,
            category: 'Продукты',
            quantity,
            priority: 'normal',
            notes: `Для блюда: ${meal.dishName}`
          }),
        });
        addedCount++;
      }
      setAddedToShopping(true);
      setShoppingCount(addedCount);
    } catch {
      alert('Ошибка добавления в покупки');
    } finally {
      setAddingShopping(false);
    }
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
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {MEAL_TYPE_TIMES[meal.mealType]}
                </span>
                <Icon
                  name={expanded ? 'ChevronUp' : 'ChevronDown'}
                  size={14}
                  className="ml-auto text-muted-foreground"
                />
              </div>
              <h3 className="font-semibold text-sm">{meal.dishName}</h3>
              {meal.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{meal.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50">
                  <Icon name="User" size={10} className="mr-1" />
                  {meal.addedByName}
                </Badge>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="border-t px-4 py-3 space-y-3 bg-gray-50/50">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={meal.dishName}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxOpen(true)}
                />
              )}

              {meal.ingredients && meal.ingredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                    <Icon name="ShoppingBasket" size={14} />
                    Ингредиенты ({meal.ingredients.length})
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
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold">
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
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs h-8 ${addedToShopping ? 'text-green-600 border-green-300 bg-green-50' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}
                    onClick={(e) => { e.stopPropagation(); addToShopping(); }}
                    disabled={addingShopping || addedToShopping}
                  >
                    {addingShopping ? (
                      <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-1" />Добавляю...</>
                    ) : (
                      <><Icon name={addedToShopping ? 'Check' : 'ShoppingCart'} size={14} className="mr-1" />{addedToShopping ? `${shoppingCount} продуктов` : 'В покупки'}</>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={(e) => { e.stopPropagation(); onEdit(meal); }}
                >
                  <Icon name="Edit2" size={14} className="mr-1" />
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); onDelete(meal.id); }}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {photoUrl && (
        <ImageLightbox
          src={photoUrl}
          alt={meal.dishName}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}