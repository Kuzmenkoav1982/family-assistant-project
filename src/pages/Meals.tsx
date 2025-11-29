import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { MealDialog } from '@/components/meals/MealDialog';
import { DayColumn } from '@/components/meals/DayColumn';

const STORAGE_KEY = 'family_meal_plan';

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
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' }
];

const MEAL_TYPES = [
  { value: 'breakfast', label: '🍳 Завтрак', emoji: '🍳' },
  { value: 'lunch', label: '🍽️ Обед', emoji: '🍽️' },
  { value: 'dinner', label: '🍷 Ужин', emoji: '🍷' }
];

export default function Meals() {
  const navigate = useNavigate();
  const { members } = useFamilyMembers();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');

  const [newMeal, setNewMeal] = useState({
    day: 'monday',
    mealType: 'breakfast' as MealPlan['mealType'],
    dishName: '',
    description: '',
    emoji: '🍳'
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMealPlans(JSON.parse(saved));
    }
  }, []);

  const saveMealPlans = (updated: MealPlan[]) => {
    setMealPlans(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddMeal = () => {
    if (!newMeal.dishName.trim()) return;

    const currentMember = members[0] || { id: 'demo', name: 'Пользователь', avatar: '👤' };

    if (editingMeal) {
      const updated = mealPlans.map(m =>
        m.id === editingMeal.id
          ? {
              ...m,
              day: newMeal.day,
              mealType: newMeal.mealType,
              dishName: newMeal.dishName,
              description: newMeal.description,
              emoji: newMeal.emoji
            }
          : m
      );
      saveMealPlans(updated);
      setEditingMeal(null);
    } else {
      const meal: MealPlan = {
        id: Date.now().toString(),
        day: newMeal.day,
        mealType: newMeal.mealType,
        dishName: newMeal.dishName,
        description: newMeal.description,
        emoji: newMeal.emoji,
        addedBy: currentMember.id,
        addedByName: currentMember.name,
        addedAt: new Date().toISOString()
      };

      saveMealPlans([...mealPlans, meal]);
    }

    setNewMeal({
      day: 'monday',
      mealType: 'breakfast',
      dishName: '',
      description: '',
      emoji: '🍳'
    });
    setIsDialogOpen(false);
  };

  const handleEditMeal = (meal: MealPlan) => {
    setEditingMeal(meal);
    setNewMeal({
      day: meal.day,
      mealType: meal.mealType,
      dishName: meal.dishName,
      description: meal.description || '',
      emoji: meal.emoji || '🍳'
    });
    setIsDialogOpen(true);
  };

  const deleteMeal = (id: string) => {
    saveMealPlans(mealPlans.filter(m => m.id !== id));
  };

  const getMealsForDay = (day: string) => {
    const filtered = mealPlans.filter(m => m.day === day);
    if (selectedAuthor === 'all') return filtered;
    return filtered.filter(m => m.addedBy === selectedAuthor);
  };

  const getMealsByType = (day: string, type: MealPlan['mealType']) => {
    const filtered = mealPlans.filter(m => m.day === day && m.mealType === type);
    if (selectedAuthor === 'all') return filtered;
    return filtered.filter(m => m.addedBy === selectedAuthor);
  };

  const getUniqueAuthors = () => {
    const authors = new Map<string, { id: string; name: string }>();
    mealPlans.forEach(meal => {
      if (!authors.has(meal.addedBy)) {
        authors.set(meal.addedBy, { id: meal.addedBy, name: meal.addedByName });
      }
    });
    return Array.from(authors.values());
  };

  const selectedDayLabel = DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label || 'День';
  const mealsForSelectedDay = getMealsForDay(selectedDay);
  
  const getFilteredMealsCount = () => {
    if (selectedAuthor === 'all') return mealPlans.length;
    return mealPlans.filter(m => m.addedBy === selectedAuthor).length;
  };

  const handleQuickAddMeal = (day: string, mealType: MealPlan['mealType']) => {
    setEditingMeal(null);
    const selectedType = MEAL_TYPES.find(t => t.value === mealType);
    setNewMeal({
      day: day,
      mealType: mealType,
      dishName: '',
      description: '',
      emoji: selectedType?.emoji || '🍳'
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white">
              <Icon name="UtensilsCrossed" size={14} className="mr-1" />
              {selectedAuthor === 'all' 
                ? `Блюд на неделю: ${mealPlans.length}`
                : `Блюд автора: ${getFilteredMealsCount()}`
              }
            </Badge>
          </div>
        </div>

        {mealPlans.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p><strong>Как пользоваться:</strong> Нажмите оранжевую кнопку "Добавить блюдо" справа вверху, или используйте кнопку "+ Добавить" внутри нужного приёма пищи для быстрого добавления.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="UtensilsCrossed" size={28} />
                Меню на неделю
              </CardTitle>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto text-lg py-6 md:py-2" 
                onClick={() => {
                  setEditingMeal(null);
                  setNewMeal({
                    day: 'monday',
                    mealType: 'breakfast',
                    dishName: '',
                    description: '',
                    emoji: '🍳'
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить блюдо
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mealPlans.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Фильтр по автору</label>
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все авторы</SelectItem>
                      {getUniqueAuthors().map(author => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Выбрать день</label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {mealPlans.length === 0 ? (
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="text-6xl">🍽️</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Меню пусто</h3>
                    <p className="text-muted-foreground mb-4">
                      Начните планировать меню для вашей семьи! Добавьте первое блюдо.
                    </p>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        setEditingMeal(null);
                        setNewMeal({
                          day: 'monday',
                          mealType: 'breakfast',
                          dishName: '',
                          description: '',
                          emoji: '🍳'
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Icon name="Plus" size={20} className="mr-2" />
                      Добавить первое блюдо
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="hidden md:grid md:grid-cols-7 gap-4">
                {DAYS_OF_WEEK.map(day => (
                  <DayColumn
                    key={day.value}
                    dayValue={day.value}
                    dayLabel={day.label}
                    getMealsByType={getMealsByType}
                    onQuickAdd={handleQuickAddMeal}
                    onEdit={handleEditMeal}
                    onDelete={deleteMeal}
                  />
                ))}
              </div>
            )}

            {mealPlans.length > 0 && (
              <Card className="md:hidden bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center">{selectedDayLabel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MEAL_TYPES.map(mealType => {
                    const meals = getMealsByType(selectedDay, mealType.value as MealPlan['mealType']);
                    return (
                      <div key={mealType.value} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold flex items-center gap-1">
                            <span>{mealType.emoji}</span>
                            <span>{mealType.label.replace(mealType.emoji, '').trim()}</span>
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleQuickAddMeal(selectedDay, mealType.value as MealPlan['mealType'])}
                          >
                            <Icon name="Plus" size={12} className="mr-1" />
                            Добавить
                          </Button>
                        </div>

                        {meals.length === 0 ? (
                          <Card className="bg-white/50 border-dashed">
                            <CardContent className="p-3 text-center text-xs text-muted-foreground">
                              Нет блюд
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-2">
                            {meals.map(meal => (
                              <Card key={meal.id} className="bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                      <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm break-words">{meal.dishName}</h4>
                                        {meal.description && (
                                          <p className="text-xs text-muted-foreground mt-1 break-words">{meal.description}</p>
                                        )}
                                        <Badge variant="outline" className="mt-2 text-[10px] px-1 py-0">
                                          <Icon name="User" size={10} className="mr-1" />
                                          {meal.addedByName}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleEditMeal(meal)}
                                      >
                                        <Icon name="Edit2" size={14} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => deleteMeal(meal.id)}
                                      >
                                        <Icon name="Trash2" size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <MealDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingMeal={editingMeal}
        newMeal={newMeal}
        setNewMeal={setNewMeal}
        handleAddMeal={handleAddMeal}
      />
    </div>
  );
}
