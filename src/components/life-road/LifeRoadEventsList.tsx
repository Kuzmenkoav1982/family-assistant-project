import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { usePermissions } from '@/hooks/usePermissions';

interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'birth' | 'wedding' | 'education' | 'career' | 'achievement' | 'travel' | 'family' | 'health' | 'other';
  importance: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  photos?: string[];
  createdBy: string;
  createdAt: string;
}

interface LifeRoadEventsListProps {
  filteredEvents: LifeEvent[];
  categoryConfig: {
    [key: string]: { label: string; icon: string; color: string };
  };
  importanceConfig: {
    [key: string]: { label: string; color: string };
  };
  handleDeleteEvent: (eventId: string) => void;
  getEventAge: (date: string) => string;
}

export function LifeRoadEventsList({
  filteredEvents,
  categoryConfig,
  importanceConfig,
  handleDeleteEvent,
  getEventAge
}: LifeRoadEventsListProps) {
  const { members } = useFamilyMembersContext();
  const { canDo } = usePermissions();

  const handleDelete = (eventId: string) => {
    if (!canDo('events', 'delete')) {
      alert('❌ У вас недостаточно прав для удаления событий');
      return;
    }
    handleDeleteEvent(eventId);
  };

  if (filteredEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon name="Calendar" size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-2">Нет событий для отображения</p>
          <p className="text-gray-500 text-sm">Добавьте первое событие или измените фильтры</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredEvents.map((event, index) => {
        const config = categoryConfig[event.category];
        const impConfig = importanceConfig[event.importance];
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();

        return (
          <Card 
            key={event.id} 
            className={`relative overflow-hidden ${isUpcoming ? 'border-dashed border-2' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${config.color.split(' ')[0]}`} />
            
            <CardHeader className="pl-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={config.color}>
                      <Icon name={config.icon as any} size={12} className="mr-1" />
                      {config.label}
                    </Badge>
                    <Badge className={impConfig.color}>
                      {impConfig.label}
                    </Badge>
                    {isUpcoming && (
                      <Badge className="bg-blue-100 text-blue-600">
                        <Icon name="Clock" size={12} className="mr-1" />
                        Предстоящее
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} />
                    {eventDate.toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {!isUpcoming && (
                      <span className="text-gray-400">• {getEventAge(event.date)}</span>
                    )}
                  </CardDescription>
                </div>
                {canDo('events', 'delete') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Удалить это событие?')) {
                        handleDelete(event.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pl-6">
              {event.description && (
                <p className="text-gray-700 mb-4">{event.description}</p>
              )}

              {event.participants.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Icon name="Users" size={14} />
                    Участники:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map((participantId) => {
                      const member = members?.find(m => m.id === participantId);
                      return (
                        <Badge key={participantId} variant="outline">
                          {member?.name || participantId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {event.photos && event.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Icon name="Image" size={14} />
                    Фотографии:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {event.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${event.title} ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}