import { useState } from 'react';
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import useGarage from '@/hooks/useGarage';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import GarageStatCards from '@/components/garage/GarageStatCards';
import { VehicleCard, AddVehicleForm } from '@/components/garage/GarageVehicleCard';
import ServicesTab from '@/components/garage/tabs/ServicesTab';
import ExpensesTab from '@/components/garage/tabs/ExpensesTab';
import RemindersTab from '@/components/garage/tabs/RemindersTab';
import NotesTab from '@/components/garage/tabs/NotesTab';
import InfoTab from '@/components/garage/tabs/InfoTab';

const HERO_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/627133e5-d460-4cd0-9bcb-91e6f0f9ed48.jpg';
const BG = 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900';

export default function Garage() {
  const g = useGarage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState('services');

  const selected = g.vehicles.find(v => v.id === selectedId) || null;
  const subtitle = g.stats
    ? `${g.stats.vehicle_count} авто${g.stats.urgent_reminders ? ` · ${g.stats.urgent_reminders} напоминаний` : ''}`
    : 'Загрузка...';

  if (g.loading) {
    return (
      <SectionPageFrame title="Гараж" backPath="/household-hub" imageUrl={HERO_IMG} backgroundClass={BG}>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600" />
        </div>
      </SectionPageFrame>
    );
  }

  return (
    <>
      <SEOHead
        title="Гараж — учёт автомобилей семьи"
        description="Управление семейным автопарком: техобслуживание, страховки, расходы на топливо, напоминания о ТО."
        path="/garage"
        breadcrumbs={[{ name: 'Быт', path: '/household-hub' }, { name: 'Гараж', path: '/garage' }]}
      />
      <SectionPageFrame
        title="Гараж"
        subtitle={subtitle}
        backPath="/household-hub"
        imageUrl={HERO_IMG}
        backgroundClass={BG}
      >
        <div className="space-y-4">
          {g.stats && <GarageStatCards stats={g.stats} />}

          <SectionAIAdvisor
            role="mechanic"
            title="ИИ-Автомеханик"
            description="ТО, индикаторы, поломки, выбор масла"
            gradientFrom="from-blue-600"
            gradientTo="to-indigo-700"
            accentBg="bg-blue-50"
            accentText="text-blue-700"
            accentBorder="border-blue-200"
            placeholder="Спросите о машине..."
            quickQuestions={[
              'Когда пора на ТО?',
              'Что означает индикатор на панели?',
              'Как сэкономить на топливе?',
              'Какое масло выбрать?',
              'Что делать при ДТП?',
            ]}
            sectionContext={g.vehicles.length > 0
              ? `Автомобили семьи: ${g.vehicles.map(v => `${v.make || ''} ${v.model || ''} ${v.year || ''} (пробег: ${v.mileage || '—'} км)`).join('; ')}.`
              : undefined}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Мои автомобили</h2>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Icon name="Plus" size={16} className="mr-1" />Добавить</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full">
                <DialogHeader><DialogTitle>Новый автомобиль</DialogTitle></DialogHeader>
                <AddVehicleForm onSubmit={async (v) => { await g.createVehicle(v); await g.loadStats(); setShowAdd(false); }} />
              </DialogContent>
            </Dialog>
          </div>

          {g.vehicles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                <Icon name="Car" size={40} className="mx-auto mb-3 text-blue-300" />
                <p>Добавьте первый автомобиль</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.vehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} active={v.id === selectedId} onClick={() => setSelectedId(v.id === selectedId ? null : v.id)} />
              ))}
            </div>
          )}

          {selected && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  <Icon name="X" size={18} />
                </Button>
              </div>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full grid grid-cols-5 h-auto gap-0.5">
                  <TabsTrigger value="services" className="text-[10px] sm:text-xs py-1.5 px-1"><Icon name="Wrench" size={14} className="hidden sm:inline mr-1" />ТО</TabsTrigger>
                  <TabsTrigger value="expenses" className="text-[10px] sm:text-xs py-1.5 px-1"><Icon name="Wallet" size={14} className="hidden sm:inline mr-1" />Расходы</TabsTrigger>
                  <TabsTrigger value="reminders" className="text-[10px] sm:text-xs py-1.5 px-1"><Icon name="Bell" size={14} className="hidden sm:inline mr-1" />Напом.</TabsTrigger>
                  <TabsTrigger value="notes" className="text-[10px] sm:text-xs py-1.5 px-1"><Icon name="MessageSquare" size={14} className="hidden sm:inline mr-1" />Заметки</TabsTrigger>
                  <TabsTrigger value="info" className="text-[10px] sm:text-xs py-1.5 px-1"><Icon name="Info" size={14} className="hidden sm:inline mr-1" />Инфо</TabsTrigger>
                </TabsList>

                <TabsContent value="services"><ServicesTab vehicleId={selected.id} garage={g} /></TabsContent>
                <TabsContent value="expenses"><ExpensesTab vehicleId={selected.id} garage={g} /></TabsContent>
                <TabsContent value="reminders"><RemindersTab vehicleId={selected.id} garage={g} /></TabsContent>
                <TabsContent value="notes"><NotesTab vehicleId={selected.id} garage={g} /></TabsContent>
                <TabsContent value="info"><InfoTab vehicle={selected} garage={g} onDeleted={() => setSelectedId(null)} /></TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </SectionPageFrame>
    </>
  );
}
