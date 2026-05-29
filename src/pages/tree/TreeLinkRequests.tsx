import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const API = 'https://functions.poehali.dev/1c2b8fba-a386-476a-a78e-dd0d78f1aa61';

const ACTION_LABELS: Record<string, string> = {
  link_existing:    'Я уже есть в древе',
  create_new_person:'Создайте запись обо мне',
  skip:             'Пропустить',
};

const ROLE_LABELS: Record<string, string> = {
  parent:  'Родитель', spouse: 'Супруг / супруга', child: 'Сын / дочь',
  sibling: 'Брат / сестра', grandp: 'Бабушка / дедушка', grandch: 'Внук / внучка',
  other:   'Другой родственник',
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
  /** Только для Владельца и Администратора */
  userRole: string;
}

export default function TreeLinkRequests({ userRole }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwnerOrAdmin = userRole === 'Владелец' || userRole === 'Администратор';

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

  const review = async (requestId: string, action: 'link' | 'create' | 'postpone') => {
    setActionLoading(requestId + action);
    try {
      const token = localStorage.getItem('authToken') || '';
      await fetch(`${API}?action=review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'review', request_id: requestId, action: action }),
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  if (!isOwnerOrAdmin || requests.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden">
      {/* Заголовок */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={14} className="text-amber-700" />
          </div>
          <span className="text-sm font-semibold text-amber-900">Ожидают привязки к древу</span>
          <span className="text-xs font-bold bg-amber-500 text-white rounded-full px-2 py-0.5">
            {requests.length}
          </span>
        </div>
        <Icon name={collapsed ? 'ChevronDown' : 'ChevronUp'} size={16} className="text-amber-600" />
      </button>

      {/* Список заявок */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Icon name="Loader" size={18} className="animate-spin text-amber-500" />
            </div>
          )}
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-amber-100 p-4 space-y-3">
              {/* Шапка карточки */}
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

              {/* Детали запроса */}
              <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Icon name="User" size={12} className="text-violet-500 flex-shrink-0" />
                  <span>Роль: <span className="font-medium">{ROLE_LABELS[req.requested_role] || req.requested_role || '—'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Icon name="GitBranch" size={12} className="text-violet-500 flex-shrink-0" />
                  <span>Запрос: <span className="font-medium">{ACTION_LABELS[req.action_type] || req.action_type}</span></span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  onClick={() => review(req.id, 'link')}
                  disabled={!!actionLoading}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                >
                  {actionLoading === req.id + 'link'
                    ? <Icon name="Loader" size={12} className="animate-spin" />
                    : 'Связать'
                  }
                </Button>
                <Button
                  size="sm"
                  onClick={() => review(req.id, 'create')}
                  disabled={!!actionLoading}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white h-8"
                >
                  {actionLoading === req.id + 'create'
                    ? <Icon name="Loader" size={12} className="animate-spin" />
                    : 'Создать'
                  }
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => review(req.id, 'postpone')}
                  disabled={!!actionLoading}
                  className="text-xs border-gray-200 text-gray-500 h-8"
                >
                  Позже
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
