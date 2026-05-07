import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import func2url from '../../../../backend/func2url.json';

const MAX_BOT_URL = (func2url as Record<string, string>)['max-bot'];

interface PollResult {
  fetched: number;
  saved: number;
  skipped_short: number;
  skipped_existing: number;
  errors: number;
  posts?: { post_id: number; slug: string; title: string }[];
}

export default function ChannelPoller() {
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState<PollResult | null>(null);
  const [lastTime, setLastTime] = useState<string | null>(null);

  const handlePoll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || 'admin_authenticated';
      const res = await fetch(`${MAX_BOT_URL}?action=poll-channel&limit=50`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        setLast({
          fetched: data.fetched || 0,
          saved: data.saved || 0,
          skipped_short: data.skipped_short || 0,
          skipped_existing: data.skipped_existing || 0,
          errors: data.errors || 0,
          posts: data.posts || [],
        });
        setLastTime(new Date().toLocaleTimeString('ru-RU'));
        if (data.saved > 0) {
          toast.success(`Подтянули ${data.saved} новых постов`);
        } else if (data.skipped_existing > 0) {
          toast.info(`Новых постов нет (${data.skipped_existing} уже в блоге)`);
        } else {
          toast.info('Сообщения не найдены');
        }
      } else {
        toast.error(data.error || 'Не удалось подтянуть посты');
      }
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Icon name="RefreshCw" size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            Polling: ручная и автоматическая синхронизация
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Если webhook от MAX молчит — этот режим тянет посты канала через API сам. Дубли не создаются.
          </p>
        </div>
      </div>

      <Button
        onClick={handlePoll}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
      >
        {loading ? (
          <>
            <Icon name="Loader2" size={18} className="animate-spin" />
            Тянем посты из MAX-канала…
          </>
        ) : (
          <>
            <Icon name="Download" size={18} />
            Подтянуть последние 50 постов сейчас
          </>
        )}
      </Button>

      {last && (
        <div className="mt-4 rounded-xl bg-white border border-emerald-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Последний запуск: {lastTime}</span>
            {last.saved > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                +{last.saved}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-xl font-bold text-slate-700">{last.fetched}</div>
              <div className="text-[10px] text-slate-500 uppercase">Получено</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2">
              <div className="text-xl font-bold text-emerald-700">{last.saved}</div>
              <div className="text-[10px] text-emerald-600 uppercase">Новых</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-xl font-bold text-amber-700">{last.skipped_existing}</div>
              <div className="text-[10px] text-amber-600 uppercase">Уже было</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-2">
              <div className="text-xl font-bold text-rose-700">{last.errors}</div>
              <div className="text-[10px] text-rose-600 uppercase">Ошибок</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500 leading-relaxed">
        <Icon name="Info" size={12} className="inline mr-1" />
        Автоматический режим (cron каждые 5 минут) уже подключён — просто пиши в канал, посты сами появятся в блоге.
      </div>
    </div>
  );
}
