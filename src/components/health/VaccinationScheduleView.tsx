import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface ScheduleVaccination {
  id: string;
  name: string;
  ageMonths: number;
  description: string;
  isMandatory: boolean;
  status?: 'completed' | 'planned' | 'upcoming' | 'overdue';
  completedDate?: string;
}

interface VaccinationScheduleViewProps {
  profileId: string;
  profileBirthDate: string;
  completedVaccinations: any[];
}

export function VaccinationScheduleView({ 
  profileId, 
  profileBirthDate,
  completedVaccinations 
}: VaccinationScheduleViewProps) {
  const [schedule, setSchedule] = useState<ScheduleVaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAgeInMonths = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return years * 12 + months;
  };

  const getVaccinationStatus = (ageMonths: number, name: string): { status: string; date?: string } => {
    const completed = completedVaccinations.find(v => 
      v.name.toLowerCase().includes(name.toLowerCase().split('(')[0].trim())
    );
    
    if (completed) {
      return { status: 'completed', date: completed.date };
    }

    const currentAge = getAgeInMonths(profileBirthDate);
    if (currentAge < ageMonths) {
      return { status: 'upcoming' };
    } else if (currentAge >= ageMonths && currentAge < ageMonths + 3) {
      return { status: 'planned' };
    } else {
      return { status: 'overdue' };
    }
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${func2url['health-vaccinations']}/schedule`, {
          headers: {
            'X-User-Id': profileId,
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          const enrichedSchedule = data.map((item: any) => {
            const { status, date } = getVaccinationStatus(item.ageMonths, item.name);
            return {
              ...item,
              status,
              completedDate: date
            };
          });
          setSchedule(enrichedSchedule);
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [profileId, completedVaccinations, profileBirthDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">✓ Выполнено</Badge>;
      case 'planned':
        return <Badge className="bg-blue-500">По плану</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Предстоит</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Просрочено</Badge>;
      default:
        return null;
    }
  };

  const formatAge = (months: number): string => {
    if (months === 0) return 'При рождении';
    if (months < 12) return `${months} мес.`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    return `${years}г ${remainingMonths}м`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" size={24} className="animate-spin" />
      </div>
    );
  }

  const grouped = {
    overdue: schedule.filter(v => v.status === 'overdue'),
    planned: schedule.filter(v => v.status === 'planned'),
    upcoming: schedule.filter(v => v.status === 'upcoming'),
    completed: schedule.filter(v => v.status === 'completed')
  };

  return (
    <div className="space-y-4">
      {grouped.overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <Icon name="AlertCircle" size={18} />
              Просроченные прививки ({grouped.overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {grouped.overdue.map(vacc => (
              <div key={vacc.id} className="flex items-start justify-between p-2 bg-white dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{vacc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Плановый возраст: {formatAge(vacc.ageMonths)}
                  </p>
                </div>
                {getStatusBadge(vacc.status || 'upcoming')}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {grouped.planned.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Icon name="Calendar" size={18} />
              По плану ({grouped.planned.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {grouped.planned.map(vacc => (
              <div key={vacc.id} className="flex items-start justify-between p-2 bg-white dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{vacc.name}</p>
                  <p className="text-xs text-muted-foreground">{vacc.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Возраст: {formatAge(vacc.ageMonths)}
                  </p>
                </div>
                {getStatusBadge(vacc.status || 'upcoming')}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="CheckCircle2" size={18} className="text-green-600" />
            Выполненные ({grouped.completed.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {grouped.completed.map(vacc => (
              <div key={vacc.id} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{vacc.name}</p>
                  {vacc.completedDate && (
                    <p className="text-xs text-muted-foreground">
                      Дата: {new Date(vacc.completedDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>
                {getStatusBadge('completed')}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {grouped.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Clock" size={18} />
              Предстоящие ({grouped.upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {grouped.upcoming.map(vacc => (
              <div key={vacc.id} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{vacc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Плановый возраст: {formatAge(vacc.ageMonths)}
                  </p>
                </div>
                {getStatusBadge(vacc.status || 'upcoming')}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
