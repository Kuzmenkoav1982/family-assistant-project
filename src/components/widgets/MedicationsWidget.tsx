import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import func2url from '../../../backend/func2url.json';

interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export function MedicationsWidget() {
  const [todayMedications, setTodayMedications] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTodayMedications = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setLoading(false);
        return;
      }

      const medsResponse = await fetch(func2url['health-medications'], {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!medsResponse.ok) {
        throw new Error('Failed to fetch medications');
      }

      const medications = await medsResponse.json();
      const activeMeds = medications.filter((m: any) => m.active);

      const reminders: MedicationReminder[] = [];
      const today = new Date().toISOString().split('T')[0];

      for (const med of activeMeds) {
        for (const reminder of med.reminders || []) {
          if (reminder.enabled) {
            const intakesResponse = await fetch(
              `${func2url['medication-intakes']}?medicationId=${med.id}`,
              {
                headers: {
                  'X-User-Id': userId,
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              }
            );

            let taken = false;
            if (intakesResponse.ok) {
              const intakes = await intakesResponse.json();
              taken = intakes.some(
                (intake: any) =>
                  intake.scheduledDate === today &&
                  intake.scheduledTime === reminder.time &&
                  intake.status === 'taken'
              );
            }

            reminders.push({
              id: reminder.id,
              medicationId: med.id,
              medicationName: med.name,
              dosage: med.dosage,
              time: reminder.time,
              taken
            });
          }
        }
      }

      reminders.sort((a, b) => a.time.localeCompare(b.time));
      setTodayMedications(reminders);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayMedications();
  }, []);

  const handleToggle = async (reminder: MedicationReminder, checked: boolean) => {
    setUpdating({ ...updating, [reminder.id]: true });

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const response = await fetch(func2url['medication-intakes'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || '',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          medicationId: reminder.medicationId,
          reminderId: reminder.id,
          scheduledTime: reminder.time,
          scheduledDate: new Date().toISOString().split('T')[0],
          status: checked ? 'taken' : 'pending',
          actualTime: checked ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        setTodayMedications(prev =>
          prev.map(m =>
            m.id === reminder.id ? { ...m, taken: checked } : m
          )
        );

        toast({
          title: checked ? '✓ Приём отмечен' : 'Отметка снята',
          description: `${reminder.medicationName} в ${reminder.time}`
        });
      } else {
        throw new Error('Failed to update intake');
      }
    } catch (error) {
      console.error('Failed to toggle intake:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить отметку',
        variant: 'destructive'
      });
    } finally {
      setUpdating({ ...updating, [reminder.id]: false });
    }
  };

  const handleMarkAll = async () => {
    const unchecked = todayMedications.filter(m => !m.taken);
    for (const reminder of unchecked) {
      await handleToggle(reminder, true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todayMedications.length === 0) {
    return null;
  }

  const takenCount = todayMedications.filter(m => m.taken).length;
  const totalCount = todayMedications.length;
  const progress = (takenCount / totalCount) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Pill" size={20} className="text-blue-600" />
            Лекарства на сегодня
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/health')}
          >
            <Icon name="ArrowRight" size={16} />
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Принято {takenCount} из {totalCount}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {todayMedications.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                reminder.taken
                  ? 'bg-green-50 dark:bg-green-950 border-green-200'
                  : 'bg-white dark:bg-gray-900 border-gray-200 hover:border-blue-300'
              }`}
            >
              <Checkbox
                id={reminder.id}
                checked={reminder.taken}
                disabled={updating[reminder.id]}
                onCheckedChange={(checked) => handleToggle(reminder, checked as boolean)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <label
                  htmlFor={reminder.id}
                  className="cursor-pointer block"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={14} className="text-muted-foreground" />
                    <span className="font-medium text-sm">{reminder.time}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className={reminder.taken ? 'line-through text-muted-foreground' : 'font-medium'}>
                      {reminder.medicationName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reminder.dosage}
                  </p>
                </label>
              </div>
              {reminder.taken && (
                <Icon name="CheckCircle2" size={18} className="text-green-600" />
              )}
            </div>
          ))}
        </div>

        {takenCount < totalCount && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleMarkAll}
          >
            <Icon name="CheckCheck" size={16} className="mr-2" />
            Отметить всё принятым
          </Button>
        )}

        {takenCount === totalCount && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
              <Icon name="PartyPopper" size={16} />
              Все лекарства приняты!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
