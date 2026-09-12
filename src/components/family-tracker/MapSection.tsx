import { RefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Geofence } from '@/hooks/useFamilyTracker';

interface MapSectionProps {
  mapContainer: RefObject<HTMLDivElement>;
  /** SEC-2026-001: раздел приостановлен — действия сбора недоступны. */
  geolocationDisabled?: boolean;
  isDemoMode: boolean;
  isTracking: boolean;
  isAddingZone: boolean;
  setIsAddingZone: (v: boolean) => void;
  newZoneName: string;
  setNewZoneName: (v: string) => void;
  newZoneRadius: number;
  setNewZoneRadius: (v: number) => void;
  geofences: Geofence[];
  /** Открывает экран согласия. Сбор начнётся только после его подтверждения. */
  onRequestTracking: () => void;
  stopTracking: () => void;
  refreshMap: () => void;
  deleteGeofence: (id: number) => void;
  navigate: (path: string) => void;
}

export default function MapSection({
  mapContainer, geolocationDisabled = false,
  isDemoMode, isTracking, isAddingZone, setIsAddingZone,
  newZoneName, setNewZoneName, newZoneRadius, setNewZoneRadius,
  geofences, onRequestTracking, stopTracking, refreshMap, deleteGeofence, navigate,
}: MapSectionProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="MapPin" size={20} />
          Карта семьи
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainer} className="w-full h-[500px] rounded-lg bg-gray-100" />
        <div className="mt-4 flex flex-wrap gap-2">
          {geolocationDisabled ? (
            /* Кнопок сбора нет вовсе: неактивная кнопка «Включить
               отслеживание» всё равно обещала бы функцию, которой нет. */
            <Badge className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-sm">
              <Icon name="PauseCircle" size={14} className="mr-1" />
              Отслеживание приостановлено — координаты не собираются
            </Badge>
          ) : isDemoMode ? (
            <Badge className="bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 text-sm">
              <Icon name="Eye" size={14} className="mr-1" />
              Демо-режим — реальное отслеживание доступно после входа
            </Badge>
          ) : !isTracking ? (
            /* Кнопка открывает экран согласия, а не начинает сбор:
               нажатие само по себе согласием не является. */
            <Button onClick={onRequestTracking} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Icon name="Play" size={18} className="mr-2" />
              Включить отслеживание
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive">
              <Icon name="Pause" size={18} className="mr-2" />
              Остановить отслеживание
            </Button>
          )}
          {!geolocationDisabled && (
            <>
              <Button onClick={refreshMap} variant="outline">
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Обновить
              </Button>
              <Button onClick={() => setIsAddingZone(!isAddingZone)} variant="outline" className="bg-purple-50 hover:bg-purple-100 border-purple-300">
                <Icon name="MapPinned" size={18} className="mr-2" />
                {isAddingZone ? 'Отменить' : 'Добавить зону'}
              </Button>
              <Button onClick={() => navigate('/location-history')} variant="outline" className="bg-indigo-50 hover:bg-indigo-100 border-indigo-300">
                <Icon name="History" size={18} className="mr-2" />
                История перемещений
              </Button>
            </>
          )}
        </div>

        {isAddingZone && !geolocationDisabled && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
            <p className="text-sm font-medium text-purple-900">Кликните на карту, чтобы добавить безопасную зону</p>
            <div className="space-y-2">
              <input type="text" placeholder="Название зоны (например, Школа)" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="w-full px-3 py-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Радиус:</label>
                <input type="range" min="100" max="2000" step="50" value={newZoneRadius} onChange={(e) => setNewZoneRadius(Number(e.target.value))} className="flex-1" />
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
                <Button variant="ghost" size="sm" onClick={() => deleteGeofence(zone.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}