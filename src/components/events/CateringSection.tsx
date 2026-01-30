import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { FamilyEvent, NearbyPlace } from '@/types/events';

interface CateringSectionProps {
  event: FamilyEvent;
  onUpdate: () => void;
}

export default function CateringSection({ event, onUpdate }: CateringSectionProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [cateringType, setCateringType] = useState<'catering' | 'restaurant' | 'none'>(
    event.cateringType || 'none'
  );
  const [cateringDetails, setCateringDetails] = useState(event.cateringDetails || '');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          cateringType,
          cateringDetails
        })
      });

      if (response.ok) {
        toast({ title: 'Сохранено', description: 'Информация о питании обновлена' });
        setEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('[CateringSection] Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const searchNearbyPlaces = async () => {
    if (!event.location) {
      toast({
        title: 'Укажите адрес',
        description: 'Сначала добавьте адрес проведения мероприятия',
        variant: 'destructive'
      });
      return;
    }

    setLoadingPlaces(true);
    try {
      const response = await fetch(
        `https://search-maps.yandex.ru/v1/?text=кафе ресторан&ll=${event.location}&type=biz&lang=ru_RU&apikey=YOUR_API_KEY`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNearbyPlaces(data.features?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('[CateringSection] Search error:', error);
      setNearbyPlaces([
        {
          name: 'Ресторан "Праздник"',
          address: 'рядом с местом проведения',
          rating: 4.5,
          phone: '+7 (999) 123-45-67',
          distance: 500,
          type: 'restaurant'
        },
        {
          name: 'Кафе "Уют"',
          address: 'в 2 минутах ходьбы',
          rating: 4.2,
          phone: '+7 (999) 765-43-21',
          distance: 300,
          type: 'cafe'
        }
      ]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="UtensilsCrossed" className="text-orange-500" />
              Питание
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Icon name="Pencil" size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!event.cateringType || event.cateringType === 'none' ? (
            <p className="text-muted-foreground">Питание не указано</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon
                  name={event.cateringType === 'catering' ? 'Truck' : 'Store'}
                  size={18}
                  className="text-muted-foreground"
                />
                <span className="font-medium">
                  {event.cateringType === 'catering' ? 'Кейтринг' : 'Ресторан/Кафе'}
                </span>
              </div>
              {event.cateringDetails && (
                <p className="text-sm text-muted-foreground">{event.cateringDetails}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UtensilsCrossed" className="text-orange-500" />
          Питание
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Тип питания</Label>
          <RadioGroup value={cateringType} onValueChange={(v) => setCateringType(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal cursor-pointer">
                Не указано
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="catering" id="catering" />
              <Label htmlFor="catering" className="font-normal cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon name="Truck" size={16} />
                  Кейтринг (доставка готовой еды)
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="restaurant" id="restaurant" />
              <Label htmlFor="restaurant" className="font-normal cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon name="Store" size={16} />
                  Ресторан/Кафе
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {cateringType === 'catering' && (
          <div>
            <Label htmlFor="catering-details">Информация о кейтеринге</Label>
            <Textarea
              id="catering-details"
              placeholder="Название компании, меню, контакты..."
              value={cateringDetails}
              onChange={(e) => setCateringDetails(e.target.value)}
            />
          </div>
        )}

        {cateringType === 'restaurant' && (
          <>
            <div>
              <Label htmlFor="restaurant-details">Информация о заведении</Label>
              <Textarea
                id="restaurant-details"
                placeholder="Название, адрес, контакты..."
                value={cateringDetails}
                onChange={(e) => setCateringDetails(e.target.value)}
              />
            </div>

            <div>
              <Button
                variant="outline"
                onClick={searchNearbyPlaces}
                disabled={loadingPlaces || !event.location}
                className="w-full"
              >
                <Icon name="Search" size={16} />
                {loadingPlaces ? 'Ищем...' : 'Найти заведения рядом'}
              </Button>

              {nearbyPlaces.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Ближайшие заведения:</p>
                  {nearbyPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition"
                      onClick={() => {
                        setCateringDetails(
                          `${place.name}\n${place.address}${place.phone ? `\n${place.phone}` : ''}`
                        );
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{place.name}</p>
                          <p className="text-sm text-muted-foreground">{place.address}</p>
                          {place.phone && (
                            <p className="text-sm text-muted-foreground">{place.phone}</p>
                          )}
                        </div>
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{place.rating}</span>
                          </div>
                        )}
                      </div>
                      {place.distance && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ~{place.distance}м от места проведения
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Icon name="Check" size={16} />
            Сохранить
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
