import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface MedicationReminderSettingsProps {
  medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay?: string;
    remindersEnabled?: boolean;
  };
  onUpdate: () => void;
}

const TIME_PRESETS = [
  { value: 'утро', label: '☀️ Утро (08:00)', times: ['08:00'] },
  { value: 'день', label: '🌤️ День (14:00)', times: ['14:00'] },
  { value: 'вечер', label: '🌙 Вечер (20:00)', times: ['20:00'] },
  { value: 'утро+вечер', label: '☀️🌙 Утро и вечер', times: ['08:00', '20:00'] },
  { value: 'утро+день+вечер', label: '☀️🌤️🌙 Утро, день и вечер', times: ['08:00', '14:00', '20:00'] }
];

export function MedicationReminderSettings({ medication, onUpdate }: MedicationReminderSettingsProps) {
  const [remindersEnabled, setRemindersEnabled] = useState(medication.remindersEnabled ?? false);
  const [timePreset, setTimePreset] = useState(medication.timeOfDay || 'утро+вечер');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://functions.poehali.dev/520001f0-b1a0-4150-b221-a38041928a67`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken || ''
        },
        body: JSON.stringify({
          id: medication.id,
          timeOfDay: remindersEnabled ? timePreset : null,
          remindersEnabled
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: remindersEnabled 
            ? 'Напоминания о приёме включены' 
            : 'Напоминания отключены'
        });
        onUpdate();
      } else {
        throw new Error('Ошибка при сохранении');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedPreset = TIME_PRESETS.find(p => p.value === timePreset);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Bell" size={18} />
          Напоминания о приёме
        </CardTitle>
        <CardDescription>
          Получайте push-уведомления в нужное время
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="reminder-toggle">Включить напоминания</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {medication.name} ({medication.dosage})
            </p>
          </div>
          <Switch
            id="reminder-toggle"
            checked={remindersEnabled}
            onCheckedChange={setRemindersEnabled}
          />
        </div>

        {remindersEnabled && (
          <>
            <div className="space-y-2">
              <Label>Время приёма</Label>
              <Select value={timePreset} onValueChange={setTimePreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPreset && (
              <Alert className="bg-blue-50 border-blue-200">
                <Icon name="Clock" size={16} className="text-blue-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-900">Вы будете получать уведомления:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPreset.times.map((time) => (
                        <Badge key={time} variant="secondary" className="bg-blue-100 text-blue-800">
                          <Icon name="Bell" size={12} className="mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription className="text-sm">
                <strong>Как это работает:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>За 30 минут до приёма придёт уведомление</li>
                  <li>Можно отметить приём или отложить на 15 минут</li>
                  <li>История приёма сохраняется автоматически</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}

        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Icon name="Loader2" className="animate-spin mr-2" size={16} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить настройки
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
