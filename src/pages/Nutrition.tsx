import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { NutritionHeader } from '@/components/nutrition/NutritionHeader';
import SectionHero from '@/components/ui/section-hero';
import { NutritionStats } from '@/components/nutrition/NutritionStats';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { FoodDiaryTable } from '@/components/nutrition/FoodDiaryTable';
import { useNutritionData } from '@/components/nutrition/useNutritionData';

export default function Nutrition() {
  const { members } = useFamilyMembersContext();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const {
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
  } = useNutritionData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!nutritionData) return null;

  return (
    <>
      <SEOHead
        title="Питание семьи — рацион, диеты и рецепты"
        description="Планирование питания семьи: ИИ-диеты, готовые программы, рецепты из продуктов, счётчик калорий и БЖУ. Здоровое питание для всей семьи."
        path="/nutrition"
      />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">

          <SectionHero
            title="Счётчик БЖУ"
            subtitle="Дневник питания с подсчётом калорий и нутриентов"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3783739b-09dd-451c-9fac-a95c55db2792.jpg"
            backPath="/nutrition"
          />

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
    </>
  );
}