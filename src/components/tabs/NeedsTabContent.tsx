import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { FamilyNeed } from '@/types/family.types';

interface NeedsTabContentProps {
  familyNeeds: FamilyNeed[];
  setFamilyNeeds: React.Dispatch<React.SetStateAction<FamilyNeed[]>>;
}

export function NeedsTabContent({
  familyNeeds,
  setFamilyNeeds,
}: NeedsTabContentProps) {
  const updateNeedStatus = (needId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setFamilyNeeds(familyNeeds.map(need => 
      need.id === needId ? { ...need, status: newStatus } : need
    ));
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusColor = (status: 'pending' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TabsContent value="needs" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Heart" size={24} />
            Семейные потребности
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {familyNeeds.map((need) => (
            <Card key={need.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{need.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{need.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(need.priority)}>
                          {need.priority === 'high' && 'Высокий приоритет'}
                          {need.priority === 'medium' && 'Средний приоритет'}
                          {need.priority === 'low' && 'Низкий приоритет'}
                        </Badge>
                        
                        <Badge className={getStatusColor(need.status)}>
                          {need.status === 'completed' && 'Выполнено'}
                          {need.status === 'in_progress' && 'В процессе'}
                          {need.status === 'pending' && 'Ожидает'}
                        </Badge>
                        
                        <Badge variant="outline">
                          <Icon name="DollarSign" size={14} className="mr-1" />
                          {need.estimatedCost.toLocaleString('ru-RU')} ₽
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс</span>
                      <span className="font-semibold">{need.progress}%</span>
                    </div>
                    <Progress value={need.progress} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {need.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateNeedStatus(need.id, 'in_progress')}
                      >
                        Начать выполнение
                      </Button>
                    )}
                    {need.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateNeedStatus(need.id, 'completed')}
                      >
                        Завершить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {familyNeeds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Heart" className="mx-auto mb-2 text-gray-400" size={48} />
              <p>Нет семейных потребностей</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
