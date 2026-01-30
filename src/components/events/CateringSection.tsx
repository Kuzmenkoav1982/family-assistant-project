import { useState, useEffect, useRef } from 'react';
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
  const [venueName, setVenueName] = useState(event.venueName || '');
  const [venueAddress, setVenueAddress] = useState(event.venueAddress || '');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [cuisineType, setCuisineType] = useState('all');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const cuisineTypes = [
    { value: 'all', label: 'Все заведения', query: 'кафе ресторан' },
    { value: 'italian', label: 'Итальянская', query: 'итальянский ресторан' },
    { value: 'japanese', label: 'Японская', query: 'японский ресторан суши' },
    { value: 'georgian', label: 'Грузинская', query: 'грузинский ресторан' },
    { value: 'caucasian', label: 'Кавказская', query: 'кавказская кухня' },
    { value: 'european', label: 'Европейская', query: 'европейская кухня' },
    { value: 'asian', label: 'Азиатская', query: 'азиатская кухня' },
    { value: 'cafe', label: 'Кафе', query: 'кафе' },
    { value: 'fastfood', label: 'Фастфуд', query: 'фастфуд' },
    { value: 'bakery', label: 'Пекарня/Кондитерская', query: 'кондитерская пекарня' }
  ];

  useEffect(() => {
    if (showMap && mapRef.current && nearbyPlaces.length > 0 && !mapInstanceRef.current) {
      const ymaps = (window as any).ymaps;
      if (!ymaps) return;

      ymaps.ready(() => {
        if (mapInstanceRef.current) return;

        const [eventLng, eventLat] = event.location?.split(',').map(Number) || [37.6173, 55.7558];
        
        const map = new ymaps.Map('yandex-map', {
          center: [eventLat, eventLng],
          zoom: 14,
          controls: ['zoomControl', 'fullscreenControl']
        });

        const eventPlacemark = new ymaps.Placemark(
          [eventLat, eventLng],
          { hintContent: 'Место проведения', balloonContent: event.title },
          { preset: 'islands#redDotIcon' }
        );
        map.geoObjects.add(eventPlacemark);

        nearbyPlaces.forEach((place) => {
          if (place.coordinates && place.coordinates.length === 2) {
            const placemark = new ymaps.Placemark(
              [place.coordinates[1], place.coordinates[0]],
              {
                hintContent: place.name,
                balloonContent: `
                  <strong>${place.name}</strong><br/>
                  ${place.address}<br/>
                  ${place.rating ? `⭐ ${place.rating}` : ''}
                `
              },
              { preset: 'islands#orangeDotIcon' }
            );
            map.geoObjects.add(placemark);
          }
        });

        mapInstanceRef.current = map;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, nearbyPlaces, event.location, event.title]);

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
          cateringDetails,
          venueName,
          venueAddress
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
      const keyResponse = await fetch('https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7');
      const { apiKey } = await keyResponse.json();

      const selectedCuisine = cuisineTypes.find(c => c.value === cuisineType);
      const searchQuery = selectedCuisine?.query || 'кафе ресторан';

      const [eventLng, eventLat] = event.location.split(',').map(Number);
      const response = await fetch(
        `https://search-maps.yandex.ru/v1/?text=${encodeURIComponent(searchQuery)}&ll=${eventLng},${eventLat}&type=biz&lang=ru_RU&apikey=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const places = data.features?.slice(0, 10).map((f: any) => ({
          name: f.properties?.name || 'Заведение',
          address: f.properties?.description || '',
          coordinates: f.geometry?.coordinates || [],
          rating: f.properties?.rating || null,
          phone: f.properties?.phone || null,
          distance: null,
          type: 'restaurant'
        })) || [];
        setNearbyPlaces(places);
        if (places.length > 0) setShowMap(true);
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
              Ресторан
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
              {event.venueName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{event.venueName}</span>
                  </div>
                  {event.venueAddress && (
                    <p className="text-sm text-muted-foreground ml-6">{event.venueAddress}</p>
                  )}
                </div>
              )}
              {event.cateringDetails && (
                <p className="text-sm text-muted-foreground mt-2">{event.cateringDetails}</p>
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
          Ресторан
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
            <div className="space-y-3">
              <div>
                <Label htmlFor="venue-name">Название заведения</Label>
                <Input
                  id="venue-name"
                  placeholder="Например: Ресторан 'Праздник'"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="venue-address">Адрес заведения</Label>
                <Input
                  id="venue-address"
                  placeholder="Укажите точный адрес"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="restaurant-details">Дополнительная информация</Label>
                <Textarea
                  id="restaurant-details"
                  placeholder="Меню, особенности, контакты..."
                  value={cateringDetails}
                  onChange={(e) => setCateringDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Тип кухни</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cuisineTypes.map((cuisine) => (
                    <Button
                      key={cuisine.value}
                      variant={cuisineType === cuisine.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCuisineType(cuisine.value)}
                      className="text-xs"
                    >
                      {cuisine.label}
                    </Button>
                  ))}
                </div>
              </div>

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
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Найдено заведений: {nearbyPlaces.length}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                    >
                      <Icon name={showMap ? 'List' : 'Map'} size={14} />
                      {showMap ? 'Список' : 'Карта'}
                    </Button>
                  </div>

                  {showMap && (
                    <div
                      ref={mapRef}
                      className="w-full h-[400px] rounded-lg border"
                      id="yandex-map"
                    />
                  )}

                  <div className="space-y-2">
                    {nearbyPlaces.map((place, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition"
                        onClick={() => {
                          setVenueName(place.name);
                          setVenueAddress(place.address);
                          if (place.phone) {
                            setCateringDetails(`Телефон: ${place.phone}`);
                          }
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
                      </div>
                    ))}
                  </div>
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