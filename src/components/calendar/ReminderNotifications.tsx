import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { CalendarEvent } from '@/types/family.types';

interface ReminderNotificationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminders: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function ReminderNotifications({
  open,
  onOpenChange,
  reminders,
  onEventClick
}: ReminderNotificationsProps) {
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      personal: 'Личное',
      family: 'Семья',
      work: 'Работа',
      health: 'Здоровье',
      education: 'Образование',
      leisure: 'Досуг'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-700',
      family: 'bg-green-100 text-green-700',
      work: 'bg-purple-100 text-purple-700',
      health: 'bg-red-100 text-red-700',
      education: 'bg-yellow-100 text-yellow-700',
      leisure: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const formatEventDate = (dateStr: string, timeStr?: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('ru-RU', options);
    return timeStr ? `${formattedDate} в ${timeStr}` : formattedDate;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Bell" size={24} className="text-orange-500" />
            Напоминания
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 text-green-500" />
              <p>Нет активных напоминаний</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                У вас {reminders.length} предстоящих {reminders.length === 1 ? 'событие' : 'события'}
              </p>
              {reminders.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    onEventClick(event);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold flex-1">{event.title}</h4>
                    <Badge className={getCategoryColor(event.category)}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="Clock" size={14} />
                    <span>{formatEventDate(event.date, event.time)}</span>
                  </div>
                  
                  {event.reminderDays && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
                      <Icon name="Bell" size={14} />
                      <span>Напоминание за {event.reminderDays} {event.reminderDays === 1 ? 'день' : 'дней'}</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
