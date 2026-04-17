import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Pet } from '@/hooks/usePets';
import PetPhotoUpload from './PetPhotoUpload';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pet?: Pet | null;
  onSave: (data: Partial<Pet>) => Promise<void>;
}

const SPECIES = ['Собака', 'Кошка', 'Птица', 'Грызун', 'Рыбка', 'Рептилия', 'Другое'];

export default function PetForm({ open, onOpenChange, pet, onSave }: Props) {
  const [form, setForm] = useState<Partial<Pet>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(pet ? { ...pet } : { species: 'Собака' });
  }, [open, pet]);

  const set = (k: keyof Pet, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="PawPrint" size={20} className="text-violet-600" />
            {pet ? 'Редактировать питомца' : 'Новый питомец'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label>Фото питомца</Label>
            <div className="mt-1.5">
              <PetPhotoUpload
                value={form.photo_url || ''}
                onChange={(url) => set('photo_url', url)}
                size="lg"
                shape="circle"
                placeholderIcon="PawPrint"
                folder="pets"
                label="Выбрать из галереи"
              />
            </div>
          </div>

          <div>
            <Label>Кличка *</Label>
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Барсик" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Вид</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={form.species || ''}
                onChange={e => set('species', e.target.value)}
              >
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Порода</Label>
              <Input value={form.breed || ''} onChange={e => set('breed', e.target.value)} placeholder="Британец" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Пол</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={form.gender || ''}
                onChange={e => set('gender', e.target.value)}
              >
                <option value="">—</option>
                <option value="male">Мальчик</option>
                <option value="female">Девочка</option>
              </select>
            </div>
            <div>
              <Label>Дата рождения</Label>
              <Input type="date" value={form.birth_date || ''} onChange={e => set('birth_date', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Вес, кг</Label>
              <Input type="number" step="0.1" value={form.weight?.toString() || ''} onChange={e => set('weight', e.target.value ? parseFloat(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>Окрас</Label>
              <Input value={form.color || ''} onChange={e => set('color', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Номер чипа</Label>
            <Input value={form.chip_number || ''} onChange={e => set('chip_number', e.target.value)} />
          </div>

          <div>
            <Label>Аллергии</Label>
            <Input value={form.allergies || ''} onChange={e => set('allergies', e.target.value)} placeholder="На курицу, пыльцу..." />
          </div>

          <div>
            <Label>Особенности</Label>
            <Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={save} disabled={saving || !form.name?.trim()} className="bg-violet-600 hover:bg-violet-700">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}