import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number;
}

interface FamilyMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  color: string;
}

export default function LocationHistory() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [map, setMap] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const selectedMemberData = familyMembers.find(m => m.id === selectedMember);

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
          if (data.members && data.members.length > 0) {
            setSelectedMember(data.members[0].id);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки членов семьи:', error);
      }
    };

    loadMembers();
  }, []);

  // Инициализация карты
  useEffect(() => {
    const initMap = async () => {
      try {
        const resp = await fetch('https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7');
        const data = await resp.json();
        const apiKey = data.apiKey;

        // @ts-expect-error ymaps
        if (window.ymaps) {
          // @ts-expect-error ymaps
          window.ymaps.ready(() => {
            // @ts-expect-error ymaps
            const mapInstance = new window.ymaps.Map('history-map', {
              center: [55.751244, 37.618423],
              zoom: 12,
              controls: ['zoomControl', 'fullscreenControl']
            });
            setMap(mapInstance);
          });
          return;
        }

        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
          // @ts-expect-error ymaps
          window.ymaps.ready(() => {
            // @ts-expect-error ymaps
            const mapInstance = new window.ymaps.Map('history-map', {
              center: [55.751244, 37.618423],
              zoom: 12,
              controls: ['zoomControl', 'fullscreenControl']
            });
            setMap(mapInstance);
          });
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
      }
    };
    initMap();
  }, []);

  // Загрузка истории
  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(
        `https://functions.poehali.dev/e00d057e-5c17-4a43-ab17-f926d7ab3d7c?member_id=${selectedMember}&date=${selectedDate}`,
        {
          method: 'GET',
          headers: {
            'X-Auth-Token': token || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.locations || []);
        drawTrackOnMap(data.locations || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  // Отрисовка трека на карте
  const drawTrackOnMap = (locations: LocationPoint[]) => {
    if (!map || locations.length === 0) return;

    // Очищаем карту
    map.geoObjects.removeAll();

    // Создаем массив координат для линии
    const coordinates = locations.map(loc => [loc.lat, loc.lng]);

    // @ts-ignore
    const polyline = new window.ymaps.Polyline(
      coordinates,
      {},
      {
        strokeColor: selectedMemberData?.color || '#3B82F6',
        strokeWidth: 4,
        strokeOpacity: 0.7
      }
    );

    map.geoObjects.add(polyline);

    // Добавляем метки начала и конца
    if (locations.length > 0) {
      const start = locations[0];
      const end = locations[locations.length - 1];

      // @ts-ignore
      const startMark = new window.ymaps.Placemark(
        [start.lat, start.lng],
        { balloonContent: `Начало: ${new Date(start.timestamp).toLocaleTimeString()}` },
        { preset: 'islands#greenCircleDotIcon' }
      );

      // @ts-ignore
      const endMark = new window.ymaps.Placemark(
        [end.lat, end.lng],
        { balloonContent: `Конец: ${new Date(end.timestamp).toLocaleTimeString()}` },
        { preset: 'islands#redCircleDotIcon' }
      );

      map.geoObjects.add(startMark);
      map.geoObjects.add(endMark);

      // Центрируем карту
      map.setBounds(polyline.geometry.getBounds(), { checkZoomRange: true });
    }
  };

  useEffect(() => {
    if (map) {
      loadHistory();
    }
  }, [map, selectedMember, selectedDate]);

  // Форматирование времени для timeline
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Расчет расстояния между точками (примерно)
  const calculateTotalDistance = () => {
    if (history.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      const distance = Math.sqrt(
        Math.pow(curr.lat - prev.lat, 2) + Math.pow(curr.lng - prev.lng, 2)
      ) * 111000; // Примерный коэффициент для км
      total += distance;
    }
    return (total / 1000).toFixed(2); // В километрах
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/family-tracker')}
            className="rounded-full"
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <Icon name="History" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">История перемещений</h1>
            <p className="text-gray-600">Просматривайте маршруты членов семьи за день</p>
          </div>
        </div>

        {/* Фильтры */}
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Выбор члена семьи */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Член семьи</label>
                <div className="flex gap-2">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedMember === member.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
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
                                target.parentElement.innerHTML = `<span class="text-sm font-bold" style="color: ${member.color}">${member.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm font-bold" style={{ color: member.color }}>
                            {member.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбор даты */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Дата</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Карта с треком */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Map" size={20} />
                    Маршрут за день
                  </span>
                  {history.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-800">
                      📍 {history.length} точек • 📏 {calculateTotalDistance()} км
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  id="history-map"
                  className="w-full h-[500px] rounded-lg bg-gray-100"
                />
              </CardContent>
            </Card>
          </div>

          {/* Timeline событий */}
          <div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  Timeline дня
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="MapOff" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Нет данных за выбранную дату</p>
                  </div>
                ) : (
                  history.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-purple-700">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{formatTime(point.timestamp)}</p>
                        <p className="text-xs text-gray-500">
                          📍 {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                        </p>
                        {point.accuracy && (
                          <p className="text-xs text-gray-400 mt-1">
                            Точность: ±{Math.round(point.accuracy)} м
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}