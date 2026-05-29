import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';
import { adminFetch } from '@/lib/adminFetch';
import { hasValidLocalAdminSession } from '@/lib/adminAuth';

interface Ticket {
  id: number;
  type: string;
  user_name: string;
  user_email: string | null;
  title: string;
  description: string;
  rating: number | null;
  status: string;
  priority: string;
  source: string;
  ai_summary: string | null;
  ai_draft: string | null;
  ai_category: string | null;
  ai_priority: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  family_id: string | null;
}

interface Message {
  id: number;
  message_type: 'reply' | 'note' | 'ai_draft';
  body: string;
  author: string;
  created_at: string;
}

interface UserContext {
  email?: string;
  phone?: string;
  role?: string;
  family_name?: string;
  total_tickets?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  new: { label: 'Новое', color: 'bg-red-100 text-red-700 border-red-200', icon: 'AlertCircle' },
  in_progress: { label: 'В работе', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'Clock' },
  waiting_user: { label: 'Ждём ответа', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'MessageSquare' },
  resolved: { label: 'Решено', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Низкий', color: 'text-slate-500' },
  medium: { label: 'Средний', color: 'text-amber-600' },
  high: { label: 'Высокий', color: 'text-orange-600' },
  critical: { label: 'Критический', color: 'text-red-600' },
};

const TYPE_ICON: Record<string, string> = {
  support: 'Headphones',
  review: 'Star',
  suggestion: 'Lightbulb',
};

const AI_CATEGORY_LABEL: Record<string, string> = {
  auth: 'Авторизация', payment: 'Оплата', bug: 'Ошибка',
  feature: 'Функция', content: 'Контент', account: 'Аккаунт',
  family: 'Семья', other: 'Другое',
};

export default function AdminSupportDesk() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<UserContext>({});
  const [ticketLoading, setTicketLoading] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');

  useEffect(() => {
    if (!hasValidLocalAdminSession()) { navigate('/admin/login'); return; }
    loadTickets();
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) setSelectedId(Number(idFromUrl));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedId) {
      loadTicket(selectedId);
      setSearchParams({ id: String(selectedId) });
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [s, r, sg] = await Promise.all([
        adminFetch(`${feedbackUrl}?type=support&all_statuses=true`),
        adminFetch(`${feedbackUrl}?type=review&all_statuses=true`),
        adminFetch(`${feedbackUrl}?type=suggestion&all_statuses=true`),
      ]);
      const sd = await s.json(); const rd = await r.json(); const sgd = await sg.json();
      const all = [
        ...(sd.items || []).map((t: Ticket) => ({ ...t, type: 'support' })),
        ...(rd.items || []).map((t: Ticket) => ({ ...t, type: 'review' })),
        ...(sgd.items || []).map((t: Ticket) => ({ ...t, type: 'suggestion' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTickets(all);
    } finally { setLoading(false); }
  };

  const loadTicket = async (id: number) => {
    setTicketLoading(true);
    setReplyText(''); setNoteText(''); setSendResult(null);
    try {
      const res = await adminFetch(`${feedbackUrl}?id=${id}&detail=1`);
      const data = await res.json();
      setTicket(data.ticket || null);
      setMessages(data.messages || []);
      setUserContext(data.user_context || {});
      if (data.ticket?.ai_draft) setReplyText(data.ticket.ai_draft);
    } finally { setTicketLoading(false); }
  };

  const runAI = async () => {
    if (!ticket) return;
    setAiLoading(true);
    try {
      const res = await adminFetch(feedbackUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'ai_analyze', id: ticket.id })
      });
      const data = await res.json();
      if (data.result) {
        setTicket(t => t ? {
          ...t,
          ai_summary: data.result.summary,
          ai_draft: data.result.draft_reply,
          ai_category: data.result.category,
          ai_priority: data.result.priority,
        } : t);
        setReplyText(data.result.draft_reply || '');
        loadTicket(ticket.id);
      }
    } finally { setAiLoading(false); }
  };

  const sendReply = async () => {
    if (!ticket || !replyText.trim()) return;
    setSending(true); setSendResult(null);
    try {
      const res = await adminFetch(feedbackUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'reply', id: ticket.id, reply_text: replyText })
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ ok: true, msg: `Ответ отправлен на ${data.sent_to}` });
        await loadTicket(ticket.id); await loadTickets(); setReplyText('');
      } else {
        setSendResult({ ok: false, msg: data.error || 'Ошибка отправки' });
      }
    } finally { setSending(false); }
  };

  const sendNote = async () => {
    if (!ticket || !noteText.trim()) return;
    setSending(true);
    try {
      await adminFetch(feedbackUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'note', id: ticket.id, note: noteText })
      });
      await loadTicket(ticket.id);
      setNoteText('');
    } finally { setSending(false); }
  };

  const changeStatus = async (id: number, status: string) => {
    await adminFetch(feedbackUrl, { method: 'PUT', body: JSON.stringify({ id, status }) });
    await loadTickets();
    if (ticket?.id === id) await loadTicket(id);
  };

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) &&
          !t.user_name.toLowerCase().includes(q) &&
          !(t.user_email || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const newCount = tickets.filter(t => t.status === 'new').length;

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'Circle' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
        <Icon name={cfg.icon} size={10} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR — список */}
      <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col">
        {/* Шапка */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/admin/dashboard')} className="text-gray-400 hover:text-gray-600">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <h1 className="font-bold text-gray-900">Support Desk</h1>
              {newCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{newCount}</span>
              )}
            </div>
            <button onClick={loadTickets} className="text-gray-400 hover:text-gray-600">
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
          {/* Поиск */}
          <div className="relative mb-2">
            <Icon name="Search" size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Поиск..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Фильтры */}
          <div className="flex gap-1 flex-wrap">
            {['all', 'new', 'in_progress', 'resolved'].map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {s === 'all' ? 'Все' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {['all', 'support', 'review', 'suggestion'].map(t => (
              <button key={t}
                onClick={() => setFilterType(t)}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${filterType === t ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:border-slate-400'}`}>
                {t === 'all' ? 'Все типы' : t === 'support' ? 'Поддержка' : t === 'review' ? 'Отзывы' : 'Идеи'}
              </button>
            ))}
          </div>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <Icon name="Inbox" size={32} className="mx-auto mb-2" />
              <p className="text-sm">Нет обращений</p>
            </div>
          ) : filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${selectedId === t.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">{t.title}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Icon name={TYPE_ICON[t.type] || 'MessageSquare'} size={11} />
                <span>{t.user_name}</span>
                {t.priority === 'high' && <span className="text-orange-500 font-medium">↑</span>}
                {t.priority === 'critical' && <span className="text-red-500 font-bold">↑↑</span>}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(t.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN — карточка */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Headphones" size={36} className="text-indigo-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Support Desk</h2>
              <p className="text-gray-400 text-sm">Выберите обращение из списка слева</p>
              <p className="text-gray-400 text-sm mt-1">Всего обращений: <strong>{tickets.length}</strong> · Новых: <strong className="text-red-500">{newCount}</strong></p>
            </div>
          </div>
        ) : ticketLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        ) : ticket ? (
          <div className="flex-1 overflow-y-auto">
            {/* Шапка карточки */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                    <Icon name={TYPE_ICON[ticket.type] || 'MessageSquare'} size={14} className="text-gray-500" />
                    <h2 className="font-bold text-gray-900">{ticket.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Icon name="User" size={13} />{ticket.user_name}</span>
                    {ticket.user_email && (
                      <a href={`mailto:${ticket.user_email}`} className="flex items-center gap-1 hover:text-indigo-600">
                        <Icon name="Mail" size={13} />{ticket.user_email}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={13} />
                      {new Date(ticket.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={ticket.status} />
                  <select
                    value={ticket.status}
                    onChange={e => changeStatus(ticket.id, e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* AI-блок */}
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Icon name="Sparkles" size={14} className="text-white" />
                      </div>
                      <span className="font-semibold text-indigo-900 text-sm">AI-помощник</span>
                      {ticket.ai_category && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {AI_CATEGORY_LABEL[ticket.ai_category] || ticket.ai_category}
                        </span>
                      )}
                      {ticket.ai_priority && (
                        <span className={`text-xs font-medium ${PRIORITY_CONFIG[ticket.ai_priority]?.color}`}>
                          {PRIORITY_CONFIG[ticket.ai_priority]?.label}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline"
                      className="gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-100 text-xs"
                      onClick={runAI} disabled={aiLoading}>
                      {aiLoading
                        ? <><Icon name="Loader2" size={13} className="animate-spin" /> Анализирую...</>
                        : <><Icon name="Wand2" size={13} /> {ticket.ai_summary ? 'Переанализировать' : 'Анализировать'}</>}
                    </Button>
                  </div>

                  {ticket.ai_summary ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-indigo-700 mb-1">Резюме</p>
                        <p className="text-sm text-gray-800">{ticket.ai_summary}</p>
                      </div>
                      {ticket.ai_draft && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-indigo-700">Черновик ответа</p>
                            <button
                              onClick={() => { setReplyText(ticket.ai_draft || ''); setActiveTab('reply'); }}
                              className="text-xs text-indigo-600 hover:underline">
                              Использовать →
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 bg-white/70 rounded-lg p-3 border border-indigo-200">{ticket.ai_draft}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-indigo-600/70">Нажмите «Анализировать» — AI изучит обращение и подготовит черновик ответа</p>
                  )}
                </div>
              </Card>

              {/* Оригинальное сообщение */}
              <Card className="p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Обращение пользователя</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
              </Card>

              {/* Контекст пользователя */}
              {(userContext.family_name || userContext.total_tickets) && (
                <Card className="p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Контекст пользователя</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    {userContext.family_name && (
                      <span className="flex items-center gap-1"><Icon name="Home" size={13} className="text-gray-400" /> {userContext.family_name}</span>
                    )}
                    {userContext.role && (
                      <span className="flex items-center gap-1"><Icon name="Shield" size={13} className="text-gray-400" /> {userContext.role}</span>
                    )}
                    {userContext.total_tickets !== undefined && (
                      <span className="flex items-center gap-1"><Icon name="MessageSquare" size={13} className="text-gray-400" /> Обращений: {userContext.total_tickets}</span>
                    )}
                  </div>
                </Card>
              )}

              {/* История сообщений */}
              {messages.length > 0 && (
                <Card className="p-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">История</p>
                  <div className="space-y-3">
                    {messages.map(m => (
                      <div key={m.id} className={`rounded-lg p-3 text-sm ${
                        m.message_type === 'reply' ? 'bg-indigo-50 border border-indigo-100' :
                        m.message_type === 'note' ? 'bg-amber-50 border border-amber-100' :
                        'bg-purple-50 border border-purple-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                          <Icon name={m.message_type === 'reply' ? 'Mail' : m.message_type === 'note' ? 'StickyNote' : 'Sparkles'} size={11} />
                          <span className="font-medium">{m.message_type === 'reply' ? 'Ответ' : m.message_type === 'note' ? 'Заметка' : 'AI черновик'}</span>
                          <span>·</span>
                          <span>{new Date(m.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {m.message_type === 'ai_draft'
                            ? (() => { try { return JSON.parse(m.body).draft_reply || m.body; } catch { return m.body; } })()
                            : m.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Форма ответа/заметки */}
              <Card className="p-4">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setActiveTab('reply')}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'reply' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Icon name="Send" size={13} /> Ответить
                  </button>
                  <button
                    onClick={() => setActiveTab('note')}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'note' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Icon name="StickyNote" size={13} /> Заметка
                  </button>
                </div>

                {activeTab === 'reply' ? (
                  <>
                    {ticket.user_email ? (
                      <p className="text-xs text-indigo-600 mb-2 flex items-center gap-1">
                        <Icon name="Mail" size={12} /> Письмо уйдёт на: {ticket.user_email}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                        <Icon name="AlertTriangle" size={12} /> Email не указан — возьмём из профиля
                      </p>
                    )}
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      rows={5}
                      placeholder="Напишите ответ пользователю..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    {sendResult && (
                      <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-1.5 ${sendResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <Icon name={sendResult.ok ? 'CheckCircle' : 'AlertCircle'} size={13} />
                        {sendResult.msg}
                      </div>
                    )}
                    <Button
                      className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}>
                      {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
                      {sending ? 'Отправка...' : 'Отправить письмо'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                      <Icon name="Lock" size={12} /> Внутренняя заметка — пользователь не увидит
                    </p>
                    <textarea
                      className="w-full border border-amber-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 bg-amber-50"
                      rows={4}
                      placeholder="Заметка для себя: что проверить, что сделано..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                    />
                    <Button
                      className="mt-3 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                      onClick={sendNote}
                      disabled={sending || !noteText.trim()}>
                      <Icon name="StickyNote" size={14} />
                      Сохранить заметку
                    </Button>
                  </>
                )}
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}