import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import ProgressMap, { type ProgressStep } from '@/components/ui/progress-map';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

// ─────────────────────────────────────────────────────────────
// Типы
// ─────────────────────────────────────────────────────────────
interface Apartment {
  address: string;
  area: string;
  rooms: string;
  ownership: 'own' | 'rent' | 'mortgage' | '';
  notes: string;
}

interface Utility {
  id: string;
  name: string;
  amount: string;       // "5500"
  dueDate: string;      // ISO
  paid: boolean;
}

interface MeterReading {
  id: string;
  type: 'electricity' | 'cold-water' | 'hot-water' | 'gas' | 'heating' | 'other';
  date: string;          // ISO
  value: string;
  note?: string;
}

interface RepairTask {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimateRub?: string;
  notes?: string;
}

type TabId = 'apartment' | 'utilities' | 'meters' | 'repairs';

// ─────────────────────────────────────────────────────────────
// Константы
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'home-module-data-v1';

const METER_LABELS: Record<MeterReading['type'], { label: string; icon: string; color: string }> = {
  electricity: { label: 'Электричество', icon: 'Zap',         color: 'text-amber-600' },
  'cold-water':{ label: 'Холодная вода', icon: 'Droplet',     color: 'text-blue-500' },
  'hot-water': { label: 'Горячая вода',  icon: 'Flame',       color: 'text-rose-500' },
  gas:         { label: 'Газ',           icon: 'Flame',       color: 'text-orange-600' },
  heating:     { label: 'Отопление',     icon: 'Thermometer', color: 'text-red-500' },
  other:       { label: 'Другое',        icon: 'Gauge',       color: 'text-slate-500' },
};

const UTILITY_TEMPLATES = [
  'Электричество',
  'Холодная вода',
  'Горячая вода',
  'Газ',
  'Отопление',
  'Интернет',
  'Капремонт',
  'Управляющая компания',
];

// ─────────────────────────────────────────────────────────────
// Компонент
// ─────────────────────────────────────────────────────────────
export default function HomeModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('apartment');

  const [apartment, setApartment] = useState<Apartment>({
    address: '',
    area: '',
    rooms: '',
    ownership: '',
    notes: '',
  });
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [meters, setMeters] = useState<MeterReading[]>([]);
  const [repairs, setRepairs] = useState<RepairTask[]>([]);

  // Загрузка из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.apartment) setApartment(data.apartment);
        if (data.utilities) setUtilities(data.utilities);
        if (data.meters) setMeters(data.meters);
        if (data.repairs) setRepairs(data.repairs);
      }
    } catch {
      // ignore
    }
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ apartment, utilities, meters, repairs }),
      );
    } catch {
      // ignore
    }
  }, [apartment, utilities, meters, repairs]);

  // Прогресс заполнения для ProgressMap
  const apartmentFilled = !!(apartment.address && apartment.ownership);
  const utilitiesFilled = utilities.length > 0;
  const metersFilled = meters.length > 0;
  const repairsFilled = repairs.length > 0;

  const progressSteps: ProgressStep[] = [
    {
      id: 'apartment',
      label: 'Квартира',
      hint: apartmentFilled ? 'Заполнено' : 'Адрес и параметры',
      icon: 'Building',
      status:
        activeTab === 'apartment' ? 'current' : apartmentFilled ? 'done' : 'available',
    },
    {
      id: 'utilities',
      label: 'Коммуналка',
      hint: utilitiesFilled ? `${utilities.length} платежей` : 'Платежи и счета',
      icon: 'Receipt',
      status:
        activeTab === 'utilities' ? 'current' : utilitiesFilled ? 'done' : 'available',
    },
    {
      id: 'meters',
      label: 'Показания',
      hint: metersFilled ? `${meters.length} записей` : 'Счётчики',
      icon: 'Gauge',
      status:
        activeTab === 'meters' ? 'current' : metersFilled ? 'done' : 'available',
    },
    {
      id: 'repairs',
      label: 'Ремонты',
      hint: repairsFilled ? `${repairs.length} задач` : 'Планы и работы',
      icon: 'Hammer',
      status:
        activeTab === 'repairs' ? 'current' : repairsFilled ? 'done' : 'available',
    },
  ];

  // Сводка
  const unpaidUtilities = utilities.filter((u) => !u.paid);
  const totalUnpaid = unpaidUtilities.reduce(
    (sum, u) => sum + (parseFloat(u.amount) || 0),
    0,
  );
  const activeRepairs = repairs.filter((r) => r.status !== 'done').length;

  return (
    <>
      <SEOHead
        title="Дом — квартира, коммуналка, показания счётчиков и ремонты"
        description="Раздел «Дом» в Семейной ОС: учёт квартиры, платежи за коммунальные услуги, показания счётчиков и список ремонтов. Всё про ваш дом в одном месте."
        path="/home-hub"
        breadcrumbs={[
          { name: 'Дом и быт', path: '/household-hub' },
          { name: 'Дом', path: '/home-hub' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button
              onClick={() => navigate('/household-hub')}
              className="flex items-center gap-1 hover:text-amber-700 transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              Дом и быт
            </button>
            <Icon name="ChevronRight" size={12} className="text-slate-300" />
            <span className="font-semibold text-slate-700">Дом</span>
          </div>

          <SectionHero
            title="Дом"
            subtitle="Квартира, коммуналка, показания и ремонты — всё в одном месте"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3846fdd1-13b2-4590-82b3-e8c37204ee0b.jpg"
          />

          {/* Прогресс по разделам */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
            <CardContent className="p-4">
              <ProgressMap
                steps={progressSteps}
                onStepClick={(step) => setActiveTab(step.id as TabId)}
                title="Карта раздела «Дом»"
                subtitle="Заполняйте по мере готовности — всё сохраняется автоматически"
                accent="amber"
              />
            </CardContent>
          </Card>

          {/* Сводные плашки */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <SummaryCard
              icon="Building"
              label="Адрес"
              value={apartment.address ? 'Указан' : '—'}
              accent={apartment.address ? 'emerald' : 'slate'}
            />
            <SummaryCard
              icon="Receipt"
              label="К оплате"
              value={totalUnpaid > 0 ? `${totalUnpaid.toLocaleString('ru-RU')} ₽` : '—'}
              accent={totalUnpaid > 0 ? 'rose' : 'slate'}
            />
            <SummaryCard
              icon="Gauge"
              label="Показаний"
              value={meters.length.toString()}
              accent={meters.length > 0 ? 'blue' : 'slate'}
            />
            <SummaryCard
              icon="Hammer"
              label="Активных ремонтов"
              value={activeRepairs.toString()}
              accent={activeRepairs > 0 ? 'amber' : 'slate'}
            />
          </div>

          {/* Табы */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {progressSteps.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id as TabId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === s.id
                    ? 'bg-amber-600 text-white border-transparent shadow-md scale-105'
                    : 'bg-white text-amber-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon name={s.icon ?? 'Circle'} size={15} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Содержимое таба */}
          {activeTab === 'apartment' && (
            <ApartmentTab apartment={apartment} setApartment={setApartment} />
          )}
          {activeTab === 'utilities' && (
            <UtilitiesTab utilities={utilities} setUtilities={setUtilities} />
          )}
          {activeTab === 'meters' && <MetersTab meters={meters} setMeters={setMeters} />}
          {activeTab === 'repairs' && (
            <RepairsTab repairs={repairs} setRepairs={setRepairs} />
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Сводная плашка
// ─────────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: 'emerald' | 'rose' | 'blue' | 'amber' | 'slate';
}) {
  const cls = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-white text-slate-500',
  }[accent];

  return (
    <div className={`rounded-xl border-2 ${cls} p-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={icon} size={13} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base font-bold leading-tight">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Таб: Квартира
// ─────────────────────────────────────────────────────────────
function ApartmentTab({
  apartment,
  setApartment,
}: {
  apartment: Apartment;
  setApartment: (a: Apartment) => void;
}) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="Building" size={18} className="text-amber-600" />
          <h3 className="text-base font-bold text-slate-800">Параметры квартиры</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Адрес</Label>
            <Input
              placeholder="г. Москва, ул. Примерная, 10, кв. 25"
              value={apartment.address}
              onChange={(e) => setApartment({ ...apartment, address: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Площадь, м²</Label>
            <Input
              type="number"
              placeholder="55"
              value={apartment.area}
              onChange={(e) => setApartment({ ...apartment, area: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Количество комнат</Label>
            <Input
              type="number"
              placeholder="2"
              value={apartment.rooms}
              onChange={(e) => setApartment({ ...apartment, rooms: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Тип владения</Label>
            <div className="flex gap-1.5 flex-wrap">
              {([
                { id: 'own', label: 'Своя' },
                { id: 'mortgage', label: 'В ипотеке' },
                { id: 'rent', label: 'Съёмная' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setApartment({ ...apartment, ownership: opt.id })
                  }
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    apartment.ownership === opt.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Заметки</Label>
          <Textarea
            placeholder="Особенности квартиры, контакты УК, важные напоминания…"
            value={apartment.notes}
            onChange={(e) => setApartment({ ...apartment, notes: e.target.value })}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Таб: Коммуналка
// ─────────────────────────────────────────────────────────────
function UtilitiesTab({
  utilities,
  setUtilities,
}: {
  utilities: Utility[];
  setUtilities: (u: Utility[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const addUtility = () => {
    if (!name.trim() || !amount) return;
    const newU: Utility = {
      id: Date.now().toString(),
      name: name.trim(),
      amount,
      dueDate,
      paid: false,
    };
    setUtilities([newU, ...utilities]);
    setName('');
    setAmount('');
    setDueDate('');
    setOpen(false);
  };

  const togglePaid = (id: string) => {
    setUtilities(utilities.map((u) => (u.id === id ? { ...u, paid: !u.paid } : u)));
  };

  const removeUtility = (id: string) => {
    setUtilities(utilities.filter((u) => u.id !== id));
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Receipt" size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-slate-800">Коммунальные платежи</h3>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1">
                <Icon name="Plus" size={15} />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый платёж</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Название</Label>
                  <Input
                    placeholder="Электричество"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {UTILITY_TEMPLATES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setName(t)}
                        className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Сумма, ₽</Label>
                  <Input
                    type="number"
                    placeholder="5500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Срок оплаты</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addUtility} className="bg-amber-600 hover:bg-amber-700">
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {utilities.length === 0 ? (
          <EmptyState
            icon="Receipt"
            text="Платежей пока нет. Добавьте первый — например, электричество за этот месяц."
          />
        ) : (
          <div className="space-y-2">
            {utilities.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  u.paid ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => togglePaid(u.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    u.paid
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {u.paid && <Icon name="Check" size={13} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      u.paid ? 'text-emerald-700 line-through' : 'text-slate-800'
                    }`}
                  >
                    {u.name}
                  </p>
                  {u.dueDate && (
                    <p className="text-[11px] text-slate-500">
                      до {new Date(u.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm font-bold ${
                    u.paid ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {parseFloat(u.amount).toLocaleString('ru-RU')} ₽
                </span>
                <button
                  onClick={() => removeUtility(u.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Таб: Показания счётчиков
// ─────────────────────────────────────────────────────────────
function MetersTab({
  meters,
  setMeters,
}: {
  meters: MeterReading[];
  setMeters: (m: MeterReading[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MeterReading['type']>('electricity');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const addMeter = () => {
    if (!value) return;
    const newM: MeterReading = {
      id: Date.now().toString(),
      type,
      date,
      value,
      note: note || undefined,
    };
    setMeters([newM, ...meters]);
    setValue('');
    setNote('');
    setOpen(false);
  };

  const removeMeter = (id: string) => {
    setMeters(meters.filter((m) => m.id !== id));
  };

  // Группировка по типу
  const byType = meters.reduce<Record<string, MeterReading[]>>((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Gauge" size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-slate-800">Показания счётчиков</h3>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1">
                <Icon name="Plus" size={15} />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новое показание</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Тип счётчика</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                    {(Object.keys(METER_LABELS) as MeterReading['type'][]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setType(k)}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border-2 text-[11px] font-semibold transition-all ${
                          type === k
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon name={METER_LABELS[k].icon} size={15} className={METER_LABELS[k].color} />
                        {METER_LABELS[k].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Дата</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Показание</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="12345"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Заметка (необязательно)</Label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addMeter} className="bg-amber-600 hover:bg-amber-700">
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {meters.length === 0 ? (
          <EmptyState
            icon="Gauge"
            text="Записей пока нет. Добавьте первое показание — счётчики удобно сверять помесячно."
          />
        ) : (
          <div className="space-y-3">
            {(Object.keys(byType) as MeterReading['type'][]).map((t) => {
              const meta = METER_LABELS[t];
              const list = [...byType[t]].sort((a, b) => b.date.localeCompare(a.date));
              return (
                <div key={t} className="rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 rounded-t-lg">
                    <Icon name={meta.icon} size={14} className={meta.color} />
                    <span className="text-sm font-bold text-slate-700">{meta.label}</span>
                    <span className="text-[11px] text-slate-500">· {list.length}</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {list.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                        <span className="text-[11px] text-slate-500 w-20 shrink-0">
                          {new Date(m.date).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 flex-1">
                          {m.value}
                        </span>
                        {m.note && (
                          <span className="text-[11px] text-slate-500 italic truncate">
                            {m.note}
                          </span>
                        )}
                        <button
                          onClick={() => removeMeter(m.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Таб: Ремонты
// ─────────────────────────────────────────────────────────────
function RepairsTab({
  repairs,
  setRepairs,
}: {
  repairs: RepairTask[];
  setRepairs: (r: RepairTask[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<RepairTask['priority']>('medium');
  const [estimate, setEstimate] = useState('');
  const [notes, setNotes] = useState('');

  const addRepair = () => {
    if (!title.trim()) return;
    const newR: RepairTask = {
      id: Date.now().toString(),
      title: title.trim(),
      status: 'planned',
      priority,
      estimateRub: estimate || undefined,
      notes: notes || undefined,
    };
    setRepairs([newR, ...repairs]);
    setTitle('');
    setEstimate('');
    setNotes('');
    setPriority('medium');
    setOpen(false);
  };

  const cycleStatus = (id: string) => {
    setRepairs(
      repairs.map((r) => {
        if (r.id !== id) return r;
        const next: RepairTask['status'] =
          r.status === 'planned' ? 'in-progress' : r.status === 'in-progress' ? 'done' : 'planned';
        return { ...r, status: next };
      }),
    );
  };

  const removeRepair = (id: string) => {
    setRepairs(repairs.filter((r) => r.id !== id));
  };

  const STATUS_META: Record<RepairTask['status'], { label: string; cls: string; icon: string }> = {
    planned: { label: 'Запланировано', cls: 'bg-slate-100 text-slate-700 border-slate-300', icon: 'Clock' },
    'in-progress': { label: 'В работе', cls: 'bg-amber-100 text-amber-700 border-amber-300', icon: 'Hammer' },
    done: { label: 'Готово', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: 'Check' },
  };

  const PRIORITY_META: Record<RepairTask['priority'], { label: string; cls: string }> = {
    low: { label: 'Низкий', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
    medium: { label: 'Средний', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    high: { label: 'Высокий', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Hammer" size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-slate-800">Ремонты и работы по дому</h3>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1">
                <Icon name="Plus" size={15} />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Что сделать</Label>
                  <Input
                    placeholder="Поменять кран на кухне"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Приоритет</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                    {(Object.keys(PRIORITY_META) as RepairTask['priority'][]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                          priority === p
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {PRIORITY_META[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Бюджет, ₽ (необязательно)</Label>
                  <Input
                    type="number"
                    placeholder="3500"
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Заметки (необязательно)</Label>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addRepair} className="bg-amber-600 hover:bg-amber-700">
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {repairs.length === 0 ? (
          <EmptyState
            icon="Hammer"
            text="Задач пока нет. Добавьте первый ремонт — большой или маленький, всё равно важно."
          />
        ) : (
          <div className="space-y-2">
            {repairs.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-white"
              >
                <button
                  onClick={() => cycleStatus(r.id)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${STATUS_META[r.status].cls}`}
                  title="Кликните для смены статуса"
                >
                  <Icon name={STATUS_META[r.status].icon} size={10} />
                  {STATUS_META[r.status].label}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      r.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {r.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_META[r.priority].cls}`}
                    >
                      {PRIORITY_META[r.priority].label}
                    </span>
                    {r.estimateRub && (
                      <span className="text-[10px] text-slate-500">
                        ~{parseFloat(r.estimateRub).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">{r.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => removeRepair(r.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Пустое состояние
// ─────────────────────────────────────────────────────────────
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
      <Icon name={icon} size={28} className="text-slate-300 mx-auto mb-2" />
      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{text}</p>
    </div>
  );
}
