import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { CATEGORY_CONFIG, IMPORTANCE_CONFIG, type LifeEvent, type LifeEventCategory, type LifeEventImportance } from './types';
import func2url from '@/config/func2url';

const API_URL = (func2url as Record<string, string>)['life-road'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEvent?: LifeEvent | null;
  onSave: (data: Partial<LifeEvent>, id?: string) => Promise<void> | void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function LifeEventDialog({ open, onOpenChange, initialEvent, onSave }: Props) {
  const { members } = useFamilyMembersContext();
  const isEdit = Boolean(initialEvent?.id);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quote, setQuote] = useState('');
  const [category, setCategory] = useState<LifeEventCategory>('other');
  const [importance, setImportance] = useState<LifeEventImportance>('medium');
  const [participants, setParticipants] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(initialEvent?.date || '');
      setTitle(initialEvent?.title || '');
      setDescription(initialEvent?.description || '');
      setQuote(initialEvent?.quote || '');
      setCategory(initialEvent?.category || 'other');
      setImportance(initialEvent?.importance || 'medium');
      setParticipants(initialEvent?.participants || []);
      setPhotos(initialEvent?.photos || []);
    }
  }, [open, initialEvent]);

  const isFuture = date > today();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const userId = localStorage.getItem('familyMemberId') || localStorage.getItem('userId') || '';
      const res = await fetch(`${API_URL}?resource=photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body: JSON.stringify({ photo: base64, filename: file.name, contentType: file.type }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Ошибка загрузки');
      setPhotos((prev) => [...prev, data.url!]);
    } catch (e) {
      alert('Не удалось загрузить фото: ' + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!date || !title.trim()) return;
    setSaving(true);
    try {
      await onSave(
        {
          date,
          title: title.trim(),
          description: description.trim() || null,
          quote: quote.trim() || null,
          category,
          importance,
          participants,
          photos,
          isFuture,
        },
        initialEvent?.id || undefined,
      );
      onOpenChange(false);
    } catch (e) {
      alert('Не удалось сохранить: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name={isEdit ? 'Pencil' : 'Plus'} size={22} />
            {isEdit ? 'Редактировать событие' : 'Добавить событие'}
          </DialogTitle>
          <DialogDescription>
            {isFuture
              ? 'Это будущее событие — оно появится в плане на твоём пути.'
              : 'Запиши важный момент жизни — он останется на твоей дороге навсегда.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Дата <span className="text-rose-500">*</span></Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as LifeEventCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_CONFIG) as [LifeEventCategory, typeof CATEGORY_CONFIG['other']][]).map(([k, c]) => (
                    <SelectItem key={k} value={k}>
                      <div className="flex items-center gap-2">
                        <Icon name={c.icon} size={14} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Название <span className="text-rose-500">*</span></Label>
            <Input
              id="title"
              placeholder="Например: Свадьба, Окончание университета, Переезд в Москву"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Расскажи подробнее — что было, кто был рядом, что запомнилось"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote">Цитата дня (опционально)</Label>
            <Input
              id="quote"
              placeholder="Короткая фраза, которая запомнилась"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Важность</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(IMPORTANCE_CONFIG) as [LifeEventImportance, typeof IMPORTANCE_CONFIG['medium']][]).map(([k, c]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setImportance(k)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    importance === k ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <span className={`inline-block rounded-full ${c.dot} ${c.size}`} />
                  <span className="text-[10px] text-gray-700">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Фотографии</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p + i} className="relative group">
                  <img src={p} alt="" className="w-20 h-20 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-xs hidden group-hover:flex items-center justify-center"
                    title="Удалить фото"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 flex flex-col items-center justify-center cursor-pointer text-purple-600 text-[10px] gap-1">
                <Icon name={uploading ? 'Loader2' : 'ImagePlus'} size={20} className={uploading ? 'animate-spin' : ''} />
                <span>{uploading ? 'Загрузка…' : 'Добавить'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) await handleFile(f);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Участники события</Label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-md p-3">
              {members && members.length > 0 ? (
                members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`p-${m.id}`}
                      checked={participants.includes(m.id)}
                      onCheckedChange={(checked) => {
                        setParticipants((prev) =>
                          checked ? [...prev, m.id] : prev.filter((x) => x !== m.id),
                        );
                      }}
                    />
                    <Label htmlFor={`p-${m.id}`} className="text-sm font-normal cursor-pointer">
                      {m.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">В семье пока нет участников</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!date || !title.trim() || saving}>
              <Icon name={saving ? 'Loader2' : 'Check'} size={16} className={`mr-2 ${saving ? 'animate-spin' : ''}`} />
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}