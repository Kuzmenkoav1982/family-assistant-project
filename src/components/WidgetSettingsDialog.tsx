import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  type MemberWidgetSettings,
  DEFAULT_WIDGET_SETTINGS,
  WIDGET_PRESETS,
  saveWidgetSettings,
  loadWidgetSettings
} from '@/types/widgetSettings';

interface WidgetSettingsDialogProps {
  onSettingsChange?: (settings: MemberWidgetSettings) => void;
}

export function WidgetSettingsDialog({ onSettingsChange }: WidgetSettingsDialogProps) {
  const [settings, setSettings] = useState<MemberWidgetSettings>(() => loadWidgetSettings());
  const [open, setOpen] = useState(false);

  const handleToggle = (key: keyof MemberWidgetSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
  };

  const handleSizeChange = (size: 'compact' | 'normal' | 'detailed') => {
    const newSettings = { ...settings, widgetSize: size };
    setSettings(newSettings);
  };

  const applyPreset = (presetName: 'minimalist' | 'detailed' | 'standard') => {
    const preset = WIDGET_PRESETS[presetName];
    setSettings(preset);
  };

  const handleSave = () => {
    saveWidgetSettings(settings);
    onSettingsChange?.(settings);
    setOpen(false);
    // Перезагрузка страницы для применения изменений
    window.location.reload();
  };

  const handleReset = () => {
    setSettings(DEFAULT_WIDGET_SETTINGS);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Settings" size={16} />
          Настроить виджеты
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} className="text-purple-600" />
            Настройка виджетов членов семьи
          </DialogTitle>
          <DialogDescription>
            Выберите, какую информацию отображать на карточках членов семьи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Пресеты */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Готовые пресеты</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => applyPreset('minimalist')}
              >
                <Icon name="Minimize2" size={20} />
                <span className="text-xs">Минималист</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => applyPreset('standard')}
              >
                <Icon name="Layout" size={20} />
                <span className="text-xs">Стандарт</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => applyPreset('detailed')}
              >
                <Icon name="Maximize2" size={20} />
                <span className="text-xs">Подробный</span>
              </Button>
            </div>
          </div>

          {/* Размер виджета */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Размер виджета</Label>
            <RadioGroup value={settings.widgetSize} onValueChange={handleSizeChange as any}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact" className="cursor-pointer">Компактный</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="cursor-pointer">Обычный</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="detailed" />
                <Label htmlFor="detailed" className="cursor-pointer">Детальный</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Основная информация */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Основная информация</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-gray-600" />
                  <Label htmlFor="showAge" className="cursor-pointer">Показывать возраст</Label>
                </div>
                <Switch
                  id="showAge"
                  checked={settings.showAge}
                  onCheckedChange={() => handleToggle('showAge')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-gray-600" />
                  <Label htmlFor="showRole" className="cursor-pointer">Показывать роль</Label>
                </div>
                <Switch
                  id="showRole"
                  checked={settings.showRole}
                  onCheckedChange={() => handleToggle('showRole')}
                />
              </div>
            </div>
          </div>

          {/* Метрики загруженности */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Метрики загруженности
              <Badge className="ml-2 bg-blue-100 text-blue-700">Рекомендуется</Badge>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Icon name="Activity" size={16} className="text-blue-600" />
                  <Label htmlFor="showWorkload" className="cursor-pointer font-medium">
                    Прогресс-бар загруженности
                  </Label>
                </div>
                <Switch
                  id="showWorkload"
                  checked={settings.showWorkload}
                  onCheckedChange={() => handleToggle('showWorkload')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="ListTodo" size={16} className="text-blue-500" />
                  <Label htmlFor="showActiveTasks" className="cursor-pointer">Активные задачи</Label>
                </div>
                <Switch
                  id="showActiveTasks"
                  checked={settings.showActiveTasks}
                  onCheckedChange={() => handleToggle('showActiveTasks')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-green-500" />
                  <Label htmlFor="showCompletedToday" className="cursor-pointer">Завершено сегодня</Label>
                </div>
                <Switch
                  id="showCompletedToday"
                  checked={settings.showCompletedToday}
                  onCheckedChange={() => handleToggle('showCompletedToday')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Briefcase" size={16} className="text-purple-500" />
                  <Label htmlFor="showResponsibilities" className="cursor-pointer">Обязанности</Label>
                </div>
                <Switch
                  id="showResponsibilities"
                  checked={settings.showResponsibilities}
                  onCheckedChange={() => handleToggle('showResponsibilities')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-purple-500" />
                  <Label htmlFor="showTodayEvents" className="cursor-pointer">События на сегодня</Label>
                </div>
                <Switch
                  id="showTodayEvents"
                  checked={settings.showTodayEvents}
                  onCheckedChange={() => handleToggle('showTodayEvents')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Trophy" size={16} className="text-yellow-500" />
                  <Label htmlFor="showWeekAchievements" className="cursor-pointer">Достижения за неделю</Label>
                </div>
                <Switch
                  id="showWeekAchievements"
                  checked={settings.showWeekAchievements}
                  onCheckedChange={() => handleToggle('showWeekAchievements')}
                />
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Действия</Label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={16} className="text-yellow-600" />
                <Label htmlFor="showQuickActions" className="cursor-pointer">Быстрые действия (кнопки)</Label>
              </div>
              <Switch
                id="showQuickActions"
                checked={settings.showQuickActions}
                onCheckedChange={() => handleToggle('showQuickActions')}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
            <Icon name="Check" size={16} className="mr-2" />
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
