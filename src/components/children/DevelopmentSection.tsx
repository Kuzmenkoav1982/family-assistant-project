import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChildrenData } from '@/hooks/useChildrenData';
import type { FamilyMember } from '@/types/family.types';
import { DevelopmentAreas } from './DevelopmentAreas';
import { ActivitiesSection } from './ActivitiesSection';
import { TestsSection } from './TestsSection';

export function DevelopmentSection({ child }: { child: FamilyMember }) {
  const { data, loading, addItem, updateItem, deleteItem } = useChildrenData(child.id);
  
  const developmentAreas = data?.development || [];

  const handleAddArea = async (areaData: { area: string; current_level: number; target_level: number; family_id: string }) => {
    return await addItem('development_area', areaData);
  };

  const handleUpdateProgress = async (areaId: string, newLevel: number) => {
    const area = developmentAreas.find((a: any) => a.id === areaId);
    if (!area) return;

    const result = await updateItem('development_area', areaId, {
      area: area.area,
      current_level: newLevel,
      target_level: area.target_level
    });

    if (!result.success) {
      alert(result.error || 'Ошибка обновления прогресса');
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Удалить эту область развития? Все связанные занятия и тесты также будут удалены.')) return;
    
    const result = await deleteItem('development_area', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleAddActivity = async (activityData: { development_id: string; type: string; name: string; schedule: string; cost: number; status: string }) => {
    return await addItem('activity', activityData);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Удалить это занятие?')) return;
    
    const result = await deleteItem('activity', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleAddTest = async (testData: { development_id: string; test_name: string; date: string; result: string; notes: string }) => {
    return await addItem('test', testData);
  };

  return (
    <div className="space-y-6">
      <DevelopmentAreas
        developmentAreas={developmentAreas}
        loading={loading}
        onAddArea={handleAddArea}
        onUpdateProgress={handleUpdateProgress}
        onDeleteArea={handleDeleteArea}
      />

      <ActivitiesSection
        developmentAreas={developmentAreas}
        onAddActivity={handleAddActivity}
        onDeleteActivity={handleDeleteActivity}
      />

      <TestsSection
        developmentAreas={developmentAreas}
        onAddTest={handleAddTest}
      />
    </div>
  );
}