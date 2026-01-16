import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const LEISURE_AI_URL = 'https://functions.poehali.dev/69dba587-f145-4cdc-bba4-3c78ae65fcb5';

interface SearchPlace {
  name: string;
  description?: string;
  address?: string;
  categories?: string[];
  phone?: string;
  hours?: string;
  url?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface PlaceSearchProps {
  onSelectPlace: (place: SearchPlace) => void;
}

export function PlaceSearch({ onSelectPlace }: PlaceSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Москва');
  const [results, setResults] = useState<SearchPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SearchPlace | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Введите запрос для поиска');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(LEISURE_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_places',
          query,
          city
        })
      });

      const data = await response.json();
      console.log('[PlaceSearch] API Response:', data);
      console.log('[PlaceSearch] Places count:', data.places?.length || 0);
      setResults(data.places || []);
    } catch (error) {
      console.error('Error searching places:', error);
      alert('Ошибка при поиске мест');
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
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
        <Icon name="Search" size={20} />
        Поиск мест
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Search" size={24} />
              Поиск мест на карте
            </DialogTitle>
            <DialogDescription>
              Найдите интересные места рядом с вами через Яндекс.Карты
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label>Что ищем?</Label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Например: музеи, рестораны, парки"
                  autoFocus
                />
              </div>
              <div>
                <Label>Город</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Москва"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleSearch} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Поиск...
                </>
              ) : (
                <>
                  <Icon name="Search" size={16} className="mr-2" />
                  Найти
                </>
              )}
              </Button>
              {results.length > 0 && (
                <Button
                  type="button"
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                  className="gap-2"
                >
                  <Icon name={viewMode === 'map' ? 'List' : 'Map'} size={16} />
                  {viewMode === 'map' ? 'Список' : 'Карта'}
                </Button>
              )}
            </div>

            {/* Результаты */}
            {results.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Найдено: {results.length}</h3>
                  {results.length > 20 && (
                    <span className="text-sm text-gray-500">Уточните запрос для лучших результатов</span>
                  )}
                </div>
                
                {viewMode === 'map' ? (
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-4 h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="Map" size={48} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Просмотр на карте</p>
                        <a
                          href={`https://yandex.ru/maps/?text=${encodeURIComponent(query + ' ' + city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Открыть в Яндекс.Картах →
                        </a>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      💡 Совет: кликните на место из списка ниже для просмотра на карте
                    </div>
                  </div>
                ) : null}
                
                <div className={`space-y-2 ${viewMode === 'map' ? 'max-h-[200px]' : 'max-h-[500px]'} overflow-y-auto`}>
                  {results.map((place, index) => (
                    <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            // Адаптируем формат для handleAddFromSearch
                            const adaptedPlace = {
                              name: place.name,
                              formatted_address: place.address,
                              vicinity: place.description,
                              website: place.url || '',
                              formatted_phone_number: place.phone || '',
                              geometry: place.coordinates ? {
                                location: {
                                  lat: place.coordinates.lat,
                                  lng: place.coordinates.lon
                                }
                              } : undefined,
                              types: place.categories || []
                            };
                            onSelectPlace(adaptedPlace);
                            setIsOpen(false);
                          }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{place.name}</h4>
                          {place.description && (
                            <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                          )}
                          {place.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Icon name="MapPin" size={12} />
                              {place.address}
                            </div>
                          )}
                          {place.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Icon name="Phone" size={12} />
                              {place.phone}
                            </div>
                          )}
                          {place.hours && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Icon name="Clock" size={12} />
                              {place.hours}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {place.categories && place.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {place.categories.slice(0, 3).map((cat, idx) => (
                                  <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                            {place.url && (
                              <a
                                href={place.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-auto"
                              >
                                <Icon name="ExternalLink" size={12} />
                                На карте
                              </a>
                            )}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}