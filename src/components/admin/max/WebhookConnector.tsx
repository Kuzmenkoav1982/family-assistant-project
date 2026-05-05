import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import func2url from '../../../../backend/func2url.json';

const MAX_BOT_URL = (func2url as Record<string, string>)['max-bot'];

interface WebhookStatus {
  connected: boolean;
  count: number;
  our_url: string;
}

export default function WebhookConnector() {
  const [status, setStatus] = useState<WebhookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || 'admin_authenticated';
      const res = await fetch(`${MAX_BOT_URL}?action=webhook-status`, {
        headers: { 'X-Admin-Token': token },
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ connected: data.connected, count: data.count, our_url: data.our_url });
      } else {
        toast.error(data.error || 'Не удалось получить статус');
      }
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConnect = async () => {
    setActing(true);
    try {
      const token = localStorage.getItem('adminToken') || 'admin_authenticated';
      const res = await fetch(`${MAX_BOT_URL}?action=webhook-subscribe`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('🎉 Готово! Теперь все посты из МАХ автоматически попадают на сайт');
        await loadStatus();
      } else {
        toast.error(`Не получилось: ${data.error || JSON.stringify(data.response)}`);
      }
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setActing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Точно отключить автоматическое зеркало? После этого посты из МАХ перестанут попадать на сайт автоматически.')) return;
    setActing(true);
    try {
      const token = localStorage.getItem('adminToken') || 'admin_authenticated';
      const res = await fetch(`${MAX_BOT_URL}?action=webhook-unsubscribe`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Автоматическое зеркало отключено');
        await loadStatus();
      } else {
        toast.error('Не удалось отключить');
      }
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
        <Icon name="Loader2" size={16} className="animate-spin" />
        Проверяем статус подключения...
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Icon name="CheckCircle2" size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-green-900">
              ✅ Автоматическое зеркало включено
            </h3>
            <p className="text-sm text-green-800 mt-1 leading-relaxed">
              Всё работает! Каждый раз, когда вы пишете пост в МАХ-канале (через приложение или сайт max.ru), он автоматически появится на nasha-semiya.ru/blog с картинкой и SEO-настройками.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Link2" size={14} className="text-green-600" />
            <span className="font-mono break-all">{status.our_url}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Activity" size={14} className="text-green-600" />
            <span>Активных подписок у бота: <strong>{status.count}</strong></span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={loadStatus}>
            <Icon name="RefreshCw" size={14} className="mr-1.5" />
            Проверить ещё раз
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisconnect}
            disabled={acting}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Icon name="Unlink" size={14} className="mr-1.5" />
            Отключить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Icon name="AlertTriangle" size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-amber-900">
            ⚠️ Автоматическое зеркало выключено
          </h3>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Сейчас посты, которые вы пишете <strong>прямо в МАХ-приложении</strong>, не попадают на сайт автоматически. Чтобы это исправить — нажмите одну кнопку ниже.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Что произойдёт после нажатия:
        </p>
        <ul className="text-sm text-gray-700 space-y-1.5 ml-1">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Бот в МАХ начнёт уведомлять наш сайт о каждом новом посте в канале
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Каждый пост (заголовок, текст, картинка) сразу появится на /blog
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Через 1–7 дней Яндекс начнёт находить эти посты и показывать в поиске
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Можно отключить в любой момент, ничего не сломается
          </li>
        </ul>
      </div>

      <Button
        onClick={handleConnect}
        disabled={acting}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:opacity-90 text-white text-base h-14"
      >
        {acting ? (
          <>
            <Icon name="Loader2" size={20} className="animate-spin mr-2" />
            Подключаем...
          </>
        ) : (
          <>
            <Icon name="Zap" size={20} className="mr-2" />
            Включить автоматическое зеркало
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Технически: зарегистрирует webhook URL у MAX Bot API. Делается один раз.
      </p>
    </div>
  );
}
