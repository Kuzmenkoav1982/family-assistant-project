import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';

export interface WidgetConfig {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  description: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'calendar',
    name: 'Календарь на неделю',
    icon: 'Calendar',
    enabled: true,
    description: 'Ближайшие события и мероприятия семьи'
  },
  {
    id: 'tasks',
    name: 'Задачи семьи',
    icon: 'CheckSquare',
    enabled: true,
    description: 'Активные задачи и список дел'
  },
  {
    id: 'family-members',
    name: 'Профили членов семьи',
    icon: 'Users',
    enabled: true,
    description: 'Карточки всех членов семьи'
  },
  {
    id: 'shopping',
    name: 'Покупки',
    icon: 'ShoppingCart',
    enabled: false,
    description: 'Список покупок семьи'
  },
  {
    id: 'voting',
    name: 'Голосование',
    icon: 'ThumbsUp',
    enabled: false,
    description: 'Активные голосования семьи'
  },
  {
    id: 'nutrition',
    name: 'Питание',
    icon: 'Apple',
    enabled: false,
    description: 'Рацион и предпочтения питания'
  },
  {
    id: 'weekly-menu',
    name: 'Меню на неделю',
    icon: 'UtensilsCrossed',
    enabled: false,
    description: 'План питания на неделю'
  }
];

interface WidgetSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgets: WidgetConfig[]) => void;
}

export default function WidgetSettings({ isOpen, onClose, onSave }: WidgetSettingsProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('widgetSettings');
    if (saved) {
      try {
        const savedWidgets = JSON.parse(saved);
        
        // Миграция: удаляем виджет "goals" если есть
        const filteredWidgets = savedWidgets.filter((w: WidgetConfig) => w.id !== 'goals');
        
        // Добавляем новые виджеты если их нет
        const existingIds = new Set(filteredWidgets.map((w: WidgetConfig) => w.id));
        const newWidgets = DEFAULT_WIDGETS.filter(w => !existingIds.has(w.id));
        
        return [...filteredWidgets, ...newWidgets];
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  const handleToggle = (widgetId: string) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  const handleSave = () => {
    localStorage.setItem('widgetSettings', JSON.stringify(widgets));
    onSave(widgets);
    onClose();
  };

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const enabledCount = widgets.filter(w => w.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} />
            Настройка виджетов главного экрана
          </DialogTitle>
          <DialogDescription>
            Выберите какие виджеты отображать на главном экране
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {widgets.map((widget) => (
            <Card key={widget.id} className={widget.enabled ? 'border-blue-200' : 'border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${widget.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon 
                      name={widget.icon as any} 
                      size={24} 
                      className={widget.enabled ? 'text-blue-600' : 'text-gray-400'}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor={widget.id} className="text-base font-semibold cursor-pointer">
                        {widget.name}
                      </Label>
                      <Switch
                        id={widget.id}
                        checked={widget.enabled}
                        onCheckedChange={() => handleToggle(widget.id)}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{widget.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Включено виджетов: <strong>{enabledCount} из {widgets.length}</strong></span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}