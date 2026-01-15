import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FamilyMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  color: string;
}

interface LocationData {
  memberId: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number;
}

interface Geofence {
  id: number;
  name: string;
  center_lat: number;
  center_lng: number;
  radius: number;
  color: string;
}

export default function FamilyTracker() {
  const navigate = useNavigate();
  const [map, setMap] = useState<any>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(() => {
    return localStorage.getItem('isTracking') === 'true';
  });
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(500);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const watchId = useRef<number | null>(null);
  const circleRef = useRef<any>(null);

  // Загрузка членов семьи
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
        const response = await fetch('https://functions.poehali.dev/2408ee6f-f00b-49c1-9d7a-2d515db9616d', {
          method: 'GET',
          headers: {
            'X-Auth-Token': token || ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFamilyMembers(data.members || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки членов семьи:', error);
      }
    };

    loadMembers();
  }, []);

  // Инициализация Яндекс.Карт
  useEffect(() => {
    const initMap = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7');
        const data = await response.json();
        const apiKey = data.apiKey;

        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          window.ymaps.ready(() => {
            if (!mapContainer.current) return;

            // @ts-ignore
            const mapInstance = new window.ymaps.Map(mapContainer.current, {
              center: [55.751244, 37.618423], // Москва по умолчанию
              zoom: 12,
              controls: ['zoomControl', 'fullscreenControl']
            });

            // Обработчик клика по карте для добавления зоны
            mapInstance.events.add('click', (e: any) => {
              if (isAddingZone && newZoneName) {
                const coords = e.get('coords');
                addGeofence(coords[0], coords[1]);
              }
            });

            setMap(mapInstance);
          });
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Ошибка загрузки API ключа Яндекс.Карт:', error);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // Запуск отслеживания геолокации
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Ваш браузер не поддерживает геолокацию');
      return;
    }

    setError('');
    setIsTracking(true);
    localStorage.setItem('isTracking', 'true');

    // Получение координат и отправка на сервер
    const sendCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const newLocation = {
            memberId: '1',
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
            accuracy
          };

          setCurrentLocation({ lat: latitude, lng: longitude });
          sendLocationToServer(newLocation);

          // Центрирование карты
          if (map) {
            map.setCenter([latitude, longitude]);
            // @ts-ignore
            const placemark = new window.ymaps.Placemark(
              [latitude, longitude],
              { balloonContent: 'Вы здесь' },
              { preset: 'islands#blueCircleDotIcon' }
            );
            map.geoObjects.add(placemark);
          }
        },
        (err) => {
          setError(`Ошибка получения геолокации: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    // Отправить координаты сразу
    sendCurrentLocation();

    // Настроить Service Worker для фоновой отправки
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      navigator.serviceWorker.controller.postMessage({
        type: 'START_GEOLOCATION',
        interval: 600000, // 10 минут
        apiUrl: 'https://functions.poehali.dev/45705c25-441b-4063-8e0b-795feb904533',
        authToken: token
      });

      // Слушаем запросы от Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'REQUEST_LOCATION') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              try {
                await fetch(event.data.apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': event.data.authToken || ''
                  },
                  body: JSON.stringify({
                    lat: latitude,
                    lng: longitude,
                    accuracy
                  })
                });
              } catch (error) {
                console.error('Ошибка отправки координат:', error);
              }
            },
            (err) => console.error('Ошибка геолокации:', err),
            { enableHighAccuracy: true }
          );
        }
      });
    }

    // Периодическое обновление на странице (каждые 10 минут)
    watchId.current = window.setInterval(sendCurrentLocation, 600000);
  };

  // Остановка отслеживания
  const stopTracking = () => {
    if (watchId.current !== null) {
      clearInterval(watchId.current);
      watchId.current = null;
    }
    
    // Остановить Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_GEOLOCATION'
      });
    }
    
    setIsTracking(false);
    localStorage.setItem('isTracking', 'false');
  };

  // Добавление геозоны
  const addGeofence = async (lat: number, lng: number) => {
    if (!newZoneName) {
      setError('Введите название зоны');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch('https://functions.poehali.dev/430446f6-ba86-44eb-af18-36af99419459', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          name: newZoneName,
          center_lat: lat,
          center_lng: lng,
          radius: newZoneRadius,
          color: '#9333EA'
        })
      });

      if (response.ok) {
        const newZone = await response.json();
        setGeofences([...geofences, newZone]);
        
        // Отрисовка круга на карте
        if (map) {
          // @ts-ignore
          const circle = new window.ymaps.Circle(
            [[lat, lng], newZoneRadius],
            {},
            {
              fillColor: '#9333EA30',
              strokeColor: '#9333EA',
              strokeWidth: 2
            }
          );
          map.geoObjects.add(circle);

          // Метка с названием
          // @ts-ignore
          const placemark = new window.ymaps.Placemark(
            [lat, lng],
            { balloonContent: newZoneName },
            { preset: 'islands#violetCircleDotIcon' }
          );
          map.geoObjects.add(placemark);
        }

        setNewZoneName('');
        setIsAddingZone(false);
        setError('');
      }
    } catch (error) {
      setError('Ошибка добавления зоны');
      console.error(error);
    }
  };

  // Удаление геозоны
  const deleteGeofence = async (zoneId: number) => {
    if (!confirm('Удалить эту зону?')) return;
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`https://functions.poehali.dev/430446f6-ba86-44eb-af18-36af99419459?id=${zoneId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      if (response.ok) {
        // Обновляем список зон
        setGeofences(geofences.filter(z => z.id !== zoneId));
        // Перезагружаем карту
        if (map) {
          map.geoObjects.removeAll();
          loadGeofences();
          loadFamilyLocations();
        }
      }
    } catch (error) {
      console.error('Ошибка удаления зоны:', error);
    }
  };

  // Загрузка геозон
  const loadGeofences = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch('https://functions.poehali.dev/430446f6-ba86-44eb-af18-36af99419459', {
        method: 'GET',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGeofences(data.geofences || []);

        // Отрисовка на карте
        if (map && data.geofences) {
          data.geofences.forEach((zone: Geofence) => {
            // @ts-ignore
            const circle = new window.ymaps.Circle(
              [[zone.center_lat, zone.center_lng], zone.radius],
              {},
              {
                fillColor: zone.color + '30',
                strokeColor: zone.color,
                strokeWidth: 2
              }
            );
            map.geoObjects.add(circle);

            // @ts-ignore
            const placemark = new window.ymaps.Placemark(
              [zone.center_lat, zone.center_lng],
              { balloonContent: zone.name },
              { preset: 'islands#violetCircleDotIcon' }
            );
            map.geoObjects.add(placemark);
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки геозон:', error);
    }
  };

  // Отправка координат на сервер
  const sendLocationToServer = async (location: LocationData) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch('https://functions.poehali.dev/45705c25-441b-4063-8e0b-795feb904533', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify(location)
      });

      if (!response.ok) {
        console.error('Ошибка отправки координат на сервер');
      }
    } catch (error) {
      console.error('Ошибка при отправке координат:', error);
    }
  };

  // Загрузка локаций всех членов семьи
  const loadFamilyLocations = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch('https://functions.poehali.dev/45705c25-441b-4063-8e0b-795feb904533', {
        method: 'GET',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Показываем только последнюю локацию каждого члена семьи
        const latestLocations: { [key: string]: LocationData } = {};
        (data.locations || []).forEach((loc: LocationData) => {
          if (!latestLocations[loc.memberId] || 
              new Date(loc.timestamp) > new Date(latestLocations[loc.memberId].timestamp)) {
            latestLocations[loc.memberId] = loc;
          }
        });
        const filteredLocations = Object.values(latestLocations);
        setLocations(filteredLocations);

        // Отображение меток на карте
        if (map) {
          // Очищаем старые метки (но не геозоны)
          map.geoObjects.each((geoObject: any) => {
            if (geoObject.properties && geoObject.properties.get('type') === 'member-location') {
              map.geoObjects.remove(geoObject);
            }
          });

          filteredLocations.forEach((loc: LocationData) => {
            const member = familyMembers.find(m => m.id === loc.memberId);
            if (member) {
              // @ts-ignore
              const placemark = new window.ymaps.Placemark(
                [loc.lat, loc.lng],
                {
                  balloonContent: `${member.name}<br>${new Date(loc.timestamp).toLocaleString()}`,
                  type: 'member-location'
                },
                {
                  preset: 'islands#circleIcon',
                  iconColor: member.color
                }
              );
              placemark.properties.set('type', 'member-location');
              map.geoObjects.add(placemark);
            }
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки локаций:', error);
    }
  };

  useEffect(() => {
    if (map) {
      loadFamilyLocations();
      loadGeofences();
      // Обновление каждые 30 секунд
      const interval = setInterval(loadFamilyLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [map]);

  // Восстановление отслеживания при загрузке страницы
  useEffect(() => {
    if (isTracking && map) {
      startTracking();
    }
  }, [map]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <Icon name="Home" size={24} />
            </Button>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <Icon name="MapPin" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Семейный маячок</h1>
              <p className="text-gray-600">Отслеживайте местоположение членов семьи в реальном времени</p>
            </div>
          </div>
        </div>

        {/* Сворачиваемая инструкция */}
        <Card className="shadow-md bg-blue-50 border-blue-200">
          <div 
            className="p-4 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
            onClick={() => setIsInstructionOpen(!isInstructionOpen)}
          >
            <div className="flex items-center gap-3">
              <Icon name="Info" size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">Как это работает?</span>
            </div>
            <Icon 
              name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              className="text-blue-600"
            />
          </div>
          
          {isInstructionOpen && (
            <div className="px-4 pb-4 text-blue-800 space-y-3">
              <p>
                <strong>Каждый член семьи</strong> включает отслеживание на своем телефоне через PWA-приложение.
                Координаты обновляются автоматически каждые 5-10 минут.
              </p>
              <p>
                <strong>Безопасные зоны:</strong> Создайте зоны (школа, дом, секции) — при выходе из них придет уведомление.
              </p>
              <p>
                <strong>История перемещений:</strong> Смотрите маршруты каждого члена семьи за любой день.
              </p>
              <p className="text-sm text-blue-700">
                Данные защищены и доступны только вашей семье.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2 border-blue-400 text-blue-700 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/instructions#family-tracker';
                }}
              >
                <Icon name="BookOpen" size={16} className="mr-2" />
                Полная инструкция
              </Button>
            </div>
          )}
        </Card>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <Icon name="AlertCircle" size={18} className="text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Карта */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  Карта семьи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapContainer}
                  className="w-full h-[500px] rounded-lg bg-gray-100"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {!isTracking ? (
                    <Button
                      onClick={startTracking}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Icon name="Play" size={18} className="mr-2" />
                      Включить отслеживание
                    </Button>
                  ) : (
                    <Button
                      onClick={stopTracking}
                      variant="destructive"
                    >
                      <Icon name="Pause" size={18} className="mr-2" />
                      Остановить отслеживание
                    </Button>
                  )}
                  <Button
                    onClick={loadFamilyLocations}
                    variant="outline"
                  >
                    <Icon name="RefreshCw" size={18} className="mr-2" />
                    Обновить
                  </Button>
                  <Button
                    onClick={() => setIsAddingZone(!isAddingZone)}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100 border-purple-300"
                  >
                    <Icon name="MapPinned" size={18} className="mr-2" />
                    {isAddingZone ? 'Отменить' : 'Добавить зону'}
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/location-history'}
                    variant="outline"
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-300"
                  >
                    <Icon name="History" size={18} className="mr-2" />
                    История перемещений
                  </Button>
                </div>
                
                {isAddingZone && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                    <p className="text-sm font-medium text-purple-900">Кликните на карту, чтобы добавить безопасную зону</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Название зоны (например, Школа)"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Радиус:</label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="50"
                          value={newZoneRadius}
                          onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">{newZoneRadius} м</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {geofences.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Безопасные зоны ({geofences.length}):</p>
                    {geofences.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Icon name="MapPin" size={16} className="text-purple-600" />
                          <span className="text-sm font-medium">{zone.name}</span>
                          <span className="text-xs text-gray-500">{zone.radius}м</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGeofence(zone.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Список членов семьи */}
          <div className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} />
                  Члены семьи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {familyMembers.map((member) => {
                  const memberLocation = locations.find(loc => loc.memberId === member.id);
                  const isOnline = memberLocation && 
                    (new Date().getTime() - new Date(memberLocation.timestamp).getTime()) < 600000; // 10 минут

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: member.avatar_url ? 'transparent' : member.color + '20' }}
                        >
                          {member.avatar_url ? (
                            <img 
                              src={member.avatar_url} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.parentElement) {
                                  target.parentElement.style.backgroundColor = member.color + '20';
                                  target.parentElement.innerHTML = `<span class="text-lg font-bold" style="color: ${member.color}">${member.name.charAt(0)}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-lg font-bold" style={{ color: member.color }}>
                              {member.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">
                            {memberLocation
                              ? new Date(memberLocation.timestamp).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Нет данных'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={isOnline ? 'bg-green-500' : 'bg-gray-400'}
                      >
                        {isOnline ? 'Онлайн' : 'Оффлайн'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Настройки */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Частота обновления</span>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option value="5">5 минут</option>
                    <option value="10">10 минут</option>
                    <option value="30">30 минут</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Уведомления</span>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">История за 24ч</span>
                  <Button variant="outline" size="sm">
                    <Icon name="History" size={16} className="mr-1" />
                    Показать
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Информация о PWA */}
        <Card className="shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                <Icon name="Smartphone" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Установите приложение на телефон</h3>
                <p className="text-gray-700 mb-4">
                  Для работы семейного маячка установите наше PWA-приложение на телефон каждого члена семьи.
                  Приложение работает в фоне и автоматически отправляет координаты.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Icon name="Download" size={18} className="mr-2" />
                  Инструкция по установке
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}