import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { eventTypeLabels, statusLabels, formatDate } from './eventDetailsConstants';
import type { FamilyEvent } from '@/types/events';

interface EventDetailsHeaderProps {
  event: FamilyEvent;
  onShowAIIdeas: () => void;
  onShowShare: () => void;
}

export default function EventDetailsHeader({ event, onShowAIIdeas, onShowShare }: EventDetailsHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Back Button */}
      <div className="flex items-center gap-2 mb-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <span className="text-sm font-medium">Назад к праздникам</span>
      </div>

      {/* Desktop Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/events')}
        className="mb-4 hidden md:flex"
      >
        <Icon name="ArrowLeft" size={16} />
        Назад к праздникам
      </Button>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Icon name="PartyPopper" className="text-pink-500" />
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
              <Icon name="Calendar" size={16} />
              <span>{formatDate(event.eventDate)}</span>
              {event.eventTime && (
                <>
                  <Icon name="Clock" size={16} className="ml-2" />
                  <span>{event.eventTime}</span>
                </>
              )}
            </div>

            {/* Mobile Badges */}
            <div className="flex gap-2 mt-3 md:hidden">
              <Badge variant={statusLabels[event.status]?.variant || 'default'}>
                {statusLabels[event.status]?.label || event.status}
              </Badge>
              <Badge variant="outline">
                {eventTypeLabels[event.eventType] || event.eventType}
              </Badge>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button onClick={onShowAIIdeas} variant="outline">
                <Icon name="Sparkles" size={16} />
                ИИ-помощник
              </Button>
              <Button onClick={onShowShare} variant="outline">
                <Icon name="Share2" size={16} />
                Поделиться
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusLabels[event.status]?.variant || 'default'}>
                {statusLabels[event.status]?.label || event.status}
              </Badge>
              <Badge variant="outline">
                {eventTypeLabels[event.eventType] || event.eventType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex flex-col gap-2 mb-4 md:hidden">
          <Button onClick={onShowAIIdeas} variant="outline" className="w-full">
            <Icon name="Sparkles" size={16} />
            ИИ-помощник
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onShowShare} variant="outline">
              <Icon name="Share2" size={16} />
              Поделиться
            </Button>
            {event.eventType === 'birthday' && (
              <div className="bg-muted rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2">
                <Icon name="Cake" size={16} />
                <span className="text-xs">День рождения</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="Users" size={16} />
                <span className="text-sm">Гостей</span>
              </div>
              <p className="text-2xl font-bold">{event.guestsCount || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="Wallet" size={16} />
                <span className="text-sm">Бюджет</span>
              </div>
              <p className="text-2xl font-bold">
                {event.budget ? `${event.budget.toLocaleString('ru-RU')} ₽` : 'Не указан'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="TrendingUp" size={16} />
                <span className="text-sm">Потрачено</span>
              </div>
              <p className="text-2xl font-bold">
                {event.spent ? `${event.spent.toLocaleString('ru-RU')} ₽` : '0 ₽'}
              </p>
            </CardContent>
          </Card>
        </div>

        {event.location && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} className="text-pink-500" />
                <span className="font-medium">{event.location}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {event.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
