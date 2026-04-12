import { useNavigate } from 'react-router-dom';
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import useFamilyTracker from '@/hooks/useFamilyTracker';
import MapSection from '@/components/family-tracker/MapSection';
import MembersPanel from '@/components/family-tracker/MembersPanel';
import AlertsPanel from '@/components/family-tracker/AlertsPanel';

export default function FamilyTracker() {
  const navigate = useNavigate();
  const t = useFamilyTracker();

  return (
    <>
    <SEOHead title="Семейный маячок — где находятся близкие" description="Отслеживание местоположения членов семьи в реальном времени. Безопасность детей, геозоны, история перемещений." path="/family-tracker" />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Семейный маячок"
          subtitle="Местоположение членов семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/1f86cef7-8734-493e-bef6-12ac69e8a4b8.jpg"
          backPath="/family-hub"
        />

        <Card className="shadow-md bg-blue-50 border-blue-200">
          <div className="p-4 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors" onClick={() => t.setIsInstructionOpen(!t.isInstructionOpen)}>
            <div className="flex items-center gap-3">
              <Icon name="Info" size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">Как это работает?</span>
            </div>
            <Icon name={t.isInstructionOpen ? "ChevronUp" : "ChevronDown"} size={20} className="text-blue-600" />
          </div>
          {t.isInstructionOpen && (
            <div className="px-4 pb-4 text-blue-800 space-y-3">
              <p><strong>Каждый член семьи</strong> должен открыть приложение на своём телефоне (nasha-semiya.ru), зайти в "Семейный маячок" и нажать кнопку "Включить отслеживание". Браузер запросит доступ к геолокации — нужно разрешить. После этого координаты будут отправляться автоматически каждые 10 минут — даже если свернуть браузер.</p>
              <p><strong>Статусы на карте:</strong> Если координаты обновлялись менее 30 минут назад — статус "Онлайн" (зелёный). Если давно нет данных — "Оффлайн" (серый). Время показывается по Москве.</p>
              <p><strong>Безопасные зоны:</strong> Создайте зоны (школа, дом, секции) — нажмите "Добавить зону", введите название и радиус, кликните на карту. При выходе из зоны придёт push-уведомление.</p>
            </div>
          )}
        </Card>

        {t.error && (
          <Alert variant="destructive">
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapSection
              mapContainer={t.mapContainer}
              isDemoMode={t.isDemoMode}
              isTracking={t.isTracking}
              isAddingZone={t.isAddingZone}
              setIsAddingZone={t.setIsAddingZone}
              newZoneName={t.newZoneName}
              setNewZoneName={t.setNewZoneName}
              newZoneRadius={t.newZoneRadius}
              setNewZoneRadius={t.setNewZoneRadius}
              geofences={t.geofences}
              startTracking={t.startTracking}
              stopTracking={t.stopTracking}
              refreshMap={t.refreshMap}
              deleteGeofence={t.deleteGeofence}
              navigate={navigate}
            />
          </div>

          <div className="space-y-4">
            <MembersPanel familyMembers={t.familyMembers} locations={t.locations} />
            <AlertsPanel
              familyMembers={t.familyMembers}
              alertSettings={t.alertSettings}
              setAlertSettings={t.setAlertSettings}
              savingSettings={t.savingSettings}
              onSave={t.saveAlertSettings}
            />
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
    </>
  );
}