import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useRecipes, useCreateRecipe, useUpdateRecipe, useDeleteRecipe, useOCR } from '@/hooks/useRecipes';
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
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
          onOCR={handleOCR}
          isOCRProcessing={ocrMutation.isPending}
        />

        <RecipeViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          recipe={selectedRecipe}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteRecipe}
          isDeleting={deleteRecipe.isPending}
        />
      </div>
    </div>
  );
}