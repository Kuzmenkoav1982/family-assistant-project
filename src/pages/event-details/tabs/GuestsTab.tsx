import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { guestStatusLabels } from '../eventDetailsConstants';
import type { EventGuest } from '@/types/events';

interface Props {
  guests: EventGuest[];
  guestsLoading: boolean;
  onShowAddGuest: () => void;
  fetchGuests: () => void;
}

export default function GuestsTab({ guests, guestsLoading, onShowAddGuest, fetchGuests }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Список гостей</CardTitle>
        <Button onClick={() => { onShowAddGuest(); fetchGuests(); }}>
          <Icon name="Plus" size={16} />
          Добавить гостя
        </Button>
      </CardHeader>
      <CardContent>
        {guestsLoading ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={24} />
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Гостей пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{guest.name}</p>
                  <p className="text-sm text-gray-600">
                    {guest.adultsCount} взр. {guest.childrenCount > 0 && `• ${guest.childrenCount} реб.`}
                    {guest.phone && ` • ${guest.phone}`}
                  </p>
                  {guest.dietaryRestrictions && (
                    <p className="text-sm text-gray-500 mt-1">🍽️ {guest.dietaryRestrictions}</p>
                  )}
                </div>
                <Badge variant={guestStatusLabels[guest.status]?.variant || 'default'}>
                  {guestStatusLabels[guest.status]?.label || guest.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
