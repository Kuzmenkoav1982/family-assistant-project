import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import { MedicationReminderSettings } from './MedicationReminderSettings';

interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
}

interface MedicationFile {
  url: string;
  filename: string;
  fileType: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
  purpose?: string;
  reminders: Reminder[];
  files?: MedicationFile[];
}

interface MedicationCardProps {
  medication: Medication;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (medication: Medication) => void;
}

export function MedicationCard({ medication, onUpdate, onDelete, onEdit }: MedicationCardProps) {
  const [intakes, setIntakes] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleIntakeToggle = async (reminderId: string, time: string, checked: boolean) => {
    setLoading({ ...loading, [reminderId]: true });
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['medication-intakes'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': medication.id,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          medicationId: medication.id,
          reminderId: reminderId,
          scheduledTime: time,
          scheduledDate: new Date().toISOString().split('T')[0],
          status: checked ? 'taken' : 'pending',
          actualTime: checked ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        setIntakes({ ...intakes, [reminderId]: checked });
        toast({
          title: checked ? 'Приём отмечен' : 'Отметка снята',
          description: `${medication.name} в ${time}`
        });
        onUpdate?.();
      } else {
        throw new Error('Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Intake toggle error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить отметку о приёме',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, [reminderId]: false });
    }
  };

  return (
    <Card className={!medication.active ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Pill" size={18} className={medication.active ? 'text-green-600' : 'text-gray-400'} />
              {medication.name}
            </CardTitle>
            {!medication.active && (
              <p className="text-xs text-muted-foreground">Прием завершен</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {medication.active && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Icon name="Bell" size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Настройка напоминаний</DialogTitle>
                  </DialogHeader>
                  <MedicationReminderSettings 
                    medication={medication}
                    onUpdate={() => onUpdate?.()}
                  />
                </DialogContent>
              </Dialog>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(medication)}
              >
                <Icon name="Pencil" size={16} />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  if (confirm(`Удалить лекарство "${medication.name}"?`)) {
                    onDelete(medication.id);
                  }
                }}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Дозировка:</span>
          <span className="font-medium">{medication.dosage}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Частота:</span>
          <span>{medication.frequency}</span>
        </div>
        {medication.purpose && (
          <div className="text-sm">
            <span className="text-muted-foreground">Назначение:</span> {medication.purpose}
          </div>
        )}
        
        {medication.files && medication.files.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Icon name="Paperclip" size={12} />
              Прикрепленные файлы:
            </p>
            <div className="flex flex-wrap gap-2">
              {medication.files.map((file, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <Icon name="FileText" size={12} className="mr-1" />
                  {file.filename}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {medication.reminders.length > 0 && medication.active && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs font-medium mb-2 flex items-center gap-1">
              <Icon name="Bell" size={12} />
              Время приёма сегодня:
            </p>
            <div className="space-y-2">
              {medication.reminders.map((rem) => (
                <div key={rem.id} className="flex items-center gap-2">
                  <Checkbox
                    id={rem.id}
                    checked={intakes[rem.id] || false}
                    disabled={loading[rem.id]}
                    onCheckedChange={(checked) => handleIntakeToggle(rem.id, rem.time, checked as boolean)}
                  />
                  <label 
                    htmlFor={rem.id} 
                    className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                  >
                    <Icon name="Clock" size={14} />
                    <span className="font-medium">{rem.time}</span>
                    {intakes[rem.id] && (
                      <span className="text-xs text-green-600">✓ Принято</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}