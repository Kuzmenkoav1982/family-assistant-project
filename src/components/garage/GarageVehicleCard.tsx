import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { Vehicle } from '@/hooks/useGarage';
import { fmt } from './constants';

export function VehicleCard({ vehicle: v, active, onClick }: { vehicle: Vehicle; active: boolean; onClick: () => void }) {
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

export function AddVehicleForm({ onSubmit }: { onSubmit: (v: Partial<Vehicle>) => Promise<void> }) {
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
