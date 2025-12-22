import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { NutritionHeader } from '@/components/nutrition/NutritionHeader';
import { NutritionStats } from '@/components/nutrition/NutritionStats';
import { AddMealDialog, type NewEntry } from '@/components/nutrition/AddMealDialog';
import { FoodDiaryTable, type FoodDiaryEntry } from '@/components/nutrition/FoodDiaryTable';

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

export default function Nutrition() {
  const { members } = useFamilyMembersContext();
  
  const getCurrentUserId = () => {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        return authUser.member_id || authUser.id || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  };
  
  // По умолчанию показываем "Все авторы" (0)
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [foodDiary, setFoodDiary] = useState<FoodDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addMode, setAddMode] = useState<'search' | 'manual'>('search');
  const [newEntry, setNewEntry] = useState<NewEntry>({
    product_id: null,
    product_name: '',
    amount: '',
    meal_type: 'breakfast',
    calories: '',
    protein: '',
    fats: '',
    carbs: ''
  });
  const [editingEntry, setEditingEntry] = useState<FoodDiaryEntry | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadNutritionData();
    loadFoodDiary();
  }, [selectedMemberId]);

  const loadNutritionData = async () => {
    try {
      // Если selectedMemberId === 0, значит выбран "Все авторы"
      const userIdParam = selectedMemberId === 0 ? 'all' : selectedMemberId;
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=analytics&user_id=${userIdParam}&date=${today}`
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
      // Если selectedMemberId === 0, значит выбран "Все авторы"
      const userIdParam = selectedMemberId === 0 ? 'all' : selectedMemberId;
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=diary&user_id=${userIdParam}&date=${today}`
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

  const handleAddEntry = async (entry: NewEntry) => {
    if (!entry.product_name) return;
    if (!entry.amount) return;
    
    if (addMode === 'manual' && (!entry.calories || !entry.protein || !entry.fats || !entry.carbs)) {
      alert('Пожалуйста, заполните все поля БЖУ и калории');
      return;
    }

    try {
      // ВАЖНО: используем ID авторизованного пользователя (кто добавляет),
      // а НЕ selectedMemberId (чьи данные просматриваем)
      const currentUserId = getCurrentUserId();
      
      const requestBody: any = {
        action: 'add_diary',
        user_id: currentUserId,
        meal_type: entry.meal_type,
        product_name: entry.product_name,
        portion_grams: parseFloat(entry.amount)
      };
      
      if (entry.product_id) {
        requestBody.product_id = entry.product_id;
      }
      
      if (addMode === 'manual') {
        requestBody.calories = parseFloat(entry.calories);
        requestBody.protein = parseFloat(entry.protein);
        requestBody.fats = parseFloat(entry.fats);
        requestBody.carbs = parseFloat(entry.carbs);
      }
      
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
        setIsAddDialogOpen(false);
        setNewEntry({
          product_id: null,
          product_name: '',
          amount: '',
          meal_type: 'breakfast',
          calories: '',
          protein: '',
          fats: '',
          carbs: ''
        });
        setSearchQuery('');
        setSearchResults([]);
        setAddMode('search');
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
      product_name: product.name,
      calories: '',
      protein: '',
      fats: '',
      carbs: ''
    });
    setSearchQuery(product.name);
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!nutritionData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <NutritionHeader
          members={members}
          selectedMemberId={selectedMemberId}
          onMemberSelect={setSelectedMemberId}
          isInstructionOpen={isInstructionOpen}
          onInstructionToggle={setIsInstructionOpen}
        />

        <NutritionStats nutritionData={nutritionData} />

        <div className="flex justify-end">
          <AddMealDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAdd={handleAddEntry}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSearch={searchProducts}
            onSelectProduct={selectProduct}
            newEntry={newEntry}
            setNewEntry={setNewEntry}
            addMode={addMode}
            setAddMode={setAddMode}
          />
        </div>

        <FoodDiaryTable
          foodDiary={foodDiary}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          editingEntry={editingEntry}
          setEditingEntry={setEditingEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onUpdate={handleUpdateEntry}
        />

      </div>
    </div>
  );
}