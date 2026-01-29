import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { MealDialog } from '@/components/meals/MealDialog';
import { MealsHeader } from '@/components/meals/MealsHeader';
import { MealsDayView } from '@/components/meals/MealsDayView';
import { MealsWeekView } from '@/components/meals/MealsWeekView';
import { DEMO_MEAL_PLANS } from '@/data/demoMeals';

const MEAL_API = 'https://functions.poehali.dev/aabe67a3-cf0b-409f-8fa8-f3dac3c02223';

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
  const { members } = useFamilyMembersContext();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const [newMeal, setNewMeal] = useState({
    day: 'monday',
    mealType: 'breakfast' as MealPlan['mealType'],
    dishName: '',
    description: '',
    emoji: '🍳'
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    const authToken = localStorage.getItem('authToken');
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (isDemoMode && !authToken) {
      setMealPlans(DEMO_MEAL_PLANS);
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(MEAL_API, {
        headers: {
          'X-Auth-Token': authToken || ''
        }
      });
      const data = await response.json();
      if (data.success && data.meals) {
        setMealPlans(data.meals.map((m: any) => ({
          id: m.id,
          day: m.day,
          mealType: m.meal_type,
          dishName: m.dish_name,
          description: m.description,
          emoji: m.emoji,
          addedBy: m.added_by,
          addedByName: m.added_by_name,
          addedAt: m.created_at
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки меню:', error);
    }
  };

  const saveMealPlans = (updated: MealPlan[]) => {
    setMealPlans(updated);
  };

  const handleAddMeal = async () => {
    if (!newMeal.dishName.trim()) return;

    const currentMember = members[0] || { id: 'demo', name: 'Пользователь', avatar: '👤' };
    const authToken = localStorage.getItem('authToken');

    try {
      if (editingMeal) {
        const response = await fetch(MEAL_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken || ''
          },
          body: JSON.stringify({
            action: 'update',
            id: editingMeal.id,
            day: newMeal.day,
            mealType: newMeal.mealType,
            dishName: newMeal.dishName,
            description: newMeal.description,
            emoji: newMeal.emoji
          })
        });
        const data = await response.json();
        if (data.success) {
          await fetchMeals();
        }
        setEditingMeal(null);
      } else {
        const response = await fetch(MEAL_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken || ''
          },
          body: JSON.stringify({
            action: 'add',
            day: newMeal.day,
            mealType: newMeal.mealType,
            dishName: newMeal.dishName,
            description: newMeal.description,
            emoji: newMeal.emoji,
            addedBy: currentMember.id,
            addedByName: currentMember.name
          })
        });
        const data = await response.json();
        if (data.success) {
          await fetchMeals();
        }
      }

      setNewMeal({
        day: 'monday',
        mealType: 'breakfast',
        dishName: '',
        description: '',
        emoji: '🍳'
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения блюда:', error);
      alert('❌ Ошибка сохранения блюда');
    }
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

  const deleteMeal = async (id: string) => {
    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch(MEAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken || ''
        },
        body: JSON.stringify({
          action: 'delete',
          id: id
        })
      });
      const data = await response.json();
      if (data.success) {
        await fetchMeals();
      }
    } catch (error) {
      console.error('Ошибка удаления блюда:', error);
      alert('❌ Ошибка удаления блюда');
    }
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
        <MealsHeader
          onNavigateBack={() => navigate('/')}
          selectedAuthor={selectedAuthor}
          onAuthorChange={setSelectedAuthor}
          totalMeals={mealPlans.length}
          filteredMealsCount={getFilteredMealsCount()}
          uniqueAuthors={getUniqueAuthors()}
          isInstructionOpen={isInstructionOpen}
          onInstructionToggle={setIsInstructionOpen}
        />

        <Card className="bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              Режим просмотра
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <Icon name="CalendarDays" size={16} className="mr-2" />
                Неделя
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                День
              </Button>
            </div>
          </CardHeader>
        </Card>

        {viewMode === 'day' ? (
          <MealsDayView
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            selectedDayLabel={selectedDayLabel}
            mealsForSelectedDay={mealsForSelectedDay}
            onEditMeal={handleEditMeal}
            onDeleteMeal={deleteMeal}
            daysOfWeek={DAYS_OF_WEEK}
            mealTypes={MEAL_TYPES}
          />
        ) : (
          <MealsWeekView
            daysOfWeek={DAYS_OF_WEEK}
            getMealsByType={getMealsByType}
            onQuickAddMeal={handleQuickAddMeal}
            onEditMeal={handleEditMeal}
            onDeleteMeal={deleteMeal}
          />
        )}

        <MealDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingMeal={editingMeal}
          newMeal={newMeal}
          setNewMeal={setNewMeal}
          handleAddMeal={handleAddMeal}
        />

        <Button 
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
          size="lg"
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
          <Icon name="Plus" className="mr-2" size={20} />
          Добавить блюдо
        </Button>
      </div>
    </div>
  );
}