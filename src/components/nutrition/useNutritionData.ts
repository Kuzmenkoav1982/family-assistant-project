import { useState, useEffect } from 'react';
import type { FoodDiaryEntry } from './FoodDiaryTable';
import type { NewEntry } from './AddMealDialog';

const NUTRITION_API_URL = 'https://functions.poehali.dev/c592ffff-18dd-4d1c-b199-ff8832c83a2c';

export interface NutritionData {
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

const EMPTY_TOTALS = {
  date: new Date().toISOString().split('T')[0],
  totals: { total_calories: 0, total_protein: 0, total_fats: 0, total_carbs: 0, entries_count: 0 },
  by_meal: [],
  goals: { daily_calories: 2000, daily_protein: 100, daily_fats: 70, daily_carbs: 250 },
  progress: { calories: 0, protein: 0, fats: 0, carbs: 0 },
};

const EMPTY_NEW_ENTRY: NewEntry = {
  product_id: null,
  product_name: '',
  amount: '',
  meal_type: 'breakfast',
  calories: '',
  protein: '',
  fats: '',
  carbs: '',
};

function getCurrentUserId(selectedMemberId: string): string | number {
  const userDataStr = localStorage.getItem('userData') || localStorage.getItem('authUser');
  if (userDataStr) {
    try {
      const u = JSON.parse(userDataStr);
      if (u.member_id) return u.member_id;
      if (u.memberId) return u.memberId;
    } catch { /* ignore */ }
  }
  if (selectedMemberId && selectedMemberId !== 'all') return selectedMemberId;
  return 1;
}

export function useNutritionData() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [foodDiary, setFoodDiary] = useState<FoodDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [addMode, setAddMode] = useState<'search' | 'manual'>('search');
  const [newEntry, setNewEntry] = useState<NewEntry>(EMPTY_NEW_ENTRY);
  const [editingEntry, setEditingEntry] = useState<FoodDiaryEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadNutritionData = async () => {
    try {
      const userIdParam = selectedMemberId === 'all' ? 'all' : selectedMemberId;
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=analytics&user_id=${encodeURIComponent(userIdParam)}&date=${today}`
      );
      if (!response.ok) {
        setNutritionData(EMPTY_TOTALS);
        return;
      }
      const data = await response.json();
      setNutritionData(data);
    } catch {
      setNutritionData(EMPTY_TOTALS);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodDiary = async () => {
    try {
      const userIdParam = selectedMemberId === 'all' ? 'all' : selectedMemberId;
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=diary&user_id=${encodeURIComponent(userIdParam)}&date=${today}`
      );
      const data = await response.json();
      setFoodDiary(data.diary || []);
    } catch { /* silent */ }
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
    } catch { /* silent */ }
  };

  const handleAddEntry = async (entry: NewEntry) => {
    if (!entry.product_name || !entry.amount) return;
    if (addMode === 'manual' && (!entry.calories || !entry.protein || !entry.fats || !entry.carbs)) {
      alert('Пожалуйста, заполните все поля БЖУ и калории');
      return;
    }
    try {
      const currentUserId = getCurrentUserId(selectedMemberId);
      const requestBody: Record<string, unknown> = {
        action: 'add_diary',
        user_id: currentUserId,
        meal_type: entry.meal_type,
        product_name: entry.product_name,
        portion_grams: parseFloat(entry.amount),
      };
      if (entry.product_id) requestBody.product_id = entry.product_id;
      if (addMode === 'manual') {
        requestBody.calories = parseFloat(entry.calories);
        requestBody.protein = parseFloat(entry.protein);
        requestBody.fats = parseFloat(entry.fats);
        requestBody.carbs = parseFloat(entry.carbs);
      }
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
        setIsAddDialogOpen(false);
        setNewEntry(EMPTY_NEW_ENTRY);
        setSearchQuery('');
        setSearchResults([]);
        setAddMode('search');
      }
    } catch { /* silent */ }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Удалить эту запись?')) return;
    try {
      const response = await fetch(NUTRITION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_diary', entry_id: entryId }),
      });
      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
      }
    } catch { /* silent */ }
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
          meal_type: editingEntry.meal_type,
        }),
      });
      if (response.ok) {
        await loadNutritionData();
        await loadFoodDiary();
        setIsEditDialogOpen(false);
        setEditingEntry(null);
      }
    } catch { /* silent */ }
  };

  const selectProduct = (product: { id: number | string; name: string }) => {
    setNewEntry({ ...newEntry, product_id: product.id as number | null, product_name: product.name, calories: '', protein: '', fats: '', carbs: '' });
    setSearchQuery(product.name);
    setSearchResults([]);
  };

   
  useEffect(() => {
    loadNutritionData();
    loadFoodDiary();
  }, [selectedMemberId]);

  return {
    selectedMemberId, setSelectedMemberId,
    nutritionData, foodDiary, loading,
    searchQuery, setSearchQuery,
    searchResults, addMode, setAddMode,
    newEntry, setNewEntry,
    editingEntry, setEditingEntry,
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    searchProducts, handleAddEntry, handleDeleteEntry,
    handleEditEntry, handleUpdateEntry, selectProduct,
  };
}