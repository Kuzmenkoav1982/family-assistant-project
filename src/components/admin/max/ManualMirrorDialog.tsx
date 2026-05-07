import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import func2url from '../../../../backend/func2url.json';

const MAX_BOT_URL = (func2url as Record<string, string>)['max-bot'];

interface MirrorResult {
  ok: boolean;
  post_id?: number;
  slug?: string;
  error?: string;
}

interface MirrorEntry {
  text: string;
  imageUrl: string;
  result?: MirrorResult;
  loading?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export default function ManualMirrorDialog({ open, onOpenChange, onSuccess }: Props) {
  const [entries, setEntries] = useState<MirrorEntry[]>([{ text: '', imageUrl: '' }]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const updateEntry = (i: number, patch: Partial<MirrorEntry>) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { text: '', imageUrl: '' }]);
  };

  const removeEntry = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  const mirrorOne = async (i: number): Promise<boolean> => {
    const entry = entries[i];
    if (!entry.text || entry.text.trim().length < 50) {
      updateEntry(i, { result: { ok: false, error: 'Текст слишком короткий (минимум 50 символов)' } });
      return false;
    }
    updateEntry(i, { loading: true, result: undefined });
    try {
      const token = localStorage.getItem('adminToken') || 'admin_authenticated';
      const res = await fetch(`${MAX_BOT_URL}?action=mirror`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: entry.text.trim(),
          image_url: entry.imageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok && data.post_id) {
        updateEntry(i, { loading: false, result: { ok: true, post_id: data.post_id, slug: data.slug } });
        return true;
      }
      updateEntry(i, { loading: false, result: { ok: false, error: data.error || 'Не удалось сохранить' } });
      return false;
    } catch (e) {
      updateEntry(i, { loading: false, result: { ok: false, error: (e as Error).message } });
      return false;
    }
  };

  const mirrorAll = async () => {
    setBulkLoading(true);
    let success = 0;
    let failed = 0;
    for (let i = 0; i < entries.length; i++) {
      const ok = await mirrorOne(i);
      if (ok) success++;
      else failed++;
    }
    setBulkLoading(false);
    if (success > 0) {
      toast.success(`Залито постов: ${success}${failed ? `, ошибок: ${failed}` : ''}`);
      onSuccess?.();
    } else {
      toast.error(`Ничего не залилось (ошибок: ${failed})`);
    }
  };

  const successCount = entries.filter((e) => e.result?.ok).length;
  const totalReady = entries.filter((e) => e.text.trim().length >= 50).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Upload" size={20} className="text-purple-600" />
            Залить пропущенные посты из MAX
          </DialogTitle>
          <DialogDescription>
            Скопируйте текст постов из MAX-канала и вставьте сюда. Каждый пост заливается отдельно
            и сразу появится на /blog. Используйте, если посты были опубликованы до подключения
            автоматического зеркала.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {entries.map((entry, i) => (
            <div
              key={i}
              className={`border rounded-xl p-4 space-y-3 ${
                entry.result?.ok
                  ? 'border-green-300 bg-green-50/50'
                  : entry.result && !entry.result.ok
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-700">Пост #{i + 1}</span>
                  {entry.result?.ok && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <Icon name="CheckCircle2" size={12} />
                      Залит (id {entry.result.post_id})
                    </span>
                  )}
                  {entry.result && !entry.result.ok && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      <Icon name="AlertCircle" size={12} />
                      {entry.result.error}
                    </span>
                  )}
                </div>
                {entries.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEntry(i)}
                    className="text-red-600 h-7"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                )}
              </div>

              <Textarea
                placeholder="Вставьте сюда полный текст поста из MAX-канала. Первая строка станет заголовком..."
                value={entry.text}
                onChange={(e) => updateEntry(i, { text: e.target.value, result: undefined })}
                rows={6}
                className="text-sm"
                disabled={entry.loading || entry.result?.ok}
              />

              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">
                  URL обложки (опционально)
                </label>
                <Input
                  placeholder="https://... — если пусто, обложка сгенерируется ИИ позже"
                  value={entry.imageUrl}
                  onChange={(e) => updateEntry(i, { imageUrl: e.target.value })}
                  disabled={entry.loading || entry.result?.ok}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{entry.text.length} символов · ~{Math.max(1, Math.round(entry.text.split(/\s+/).length / 200))} мин чтения</span>
                {entry.result?.ok && entry.result.slug && (
                  <a
                    href={`/blog/${entry.result.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-700 hover:underline inline-flex items-center gap-1"
                  >
                    Открыть пост <Icon name="ExternalLink" size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addEntry}
            className="w-full border-dashed"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить ещё пост
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <div className="text-xs text-gray-500 mr-auto self-center">
            Готово к заливке: {totalReady} · Залито: {successCount}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button
            onClick={mirrorAll}
            disabled={bulkLoading || totalReady === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white"
          >
            {bulkLoading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Заливаем...
              </>
            ) : (
              <>
                <Icon name="Upload" size={16} className="mr-2" />
                Залить все ({totalReady})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
