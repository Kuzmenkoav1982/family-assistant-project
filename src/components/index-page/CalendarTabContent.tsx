import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { CalendarEvent, FamilyMember } from '@/types/family.types';

interface CalendarTabContentProps {
  calendarEvents: CalendarEvent[];
  calendarFilter: 'all' | 'personal' | 'family';
  setCalendarFilter: (v: 'all' | 'personal' | 'family') => void;
  currentUserId: string;
  familyMembers: FamilyMember[];
  setCalendarEvents: (events: CalendarEvent[]) => void;
}

export default function CalendarTabContent({
  calendarEvents,
  calendarFilter,
  setCalendarFilter,
  currentUserId,
  familyMembers,
  setCalendarEvents,
}: CalendarTabContentProps) {
  return (
    <TabsContent value="calendar">
      <Card className="border-2 border-green-200 bg-green-50/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Calendar" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Как работает календарь?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Добавляйте события</strong> — дни рождения, встречи, важные даты.</p>
                <p><strong>Фильтруйте</strong> по типу: личные, семейные или все события сразу.</p>
                <p><strong>Не забывайте важное</strong> — все события в одном месте для всей семьи.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => {
            const title = prompt('Название события:');
            if (!title) return;
            const description = prompt('Описание:');
            const date = prompt('Дата (ГГГГ-ММ-ДД):');
            const time = prompt('Время (HH:MM):');
            const category = prompt('Категория (Встреча/День рождения/Другое):') || 'Другое';
            const visibility = prompt('Видимость (family/personal):') as 'family' | 'personal' || 'family';
            
            const currentUser = familyMembers.find(m => m.id === currentUserId);
            const newEvent: CalendarEvent = {
              id: Date.now().toString(),
              title,
              description: description || '',
              date: date || new Date().toISOString().split('T')[0],
              time: time || '12:00',
              category,
              color: 'bg-purple-100',
              visibility,
              createdBy: currentUserId,
              createdByName: currentUser?.name || 'Неизвестно',
              createdByAvatar: currentUser?.avatar || '\u{1F464}'
            };
            
            const updated = [...(calendarEvents || []), newEvent];
            setCalendarEvents(updated);
            localStorage.setItem('calendarEvents', JSON.stringify(updated));
          }}
          className="bg-gradient-to-r from-green-500 to-teal-500"
        >
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить событие
        </Button>
      </div>
      <Card key="calendar-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" />
              Календарь событий
            </CardTitle>
            <Tabs value={calendarFilter} onValueChange={(v) => setCalendarFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="personal">Мои</TabsTrigger>
                <TabsTrigger value="family">Семейные</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(calendarEvents || [])
              .filter(event => {
                if (calendarFilter === 'all') return true;
                if (calendarFilter === 'personal') return event.createdBy === currentUserId;
                if (calendarFilter === 'family') return event.visibility === 'family';
                return true;
              })
              .map((event, index) => (
                <div key={event.id} className={`p-4 rounded-lg ${event.color || 'bg-blue-50'} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Badge variant="outline">{event.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {new Date(event.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.createdBy === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Удалить это событие?')) {
                              const updated = (calendarEvents || []).filter(e => e.id !== event.id);
                              setCalendarEvents(updated);
                              localStorage.setItem('calendarEvents', JSON.stringify(updated));
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                      {event.createdByAvatar && event.createdByAvatar.startsWith('http') ? (
                        <img 
                          src={event.createdByAvatar} 
                          alt={event.createdByName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                        />
                      ) : (
                        <div className="text-3xl">{event.createdByAvatar}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {(calendarEvents || []).filter(event => {
              if (calendarFilter === 'all') return true;
              if (calendarFilter === 'personal') return event.createdBy === currentUserId;
              if (calendarFilter === 'family') return event.visibility === 'family';
              return true;
            }).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Нет событий в этом фильтре
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
