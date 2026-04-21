import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

// ✅ AI-рекомендации работают!
const AI_RECOMMEND_URL = 'https://functions.poehali.dev/b6fa0071-ce37-48e5-b426-66f835fb4996';

// ✅ РАБОТАЕТ: Функция trips интегрирована с поддержкой trip_places!
const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface Place {
  id: number;
  place_name: string;
  place_type: string;
  address?: string;
  description?: string;
  rating?: number;
  estimated_cost?: number;
  currency?: string;
  priority: string;
  status: string;
  visited_date?: string;
  notes?: string;
  ai_recommended: boolean;
  ai_description?: string;
  image_url?: string;
}

interface AIRecommendation {
  place_name: string;
  description: string;
  place_type: string;
  priority: string;
  ai_recommended: boolean;
}

interface TripWishListProps {
  tripId: number;
  currency?: string;
}

export function TripWishList({ tripId, currency = 'RUB' }: TripWishListProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('all');
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [tripInfo, setTripInfo] = useState<{title?: string; destination?: string} | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({
    place_name: '',
    place_type: 'attraction',
    address: '',
    description: '',
    priority: 'medium',
    estimated_cost: '',
  });

  useEffect(() => {
    loadPlaces();
    loadTripInfo();
  }, [tripId]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}?action=places&trip_id=${tripId}${statusFilter}`, {
        headers: { 'X-Auth-Token': token || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaces(data.places || []);
      }
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripInfo = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}?action=trip&id=${tripId}`, {
        headers: { 'X-Auth-Token': token || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTripInfo(data.trip || null);
      }
    } catch (error) {
      console.error('Error loading trip info:', error);
    }
  };

  const handleGetAIRecommendations = async () => {
    setIsAILoading(true);
    setIsAIDialogOpen(true);
    setAiError(null);
    setAiRecommendations([]);
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${AI_RECOMMEND_URL}/?trip_id=${tripId}`, {
        method: 'GET',
        headers: { 'X-Auth-Token': token || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.recommendations) {
          setAiRecommendations(data.recommendations);
          setTripInfo(data.trip_info || null);
        } else {
          setAiError(data.error || 'Не удалось получить рекомендации');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAiError(errorData.error || `Ошибка сервера: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setAiError('Ошибка соединения с сервером. Проверьте интернет.');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAddAIRecommendation = async (recommendation: AIRecommendation) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'add_place',
          trip_id: tripId,
          ...recommendation
        })
      });
      
      if (response.ok) {
        await loadPlaces();
      }
    } catch (error) {
      console.error('Error adding AI recommendation:', error);
    }
  };

  const handleDeletePlace = async (placeId: number) => {
    if (!confirm('Удалить это место из списка?')) return;
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({ action: 'delete_place', place_id: placeId })
      });
      if (response.ok) {
        await loadPlaces();
      } else {
        alert('Не удалось удалить место');
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Ошибка при удалении места');
    }
  };

  const handleAddPlace = async () => {
    if (!newPlace.place_name) {
      alert('Укажите название места');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'add_place',
          trip_id: tripId,
          ...newPlace,
          estimated_cost: newPlace.estimated_cost ? parseFloat(newPlace.estimated_cost) : null
        })
      });
      
      if (response.ok) {
        await loadPlaces();
        setIsAddPlaceOpen(false);
        setNewPlace({
          place_name: '',
          place_type: 'attraction',
          address: '',
          description: '',
          priority: 'medium',
          estimated_cost: '',
        });
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Ошибка при добавлении места');
    }
  };

  const handleUpdatePlaceStatus = async (placeId: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const visitedDate = status === 'visited' ? new Date().toISOString().split('T')[0] : undefined;
      
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'mark_visited',
          place_id: placeId,
          status: status,
          visited_date: visitedDate
        })
      });
      
      if (response.ok) {
        await loadPlaces();
      }
    } catch (error) {
      console.error('Error updating place status:', error);
    }
  };

  const getPlaceIcon = (type: string) => {
    const icons: Record<string, string> = {
      attraction: 'Landmark',
      restaurant: 'Utensils',
      hotel: 'Hotel',
      activity: 'PartyPopper',
      other: 'MapPin'
    };
    return icons[type] || 'MapPin';
  };

  const getPlaceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      attraction: 'Достопримечательность',
      restaurant: 'Ресторан',
      hotel: 'Отель',
      activity: 'Активность',
      other: 'Другое'
    };
    return labels[type] || 'Место';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || colors.medium;
  };

  const handleShareWishlist = () => {
    const tripName = (tripInfo as any)?.title || (tripInfo as any)?.destination || 'Наше путешествие';
    let shareText = `🗺️ Wish List: ${tripName}\n\n`;
    
    if (plannedPlaces.length === 0) {
      shareText += `📍 Список мест пока пуст.\n💡 Давайте вместе добавим места, которые хотим посетить!\n\n`;
    } else {
      shareText += `📍 Хотим посетить (${plannedPlaces.length} мест):\n\n`;

    plannedPlaces.forEach((place, index) => {
      const priorityIcon = place.priority === 'high' ? '🔥' : place.priority === 'medium' ? '⭐' : '💤';
      shareText += `${index + 1}. ${priorityIcon} ${place.place_name}`;
      if (place.place_type) {
        shareText += ` (${getPlaceTypeLabel(place.place_type)})`;
      }
      if (place.address) {
        shareText += `\n   📍 ${place.address}`;
      }
      if (place.description) {
        shareText += `\n   ℹ️ ${place.description}`;
      }
      if (place.estimated_cost) {
        shareText += `\n   💰 ~${place.estimated_cost} ${currency}`;
      }
      if (place.ai_recommended) {
        shareText += ` ✨ AI`;
      }
      shareText += '\n\n';
    });
    }

    if (visitedPlaces.length > 0) {
      shareText += `\n✅ Уже посетили (${visitedPlaces.length} мест):\n`;
      visitedPlaces.forEach((place) => {
        shareText += `• ${place.place_name}`;
        if (place.visited_date) {
          shareText += ` (${new Date(place.visited_date).toLocaleDateString('ru-RU')})`;
        }
        shareText += '\n';
      });
    }

    shareText += '\n🚀 Создано в приложении "Наша Семья" — https://nasha-semiya.ru';

    if (navigator.share) {
      navigator.share({
        title: `Wish List: ${tripName}`,
        text: shareText,
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(shareText);
        }
      });
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Wish List скопирован в буфер обмена!\nТеперь можно вставить в любое сообщение.');
    }).catch(() => {
      alert('Не удалось скопировать. Попробуйте ещё раз.');
    });
  };

  const plannedPlaces = places.filter(p => p.status === 'planned');
  const visitedPlaces = places.filter(p => p.status === 'visited');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plannedPlaces.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsAddPlaceOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить место
          </Button>
          <Button variant="outline" onClick={handleGetAIRecommendations}>
            <Icon name="Sparkles" size={16} className="mr-2" />
            AI-рекомендации
          </Button>
          <Button variant="outline" onClick={handleShareWishlist}>
            <Icon name="Share2" size={16} className="mr-2" />
            Поделиться
          </Button>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon name="Star" size={20} />
          Хотим посетить ({plannedPlaces.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {plannedPlaces.map(place => (
            <Card key={place.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon name={getPlaceIcon(place.place_type)} size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{place.place_name}</CardTitle>
                      {place.ai_recommended && (
                        <Badge variant="outline" className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200">
                          <Icon name="Sparkles" size={10} className="mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(place.priority)}`}>
                    {place.priority === 'high' && '🔥'}
                    {place.priority === 'medium' && '⭐'}
                    {place.priority === 'low' && '💤'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {place.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                )}
                {place.address && (
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Icon name="MapPin" size={12} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{place.address}</span>
                  </div>
                )}
                {place.estimated_cost && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Icon name="Coins" size={12} />
                    <span>~{place.estimated_cost} {currency}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdatePlaceStatus(place.id, 'visited')}
                  >
                    <Icon name="Check" size={14} className="mr-1" />
                    Посетили
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdatePlaceStatus(place.id, 'skipped')}
                    title="Пропустить"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeletePlace(place.id)}
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plannedPlaces.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Icon name="MapPin" size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">Список мест для посещения пуст</p>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddPlaceOpen(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить место
                </Button>
                <Button variant="outline" onClick={handleGetAIRecommendations}>
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Получить рекомендации AI
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {visitedPlaces.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-700">
            <Icon name="CheckCircle2" size={20} />
            Посетили ({visitedPlaces.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {visitedPlaces.map(place => (
              <Card key={place.id} className="bg-green-50 border-green-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Icon name={getPlaceIcon(place.place_type)} size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{place.place_name}</CardTitle>
                      {place.visited_date && (
                        <p className="text-xs text-gray-600 mt-1">
                          Посещено: {new Date(place.visited_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleUpdatePlaceStatus(place.id, 'planned')}
                        title="Вернуть в планы"
                      >
                        <Icon name="Undo2" size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePlace(place.id)}
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {place.notes && (
                  <CardContent>
                    <p className="text-sm text-gray-700">{place.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Icon name="Sparkles" size={18} className="flex-shrink-0" />
              <span className="truncate">AI-рекомендации интересных мест</span>
            </DialogTitle>
          </DialogHeader>
          
          {isAILoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Icon name="Loader2" className="animate-spin text-purple-600" size={48} />
              <p className="text-gray-600 text-center">
                AI анализирует лучшие места для посещения...<br />
                <span className="text-sm text-gray-500">Это может занять несколько секунд</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiError ? (
                <div className="text-center py-8">
                  <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 font-medium mb-2">Ошибка получения рекомендаций</p>
                  <p className="text-sm text-gray-600">{aiError}</p>
                  <Button
                    onClick={handleGetAIRecommendations}
                    variant="outline"
                    className="mt-4"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Попробовать снова
                  </Button>
                </div>
              ) : aiRecommendations.length > 0 ? (
                aiRecommendations.map((rec, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border-purple-200">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                            <Icon name={getPlaceIcon(rec.place_type)} size={24} className="text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-gray-900">{rec.place_name}</h3>
                              <Badge className="bg-purple-600 text-white flex-shrink-0">
                                <Icon name="Sparkles" size={10} className="mr-1" />
                                AI
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <Icon name={getPlaceIcon(rec.place_type)} size={12} />
                              <span>{getPlaceTypeLabel(rec.place_type)}</span>
                              {rec.priority && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                    {rec.priority === 'high' && '🔥 Обязательно'}
                                    {rec.priority === 'medium' && '⭐ Рекомендуем'}
                                    {rec.priority === 'low' && '💤 По желанию'}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">{rec.description}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const searchQuery = encodeURIComponent(`${rec.place_name} ${tripInfo?.destination || ''}`);
                            window.open(`https://yandex.ru/maps/?text=${searchQuery}`, '_blank');
                          }}
                        >
                          <Icon name="MapPin" size={14} className="mr-1" />
                          На карте
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                          onClick={() => {
                            handleAddAIRecommendation(rec);
                            setAiRecommendations(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Добавить
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Info" size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>Нет рекомендаций для отображения</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPlaceOpen} onOpenChange={setIsAddPlaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить место в Wish List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="place_name">Название места *</Label>
              <Input
                id="place_name"
                value={newPlace.place_name}
                onChange={(e) => setNewPlace({ ...newPlace, place_name: e.target.value })}
                placeholder="Эйфелева башня"
              />
            </div>
            <div>
              <Label htmlFor="place_type">Тип места</Label>
              <Select value={newPlace.place_type} onValueChange={(val) => setNewPlace({ ...newPlace, place_type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attraction">🏛️ Достопримечательность</SelectItem>
                  <SelectItem value="restaurant">🍽️ Ресторан</SelectItem>
                  <SelectItem value="hotel">🏨 Отель</SelectItem>
                  <SelectItem value="activity">🎭 Активность</SelectItem>
                  <SelectItem value="other">📍 Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={newPlace.address}
                onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                placeholder="Champ de Mars, Paris"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newPlace.description}
                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                placeholder="Почему хотите посетить это место?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Приоритет</Label>
                <Select value={newPlace.priority} onValueChange={(val) => setNewPlace({ ...newPlace, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔥 Высокий</SelectItem>
                    <SelectItem value="medium">⭐ Средний</SelectItem>
                    <SelectItem value="low">💤 Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost">Примерная стоимость</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newPlace.estimated_cost}
                  onChange={(e) => setNewPlace({ ...newPlace, estimated_cost: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlaceOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddPlace}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}