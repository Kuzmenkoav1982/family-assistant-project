import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';

interface Dish {
  name: string;
  description: string;
  cooking_time_min: number;
  calories_per_serving: number;
  difficulty: string;
  used_products: string[];
  extra_products: string[];
  emoji: string;
  ingredients: string[];
  steps: string[];
}

const popularProducts = [
  'Картофель', 'Морковь', 'Лук', 'Чеснок', 'Помидоры', 'Огурцы',
  'Куриная грудка', 'Фарш', 'Яйца', 'Сыр', 'Молоко', 'Сметана',
  'Рис', 'Макароны', 'Гречка', 'Хлеб', 'Масло сливочное', 'Мука',
  'Капуста', 'Перец болгарский', 'Кабачок', 'Баклажан',
  'Свинина', 'Говядина', 'Рыба', 'Творог', 'Сосиски', 'Грибы',
];

const difficultyMap: Record<string, { label: string; color: string }> = {
  easy: { label: 'Просто', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Средне', color: 'bg-amber-100 text-amber-700' },
  hard: { label: 'Сложно', color: 'bg-red-100 text-red-700' },
};

export default function RecipeFromProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<string[]>([]);
  const [customProduct, setCustomProduct] = useState('');
  const [mealType, setMealType] = useState('');
  const [peopleCount, setPeopleCount] = useState('2');
  const [preferences, setPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDish, setExpandedDish] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [loadingPhotos, setLoadingPhotos] = useState<Record<number, boolean>>({});

  const toggleProduct = (p: string) => {
    setProducts(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const addCustomProduct = () => {
    const trimmed = customProduct.trim();
    if (trimmed && !products.includes(trimmed)) {
      setProducts(prev => [...prev, trimmed]);
      setCustomProduct('');
    }
  };

  const removeProduct = (p: string) => {
    setProducts(prev => prev.filter(x => x !== p));
  };

  const pollOperation = async (operationId: string): Promise<Dish[] | null> => {
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_products', operationId }),
        });
        const data = await res.json();
        if (data.status === 'processing') continue;
        if (data.status === 'done' && data.dishes) return data.dishes;
        if (data.status === 'error') {
          setError(data.error || 'Ошибка генерации');
          return null;
        }
      } catch {
        return null;
      }
    }
    setError('Генерация заняла слишком много времени.');
    return null;
  };

  const handleGenerate = async () => {
    if (products.length < 2) return;
    setIsGenerating(true);
    setError(null);
    setDishes(null);
    setExpandedDish(null);

    try {
      const authToken = localStorage.getItem('authToken') || '';
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'recipe_from_products',
          products,
          mealType,
          peopleCount: parseInt(peopleCount) || 2,
          preferences,
        }),
      });
      const data = await res.json();

      if (res.status === 402 || data.error === 'insufficient_funds') {
        setError(`Недостаточно средств на балансе. ${data.message || 'Пополните кошелёк.'}`);
      } else if (data.status === 'started' && data.operationId) {
        const result = await pollOperation(data.operationId);
        if (result && result.length > 0) {
          setDishes(result);
        } else if (!error) {
          setError('ИИ не смог подобрать блюда. Попробуйте добавить больше продуктов.');
        }
      } else {
        setError(data.error || 'Ошибка запроса');
      }
    } catch {
      setError('Ошибка соединения.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePhoto = async (idx: number, dish: Dish) => {
    if (photoUrls[idx] || loadingPhotos[idx]) return;
    setLoadingPhotos(prev => ({ ...prev, [idx]: true }));

    try {
      const authToken = localStorage.getItem('authToken') || '';
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'generate_photo',
          dishName: dish.name,
          description: dish.description,
        }),
      });
      if (res.status === 402) { setLoadingPhotos(prev => ({ ...prev, [idx]: false })); return; }
      const data = await res.json();

      if (data.status === 'started' && data.operationId) {
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 4000));
          try {
            const check = await fetch(DIET_PLAN_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'check_photo', operationId: data.operationId }),
            });
            const checkData = await check.json();
            if (checkData.status === 'processing') continue;
            if (checkData.status === 'done' && checkData.imageUrl) {
              setPhotoUrls(prev => ({ ...prev, [idx]: checkData.imageUrl }));
              break;
            }
            break;
          } catch { break; }
        }
      }
    } catch { /* silent */ } finally {
      setLoadingPhotos(prev => ({ ...prev, [idx]: false }));
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center animate-pulse">
            <Icon name="ChefHat" size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">ИИ подбирает рецепты</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Анализирую ваши продукты: {products.slice(0, 5).join(', ')}
            {products.length > 5 ? ` и ещё ${products.length - 5}...` : ''}
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">30-60 секунд</p>
        </div>
      </div>
    );
  }

  if (dishes) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setDishes(null); setExpandedDish(null); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Предложения ИИ</h1>
              <p className="text-xs text-muted-foreground">
                Из {products.length} продуктов — {dishes.length} блюд
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {products.map(p => (
              <Badge key={p} variant="secondary" className="text-[10px] bg-orange-50 text-orange-700">
                {p}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            {dishes.map((dish, idx) => {
              const isExpanded = expandedDish === idx;
              const diff = difficultyMap[dish.difficulty] || difficultyMap.medium;
              return (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className="flex items-stretch cursor-pointer"
                      onClick={() => setExpandedDish(isExpanded ? null : idx)}
                    >
                      <div className="w-14 flex items-center justify-center flex-shrink-0 bg-orange-100">
                        <span className="text-2xl">{dish.emoji || '🍳'}</span>
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${diff.color}`}>
                            {diff.label}
                          </Badge>
                          {dish.cooking_time_min > 0 && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Icon name="Clock" size={10} /> {dish.cooking_time_min} мин
                            </span>
                          )}
                          {dish.calories_per_serving > 0 && (
                            <span className="text-[10px] text-green-700 font-medium">
                              {dish.calories_per_serving} ккал
                            </span>
                          )}
                          <Icon
                            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                            size={14}
                            className="ml-auto text-muted-foreground"
                          />
                        </div>
                        <h3 className="font-semibold text-sm">{dish.name}</h3>
                        {dish.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{dish.description}</p>
                        )}
                        {!isExpanded && dish.used_products && dish.used_products.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dish.used_products.slice(0, 5).map((p, j) => (
                              <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-4 py-3 space-y-3 bg-gray-50/50">
                        {photoUrls[idx] && (
                          <img src={photoUrls[idx]} alt={dish.name} className="w-full h-40 object-cover rounded-lg" />
                        )}

                        {dish.extra_products && dish.extra_products.length > 0 && (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                            <Icon name="ShoppingCart" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                              <span className="font-bold text-amber-800">Докупить: </span>
                              <span className="text-amber-700">{dish.extra_products.join(', ')}</span>
                            </div>
                          </div>
                        )}

                        {dish.ingredients && dish.ingredients.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                              <Icon name="ShoppingBasket" size={14} />
                              Ингредиенты
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {dish.ingredients.map((ing, j) => (
                                <Badge key={j} variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {ing}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {dish.steps && dish.steps.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                              <Icon name="ChefHat" size={14} />
                              Пошаговый рецепт
                            </h4>
                            <ol className="space-y-2">
                              {dish.steps.map((step, si) => (
                                <li key={si} className="flex gap-2 text-xs">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold">
                                    {si + 1}
                                  </span>
                                  <span className="leading-relaxed pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          {!photoUrls[idx] && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={(e) => { e.stopPropagation(); generatePhoto(idx, dish); }}
                              disabled={loadingPhotos[idx]}
                            >
                              {loadingPhotos[idx] ? (
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
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setDishes(null); setExpandedDish(null); }}>
              <Icon name="ArrowLeft" size={14} className="mr-1" />
              Изменить продукты
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600"
              onClick={handleGenerate}
            >
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Другие рецепты
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold">Ошибка</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 text-center">
              <Icon name="AlertTriangle" size={40} className="text-red-500 mx-auto mb-3" />
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-600" onClick={() => { setError(null); handleGenerate(); }}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SectionPageFrame
      title="Рецепт из продуктов"
      subtitle="Укажите что есть — ИИ предложит блюда"
      imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/bce7c61c-1b5e-4743-a5d2-1c7a6ae4e868.jpg"
      backPath="/nutrition"
      width="narrow"
      backgroundClass="bg-gradient-to-b from-orange-50 via-amber-50/30 to-white dark:from-gray-950 dark:to-gray-900"
    >

        {products.length > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ShoppingBasket" size={16} className="text-orange-600" />
                <span className="text-sm font-bold text-orange-800">
                  Выбрано: {products.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {products.map(p => (
                  <Badge
                    key={p}
                    className="text-xs bg-orange-500 hover:bg-orange-600 cursor-pointer gap-1"
                    onClick={() => removeProduct(p)}
                  >
                    {p}
                    <Icon name="X" size={10} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-bold mb-2 block">Популярные продукты</Label>
              <div className="flex flex-wrap gap-1.5">
                {popularProducts.map(p => (
                  <Badge
                    key={p}
                    variant={products.includes(p) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      products.includes(p)
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'hover:bg-orange-50 hover:border-orange-300'
                    }`}
                    onClick={() => toggleProduct(p)}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold mb-2 block">Добавить свой продукт</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Например: авокадо"
                  value={customProduct}
                  onChange={e => setCustomProduct(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomProduct()}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addCustomProduct} disabled={!customProduct.trim()}>
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Приём пищи</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger><SelectValue placeholder="Любой" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Любой</SelectItem>
                    <SelectItem value="breakfast">Завтрак</SelectItem>
                    <SelectItem value="lunch">Обед</SelectItem>
                    <SelectItem value="dinner">Ужин</SelectItem>
                    <SelectItem value="snack">Перекус</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Порций</Label>
                <Select value={peopleCount} onValueChange={setPeopleCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Пожелания (необязательно)</Label>
              <Input
                placeholder="Например: без жарки, быстро, для детей"
                value={preferences}
                onChange={e => setPreferences(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 text-base"
          disabled={products.length < 2}
          onClick={handleGenerate}
        >
          <Icon name="Sparkles" size={18} className="mr-2" />
          {products.length < 2
            ? `Выберите минимум 2 продукта (${products.length}/2)`
            : `Найти рецепты из ${products.length} продуктов`
          }
        </Button>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p>Чем больше продуктов укажете, тем интереснее рецепты предложит ИИ.</p>
                <p>Базовые приправы (соль, перец, масло) добавляются автоматически.</p>
              </div>
            </div>
          </CardContent>
        </Card>
    </SectionPageFrame>
  );
}