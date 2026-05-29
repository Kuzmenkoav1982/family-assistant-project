import { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API = 'https://functions.poehali.dev/1c2b8fba-a386-476a-a78e-dd0d78f1aa61';

const ACTION_LABELS: Record<string, string> = {
  link_existing:     'Уже есть в древе',
  create_new_person: 'Нужна новая запись',
  skip:              'Пропустил',
};

const ROLE_LABELS: Record<string, string> = {
  parent:  'Родитель',
  spouse:  'Супруг / супруга',
  child:   'Сын / дочь',
  sibling: 'Брат / сестра',
  grandp:  'Бабушка / дедушка',
  grandch: 'Внук / внучка',
  other:   'Другой родственник',
};

// Честные подписи кнопок: что реально происходит сейчас
const REVIEW_BUTTONS = [
  {
    action: 'link'     as const,
    label:  'Отметить как связан',
    note:   'Вручную свяжите в разделе Древа',
    color:  'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    action: 'create'   as const,
    label:  'Добавить в древо',
    note:   'Создайте запись вручную в Древе',
    color:  'bg-violet-600 hover:bg-violet-700 text-white',
  },
  {
    action: 'postpone' as const,
    label:  'Отложить',
    note:   '',
    color:  'border border-gray-200 text-gray-500 bg-white hover:bg-gray-50',
  },
];

const TOAST_MESSAGES: Record<string, string> = {
  link:     'Заявка отмечена — свяжите человека в древе',
  create:   'Заявка принята — добавьте запись в древо',
  postpone: 'Отложено. Заявка остаётся в списке',
};

interface Request {
  id: string;
  user_name: string;
  member_name: string;
  email: string;
  requested_role: string;
  action_type: string;
  created_at: string;
  status: string;
}

interface Props {
  isOwnerOrAdmin: boolean;
  autoOpen?: boolean;
  highlightRequestId?: string;
  /** Внешний счётчик pending — синхронизирован с badge в навбаре */
  pendingCount?: number;
  /** Вызывается после успешного review — чтобы обновить badge */
  onReviewed?: () => void;
}

export default function TreeLinkRequests({ isOwnerOrAdmin, autoOpen, highlightRequestId, pendingCount, onReviewed }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(!autoOpen);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!isOwnerOrAdmin) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API}?action=list&status=pending`, {
        headers: { 'X-Auth-Token': token },
      });
      const data = await res.json();
      if (data.success) setRequests(data.requests || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isOwnerOrAdmin]);

  useEffect(() => { load(); }, [load]);

  // Scroll to highlighted card after load
  useEffect(() => {
    if (!highlightRequestId || loading || collapsed) return;
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightRequestId, loading, collapsed]);

  const review = async (requestId: string, action: 'link' | 'create' | 'postpone') => {
    setActionLoading(requestId + action);
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API}?action=review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ request_id: requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action !== 'postpone') {
          setRequests(prev => prev.filter(r => r.id !== requestId));
        }
        toast.success(TOAST_MESSAGES[action]);
        // Сигнал для badge + callback родителя — обновить счётчик pending
        window.dispatchEvent(new Event('tree-link-reviewed'));
        onReviewed?.();
      } else {
        toast.error(data.error || 'Ошибка при обработке заявки');
      }
    } catch {
      toast.error('Нет соединения, попробуйте снова');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOwnerOrAdmin || (!loading && requests.length === 0)) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden">
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={14} className="text-amber-700" />
          </div>
          <span className="text-sm font-semibold text-amber-900">Запросы на добавление в древо</span>
          {(() => {
            const displayCount = loading ? (pendingCount ?? 0) : requests.length;
            return displayCount > 0 ? (
              <span className="text-xs font-bold bg-amber-500 text-white rounded-full px-2 py-0.5">
                {displayCount}
              </span>
            ) : null;
          })()}
        </div>
        <Icon name={collapsed ? 'ChevronDown' : 'ChevronUp'} size={16} className="text-amber-600" />
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[11px] text-amber-700 bg-amber-100 rounded-lg px-3 py-2 leading-relaxed">
            Родственники вступили в семью и указали, кем приходятся. Рассмотрите запрос — привязку к узлу древа выполните вручную.
          </p>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Icon name="Loader" size={18} className="animate-spin text-amber-500" />
            </div>
          )}

          {requests.map(req => {
            const isHighlighted = req.id === highlightRequestId;
            return (
            <div
              key={req.id}
              ref={isHighlighted ? highlightRef : null}
              className={`bg-white rounded-xl border p-4 space-y-3 transition-all duration-500 ${
                isHighlighted
                  ? 'border-violet-400 ring-2 ring-violet-300/50 shadow-md'
                  : 'border-amber-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                  {(req.member_name || req.user_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {req.member_name || req.user_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{req.email}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(req.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Icon name="User" size={12} className="text-violet-500 flex-shrink-0" />
                  <span>Кем приходится: <span className="font-medium">{ROLE_LABELS[req.requested_role] || req.requested_role || '—'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Icon name="GitBranch" size={12} className="text-violet-500 flex-shrink-0" />
                  <span>Запрос: <span className="font-medium">{ACTION_LABELS[req.action_type] || req.action_type}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {REVIEW_BUTTONS.map(btn => (
                  <Button
                    key={btn.action}
                    size="sm"
                    onClick={() => review(req.id, btn.action)}
                    disabled={!!actionLoading}
                    title={btn.note}
                    className={`text-xs h-8 ${btn.color}`}
                  >
                    {actionLoading === req.id + btn.action
                      ? <Icon name="Loader" size={12} className="animate-spin" />
                      : btn.label
                    }
                  </Button>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}