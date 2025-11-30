import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
import type { FamilyMember } from '@/types/family.types';

export function DevelopmentSection({ child }: { child: FamilyMember }) {
  const { data, loading, addItem, updateItem, deleteItem } = useChildrenData(child.id);
  
  const [addAreaDialog, setAddAreaDialog] = useState(false);
  const [addActivityDialog, setAddActivityDialog] = useState(false);
  const [addTestDialog, setAddTestDialog] = useState(false);
  
  const [newAreaData, setNewAreaData] = useState({
    area: '',
    current_level: 0,
    target_level: 100
  });

  const [newActivityData, setNewActivityData] = useState({
    development_id: '',
    type: 'Секция',
    name: '',
    schedule: '',
    cost: '',
    status: 'active'
  });

  const [newTestData, setNewTestData] = useState({
    development_id: '',
    test_name: '',
    date: '',
    result: '',
    notes: ''
  });
  
  const developmentAreas = data?.development || [];
  
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

  const handleAddArea = async () => {
    if (!newAreaData.area) {
      alert('Выберите область развития');
      return;
    }

    const result = await addItem('development_area', {
      area: newAreaData.area,
      current_level: newAreaData.current_level,
      target_level: newAreaData.target_level,
      family_id: localStorage.getItem('familyId') || ''
    });

    if (result.success) {
      setAddAreaDialog(false);
      setNewAreaData({ area: '', current_level: 0, target_level: 100 });
    } else {
      alert(result.error || 'Ошибка добавления области');
    }
  };

  const handleAddActivity = async () => {
    if (!newActivityData.name || !newActivityData.development_id) {
      alert('Заполните название занятия и выберите область развития');
      return;
    }

    const result = await addItem('activity', {
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
    } else {
      alert(result.error || 'Ошибка добавления занятия');
    }
  };

  const handleAddTest = async () => {
    if (!newTestData.test_name || !newTestData.development_id || !newTestData.date) {
      alert('Заполните название теста, выберите область и укажите дату');
      return;
    }

    const result = await addItem('test', {
      development_id: newTestData.development_id,
      test_name: newTestData.test_name,
      date: newTestData.date,
      result: newTestData.result,
      notes: newTestData.notes
    });

    if (result.success) {
      setAddTestDialog(false);
      setNewTestData({
        development_id: '',
        test_name: '',
        date: '',
        result: '',
        notes: ''
      });
    } else {
      alert(result.error || 'Ошибка добавления теста');
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Удалить эту область развития? Все связанные занятия и тесты также будут удалены.')) return;
    
    const result = await deleteItem('development_area', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Удалить это занятие?')) return;
    
    const result = await deleteItem('activity', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">Раздел Развитие</CardTitle>
              <div className="text-sm text-gray-700 space-y-1">
                <p>✓ Устанавливайте цели и отслеживайте прогресс</p>
                <p>✓ Добавьте кружки, секции и их расписание</p>
                <p>✓ Сохраняйте результаты тестов и конкурсов</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} />
              Области развития
            </CardTitle>
            <Dialog open={addAreaDialog} onOpenChange={setAddAreaDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить область
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить область развития</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Область *</label>
                    <Select 
                      value={newAreaData.area}
                      onValueChange={(value) => setNewAreaData(prev => ({ ...prev, area: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите область" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sport">⚽ Спорт</SelectItem>
                        <SelectItem value="education">📚 Образование</SelectItem>
                        <SelectItem value="creativity">🎨 Творчество</SelectItem>
                        <SelectItem value="social">🤝 Социальные навыки</SelectItem>
                        <SelectItem value="music">🎵 Музыка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Текущий уровень: {newAreaData.current_level}%
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={newAreaData.current_level}
                      onChange={(e) => setNewAreaData(prev => ({ ...prev, current_level: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Целевой уровень: {newAreaData.target_level}%
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={newAreaData.target_level}
                      onChange={(e) => setNewAreaData(prev => ({ ...prev, target_level: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddArea}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : developmentAreas.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Областей развития пока нет</p>
              <p className="text-sm">Добавьте первую область для отслеживания прогресса</p>
            </div>
          ) : (
            developmentAreas.map((area: any) => (
              <div key={area.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getAreaIcon(area.area)}</span>
                    <span className="font-semibold">{getAreaName(area.area)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {area.current_level}% → {area.target_level}%
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteArea(area.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
                <Progress value={area.current_level} className="h-2" />
                {area.activities && area.activities.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Занятий: {area.activities.length}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                      <SelectContent>
                        {developmentAreas.map((area: any) => (
                          <SelectItem key={area.id} value={area.id}>
                            {getAreaIcon(area.area)} {getAreaName(area.area)}
                          </SelectItem>
                        ))}
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
                      <SelectContent>
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
                      <SelectContent>
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
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : developmentAreas.length === 0 || !developmentAreas.some((d: any) => d.activities && d.activities.length > 0) ? (
            <div className="text-center py-4 text-gray-500">
              <p>Занятий пока нет</p>
              <p className="text-sm">Добавьте первое занятие для ребёнка</p>
            </div>
          ) : (
            developmentAreas.map((area: any) => 
              area.activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Icon name="CalendarDays" size={24} className="text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="text-xs text-gray-500">{activity.type} • {getAreaName(area.area)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                          {activity.status === 'active' ? 'Активно' : activity.status === 'planned' ? 'Запланировано' : 'Завершено'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                    {activity.schedule && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {activity.schedule}
                        </span>
                        {activity.cost && (
                          <span className="flex items-center gap-1">
                            <Icon name="Wallet" size={14} />
                            {activity.cost} ₽/мес
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ClipboardList" size={24} />
              Тесты и проверки
            </CardTitle>
            <Dialog open={addTestDialog} onOpenChange={setAddTestDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                  <Icon name="Plus" size={16} />
                  Назначить тест
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить тест</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Область развития *</label>
                    <Select 
                      value={newTestData.development_id}
                      onValueChange={(value) => setNewTestData(prev => ({ ...prev, development_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите область" />
                      </SelectTrigger>
                      <SelectContent>
                        {developmentAreas.map((area: any) => (
                          <SelectItem key={area.id} value={area.id}>
                            {getAreaIcon(area.area)} {getAreaName(area.area)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название теста *</label>
                    <Input 
                      placeholder="Например: Контрольная по математике" 
                      value={newTestData.test_name}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, test_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата *</label>
                    <Input 
                      type="date"
                      value={newTestData.date}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Результат</label>
                    <Input 
                      placeholder="Например: 85 баллов" 
                      value={newTestData.result}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, result: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Примечания</label>
                    <Textarea 
                      placeholder="Дополнительная информация" 
                      value={newTestData.notes}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddTest}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : developmentAreas.length === 0 || !developmentAreas.some((d: any) => d.tests && d.tests.length > 0) ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Пока нет назначенных тестов</p>
              <p className="text-sm mt-2">Создайте тест для оценки знаний и навыков</p>
            </div>
          ) : (
            developmentAreas.map((area: any) => 
              area.tests?.map((test: any) => (
                <div key={test.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{test.test_name}</h4>
                      <p className="text-xs text-gray-500">{getAreaName(area.area)}</p>
                    </div>
                    <Badge variant="outline">{test.date}</Badge>
                  </div>
                  {test.result && (
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Результат:</strong> {test.result}
                    </p>
                  )}
                  {test.notes && (
                    <p className="text-sm text-gray-600 mt-1">{test.notes}</p>
                  )}
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
