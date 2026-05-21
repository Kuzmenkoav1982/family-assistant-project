import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { NutritionHeader } from '@/components/nutrition/NutritionHeader';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
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

  const BG = 'bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900';

  if (loading) {
    return (
      <SectionPageFrame title="Счётчик БЖУ" backPath="/nutrition" variant="light" backgroundClass={BG}>
        <div className="flex items-center justify-center py-32">
          <Icon name="Loader2" className="animate-spin" size={48} />
        </div>
      </SectionPageFrame>
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
      <SectionPageFrame
        title="Счётчик БЖУ"
        subtitle="Дневник питания с подсчётом калорий и нутриентов"
        backPath="/nutrition"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3783739b-09dd-451c-9fac-a95c55db2792.jpg"
        width="wide"
        backgroundClass={BG}
      >

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

      </SectionPageFrame>
    </>
  );
}