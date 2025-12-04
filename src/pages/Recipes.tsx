import { useState } from 'react';
import { Plus, Search, Filter, Heart, Clock, Users, ChefHat, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useRecipes, useCreateRecipe, useUpdateRecipe, useDeleteRecipe, useOCR } from '@/hooks/useRecipes';
import type { Recipe, RecipeCategory, CuisineType, DifficultyLevel } from '@/types/recipe.types';

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

const DIFFICULTIES = [
  { value: 'easy', label: 'Легко', color: 'bg-green-500' },
  { value: 'medium', label: 'Средне', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Сложно', color: 'bg-red-500' }
];

const DIETARY_TAGS = [
  'вегетарианское',
  'веганское',
  'без глютена',
  'без лактозы',
  'детское',
  'диетическое',
  'постное'
];

export default function Recipes() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [addMethod, setAddMethod] = useState<'text' | 'photo' | 'ocr'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    category: 'other' as RecipeCategory,
    cuisine: 'russian' as CuisineType,
    cooking_time: '',
    difficulty: 'medium' as DifficultyLevel,
    servings: '4',
    ingredients: '',
    instructions: '',
    dietary_tags: [] as string[],
    image_url: ''
  });

  const { data: recipes = [], isLoading } = useRecipes({
    category: selectedCategory,
    cuisine: selectedCuisine,
    search: searchQuery,
    favorites: showFavoritesOnly
  });

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();
  const ocrMutation = useOCR();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadToStorage = async (): Promise<string | null> => {
    if (!uploadedImage) return null;

    try {
      const response = await fetch('https://functions.poehali.dev/d4f7f67f-fc6d-481f-96ca-6a6b4dd52c80', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: uploadedImage,
          fileName: 'recipe.jpg',
          folder: 'recipes'
        })
      });

      const data = await response.json();
      return data.url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleOCR = async () => {
    if (!uploadedImage) return;

    const imageUrl = await handleUploadToStorage();
    if (!imageUrl) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить изображение', variant: 'destructive' });
      return;
    }

    try {
      const result = await ocrMutation.mutateAsync(imageUrl);
      setNewRecipe(prev => ({
        ...prev,
        name: result.parsed.name || prev.name,
        ingredients: result.parsed.ingredients || prev.ingredients,
        instructions: result.parsed.instructions || prev.instructions,
        image_url: imageUrl
      }));
      toast({ title: 'Успех', description: 'Текст распознан! Проверьте и отредактируйте данные' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось распознать текст', variant: 'destructive' });
    }
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.name || !newRecipe.ingredients || !newRecipe.instructions) {
      toast({ title: 'Ошибка', description: 'Заполните название, ингредиенты и инструкции', variant: 'destructive' });
      return;
    }

    let finalImageUrl = newRecipe.image_url;
    if (uploadedImage && !finalImageUrl) {
      finalImageUrl = await handleUploadToStorage() || '';
    }

    try {
      await createRecipe.mutateAsync({
        ...newRecipe,
        cooking_time: newRecipe.cooking_time ? parseInt(newRecipe.cooking_time) : undefined,
        servings: parseInt(newRecipe.servings),
        image_url: finalImageUrl
      });

      toast({ title: 'Готово!', description: 'Рецепт добавлен' });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить рецепт', variant: 'destructive' });
    }
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    try {
      await updateRecipe.mutateAsync({
        id: recipe.id,
        is_favorite: !recipe.is_favorite
      });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    try {
      await deleteRecipe.mutateAsync(id);
      toast({ title: 'Готово', description: 'Рецепт удален' });
      setIsViewDialogOpen(false);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setNewRecipe({
      name: '',
      description: '',
      category: 'other',
      cuisine: 'russian',
      cooking_time: '',
      difficulty: 'medium',
      servings: '4',
      ingredients: '',
      instructions: '',
      dietary_tags: [],
      image_url: ''
    });
    setUploadedImage(null);
    setAddMethod('text');
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '🍴';
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="ChefHat" className="text-orange-600" size={32} />
              Рецепты
            </h1>
            <p className="text-gray-600 mt-1">Ваша семейная кулинарная книга</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2" size={20} />
            Добавить рецепт
          </Button>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-6">
          <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-orange-900 text-lg">
                    Как работать с рецептами
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-orange-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-orange-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">👩‍🍳 Для чего нужна книга рецептов?</p>
                        <p className="text-sm">
                          Собирайте все любимые рецепты семьи в одном месте! Больше не нужно искать записки в блокнотах или переписывать от бабушки. 
                          Всё рецепты всегда под рукой с любого устройства.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Возможности раздела</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>3 способа добавления:</strong> текст, фото блюда, сканирование рецепта (OCR)</li>
                          <li><strong>Категории:</strong> Завтраки, супы, основные блюда, десерты и др.</li>
                          <li><strong>Кухни мира:</strong> Русская, итальянская, азиатская и другие</li>
                          <li><strong>Фильтры:</strong> Поиск, категория, кухня, избранное</li>
                          <li><strong>Детали:</strong> Время приготовления, сложность, порции</li>
                          <li><strong>Диетические метки:</strong> Вегетарианское, без глютена, детское</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📝 Как добавить рецепт вручную?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите <strong>"Добавить рецепт"</strong> → выберите вкладку <strong>"Текст"</strong></li>
                          <li>Введите название блюда</li>
                          <li>Добавьте описание (опционально)</li>
                          <li>Выберите категорию и кухню</li>
                          <li>Укажите время приготовления, сложность и количество порций</li>
                          <li>Впишите список ингредиентов (каждый с новой строки)</li>
                          <li>Опишите шаги приготовления</li>
                          <li>Добавьте диетические метки если нужно</li>
                          <li>Можно добавить фото блюда</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📸 Как добавить рецепт через фото?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите <strong>"Добавить рецепт"</strong> → выберите <strong>"Фото"</strong></li>
                          <li>Загрузите фотографию готового блюда</li>
                          <li>AI автоматически распознает блюдо</li>
                          <li>Проверьте и дополните данные при необходимости</li>
                          <li>Сохраните рецепт</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📜 Как оцифровать старый рецепт? (OCR)</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите <strong>"Добавить рецепт"</strong> → выберите <strong>"OCR"</strong></li>
                          <li>Сфотографируйте рецепт из книги или блокнота</li>
                          <li>AI распознает текст и структурирует рецепт</li>
                          <li>Проверьте результат и исправьте ошибки если есть</li>
                          <li>Сохраните — рецепт бабушки теперь в цифровом виде!</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">❤️ Избранное и поиск</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Нажимайте на сердечко чтобы добавить в избранное</li>
                          <li>Кнопка с сердечком вверху показывает только любимые</li>
                          <li>Используйте поиск по названию или ингредиентам</li>
                          <li>Фильтруйте по категориям и кухням</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Полезные советы</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Семейные рецепты:</strong> Оцифруйте рецепты бабушек и мам через OCR</li>
                          <li><strong>Планируйте меню:</strong> Связывайте с разделом "Питание"</li>
                          <li><strong>Список покупок:</strong> Копируйте ингредиенты в раздел "Покупки"</li>
                          <li><strong>Фотографируйте:</strong> Добавляйте фото готовых блюд — так легче запомнить</li>
                          <li><strong>Корректируйте:</strong> Редактируйте рецепты по своему вкусу</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🔄 Связь с другими разделами</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Планируйте меню на неделю в разделе "Питание"</li>
                          <li>Добавляйте ингредиенты в "Покупки"</li>
                          <li>Сохраняйте рецепты из семейных традиций</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Используйте OCR чтобы оцифровать рецепты из старых книг и блокнотов. 
                          Так вы сохраните семейные рецепты навсегда!
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по названию или ингредиентам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as RecipeCategory | 'all')}>
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
              <Select value={selectedCuisine} onValueChange={(v) => setSelectedCuisine(v as CuisineType | 'all')}>
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
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly ? 'bg-pink-600 hover:bg-pink-700' : ''}
              >
                <Heart className={showFavoritesOnly ? 'fill-current' : ''} size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка рецептов...</p>
          </div>
        ) : recipes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ChefHat className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-xl text-gray-600 mb-2">Рецептов пока нет</p>
              <p className="text-gray-500 mb-4">Добавьте свой первый рецепт!</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2" size={20} />
                Добавить рецепт
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setIsViewDialogOpen(true);
                }}
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
                        handleToggleFavorite(recipe);
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
            ))}
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить рецепт</DialogTitle>
            </DialogHeader>

            <Tabs value={addMethod} onValueChange={(v) => setAddMethod(v as 'text' | 'photo' | 'ocr')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Текст
                </TabsTrigger>
                <TabsTrigger value="photo">
                  <ImageIcon size={16} className="mr-2" />
                  Фото
                </TabsTrigger>
                <TabsTrigger value="ocr">
                  <Icon name="ScanText" size={16} className="mr-2" />
                  Распознать
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div>
                  <Label>Название *</Label>
                  <Input
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                    placeholder="Борщ"
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Input
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                    placeholder="Традиционный украинский суп"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Категория</Label>
                    <Select value={newRecipe.category} onValueChange={(v) => setNewRecipe({ ...newRecipe, category: v as RecipeCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Кухня</Label>
                    <Select value={newRecipe.cuisine} onValueChange={(v) => setNewRecipe({ ...newRecipe, cuisine: v as CuisineType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CUISINES.filter(c => c.value !== 'all').map(cuisine => (
                          <SelectItem key={cuisine.value} value={cuisine.value}>
                            {cuisine.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Время (мин)</Label>
                    <Input
                      type="number"
                      value={newRecipe.cooking_time}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cooking_time: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <Label>Сложность</Label>
                    <Select value={newRecipe.difficulty} onValueChange={(v) => setNewRecipe({ ...newRecipe, difficulty: v as DifficultyLevel })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map(diff => (
                          <SelectItem key={diff.value} value={diff.value}>
                            {diff.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Порций</Label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Ингредиенты *</Label>
                  <Textarea
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    placeholder="Свекла - 2 шт&#10;Капуста - 300г&#10;Мясо - 500г"
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Инструкции *</Label>
                  <Textarea
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    placeholder="1. Сварить мясо&#10;2. Добавить овощи&#10;3. Варить 1 час"
                    rows={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="photo" className="space-y-4 mt-4">
                <div>
                  <Label>Загрузить фото</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                  {uploadedImage && (
                    <div className="mt-4">
                      <img src={`data:image/jpeg;base64,${uploadedImage}`} alt="Preview" className="max-w-full h-64 object-cover rounded" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  После загрузки фото заполните информацию о рецепте на вкладке "Текст"
                </p>
              </TabsContent>

              <TabsContent value="ocr" className="space-y-4 mt-4">
                <div>
                  <Label>Загрузить фото рецепта</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                  {uploadedImage && (
                    <div className="mt-4">
                      <img src={`data:image/jpeg;base64,${uploadedImage}`} alt="Preview" className="max-w-full h-64 object-cover rounded" />
                      <Button
                        onClick={handleOCR}
                        disabled={ocrMutation.isPending}
                        className="mt-4 w-full"
                      >
                        {ocrMutation.isPending ? 'Распознаю текст...' : 'Распознать текст'}
                      </Button>
                    </div>
                  )}
                </div>
                {newRecipe.instructions && (
                  <div className="space-y-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={newRecipe.name}
                        onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Ингредиенты</Label>
                      <Textarea
                        value={newRecipe.ingredients}
                        onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                        rows={5}
                      />
                    </div>
                    <div>
                      <Label>Инструкции</Label>
                      <Textarea
                        value={newRecipe.instructions}
                        onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                        rows={5}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateRecipe} disabled={createRecipe.isPending}>
                {createRecipe.isPending ? 'Добавление...' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(selectedRecipe.category)}</span>
                    {selectedRecipe.name}
                  </DialogTitle>
                </DialogHeader>
                {selectedRecipe.image_url && (
                  <img src={selectedRecipe.image_url} alt={selectedRecipe.name} className="w-full h-64 object-cover rounded" />
                )}
                {selectedRecipe.description && (
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getDifficultyColor(selectedRecipe.difficulty)} text-white`}>
                    {DIFFICULTIES.find(d => d.value === selectedRecipe.difficulty)?.label}
                  </Badge>
                  {selectedRecipe.cooking_time && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock size={14} />
                      {selectedRecipe.cooking_time} мин
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users size={14} />
                    {selectedRecipe.servings} порций
                  </Badge>
                  <Badge variant="secondary">
                    {CUISINES.find(c => c.value === selectedRecipe.cuisine)?.label}
                  </Badge>
                  {selectedRecipe.dietary_tags?.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ингредиенты:</h4>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                    {selectedRecipe.ingredients}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Приготовление:</h4>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                    {selectedRecipe.instructions}
                  </pre>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleToggleFavorite(selectedRecipe)}>
                    <Heart className={selectedRecipe.is_favorite ? 'fill-current text-pink-600' : ''} size={20} />
                    {selectedRecipe.is_favorite ? 'Убрать из избранного' : 'В избранное'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                    disabled={deleteRecipe.isPending}
                  >
                    Удалить
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}