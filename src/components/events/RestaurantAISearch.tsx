import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  name: string;
  address: string;
  cuisine: string;
  priceRange: string;
  description: string;
}

interface RestaurantAISearchProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const LEISURE_AI_URL = 'https://functions.poehali.dev/69dba587-f145-4cdc-bba4-3c78ae65fcb5';

export default function RestaurantAISearch({ onSelectRestaurant }: RestaurantAISearchProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Введите запрос',
        description: 'Опишите, какое заведение вы ищете',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(LEISURE_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_restaurants',
          query: query
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
        
        if (!data.restaurants || data.restaurants.length === 0) {
          toast({
            title: 'Ничего не найдено',
            description: 'Попробуйте изменить запрос',
            variant: 'destructive'
          });
        }
      } else {
        throw new Error('Поиск не удался');
      }
    } catch (error) {
      console.error('[RestaurantAISearch] Error:', error);
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось найти заведения. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>🤖 Найти заведение с помощью ИИ</Label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Например: "итальянский ресторан в центре Москвы"'
          disabled={loading}
        />
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Поиск...
            </>
          ) : (
            <>
              <Icon name="Search" size={16} className="mr-2" />
              Найти заведения
            </>
          )}
        </Button>
      </div>

      {restaurants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Найдено заведений: {restaurants.length}
          </p>
          
          {restaurants.map((restaurant, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{restaurant.name}</h4>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Icon name="MapPin" size={14} />
                      <span>{restaurant.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="UtensilsCrossed" size={14} className="text-orange-500" />
                        <span>{restaurant.cuisine}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Icon name="Wallet" size={14} className="text-green-600" />
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                    
                    {restaurant.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {restaurant.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => onSelectRestaurant(restaurant)}
                  variant="default"
                  size="sm"
                  className="w-full mt-2"
                >
                  <Icon name="Check" size={16} className="mr-2" />
                  Выбрать это место
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
