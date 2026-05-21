import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import type { ServiceRecord } from '@/hooks/useGarage';
import { SERVICE_TYPES, fmt, fmtDate } from '../constants';

const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ServicesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
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
    await g.createService(vehicleId, {
      ...form,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
      photo_urls: attachedFiles.map(f => f.url),
    });
    const d = await g.loadServices(vehicleId);
    setItems(d);
    await g.loadVehicles();
    setShowAdd(false);
    setSaving(false);
    setAttachedFiles([]);
    setForm({ service_type: 'maintenance', title: '', description: '', date: new Date().toISOString().split('T')[0], mileage: '', cost: '', service_station: '', parts_replaced: '' });
  };

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
                  >×</button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Icon name={uploading ? 'Loader2' : 'Upload'} size={18} className={`text-gray-400 ${uploading ? 'animate-spin' : ''}`} />
                <span className="text-[9px] text-gray-400 mt-0.5">Добавить</span>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileAttach} disabled={uploading} />
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Фото работ, акт ТО, чеки (JPG, PNG, PDF до 10 МБ)</p>
          </div>

          <Button className="w-full" disabled={!form.title || saving || uploading} onClick={handleSave}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </CardContent></Card>
      )}

      {items.length === 0
        ? <p className="text-sm text-muted-foreground text-center py-6">Нет записей об обслуживании</p>
        : items.map(s => (
          <Card key={s.id}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{SERVICE_TYPES[s.service_type] || s.service_type} — {s.title}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(s.date)}{s.mileage ? ` · ${s.mileage.toLocaleString('ru-RU')} км` : ''}{s.service_station ? ` · ${s.service_station}` : ''}</p>
                  {s.description && <p className="text-xs mt-1">{s.description}</p>}
                  {s.photo_urls && s.photo_urls.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {s.photo_urls.map((url, i) => isPdf(url) ? (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-red-50 border border-red-200 flex flex-col items-center justify-center hover:bg-red-100 transition-colors">
                          <Icon name="FileText" size={14} className="text-red-500" />
                          <span className="text-[8px] text-red-600">PDF</span>
                        </a>
                      ) : (
                        <img key={i} src={url} alt={`Фото ${i + 1}`} className="w-10 h-10 rounded object-cover border cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" onClick={() => setPreviewUrl(url)} />
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
        ))
      }

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
