import { useEffect, useState, useRef, useCallback } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';

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

export type { FamilyMember, LocationData, Geofence, AlertSetting };

const TRACKER_URL = 'https://functions.poehali.dev/45705c25-441b-4063-8e0b-795feb904533';
const MEMBERS_URL = 'https://functions.poehali.dev/2408ee6f-f00b-49c1-9d7a-2d515db9616d';
const GEOFENCES_URL = 'https://functions.poehali.dev/430446f6-ba86-44eb-af18-36af99419459';
const MAPS_KEY_URL = 'https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7';

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
}

export default function useFamilyTracker() {
  const { isDemoMode, demoLocations, demoGeofences, demoTrackerMembers } = useDemoMode();
  const [map, setMap] = useState<any>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(() => localStorage.getItem('isTracking') === 'true');
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
    if (isDemoMode) { setFamilyMembers(demoTrackerMembers); return; }
    const loadMembers = async () => {
      try {
        const response = await fetch(MEMBERS_URL, { method: 'GET', headers: { 'X-Auth-Token': getToken() } });
        if (response.ok) { const data = await response.json(); setFamilyMembers(data.members || []); }
      } catch (err) { console.error('[Tracker] Error loading members:', err); }
    };
    loadMembers();
  }, [isDemoMode, demoTrackerMembers]);

  useEffect(() => {
    const initMap = async () => {
      try {
        const response = await fetch(MAPS_KEY_URL);
        const data = await response.json();
        const createMap = () => {
          if (!mapContainer.current) return;
          // @ts-ignore
          const mapInstance = new window.ymaps.Map(mapContainer.current, {
            center: [55.751244, 37.618423], zoom: 12, controls: ['zoomControl', 'fullscreenControl']
          });
          mapInstance.events.add('click', (e: any) => {
            if (isAddingZoneRef.current && newZoneNameRef.current) {
              const coords = e.get('coords');
              addGeofence(coords[0], coords[1]);
            }
          });
          mapRef.current = mapInstance;
          setMap(mapInstance);
        };
        // @ts-ignore
        if (window.ymaps) { window.ymaps.ready(createMap); return; }
        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${data.apiKey}&lang=ru_RU`;
        script.async = true;
        // @ts-ignore
        script.onload = () => { window.ymaps.ready(createMap); };
        document.head.appendChild(script);
      } catch (err) { console.error('[Tracker] Error loading map:', err); }
    };
    initMap();
    return () => { if (mapRef.current) mapRef.current.destroy(); };
  }, []);

  const sendLocationToServer = async (location: { lat: number; lng: number; accuracy: number }) => {
    try {
      await fetch(TRACKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() }, body: JSON.stringify(location) });
    } catch (err) { console.error('[Tracker] Send location error:', err); }
  };

  const startTracking = () => {
    if (!navigator.geolocation) { setError('Ваш браузер не поддерживает геолокацию'); return; }
    setError(''); setIsTracking(true); localStorage.setItem('isTracking', 'true');
    const sendCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          sendLocationToServer({ lat: latitude, lng: longitude, accuracy });
          if (mapRef.current) mapRef.current.setCenter([latitude, longitude]);
        },
        (err) => setError(`Ошибка геолокации: ${err.message}`),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };
    sendCurrentLocation();
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const token = getToken();
      navigator.serviceWorker.controller.postMessage({ type: 'START_GEOLOCATION', interval: 600000, apiUrl: TRACKER_URL, authToken: token });
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'REQUEST_LOCATION') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              try { await fetch(event.data.apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': event.data.authToken || '' }, body: JSON.stringify({ lat: latitude, lng: longitude, accuracy }) }); }
              catch (e) { console.error('[Tracker] SW location send error:', e); }
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
    if (watchId.current !== null) { clearInterval(watchId.current); watchId.current = null; }
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'STOP_GEOLOCATION' });
    }
    setIsTracking(false); localStorage.setItem('isTracking', 'false');
  };

  const drawZoneOnMap = (zone: Geofence) => {
    const m = mapRef.current;
    if (!m) return;
    // @ts-ignore
    const circle = new window.ymaps.Circle([[zone.center_lat, zone.center_lng], zone.radius], {}, { fillColor: (zone.color || '#9333EA') + '30', strokeColor: zone.color || '#9333EA', strokeWidth: 2 });
    m.geoObjects.add(circle);
    // @ts-ignore
    const placemark = new window.ymaps.Placemark([zone.center_lat, zone.center_lng], { balloonContent: zone.name }, { preset: 'islands#violetCircleDotIcon' });
    m.geoObjects.add(placemark);
  };

  const addGeofence = async (lat: number, lng: number) => {
    const zoneName = newZoneNameRef.current;
    const zoneRadius = newZoneRadiusRef.current;
    if (!zoneName) { setError('Введите название зоны'); return; }
    try {
      const response = await fetch(GEOFENCES_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() }, body: JSON.stringify({ name: zoneName, center_lat: lat, center_lng: lng, radius: zoneRadius, color: '#9333EA' }) });
      if (response.ok) {
        const newZone = await response.json();
        setGeofences(prev => [...prev, newZone]);
        drawZoneOnMap(newZone);
        setNewZoneName(''); setIsAddingZone(false); setError('');
      }
    } catch { setError('Ошибка добавления зоны'); }
  };

  const deleteGeofence = async (zoneId: number) => {
    if (!confirm('Удалить эту зону?')) return;
    try {
      const response = await fetch(`${GEOFENCES_URL}?id=${zoneId}`, { method: 'DELETE', headers: { 'X-Auth-Token': getToken() } });
      if (response.ok) { setGeofences(prev => prev.filter(z => z.id !== zoneId)); if (mapRef.current) { mapRef.current.geoObjects.removeAll(); loadGeofences(); loadFamilyLocations(); } }
    } catch (err) { console.error('[Tracker] Delete zone error:', err); }
  };

  const loadGeofences = useCallback(async () => {
    if (isDemoMode) { setGeofences(demoGeofences); if (mapRef.current) demoGeofences.forEach((zone) => drawZoneOnMap(zone)); return; }
    try {
      const response = await fetch(GEOFENCES_URL, { method: 'GET', headers: { 'X-Auth-Token': getToken() } });
      if (response.ok) {
        const data = await response.json();
        setGeofences(data.geofences || []);
        if (data.alert_settings) setAlertSettings(data.alert_settings);
        if (mapRef.current && data.geofences) data.geofences.forEach((zone: Geofence) => drawZoneOnMap(zone));
      }
    } catch (err) { console.error('[Tracker] Load geofences error:', err); }
  }, [isDemoMode, demoGeofences]);

  const renderMembersOnMap = useCallback((locs: LocationData[], members: FamilyMember[]) => {
    const m = mapRef.current;
    if (!m || members.length === 0) return;
    locs.forEach((loc: LocationData) => {
      const member = members.find(mem => mem.id === loc.memberId);
      if (!member) return;
      const avatarHtml = member.avatar_url
        ? `<img src="${member.avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color: ${member.color}; font-size: 20px; font-weight: bold;\\'>${member.name.charAt(0)}</span>'" />`
        : `<span style="color: ${member.color}; font-size: 20px; font-weight: bold;">${member.name.charAt(0)}</span>`;
      // @ts-ignore
      const IconLayout = window.ymaps.templateLayoutFactory.createClass(
        `<div style="width: 50px; height: 50px; position: relative;"><div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${member.color}; overflow: hidden; background: ${member.color}20; position: absolute; top: 3px; left: 3px; display: flex; align-items: center; justify-content: center;">${avatarHtml}</div></div>`
      );
      // @ts-ignore
      const placemark = new window.ymaps.Placemark([loc.lat, loc.lng], { balloonContent: `<strong>${member.name}</strong><br>${new Date(loc.timestamp).toLocaleString('ru-RU')}`, type: 'member-location' }, { iconLayout: IconLayout, iconShape: { type: 'Circle', coordinates: [25, 25], radius: 25 } });
      m.geoObjects.add(placemark);
    });
  }, []);

  const loadFamilyLocations = useCallback(async () => {
    if (isDemoMode) { setLocations(demoLocations); renderMembersOnMap(demoLocations, membersRef.current); return; }
    try {
      const response = await fetch(TRACKER_URL, { method: 'GET', headers: { 'X-Auth-Token': getToken() } });
      if (response.ok) {
        const data = await response.json();
        const rawLocations = data.locations || [];
        const latestLocations: { [key: string]: LocationData } = {};
        rawLocations.forEach((loc: LocationData) => {
          if (!latestLocations[loc.memberId] || new Date(loc.timestamp) > new Date(latestLocations[loc.memberId].timestamp)) latestLocations[loc.memberId] = loc;
        });
        const filteredLocations = Object.values(latestLocations);
        setLocations(filteredLocations); renderMembersOnMap(filteredLocations, membersRef.current);
      }
    } catch (err) { console.error('[Tracker] Load locations error:', err); }
  }, [isDemoMode, demoLocations, renderMembersOnMap]);

  useEffect(() => {
    if (map && familyMembers.length > 0) {
      loadFamilyLocations(); loadGeofences();
      const interval = setInterval(loadFamilyLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [map, familyMembers]);

  useEffect(() => {
    if (isTracking && map && !watchId.current) startTracking();
  }, [map]);

  const refreshMap = () => {
    if (mapRef.current) { mapRef.current.geoObjects.removeAll(); loadFamilyLocations(); loadGeofences(); }
  };

  const saveAlertSettings = async () => {
    setSavingSettings(true);
    try { await fetch(GEOFENCES_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() }, body: JSON.stringify({ settings: alertSettings }) }); }
    catch (err) { console.error(err); }
    setSavingSettings(false);
  };

  return {
    isDemoMode, locations, isTracking, error, geofences,
    isAddingZone, setIsAddingZone, newZoneName, setNewZoneName,
    newZoneRadius, setNewZoneRadius, familyMembers,
    isInstructionOpen, setIsInstructionOpen,
    alertSettings, setAlertSettings, savingSettings,
    mapContainer, mapRef,
    startTracking, stopTracking, deleteGeofence,
    refreshMap, saveAlertSettings,
  };
}
