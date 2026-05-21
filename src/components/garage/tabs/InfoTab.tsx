import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { Vehicle } from '@/hooks/useGarage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InfoTab({ vehicle: v, garage: g, onDeleted }: { vehicle: Vehicle; garage: any; onDeleted: () => void }) {
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
