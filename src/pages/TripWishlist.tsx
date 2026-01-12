import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface WishlistItem {
  id: number;
  destination: string;
  country: string;
  description?: string;
  priority: string;
  estimated_budget?: number;
  currency: string;
  best_season?: string;
  duration_days?: number;
  tags?: string;
  image_url?: string;
}

export default function TripWishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${TRIPS_API_URL}/?action=wishlist`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWishlistItem = async (id: number) => {
    if (!confirm('Удалить эту мечту из списка?')) return;
    
    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_wishlist',
          id: id,
        }),
      });

      if (response.ok) {
        await loadWishlist();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      alert('Ошибка при удалении');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      high: { label: 'Высокий', variant: 'destructive' as const, icon: 'Flame' },
      medium: { label: 'Средний', variant: 'default' as const, icon: 'Star' },
      low: { label: 'Низкий', variant: 'secondary' as const, icon: 'Circle' }
    };
    
    const config = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  const formatBudget = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const parseTags = (tagsStr?: string) => {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/trips')}
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="Star" size={28} className="text-yellow-500" />
                  Wish List
                </h1>
                <p className="text-sm text-gray-500">Места, куда хочется поехать</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Загрузка...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Globe" size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wish List пуст</h3>
            <p className="text-gray-500 mb-4">Добавьте места, куда мечтаете поехать</p>
            <Button className="gap-2">
              <Icon name="Plus" size={18} />
              Добавить место
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {wishlist.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Image */}
                  <div className="w-full sm:w-40 h-40 sm:h-auto flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.destination}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <Icon name="MapPin" size={48} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{item.destination}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <Icon name="MapPin" size={14} className="flex-shrink-0" />
                          <span className="truncate">{typeof item.country === 'object' ? item.country.name : item.country}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">{getPriorityBadge(item.priority)}</div>
                    </div>

                    {item.description && (
                      <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                    )}

                    {/* Info Grid */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                      {item.estimated_budget && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Icon name="Wallet" size={14} className="text-blue-600 flex-shrink-0" />
                          <span className="text-gray-600">{formatBudget(item.estimated_budget, item.currency)}</span>
                        </div>
                      )}
                      {item.duration_days && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Icon name="Clock" size={14} className="text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">{item.duration_days} дней</span>
                        </div>
                      )}
                      {item.best_season && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Icon name="Sun" size={14} className="text-yellow-600 flex-shrink-0" />
                          <span className="text-gray-600">{item.best_season}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {parseTags(item.tags).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {parseTags(item.tags).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial"
                        onClick={() => {
                          alert('Функция в разработке: выбор дат для создания поездки');
                        }}
                      >
                        <Icon name="Calendar" size={14} />
                        Запланировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs sm:text-sm"
                      >
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWishlistItem(item.id)}
                      >
                        <Icon name="Trash2" size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Icon name="Plus" size={24} />
      </Button>
    </div>
  );
}