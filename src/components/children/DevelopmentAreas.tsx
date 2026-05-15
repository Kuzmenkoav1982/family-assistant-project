import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface DevelopmentAreasProps {
  developmentAreas: any[];
  loading: boolean;
  onAddArea: (data: { area: string; current_level: number; target_level: number; family_id: string }) => Promise<{ success: boolean; error?: string }>;
  onUpdateProgress: (areaId: string, newLevel: number) => Promise<void>;
  onDeleteArea: (id: string) => Promise<void>;
}

export function DevelopmentAreas({ 
  developmentAreas, 
  loading, 
  onAddArea, 
  onUpdateProgress, 
  onDeleteArea 
}: DevelopmentAreasProps) {
  const [addAreaDialog, setAddAreaDialog] = useState(false);
  const [newAreaData, setNewAreaData] = useState({
    area: '',
    current_level: 0,
    target_level: 100
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

  const handleAddArea = async () => {
    if (!newAreaData.area) {
      alert('Выберите область развития');
      return;
    }

    const result = await onAddArea({
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

  return (
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
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateProgress(area.id, Math.min(area.current_level + 5, area.target_level))}
                      disabled={area.current_level >= area.target_level}
                      className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Увеличить прогресс на 5%"
                    >
                      <Icon name="Plus" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateProgress(area.id, Math.max(area.current_level - 5, 0))}
                      disabled={area.current_level <= 0}
                      className="h-7 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      title="Уменьшить прогресс на 5%"
                    >
                      <Icon name="Minus" size={14} />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteArea(area.id)}
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
  );
}
