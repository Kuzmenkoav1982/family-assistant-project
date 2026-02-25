import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
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

interface AlertSetting {
  member_id: string;
  alerts_enabled: boolean;
  notify_members: string[];
}

const TRACKER_URL = 'https://functions.poehali.dev/45705c25-441b-4063-8e0b-795feb904533';
const MEMBERS_URL = 'https://functions.poehali.dev/2408ee6f-f00b-49c1-9d7a-2d515db9616d';
const GEOFENCES_URL = 'https://functions.poehali.dev/430446f6-ba86-44eb-af18-36af99419459';
const MAPS_KEY_URL = 'https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7';

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
}

export default function FamilyTracker() {
  const navigate = useNavigate();
  const [map, setMap] = useState<any>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(() => {
    return localStorage.getItem('isTracking') === 'true';
  });
  const [error, setError] = useState<string>('');
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(500);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const watchId = useRef<number | null>(null);
  const mapRef = useRef<any>(null);
  const membersRef = useRef<FamilyMember[]>([]);
  const isAddingZoneRef = useRef(false);
  const newZoneNameRef = useRef('');
  const newZoneRadiusRef = useRef(500);

  useEffect(() => { membersRef.current = familyMembers; }, [familyMembers]);
  useEffect(() => { isAddingZoneRef.current = isAddingZone; }, [isAddingZone]);
  useEffect(() => { newZoneNameRef.current = newZoneName; }, [newZoneName]);
  useEffect(() => { newZoneRadiusRef.current = newZoneRadius; }, [newZoneRadius]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch(MEMBERS_URL, {
          method: 'GET',
          headers: { 'X-Auth-Token': getToken() }
        });
        if (response.ok) {
          const data = await response.json();
          const members = data.members || [];
          console.log('[Tracker] Members loaded:', members.length, members.map((m: any) => ({ id: m.id, name: m.name, avatar_url: m.avatar_url })));
          setFamilyMembers(members);
        }
      } catch (err) {
        console.error('[Tracker] Error loading members:', err);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      try {
        const response = await fetch(MAPS_KEY_URL);
        const data = await response.json();
        const apiKey = data.apiKey;

        // @ts-ignore
        if (window.ymaps) {
          // @ts-ignore
          window.ymaps.ready(() => {
            if (!mapContainer.current) return;
            // @ts-ignore
            const mapInstance = new window.ymaps.Map(mapContainer.current, {
              center: [55.751244, 37.618423],
              zoom: 12,
              controls: ['zoomControl', 'fullscreenControl']
            });
            mapInstance.events.add('click', (e: any) => {
              if (isAddingZoneRef.current && newZoneNameRef.current) {
                const coords = e.get('coords');
                addGeofence(coords[0], coords[1]);
              }
            });
            mapRef.current = mapInstance;
            setMap(mapInstance);
          });
          return;
        }

        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          window.ymaps.ready(() => {
            if (!mapContainer.current) return;
            // @ts-ignore
            const mapInstance = new window.ymaps.Map(mapContainer.current, {
              center: [55.751244, 37.618423],
              zoom: 12,
              controls: ['zoomControl', 'fullscreenControl']
            });
            mapInstance.events.add('click', (e: any) => {
              if (isAddingZoneRef.current && newZoneNameRef.current) {
                const coords = e.get('coords');
                addGeofence(coords[0], coords[1]);
              }
            });
            mapRef.current = mapInstance;
            setMap(mapInstance);
          });
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error('[Tracker] Error loading map:', err);
      }
    };
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Ваш браузер не поддерживает геолокацию');
      return;
    }
    setError('');
    setIsTracking(true);
    localStorage.setItem('isTracking', 'true');

    const sendCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          sendLocationToServer({ lat: latitude, lng: longitude, accuracy });
          if (mapRef.current) {
            mapRef.current.setCenter([latitude, longitude]);
          }
        },
        (err) => {
          setError(`Ошибка геолокации: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    sendCurrentLocation();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const token = getToken();
      navigator.serviceWorker.controller.postMessage({
        type: 'START_GEOLOCATION',
        interval: 600000,
        apiUrl: TRACKER_URL,
        authToken: token
      });
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'REQUEST_LOCATION') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              try {
                await fetch(event.data.apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Auth-Token': event.data.authToken || '' },
                  body: JSON.stringify({ lat: latitude, lng: longitude, accuracy })
                });
              } catch (e) {
                console.error('[Tracker] SW location send error:', e);
              }
            },
            (err) => console.error('[Tracker] SW geolocation error:', err),
            { enableHighAccuracy: true }
          );
        }
      });
    }

    watchId.current = window.setInterval(sendCurrentLocation, 600000);
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      clearInterval(watchId.current);
      watchId.current = null;
    }
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'STOP_GEOLOCATION' });
    }
    setIsTracking(false);
    localStorage.setItem('isTracking', 'false');
  };

  const sendLocationToServer = async (location: { lat: number; lng: number; accuracy: number }) => {
    try {
      await fetch(TRACKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify(location)
      });
    } catch (err) {
      console.error('[Tracker] Send location error:', err);
    }
  };

  const addGeofence = async (lat: number, lng: number) => {
    const zoneName = newZoneNameRef.current;
    const zoneRadius = newZoneRadiusRef.current;
    if (!zoneName) {
      setError('Введите название зоны');
      return;
    }
    try {
      const response = await fetch(GEOFENCES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({ name: zoneName, center_lat: lat, center_lng: lng, radius: zoneRadius, color: '#9333EA' })
      });
      if (response.ok) {
        const newZone = await response.json();
        setGeofences(prev => [...prev, newZone]);
        drawZoneOnMap(newZone);
        setNewZoneName('');
        setIsAddingZone(false);
        setError('');
      }
    } catch (err) {
      setError('Ошибка добавления зоны');
    }
  };

  const drawZoneOnMap = (zone: Geofence) => {
    const m = mapRef.current;
    if (!m) return;
    // @ts-ignore
    const circle = new window.ymaps.Circle(
      [[zone.center_lat, zone.center_lng], zone.radius],
      {},
      { fillColor: (zone.color || '#9333EA') + '30', strokeColor: zone.color || '#9333EA', strokeWidth: 2 }
    );
    m.geoObjects.add(circle);
    // @ts-ignore
    const placemark = new window.ymaps.Placemark(
      [zone.center_lat, zone.center_lng],
      { balloonContent: zone.name },
      { preset: 'islands#violetCircleDotIcon' }
    );
    m.geoObjects.add(placemark);
  };

  const deleteGeofence = async (zoneId: number) => {
    if (!confirm('Удалить эту зону?')) return;
    try {
      const response = await fetch(`${GEOFENCES_URL}?id=${zoneId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': getToken() }
      });
      if (response.ok) {
        setGeofences(prev => prev.filter(z => z.id !== zoneId));
        if (mapRef.current) {
          mapRef.current.geoObjects.removeAll();
          loadGeofences();
          loadFamilyLocations();
        }
      }
    } catch (err) {
      console.error('[Tracker] Delete zone error:', err);
    }
  };

  const loadGeofences = useCallback(async () => {
    try {
      const response = await fetch(GEOFENCES_URL, {
        method: 'GET',
        headers: { 'X-Auth-Token': getToken() }
      });
      if (response.ok) {
        const data = await response.json();
        setGeofences(data.geofences || []);
        if (data.alert_settings) {
          setAlertSettings(data.alert_settings);
        }
        if (mapRef.current && data.geofences) {
          data.geofences.forEach((zone: Geofence) => drawZoneOnMap(zone));
        }
      }
    } catch (err) {
      console.error('[Tracker] Load geofences error:', err);
    }
  }, []);

  const loadFamilyLocations = useCallback(async () => {
    try {
      const response = await fetch(TRACKER_URL, {
        method: 'GET',
        headers: { 'X-Auth-Token': getToken() }
      });
      if (response.ok) {
        const data = await response.json();
        const rawLocations = data.locations || [];
        console.log('[Tracker] Raw locations:', rawLocations);

        const latestLocations: { [key: string]: LocationData } = {};
        rawLocations.forEach((loc: LocationData) => {
          if (!latestLocations[loc.memberId] ||
            new Date(loc.timestamp) > new Date(latestLocations[loc.memberId].timestamp)) {
            latestLocations[loc.memberId] = loc;
          }
        });
        const filteredLocations = Object.values(latestLocations);
        console.log('[Tracker] Filtered locations:', filteredLocations);
        setLocations(filteredLocations);

        const m = mapRef.current;
        const members = membersRef.current;
        if (m && members.length > 0) {
          filteredLocations.forEach((loc: LocationData) => {
            const member = members.find(mem => mem.id === loc.memberId);
            if (!member) {
              console.log('[Tracker] No member match for memberId:', loc.memberId, 'Available:', members.map(m => m.id));
              return;
            }

            const avatarHtml = member.avatar_url
              ? `<img src="${member.avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color: ${member.color}; font-size: 20px; font-weight: bold;\\'>${member.name.charAt(0)}</span>'" />`
              : `<span style="color: ${member.color}; font-size: 20px; font-weight: bold;">${member.name.charAt(0)}</span>`;

            // @ts-ignore
            const IconLayout = window.ymaps.templateLayoutFactory.createClass(
              `<div style="width: 50px; height: 50px; position: relative;">
                <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${member.color}; overflow: hidden; background: ${member.color}20; position: absolute; top: 3px; left: 3px; display: flex; align-items: center; justify-content: center;">
                  ${avatarHtml}
                </div>
              </div>`
            );

            // @ts-ignore
            const placemark = new window.ymaps.Placemark(
              [loc.lat, loc.lng],
              {
                balloonContent: `<strong>${member.name}</strong><br>${new Date(loc.timestamp).toLocaleString('ru-RU')}`,
                type: 'member-location'
              },
              {
                iconLayout: IconLayout,
                iconShape: { type: 'Circle', coordinates: [25, 25], radius: 25 }
              }
            );
            m.geoObjects.add(placemark);
          });
        }
      }
    } catch (err) {
      console.error('[Tracker] Load locations error:', err);
    }
  }, []);

  useEffect(() => {
    if (map && familyMembers.length > 0) {
      loadFamilyLocations();
      loadGeofences();
      const interval = setInterval(loadFamilyLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [map, familyMembers]);

  useEffect(() => {
    if (isTracking && map && !watchId.current) {
      startTracking();
    }
  }, [map]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Семейный маячок"
          subtitle="Местоположение членов семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/1f86cef7-8734-493e-bef6-12ac69e8a4b8.jpg"
          backPath="/family-hub"
        />

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
                    <Button onClick={stopTracking} variant="destructive">
                      <Icon name="Pause" size={18} className="mr-2" />
                      Остановить отслеживание
                    </Button>
                  )}
                  <Button onClick={() => { if (mapRef.current) { mapRef.current.geoObjects.removeAll(); loadFamilyLocations(); loadGeofences(); } }} variant="outline">
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
                    onClick={() => navigate('/location-history')}
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
                    (new Date().getTime() - new Date(memberLocation.timestamp).getTime()) < 1800000;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2"
                      style={{ borderColor: member.color }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2"
                          style={{
                            backgroundColor: member.avatar_url ? 'transparent' : member.color + '20',
                            ringColor: member.color
                          }}
                        >
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.name}
                              className="w-full h-full object-cover rounded-full"
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
                        className={isOnline ? 'bg-green-500 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-400'}
                      >
                        {isOnline ? 'Онлайн' : 'Оффлайн'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={20} />
                  Уведомления о зонах
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-gray-500">
                  Выберите, за кем следить при выходе из безопасных зон
                </p>
                {familyMembers.map((member) => {
                  const setting = alertSettings.find(s => s.member_id === member.id);
                  const isEnabled = setting ? setting.alerts_enabled : true;
                  const notifyIds = setting?.notify_members || [];

                  return (
                    <div key={member.id} className="p-3 rounded-lg border" style={{ borderColor: member.color + '60' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: member.avatar_url ? 'transparent' : member.color + '20' }}
                          >
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-xs font-bold" style={{ color: member.color }}>{member.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium">{member.name}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              const newSettings = [...alertSettings];
                              const idx = newSettings.findIndex(s => s.member_id === member.id);
                              if (idx >= 0) {
                                newSettings[idx] = { ...newSettings[idx], alerts_enabled: e.target.checked };
                              } else {
                                newSettings.push({ member_id: member.id, alerts_enabled: e.target.checked, notify_members: [] });
                              }
                              setAlertSettings(newSettings);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      {isEnabled && (
                        <div className="ml-9 space-y-1">
                          <p className="text-xs text-gray-400">Кому сообщать:</p>
                          {familyMembers.filter(m => m.id !== member.id).map((recipient) => {
                            const isSelected = notifyIds.length === 0 || notifyIds.includes(recipient.id);
                            return (
                              <label key={recipient.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const newSettings = [...alertSettings];
                                    const idx = newSettings.findIndex(s => s.member_id === member.id);
                                    const others = familyMembers.filter(m => m.id !== member.id).map(m => m.id);
                                    let currentNotify = notifyIds.length === 0 ? [...others] : [...notifyIds];
                                    if (e.target.checked) {
                                      if (!currentNotify.includes(recipient.id)) currentNotify.push(recipient.id);
                                    } else {
                                      currentNotify = currentNotify.filter(id => id !== recipient.id);
                                    }
                                    const allSelected = currentNotify.length === others.length;
                                    if (idx >= 0) {
                                      newSettings[idx] = { ...newSettings[idx], notify_members: allSelected ? [] : currentNotify };
                                    } else {
                                      newSettings.push({ member_id: member.id, alerts_enabled: true, notify_members: allSelected ? [] : currentNotify });
                                    }
                                    setAlertSettings(newSettings);
                                  }}
                                  className="w-3.5 h-3.5 rounded accent-blue-600"
                                />
                                <span className="text-xs text-gray-600">{recipient.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await fetch(GEOFENCES_URL, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
                        body: JSON.stringify({ settings: alertSettings })
                      });
                    } catch (err) {
                      console.error(err);
                    }
                    setSavingSettings(false);
                  }}
                  disabled={savingSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Icon name={savingSettings ? "Loader2" : "Save"} size={16} className={`mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                  {savingSettings ? 'Сохраняю...' : 'Сохранить настройки'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

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
