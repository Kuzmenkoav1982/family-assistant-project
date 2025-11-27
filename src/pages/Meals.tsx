import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

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

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="UtensilsCrossed" size={28} />
                Меню на неделю
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setEditingMeal(null)}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить блюдо
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMeal ? 'Редактировать блюдо' : 'Добавить блюдо в меню'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">День недели</label>
                      <Select
                        value={newMeal.day}
                        onValueChange={(value) => setNewMeal({ ...newMeal, day: value })}
                      >
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">Приём пищи</label>
                      <Select
                        value={newMeal.mealType}
                        onValueChange={(value: MealPlan['mealType']) => {
                          const mealType = MEAL_TYPES.find(m => m.value === value);
                          setNewMeal({ 
                            ...newMeal, 
                            mealType: value,
                            emoji: mealType?.emoji || '🍳'
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название блюда</label>
                      <Input
                        placeholder="Омлет с овощами, Борщ..."
                        value={newMeal.dishName}
                        onChange={(e) => setNewMeal({ ...newMeal, dishName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание (опционально)</label>
                      <Textarea
                        placeholder="Особенности приготовления, ингредиенты..."
                        value={newMeal.description}
                        onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddMeal} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Icon name={editingMeal ? "Save" : "Plus"} size={18} className="mr-2" />
                      {editingMeal ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block text-gray-700">Фильтр по автору</label>
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Icon name="Users" size={16} />
                          Все члены семьи
                        </div>
                      </SelectItem>
                      {getUniqueAuthors().map(author => (
                        <SelectItem key={author.id} value={author.id}>
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={16} />
                            {author.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAuthor !== 'all' && (
                  <div className="flex items-end">
                    <Button
                      onClick={() => setSelectedAuthor('all')}
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Сбросить фильтр
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const mealsCount = getMealsForDay(day.value).length;
                  return (
                    <Button
                      key={day.value}
                      onClick={() => setSelectedDay(day.value)}
                      variant={selectedDay === day.value ? 'default' : 'outline'}
                      size="sm"
                      className="relative"
                    >
                      {day.label}
                      {mealsCount > 0 && (
                        <Badge className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0">
                          {mealsCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                {selectedDayLabel}
                {selectedAuthor !== 'all' && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                    <Icon name="Filter" size={14} className="mr-1" />
                    {getUniqueAuthors().find(a => a.id === selectedAuthor)?.name}
                  </Badge>
                )}
              </h3>

              {mealsForSelectedDay.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border-2 border-dashed">
                  <Icon name="UtensilsCrossed" size={48} className="mx-auto mb-4 opacity-50" />
                  {selectedAuthor !== 'all' ? (
                    <>
                      <p>У {getUniqueAuthors().find(a => a.id === selectedAuthor)?.name} нет блюд</p>
                      <p className="text-sm">на {selectedDayLabel.toLowerCase()}</p>
                    </>
                  ) : (
                    <p>На {selectedDayLabel.toLowerCase()} блюда не запланированы</p>
                  )}
                  <Button
                    onClick={() => {
                      setNewMeal({ ...newMeal, day: selectedDay });
                      setIsDialogOpen(true);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить блюдо
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {MEAL_TYPES.map(type => {
                    const meals = getMealsByType(selectedDay, type.value as MealPlan['mealType']);
                    return (
                      <Card key={type.value} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-2xl">{type.emoji}</span>
                            {type.label.split(' ')[1]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {meals.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Не запланировано
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {meals.map(meal => (
                                <div
                                  key={meal.id}
                                  className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm mb-1">{meal.dishName}</h4>
                                      {meal.description && (
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {meal.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {meal.addedByName}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        onClick={() => handleEditMeal(meal)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        <Icon name="Pencil" size={14} />
                                      </Button>
                                      <Button
                                        onClick={() => deleteMeal(meal.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Icon name="Trash2" size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Lightbulb" size={20} />
              Советы по планированию меню
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                <span>Планируйте меню на неделю заранее — это экономит время и деньги</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                <span>Учитывайте предпочтения всех членов семьи при выборе блюд</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                <span>Используйте список покупок, чтобы купить все необходимые продукты</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                <span>Готовьте полезные и разнообразные блюда для сбалансированного питания</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Filter" size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Фильтруйте блюда по автору, чтобы увидеть вклад каждого члена семьи</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}