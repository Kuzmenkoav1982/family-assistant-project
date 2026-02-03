import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import RestaurantAISearch from './RestaurantAISearch';
import type { FamilyEvent } from '@/types/events';

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

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`https://functions.poehali.dev/79f31a73-5361-4721-96ff-71bfd28f43ac/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
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

  const handleSelectRestaurant = async (restaurant: { name: string; address: string; cuisine: string; priceRange: string; description: string }) => {
    const newCateringDetails = `${restaurant.cuisine} • ${restaurant.priceRange}\n${restaurant.description}`;
    
    setCateringType('restaurant');
    setVenueName(restaurant.name);
    setVenueAddress(restaurant.address);
    setCateringDetails(newCateringDetails);

    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`https://functions.poehali.dev/79f31a73-5361-4721-96ff-71bfd28f43ac/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          cateringType: 'restaurant',
          cateringDetails: newCateringDetails,
          venueName: restaurant.name,
          venueAddress: restaurant.address
        })
      });

      if (response.ok) {
        toast({ 
          title: '✓ Ресторан сохранён', 
          description: `${restaurant.name} добавлен в праздник`,
        });
        setEditing(false);
        onUpdate();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('[CateringSection] Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить ресторан. Попробуй ещё раз.',
        variant: 'destructive'
      });
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

            <div className="border-t pt-4 mt-4">
              <RestaurantAISearch onSelectRestaurant={handleSelectRestaurant} />
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