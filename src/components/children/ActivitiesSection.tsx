import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useReturnToPortfolio } from '@/hooks/useReturnToPortfolio';

interface ActivitiesSectionProps {
  developmentAreas: any[];
  onAddActivity: (data: { development_id: string; type: string; name: string; schedule: string; cost: number; status: string }) => Promise<{ success: boolean; error?: string }>;
  onDeleteActivity: (id: string) => Promise<void>;
  /** D.1: внешний контроль открытия диалога для deep-link из портфолио. */
  openDialog?: boolean;
  onOpenDialogChange?: (open: boolean) => void;
}

export function ActivitiesSection({
  developmentAreas,
  onAddActivity,
  onDeleteActivity,
  openDialog,
  onOpenDialogChange,
}: ActivitiesSectionProps) {
  const [addActivityDialogInternal, setAddActivityDialogInternal] = useState(false);
  const addActivityDialog = openDialog ?? addActivityDialogInternal;
  const setAddActivityDialog = (v: boolean) => {
    setAddActivityDialogInternal(v);
    onOpenDialogChange?.(v);
  };
  const { returnIfRequested } = useReturnToPortfolio();
  const [newActivityData, setNewActivityData] = useState({
    development_id: '',
    type: 'Секция',
    name: '',
    schedule: '',
    cost: '',
    status: 'active'
  });

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'sport': return '⚽';
      case 'education': return '📚';
      case 'creativity': return '🎨';
      case 'social': return '🤝';
      case 'music': return '🎵';
      default: return '🎯';
    }
  };

  const getAreaName = (area: string) => {
    switch (area) {
      case 'sport': return 'Спорт';
      case 'education': return 'Образование';
      case 'creativity': return 'Творчество';
      case 'social': return 'Социальные навыки';
      case 'music': return 'Музыка';
      default: return area;
    }
  };

  const handleAddActivity = async () => {
    if (!newActivityData.name || !newActivityData.development_id) {
      alert('Заполните название занятия и выберите область развития');
      return;
    }

    const result = await onAddActivity({
      development_id: newActivityData.development_id,
      type: newActivityData.type,
      name: newActivityData.name,
      schedule: newActivityData.schedule,
      cost: newActivityData.cost ? parseInt(newActivityData.cost) : 0,
      status: newActivityData.status
    });

    if (result.success) {
      setAddActivityDialog(false);
      setNewActivityData({
        development_id: '',
        type: 'Секция',
        name: '',
        schedule: '',
        cost: '',
        status: 'active'
      });
      // D.1: если попали сюда из портфолио — возвращаем пользователя обратно.
      returnIfRequested();
    } else {
      alert(result.error || 'Ошибка добавления занятия');
    }
  };

  const allActivities = developmentAreas.flatMap((area: any) => 
    (area.activities || []).map((activity: any) => ({
      ...activity,
      area: area.area,
      areaName: getAreaName(area.area),
      areaIcon: getAreaIcon(area.area)
    }))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Активно</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Запланировано</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Завершено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Активности и занятия
          </CardTitle>
          <Dialog open={addActivityDialog} onOpenChange={setAddActivityDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Icon name="Plus" size={16} />
                Добавить занятие
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить занятие</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Область развития *</label>
                  <Select 
                    value={newActivityData.development_id}
                    onValueChange={(value) => setNewActivityData(prev => ({ ...prev, development_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите область" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {developmentAreas.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Сначала добавьте область развития</div>
                      ) : (
                        developmentAreas.map((area: any) => (
                          <SelectItem key={area.id} value={area.id}>
                            {getAreaIcon(area.area)} {getAreaName(area.area)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Тип</label>
                  <Select 
                    value={newActivityData.type}
                    onValueChange={(value) => setNewActivityData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="Секция">Секция</SelectItem>
                      <SelectItem value="Кружок">Кружок</SelectItem>
                      <SelectItem value="Репетитор">Репетитор</SelectItem>
                      <SelectItem value="Онлайн-курс">Онлайн-курс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Название *</label>
                  <Input 
                    placeholder="Например: Футбол" 
                    value={newActivityData.name}
                    onChange={(e) => setNewActivityData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Расписание</label>
                  <Input 
                    placeholder="Например: Вт, Чт 17:00" 
                    value={newActivityData.schedule}
                    onChange={(e) => setNewActivityData(prev => ({ ...prev, schedule: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Стоимость (₽/мес)</label>
                  <Input 
                    type="number"
                    placeholder="5000" 
                    value={newActivityData.cost}
                    onChange={(e) => setNewActivityData(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select 
                    value={newActivityData.status}
                    onValueChange={(value) => setNewActivityData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="active">Активно</SelectItem>
                      <SelectItem value="planned">Запланировано</SelectItem>
                      <SelectItem value="completed">Завершено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleAddActivity}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Активностей пока нет</p>
            <p className="text-sm">Добавьте первое занятие</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{activity.areaIcon}</span>
                    <span className="font-medium">{activity.name}</span>
                    <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                    {getStatusBadge(activity.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Область: {activity.areaName}</p>
                    {activity.schedule && <p>Расписание: {activity.schedule}</p>}
                    {activity.cost > 0 && <p>Стоимость: {activity.cost} ₽/мес</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteActivity(activity.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}