import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

const NUTRITION_API_URL = 'https://functions.poehali.dev/c592ffff-18dd-4d1c-b199-ff8832c83a2c';

interface NutritionData {
  date: string;
  totals: {
    total_calories: number;
    total_protein: number;
    total_fats: number;
    total_carbs: number;
    entries_count: number;
  };
  by_meal: Array<{
    meal_type: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  }>;
  goals: {
    daily_calories: number;
    daily_protein: number;
    daily_fats: number;
    daily_carbs: number;
  };
  progress: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
}

interface FoodDiaryEntry {
  id: number;
  meal_type: string;
  product_name: string;
  amount: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  created_at: string;
}

export default function Nutrition() {
  const navigate = useNavigate();
  const { members } = useFamilyMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [foodDiary, setFoodDiary] = useState<FoodDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    product_id: null as number | null,
    product_name: '',
    amount: '',
    meal_type: 'breakfast'
  });
  const [editingEntry, setEditingEntry] = useState<FoodDiaryEntry | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadNutritionData();
    loadFoodDiary();
  }, [selectedMemberId]);

  const loadNutritionData = async () => {
    try {
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=analytics&user_id=${selectedMemberId}&date=${today}`
      );
      if (!response.ok) {
        console.error('Error loading nutrition data:', response.status, response.statusText);
        setNutritionData({
          date: today,
          totals: { total_calories: 0, total_protein: 0, total_fats: 0, total_carbs: 0, entries_count: 0 },
          by_meal: [],
          goals: { daily_calories: 2000, daily_protein: 100, daily_fats: 70, daily_carbs: 250 },
          progress: { calories: 0, protein: 0, fats: 0, carbs: 0 }
        });
        return;
      }
      const data = await response.json();
      setNutritionData(data);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
      setNutritionData({
        date: today,
        totals: { total_calories: 0, total_protein: 0, total_fats: 0, total_carbs: 0, entries_count: 0 },
        by_meal: [],
        goals: { daily_calories: 2000, daily_protein: 100, daily_fats: 70, daily_carbs: 250 },
        progress: { calories: 0, protein: 0, fats: 0, carbs: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFoodDiary = async () => {
    try {
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=diary&user_id=${selectedMemberId}&date=${today}`
      );
      const data = await response.json();
      setFoodDiary(data.diary || []);
    } catch (error) {
      console.error('Ошибка загрузки дневника:', error);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=search&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Ошибка поиска продуктов:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.product_id && !newEntry.product_name) return;
    if (!newEntry.amount) return;

    try {
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_diary',
          user_id: selectedMemberId,
          meal_type: newEntry.meal_type,
          product_id: newEntry.product_id,
          product_name: newEntry.product_name,
          amount: parseFloat(newEntry.amount)
        })
      });

      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
        setIsAddDialogOpen(false);
        setNewEntry({
          product_id: null,
          product_name: '',
          amount: '',
          meal_type: 'breakfast'
        });
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Ошибка добавления записи:', error);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_diary',
          entry_id: entryId
        })
      });

      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
      }
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
    }
  };

  const handleEditEntry = (entry: FoodDiaryEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_diary',
          entry_id: editingEntry.id,
          amount: parseFloat(editingEntry.amount.toString()),
          meal_type: editingEntry.meal_type
        })
      });

      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
        setIsEditDialogOpen(false);
        setEditingEntry(null);
      }
    } catch (error) {
      console.error('Ошибка обновления записи:', error);
    }
  };

  const selectProduct = (product: any) => {
    setNewEntry({
      ...newEntry,
      product_id: product.id,
      product_name: product.name
    });
    setSearchQuery(product.name);
    setSearchResults([]);
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: '🍳 Завтрак',
      lunch: '🍽️ Обед',
      dinner: '🍷 Ужин',
      snack: '🍎 Перекус'
    };
    return labels[type] || type;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 80) return 'bg-green-500';
    if (progress < 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress < 50) return { icon: 'TrendingDown', text: 'Мало', color: 'text-blue-500' };
    if (progress < 80) return { icon: 'CheckCircle2', text: 'Отлично', color: 'text-green-500' };
    if (progress < 100) return { icon: 'AlertCircle', text: 'Близко к норме', color: 'text-yellow-500' };
    return { icon: 'AlertTriangle', text: 'Превышение', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!nutritionData) return null;

  const caloriesStatus = getProgressStatus(nutritionData.progress.calories);
  const proteinStatus = getProgressStatus(nutritionData.progress.protein);
  const fatsStatus = getProgressStatus(nutritionData.progress.fats);
  const carbsStatus = getProgressStatus(nutritionData.progress.carbs);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Icon name="Apple" className="text-green-600" size={36} />
              Питание
            </h1>
            <p className="text-gray-600 mt-1">Анализ и контроль питания семьи</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-green-900 text-lg">
                    Как пользоваться разделом Питание
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-green-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🍎 Для чего нужен раздел Питание?</p>
                        <p className="text-sm">
                          Раздел помогает отслеживать питание всей семьи: калории, белки, жиры, углеводы. 
                          Вы видите, сколько съели сегодня и сколько осталось до дневной нормы.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📝 Как добавить приём пищи?</p>
                        <ol className="text-sm space-y-1 ml-4 list-decimal">
                          <li>Нажмите кнопку "Добавить приём пищи"</li>
                          <li>Выберите тип приёма: завтрак, обед, ужин или перекус</li>
                          <li>Введите название продукта в поиск (например, "молоко")</li>
                          <li>Выберите продукт из списка или введите свой</li>
                          <li>Укажите количество в граммах</li>
                          <li>Нажмите "Добавить" — данные автоматически пересчитаются</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">👨‍👩‍👧‍👦 Как отслеживать питание семьи?</p>
                        <p className="text-sm">
                          Переключайтесь между членами семьи с помощью кнопок с аватарами. 
                          У каждого свой дневник питания и индивидуальные нормы калорий.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🤖 Кузя-диетолог в помощь!</p>
                        <p className="text-sm">
                          Нажмите "Спросить Кузю-диетолога" — он проанализирует ваш рацион, 
                          подскажет сколько калорий в блюде и предложит здоровые альтернативы.
                        </p>
                      </div>

                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium mb-1 text-sm">💡 Совет:</p>
                        <p className="text-sm">
                          Заполняйте дневник сразу после еды — так проще не забыть. 
                          В базе уже 60+ популярных продуктов с точными данными по КБЖУ.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {/* Выбор члена семьи */}
        {members.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {members.map((member) => (
                  <Button
                    key={member.id}
                    variant={selectedMemberId === parseInt(member.id) ? 'default' : 'outline'}
                    onClick={() => setSelectedMemberId(parseInt(member.id))}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="text-xl">{member.avatar}</span>
                    {member.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Главная статистика */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Icon name="Flame" size={28} />
              Калории сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-bold">
                  {Math.round(nutritionData.totals.total_calories)}
                </div>
                <div className="text-xl opacity-90">
                  / {nutritionData.goals.daily_calories} ккал
                </div>
              </div>
              <Progress 
                value={nutritionData.progress.calories} 
                className="h-3 bg-white/20"
              />
              <div className="flex items-center gap-2 text-sm">
                <Icon name={caloriesStatus.icon} size={18} />
                <span>{caloriesStatus.text} — {Math.round(nutritionData.progress.calories)}% от нормы</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка добавления */}
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Добавить приём пищи
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Добавить приём пищи</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Тип приёма пищи</Label>
                  <Select
                    value={newEntry.meal_type}
                    onValueChange={(value) => setNewEntry({ ...newEntry, meal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">🍳 Завтрак</SelectItem>
                      <SelectItem value="lunch">🍽️ Обед</SelectItem>
                      <SelectItem value="dinner">🍷 Ужин</SelectItem>
                      <SelectItem value="snack">🍎 Перекус</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Продукт</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchProducts(e.target.value);
                    }}
                    placeholder="Начните вводить название..."
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-0"
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.calories} ккал • Б: {product.protein}г • Ж: {product.fats}г • У: {product.carbs}г
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Количество (граммов)</Label>
                  <Input
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddEntry}>
                  Добавить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* БЖУ карточки */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Beef" size={18} className="text-red-500" />
                Белки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_protein)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_protein}г
              </div>
              <Progress 
                value={nutritionData.progress.protein} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.protein)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${proteinStatus.color}`}>
                <Icon name={proteinStatus.icon} size={14} />
                {proteinStatus.text}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Droplet" size={18} className="text-yellow-500" />
                Жиры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_fats)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_fats}г
              </div>
              <Progress 
                value={nutritionData.progress.fats} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.fats)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${fatsStatus.color}`}>
                <Icon name={fatsStatus.icon} size={14} />
                {fatsStatus.text}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Wheat" size={18} className="text-orange-500" />
                Углеводы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_carbs)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_carbs}г
              </div>
              <Progress 
                value={nutritionData.progress.carbs} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.carbs)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${carbsStatus.color}`}>
                <Icon name={carbsStatus.icon} size={14} />
                {carbsStatus.text}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дневник питания */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} />
              Дневник питания
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foodDiary.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="UtensilsCrossed" size={48} className="mx-auto mb-4 opacity-30" />
                <p>Записей пока нет</p>
                <p className="text-sm mt-2">Добавьте приём пищи в разделе "Меню"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                  const meals = foodDiary.filter(entry => entry.meal_type === mealType);
                  if (meals.length === 0) return null;
                  
                  const totalCal = meals.reduce((sum, m) => sum + m.calories, 0);
                  
                  return (
                    <div key={mealType} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{getMealTypeLabel(mealType)}</h3>
                        <Badge variant="secondary">{Math.round(totalCal)} ккал</Badge>
                      </div>
                      <div className="space-y-2">
                        {meals.map(meal => (
                          <div key={meal.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2 group">
                            <div>
                              <div className="font-medium">{meal.product_name}</div>
                              <div className="text-gray-500 text-xs">
                                {meal.amount}г · Б: {Math.round(meal.protein)}г · Ж: {Math.round(meal.fats)}г · У: {Math.round(meal.carbs)}г
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="font-semibold">{Math.round(meal.calories)} ккал</div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                                onClick={() => handleEditEntry(meal)}
                              >
                                <Icon name="Pencil" size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                onClick={() => handleDeleteEntry(meal.id)}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопка спросить Кузю */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <Button 
              onClick={() => navigate('/ai-assistant')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Sparkles" className="mr-2" />
              Спросить Кузю-диетолога
            </Button>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Кузя проанализирует ваше питание и даст персональные рекомендации
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <Label>Продукт</Label>
                <Input value={editingEntry.product_name} disabled className="bg-gray-100" />
              </div>

              <div>
                <Label>Приём пищи</Label>
                <Select 
                  value={editingEntry.meal_type} 
                  onValueChange={(value) => setEditingEntry({ ...editingEntry, meal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🍳 Завтрак</SelectItem>
                    <SelectItem value="lunch">🍽️ Обед</SelectItem>
                    <SelectItem value="dinner">🍷 Ужин</SelectItem>
                    <SelectItem value="snack">🍎 Перекус</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Количество (граммов)</Label>
                <Input
                  type="number"
                  value={editingEntry.amount}
                  onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateEntry}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}