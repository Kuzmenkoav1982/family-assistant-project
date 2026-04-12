import { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import useGarage, { type Vehicle, type ServiceRecord, type Expense, type Reminder, type GarageNote } from '@/hooks/useGarage';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const EXPENSE_CATEGORIES: Record<string, string> = {
  fuel: '⛽ Топливо', repair: '🔧 Ремонт', insurance: '📋 Страховка',
  tax: '💳 Налог', parking: '🅿️ Парковка', fines: '🚨 Штрафы',
  wash: '🧽 Мойка', tires: '🛞 Шины', other: '📦 Прочее',
};

const SERVICE_TYPES: Record<string, string> = {
  maintenance: '🔧 ТО', repair: '🛠️ Ремонт', tire_change: '🛞 Замена шин',
  wash: '🧽 Мойка', inspection: '🔍 Диагностика', insurance: '📋 Страховка', other: '📦 Прочее',
};

const REMINDER_TYPES: Record<string, string> = {
  oil_change: '🛢️ Замена масла', tire_change: '🛞 Замена шин', insurance: '📋 ОСАГО/КАСКО',
  inspection: '🔍 Техосмотр', maintenance: '🔧 Плановое ТО', custom: '📝 Другое',
};

function fmt(n: number) { return n.toLocaleString('ru-RU') + ' ₽'; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU'); }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <>
    <SEOHead title="Гараж — учёт автомобилей семьи" description="Управление семейным автопарком: техобслуживание, страховки, расходы на топливо, напоминания о ТО." path="/garage" breadcrumbs={[{ name: "Быт", path: "/household-hub" }, { name: "Гараж", path: "/garage" }]} />
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
      <SectionHero title="Гараж" subtitle={subtitle} imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/627133e5-d460-4cd0-9bcb-91e6f0f9ed48.jpg" backPath="/" />

      <div className="space-y-4">
        {g.stats && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon="Car" label="Автомобилей" value={String(g.stats.vehicle_count)} />
            <StatCard icon="Wallet" label="В этом месяце" value={fmt(g.stats.month_expenses)} />
            <StatCard icon="Bell" label="Напоминаний" value={String(g.stats.active_reminders)} urgent={g.stats.urgent_reminders > 0} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Мои автомобили</h2>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Icon name="Plus" size={16} className="mr-1" />Добавить</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <TabsList className="w-full grid grid-cols-5 h-auto">
                <TabsTrigger value="services" className="text-xs py-1.5"><Icon name="Wrench" size={14} className="mr-1" />ТО</TabsTrigger>
                <TabsTrigger value="expenses" className="text-xs py-1.5"><Icon name="Wallet" size={14} className="mr-1" />Расходы</TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs py-1.5"><Icon name="Bell" size={14} className="mr-1" />Напом.</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs py-1.5"><Icon name="MessageSquare" size={14} className="mr-1" />Заметки</TabsTrigger>
                <TabsTrigger value="info" className="text-xs py-1.5"><Icon name="Info" size={14} className="mr-1" />Инфо</TabsTrigger>
              </TabsList>

              <TabsContent value="services">
                <ServicesTab vehicleId={selected.id} garage={g} />
              </TabsContent>
              <TabsContent value="expenses">
                <ExpensesTab vehicleId={selected.id} garage={g} />
              </TabsContent>
              <TabsContent value="reminders">
                <RemindersTab vehicleId={selected.id} garage={g} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab vehicleId={selected.id} garage={g} />
              </TabsContent>
              <TabsContent value="info">
                <InfoTab vehicle={selected} garage={g} onDeleted={() => setSelectedId(null)} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      </div>
    </div>
    </>
  );
}

function StatCard({ icon, label, value, urgent }: { icon: string; label: string; value: string; urgent?: boolean }) {
  return (
    <Card className={urgent ? 'border-red-300 bg-red-50' : ''}>
      <CardContent className="p-3 text-center">
        <Icon name={icon} size={20} className={`mx-auto mb-1 ${urgent ? 'text-red-500' : 'text-blue-500'}`} />
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function VehicleCard({ vehicle: v, active, onClick }: { vehicle: Vehicle; active: boolean; onClick: () => void }) {
  const title = v.make && v.model ? `${v.make} ${v.model}` : v.name;
  const sub = [v.year, v.license_plate, v.mileage ? `${v.mileage.toLocaleString('ru-RU')} км` : null].filter(Boolean).join(' · ');
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${active ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Car" size={24} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{title}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            <div className="flex gap-1.5 mt-1">
              {(v.urgent_reminders ?? 0) > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <Icon name="Bell" size={10} className="mr-0.5" />{v.urgent_reminders}
                </Badge>
              )}
              {(v.total_expenses ?? 0) > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{fmt(v.total_expenses ?? 0)}</Badge>
              )}
            </div>
          </div>
          <Icon name={active ? 'ChevronDown' : 'ChevronRight'} size={18} className="text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function AddVehicleForm({ onSubmit }: { onSubmit: (v: Partial<Vehicle>) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', make: '', model: '', year: '', color: '', license_plate: '', vin: '', mileage: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3">
      <div><Label>Название *</Label><Input placeholder="Моя машина" value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Марка</Label><Input placeholder="Toyota" value={form.make} onChange={e => set('make', e.target.value)} /></div>
        <div><Label>Модель</Label><Input placeholder="Camry" value={form.model} onChange={e => set('model', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Год</Label><Input type="number" placeholder="2020" value={form.year} onChange={e => set('year', e.target.value)} /></div>
        <div><Label>Цвет</Label><Input placeholder="Белый" value={form.color} onChange={e => set('color', e.target.value)} /></div>
      </div>
      <div><Label>Госномер</Label><Input placeholder="А123БВ 77" value={form.license_plate} onChange={e => set('license_plate', e.target.value)} /></div>
      <div><Label>VIN</Label><Input placeholder="17 символов" value={form.vin} onChange={e => set('vin', e.target.value)} /></div>
      <div><Label>Пробег, км</Label><Input type="number" placeholder="50000" value={form.mileage} onChange={e => set('mileage', e.target.value)} /></div>
      <Button className="w-full" disabled={!form.name || saving} onClick={async () => {
        setSaving(true);
        await onSubmit({ ...form, year: form.year ? Number(form.year) : undefined, mileage: form.mileage ? Number(form.mileage) : undefined });
        setSaving(false);
      }}>
        {saving ? 'Сохранение...' : 'Добавить автомобиль'}
      </Button>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServicesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ service_type: 'maintenance', title: '', description: '', date: new Date().toISOString().split('T')[0], mileage: '', cost: '', service_station: '', parts_replaced: '' });
  const [attachedFiles, setAttachedFiles] = useState<{ url: string; name: string; type: string }[]>([]);
  const { upload: uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { g.loadServices(vehicleId).then((d: ServiceRecord[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'garage-service');
      setAttachedFiles(prev => [...prev, { url, name: file.name, type: file.type }]);
      toast({ title: 'Файл прикреплён' });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Ошибка загрузки', variant: 'destructive' });
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    const photoUrls = attachedFiles.map(f => f.url);
    await g.createService(vehicleId, {
      ...form,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
      photo_urls: photoUrls,
    });
    const d = await g.loadServices(vehicleId);
    setItems(d);
    await g.loadVehicles();
    setShowAdd(false);
    setSaving(false);
    setAttachedFiles([]);
    setForm({ service_type: 'maintenance', title: '', description: '', date: new Date().toISOString().split('T')[0], mileage: '', cost: '', service_station: '', parts_replaced: '' });
  };

  const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf');

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Записей: {items.length}</p>
        <Button size="sm" variant="outline" onClick={() => { setShowAdd(!showAdd); setAttachedFiles([]); }}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>
      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Select value={form.service_type} onValueChange={v => setForm(p => ({ ...p, service_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(SERVICE_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Название работы *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Пробег" value={form.mileage} onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))} />
            <Input type="number" placeholder="Стоимость, ₽" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
          </div>
          <Input placeholder="Автосервис" value={form.service_station} onChange={e => setForm(p => ({ ...p, service_station: e.target.value }))} />
          <Textarea placeholder="Описание, запчасти" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />

          <div>
            <Label className="text-xs font-medium">Фото / документы</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {attachedFiles.map((f, i) => (
                <div key={i} className="relative group">
                  {f.type === 'application/pdf' ? (
                    <div className="w-16 h-16 rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center">
                      <Icon name="FileText" size={20} className="text-red-500" />
                      <span className="text-[9px] text-red-600 mt-0.5">PDF</span>
                    </div>
                  ) : (
                    <img src={f.url} alt={f.name} className="w-16 h-16 rounded-lg object-cover border" />
                  )}
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Icon name={uploading ? 'Loader2' : 'Paperclip'} size={18} className={`text-slate-400 ${uploading ? 'animate-spin' : ''}`} />
                <span className="text-[9px] text-slate-400 mt-0.5">{uploading ? '...' : 'Файл'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFileAttach} disabled={uploading} />
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Фото работ, акт ТО, чеки (JPG, PNG, PDF до 10 МБ)</p>
          </div>

          <Button className="w-full" disabled={!form.title || saving || uploading} onClick={handleSave}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </CardContent></Card>
      )}
      {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Нет записей об обслуживании</p> : items.map(s => (
        <Card key={s.id}>
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{SERVICE_TYPES[s.service_type] || s.service_type} — {s.title}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(s.date)}{s.mileage ? ` · ${s.mileage.toLocaleString('ru-RU')} км` : ''}{s.service_station ? ` · ${s.service_station}` : ''}</p>
                {s.description && <p className="text-xs mt-1">{s.description}</p>}
                {s.photo_urls && s.photo_urls.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {s.photo_urls.map((url, i) => (
                      isPdf(url) ? (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-red-50 border border-red-200 flex flex-col items-center justify-center hover:bg-red-100 transition-colors">
                          <Icon name="FileText" size={14} className="text-red-500" />
                          <span className="text-[8px] text-red-600">PDF</span>
                        </a>
                      ) : (
                        <img
                          key={i}
                          src={url}
                          alt={`Фото ${i + 1}`}
                          className="w-10 h-10 rounded object-cover border cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                          onClick={() => setPreviewUrl(url)}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {(s.cost ?? 0) > 0 && <Badge variant="secondary" className="text-xs">{fmt(s.cost ?? 0)}</Badge>}
                <Button variant="ghost" size="sm" className="ml-1" onClick={async () => { await g.deleteService(s.id); const d = await g.loadServices(vehicleId); setItems(d); }}>
                  <Icon name="Trash2" size={14} className="text-red-400" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-2xl p-2">
            <img src={previewUrl} alt="Просмотр" className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExpensesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'fuel', title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => { g.loadExpenses(vehicleId).then((d: Expense[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  const total = items.reduce((s, e) => s + Number(e.amount), 0);

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  const byCategory = items.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Всего: {fmt(total)}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>
      {Object.keys(byCategory).length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, sum]) => (
            <Badge key={cat} variant="outline" className="text-xs">{EXPENSE_CATEGORIES[cat] || cat}: {fmt(sum)}</Badge>
          ))}
        </div>
      )}
      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Описание *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Сумма, ₽ *" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <Button className="w-full" disabled={!form.title || !form.amount} onClick={async () => {
            await g.createExpense(vehicleId, { ...form, amount: Number(form.amount) });
            const d = await g.loadExpenses(vehicleId); setItems(d); await g.loadStats(); setShowAdd(false);
            setForm({ category: 'fuel', title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}
      {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Нет расходов</p> : items.map(e => (
        <Card key={e.id}>
          <CardContent className="p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{EXPENSE_CATEGORIES[e.category] || e.category} — {e.title}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(e.date)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-blue-100 text-blue-800">{fmt(e.amount)}</Badge>
              <Button variant="ghost" size="sm" onClick={async () => { await g.deleteExpense(e.id); const d = await g.loadExpenses(vehicleId); setItems(d); await g.loadStats(); }}>
                <Icon name="Trash2" size={14} className="text-red-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RemindersTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ reminder_type: 'maintenance', title: '', description: '', due_date: '', due_mileage: '' });

  useEffect(() => { g.loadReminders(vehicleId).then((d: Reminder[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  const isOverdue = (r: Reminder) => r.due_date && !r.is_completed && new Date(r.due_date) < new Date();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Активных: {items.filter(r => !r.is_completed).length}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>
      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Select value={form.reminder_type} onValueChange={v => setForm(p => ({ ...p, reminder_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(REMINDER_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Название *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Описание" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Дата</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
            <div><Label className="text-xs">Пробег, км</Label><Input type="number" value={form.due_mileage} onChange={e => setForm(p => ({ ...p, due_mileage: e.target.value }))} /></div>
          </div>
          <Button className="w-full" disabled={!form.title} onClick={async () => {
            await g.createReminder(vehicleId, { ...form, due_mileage: form.due_mileage ? Number(form.due_mileage) : undefined });
            const d = await g.loadReminders(vehicleId); setItems(d); setShowAdd(false);
            setForm({ reminder_type: 'maintenance', title: '', description: '', due_date: '', due_mileage: '' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}
      {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Нет напоминаний</p> : items.map(r => (
        <Card key={r.id} className={isOverdue(r) ? 'border-red-300 bg-red-50/50' : r.is_completed ? 'opacity-60' : ''}>
          <CardContent className="p-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={async () => {
              await g.toggleReminder(r.id); const d = await g.loadReminders(vehicleId); setItems(d);
            }}>
              <Icon name={r.is_completed ? 'CheckCircle2' : 'Circle'} size={20} className={r.is_completed ? 'text-green-500' : isOverdue(r) ? 'text-red-500' : 'text-gray-400'} />
            </Button>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${r.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {REMINDER_TYPES[r.reminder_type] || r.reminder_type} — {r.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.due_date ? fmtDate(r.due_date) : ''}{r.due_mileage ? ` · ${r.due_mileage.toLocaleString('ru-RU')} км` : ''}
              </p>
              {r.description && <p className="text-xs mt-0.5">{r.description}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={async () => { await g.deleteReminder(r.id); const d = await g.loadReminders(vehicleId); setItems(d); }}>
              <Icon name="Trash2" size={14} className="text-red-400" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NotesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<GarageNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text: '', priority: 'normal' });

  useEffect(() => { g.loadNotes(vehicleId).then((d: GarageNote[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  const priorityColors: Record<string, string> = { urgent: 'bg-red-100 text-red-800', normal: 'bg-gray-100 text-gray-800', low: 'bg-green-100 text-green-800' };
  const priorityLabels: Record<string, string> = { urgent: '🔴 Срочно', normal: '🟡 Обычное', low: '🟢 Низкий' };

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Заметок: {items.filter(n => !n.is_resolved).length}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>
      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Textarea placeholder="Опишите проблему или наблюдение *" value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} />
          <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">🔴 Срочно</SelectItem>
              <SelectItem value="normal">🟡 Обычное</SelectItem>
              <SelectItem value="low">🟢 Низкий приоритет</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" disabled={!form.text} onClick={async () => {
            await g.createNote(vehicleId, form);
            const d = await g.loadNotes(vehicleId); setItems(d); setShowAdd(false);
            setForm({ text: '', priority: 'normal' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}
      {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Нет заметок</p> : items.map(n => (
        <Card key={n.id} className={n.is_resolved ? 'opacity-60' : ''}>
          <CardContent className="p-3 flex items-start gap-3">
            <Button variant="ghost" size="sm" className="flex-shrink-0 mt-0.5" onClick={async () => {
              await g.toggleNote(n.id); const d = await g.loadNotes(vehicleId); setItems(d);
            }}>
              <Icon name={n.is_resolved ? 'CheckCircle2' : 'Circle'} size={18} className={n.is_resolved ? 'text-green-500' : 'text-gray-400'} />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-[10px] ${priorityColors[n.priority] || priorityColors.normal}`}>{priorityLabels[n.priority] || n.priority}</Badge>
                {n.author_name && <span className="text-xs text-muted-foreground">{n.author_name}</span>}
              </div>
              <p className={`text-sm ${n.is_resolved ? 'line-through text-muted-foreground' : ''}`}>{n.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{fmtDate(n.created_at)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={async () => { await g.deleteNote(n.id); const d = await g.loadNotes(vehicleId); setItems(d); }}>
              <Icon name="Trash2" size={14} className="text-red-400" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InfoTab({ vehicle: v, garage: g, onDeleted }: { vehicle: Vehicle; garage: any; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: v.name, make: v.make || '', model: v.model || '', year: v.year ? String(v.year) : '', color: v.color || '', license_plate: v.license_plate || '', vin: v.vin || '', mileage: v.mileage ? String(v.mileage) : '', notes: v.notes || '' });

  const infoRows = [
    ['Марка', v.make], ['Модель', v.model], ['Год', v.year],
    ['Цвет', v.color], ['Госномер', v.license_plate], ['VIN', v.vin],
    ['Пробег', v.mileage ? `${v.mileage.toLocaleString('ru-RU')} км` : null],
  ].filter(([, val]) => val);

  if (editing) {
    return (
      <Card><CardContent className="p-3 space-y-2">
        <div><Label>Название</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Марка</Label><Input value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))} /></div>
          <div><Label>Модель</Label><Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Год</Label><Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} /></div>
          <div><Label>Цвет</Label><Input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} /></div>
        </div>
        <div><Label>Госномер</Label><Input value={form.license_plate} onChange={e => setForm(p => ({ ...p, license_plate: e.target.value }))} /></div>
        <div><Label>VIN</Label><Input value={form.vin} onChange={e => setForm(p => ({ ...p, vin: e.target.value }))} /></div>
        <div><Label>Пробег, км</Label><Input type="number" value={form.mileage} onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))} /></div>
        <div><Label>Заметки</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={async () => {
            await g.updateVehicle(v.id, { ...form, year: form.year ? Number(form.year) : undefined, mileage: form.mileage ? Number(form.mileage) : undefined });
            setEditing(false);
          }}>Сохранить</Button>
          <Button variant="outline" onClick={() => setEditing(false)}>Отмена</Button>
        </div>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3">
          {infoRows.map(([label, val]) => (
            <div key={label as string} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{String(val)}</span>
            </div>
          ))}
          {v.notes && <p className="text-sm mt-2 text-muted-foreground">{v.notes}</p>}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setEditing(true)}>
          <Icon name="Pencil" size={14} className="mr-1" />Редактировать
        </Button>
        <Button variant="destructive" size="sm" onClick={async () => {
          if (confirm('Удалить автомобиль и все связанные данные?')) {
            await g.deleteVehicle(v.id); await g.loadStats(); onDeleted();
          }
        }}>
          <Icon name="Trash2" size={14} />
        </Button>
      </div>
    </div>
  );
}