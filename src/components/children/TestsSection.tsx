import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface TestsSectionProps {
  developmentAreas: any[];
  onAddTest: (data: { development_id: string; test_name: string; date: string; result: string; notes: string }) => Promise<{ success: boolean; error?: string }>;
}

export function TestsSection({ 
  developmentAreas, 
  onAddTest 
}: TestsSectionProps) {
  const [addTestDialog, setAddTestDialog] = useState(false);
  const [newTestData, setNewTestData] = useState({
    development_id: '',
    test_name: '',
    date: '',
    result: '',
    notes: ''
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

  const handleAddTest = async () => {
    if (!newTestData.test_name || !newTestData.development_id || !newTestData.date) {
      alert('Заполните название теста, выберите область и укажите дату');
      return;
    }

    const result = await onAddTest({
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

  const allTests = developmentAreas.flatMap((area: any) => 
    (area.tests || []).map((test: any) => ({
      ...test,
      area: area.area,
      areaName: getAreaName(area.area),
      areaIcon: getAreaIcon(area.area)
    }))
  ).sort((a: any, b: any) => new Date(b.date || b.completed_date).getTime() - new Date(a.date || a.completed_date).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={24} />
            Тесты и достижения
          </CardTitle>
          <Dialog open={addTestDialog} onOpenChange={setAddTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Icon name="Plus" size={16} />
                Добавить тест
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить результат теста</DialogTitle>
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
                  <label className="text-sm font-medium mb-2 block">Название теста *</label>
                  <Input 
                    placeholder="Например: Контрольная работа по математике" 
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
                    placeholder="Например: 5 или 95 баллов" 
                    value={newTestData.result}
                    onChange={(e) => setNewTestData(prev => ({ ...prev, result: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Заметки</label>
                  <Textarea 
                    placeholder="Дополнительная информация о результате" 
                    value={newTestData.notes}
                    onChange={(e) => setNewTestData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button className="w-full" onClick={handleAddTest}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allTests.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Результатов тестов пока нет</p>
            <p className="text-sm">Добавьте первый результат</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTests.map((test: any) => (
              <div key={test.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{test.areaIcon}</span>
                    <span className="font-medium">{test.name || test.test_name}</span>
                  </div>
                  {test.score !== undefined && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {test.score} баллов
                    </Badge>
                  )}
                  {test.result && !test.score && (
                    <Badge variant="outline">{test.result}</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Область: {test.areaName}</p>
                  {(test.date || test.completed_date) && (
                    <p>Дата: {new Date(test.date || test.completed_date).toLocaleDateString('ru-RU')}</p>
                  )}
                  {(test.description || test.notes) && (
                    <p className="text-gray-500">{test.description || test.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}