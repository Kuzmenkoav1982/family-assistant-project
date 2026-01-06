import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useRecipes, useCreateRecipe, useUpdateRecipe, useDeleteRecipe, useOCR, useStorageStats } from '@/hooks/useRecipes';
import type { Recipe, RecipeCategory, CuisineType, DifficultyLevel } from '@/types/recipe.types';
import { RecipesFilters } from '@/components/recipes/RecipesFilters';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { AddRecipeDialog } from '@/components/recipes/AddRecipeDialog';
import { RecipeViewDialog } from '@/components/recipes/RecipeViewDialog';

export default function Recipes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [addMethod, setAddMethod] = useState<'text' | 'photo' | 'ocr'>('text');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
    image_url: '',
    images: [] as string[]
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
  const { data: storageStats } = useStorageStats();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast({ title: 'Ограничение', description: 'Максимум 5 фотографий на рецепт', variant: 'destructive' });
      return;
    }

    if (storageStats?.is_limit_reached) {
      toast({ 
        title: 'Лимит исчерпан', 
        description: `Достигнут лимит хранилища (${storageStats.limits.free_photos} фото / ${storageStats.limits.free_size_mb} МБ). Оформите подписку для увеличения.`,
        variant: 'destructive'
      });
      return;
    }

    if (storageStats && (storageStats.photo_count + uploadedImages.length + files.length > storageStats.limits.free_photos)) {
      toast({ 
        title: 'Превышен лимит', 
        description: `Можно загрузить ещё ${storageStats.limits.free_photos - storageStats.photo_count - uploadedImages.length} фото`,
        variant: 'destructive'
      });
      return;
    }

    const base64Files: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          base64Files.push(base64.split(',')[1]);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    setUploadedImages(prev => [...prev, ...base64Files]);
  };

  const handleUploadToStorage = async (base64Image: string): Promise<string | null> => {
    if (!base64Image) {
      console.log('handleUploadToStorage: empty base64Image');
      return null;
    }

    console.log('handleUploadToStorage: starting upload, base64 length:', base64Image.length);

    try {
      const payload = {
        file: base64Image,
        fileName: 'recipe.jpg',
        folder: 'recipes'
      };
      console.log('handleUploadToStorage: payload prepared');

      const response = await fetch('https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('handleUploadToStorage: response status:', response.status);

      const data = await response.json();
      console.log('handleUploadToStorage: response data:', data);
      
      return data.url || null;
    } catch (error) {
      console.error('handleUploadToStorage: ERROR:', error);
      return null;
    }
  };

  const handleOCR = async () => {
    if (uploadedImages.length === 0) return;

    const imageUrl = await handleUploadToStorage(uploadedImages[0]);
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

    if (storageStats?.is_limit_reached && uploadedImages.length > 0) {
      toast({ 
        title: 'Лимит исчерпан', 
        description: 'Достигнут лимит хранилища. Оформите подписку.',
        variant: 'destructive'
      });
      return;
    }

    let finalImageUrl = newRecipe.image_url;
    const finalImages: string[] = [];

    console.log('=== UPLOAD DEBUG ===');
    console.log('uploadedImages.length:', uploadedImages.length);
    console.log('uploadedImages[0] length:', uploadedImages[0]?.length);

    if (uploadedImages.length > 0) {
      toast({ title: 'Загрузка...', description: `Загружаю ${uploadedImages.length} фото` });
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const base64 = uploadedImages[i];
        console.log(`Uploading image ${i + 1}/${uploadedImages.length}, base64 length:`, base64.length);
        
        const url = await handleUploadToStorage(base64);
        console.log(`Image ${i + 1} uploaded, URL:`, url);
        
        if (url) {
          finalImages.push(url);
        } else {
          console.error(`Failed to upload image ${i + 1}`);
        }
      }

      console.log('Final images array:', finalImages);
      console.log('Final images count:', finalImages.length);
      
      if (finalImages.length > 0 && !finalImageUrl) {
        finalImageUrl = finalImages[0];
      }
    }

    try {
      if (isEditMode && selectedRecipe) {
        const existingImages = newRecipe.images || [];
        const allImages = [...existingImages, ...finalImages];
        
        console.log('UPDATE - Existing images:', existingImages);
        console.log('UPDATE - Final images:', finalImages);
        console.log('UPDATE - All images:', allImages);
        
        await updateRecipe.mutateAsync({
          id: selectedRecipe.id,
          ...newRecipe,
          cooking_time: newRecipe.cooking_time ? parseInt(newRecipe.cooking_time) : undefined,
          servings: parseInt(newRecipe.servings),
          image_url: finalImageUrl || newRecipe.image_url,
          images: allImages
        });
        toast({ title: 'Готово!', description: 'Рецепт обновлён' });
      } else {
        console.log('CREATE - Final images:', finalImages);
        console.log('CREATE - Payload:', {
          ...newRecipe,
          cooking_time: newRecipe.cooking_time ? parseInt(newRecipe.cooking_time) : undefined,
          servings: parseInt(newRecipe.servings),
          image_url: finalImageUrl,
          images: finalImages
        });
        
        await createRecipe.mutateAsync({
          ...newRecipe,
          cooking_time: newRecipe.cooking_time ? parseInt(newRecipe.cooking_time) : undefined,
          servings: parseInt(newRecipe.servings),
          image_url: finalImageUrl,
          images: finalImages
        });
        toast({ title: 'Готово!', description: 'Рецепт добавлен' });
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Ошибка', description: isEditMode ? 'Не удалось обновить рецепт' : 'Не удалось добавить рецепт', variant: 'destructive' });
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
  
  const handleEditRecipe = (recipe: Recipe) => {
    setNewRecipe({
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category,
      cuisine: recipe.cuisine,
      cooking_time: recipe.cooking_time?.toString() || '',
      difficulty: recipe.difficulty,
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      dietary_tags: recipe.dietary_tags || [],
      image_url: recipe.image_url || '',
      images: recipe.images || []
    });
    setSelectedRecipe(recipe);
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
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
      image_url: '',
      images: []
    });
    setUploadedImages([]);
    setAddMethod('text');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="ChefHat" className="text-orange-600" size={32} />
                Рецепты
              </h1>
              <p className="text-gray-600 mt-1">Ваша семейная кулинарная книга</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2" size={20} />
              Добавить рецепт
            </Button>
            {storageStats && (
              <div className="bg-white px-4 py-3 rounded-lg border shadow-sm min-w-[280px]">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Database" size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Хранилище</span>
                  {storageStats.is_limit_reached && (
                    <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      Лимит достигнут
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Фотографии</span>
                      <span className="font-medium">
                        {storageStats.photo_count} / {storageStats.limits.free_photos}
                      </span>
                    </div>
                    <Progress 
                      value={storageStats.usage_percent.photos} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Размер</span>
                      <span className="font-medium">
                        {storageStats.total_size_mb} / {storageStats.limits.free_size_mb} МБ
                      </span>
                    </div>
                    <Progress 
                      value={storageStats.usage_percent.size} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-6">
          <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-full p-2 shadow-md">
                <Icon name="Info" className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-orange-900 text-lg">
                      👩‍🍳 Как работать с рецептами
                    </h3>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-medium">
                      Инструкция
                    </span>
                  </div>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-6 w-6 text-orange-600 transition-transform group-hover:scale-110" 
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
                          <li><strong>Множественная загрузка:</strong> До 5 фотографий сразу при создании рецепта</li>
                          <li><strong>Галерея фото:</strong> Просмотр всех фото с навигацией и миниатюрами</li>
                          <li><strong>Редактирование:</strong> Изменяйте рецепты, добавляйте/удаляйте фото</li>
                          <li><strong>Лимиты хранилища:</strong> 100 фото или 500 МБ (бесплатно)</li>
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
                          <li><strong>Загрузите до 5 фото сразу:</strong> выберите несколько файлов, первое станет обложкой</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📸 Как добавить рецепт через фото?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите <strong>"Добавить рецепт"</strong> → выберите <strong>"Фото"</strong></li>
                          <li><strong>Выберите до 5 фото сразу:</strong> готовое блюдо, процесс приготовления</li>
                          <li>Миниатюры появятся ниже (можно удалить крестиком при наведении)</li>
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
                        <p className="font-medium mb-2">✏️ Как изменить рецепт?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Откройте рецепт (клик по карточке)</li>
                          <li>Нажмите кнопку <strong>"Изменить"</strong> внизу</li>
                          <li>Отредактируйте нужные поля</li>
                          <li>Добавьте или удалите фото (до 5 штук)</li>
                          <li>Сохраните изменения</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📸 Галерея фото и хранилище</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Добавляйте до <strong>5 фотографий сразу</strong> при создании рецепта</li>
                          <li>Первое фото — обложка (показывается в списке)</li>
                          <li>Навигация стрелками, миниатюры внизу, счётчик фото (1 / 5)</li>
                          <li><strong>Лимит бесплатно:</strong> 100 фото или 500 МБ</li>
                          <li>Прогресс-бар показывает использование хранилища</li>
                          <li>При достижении лимита появится уведомление о подписке</li>
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
                        <p className="text-sm">
                          📖 <strong>Подробнее:</strong> <a href="/instructions" className="text-orange-600 hover:underline">Полная инструкция в разделе "Инструкции"</a>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Загружайте несколько фото сразу — так удобнее! OCR поможет оцифровать старые рецепты. 
                          Следите за лимитом хранилища в правом верхнем углу.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <RecipesFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedCuisine={selectedCuisine}
          onCuisineChange={setSelectedCuisine}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Загрузка рецептов...</p>
            </CardContent>
          </Card>
        ) : recipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="ChefHat" className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg mb-2">Нет рецептов</p>
              <p className="text-gray-400 text-sm mb-6">
                {showFavoritesOnly 
                  ? 'У вас пока нет избранных рецептов'
                  : 'Добавьте первый рецепт в вашу кулинарную книгу'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2" size={20} />
                Добавить рецепт
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onCardClick={(r) => {
                  setSelectedRecipe(r);
                  setIsViewDialogOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        <AddRecipeDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
          newRecipe={newRecipe}
          onRecipeChange={setNewRecipe}
          onSave={handleCreateRecipe}
          isSaving={createRecipe.isPending}
          addMethod={addMethod}
          onMethodChange={setAddMethod}
          uploadedImages={uploadedImages}
          onImageUpload={handleImageUpload}
          onRemoveImage={(index) => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
          onOCR={handleOCR}
          isOCRProcessing={ocrMutation.isPending}
        />

        <RecipeViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          recipe={selectedRecipe}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteRecipe}
          onEdit={handleEditRecipe}
          isDeleting={deleteRecipe.isPending}
        />
      </div>
    </div>
  );
}