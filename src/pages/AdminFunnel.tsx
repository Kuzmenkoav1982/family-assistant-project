import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '@/../backend/func2url.json';

type Period = '24h' | '7d' | '30d';

interface FunnelStep {
  key: string;
  label: string;
  count: number;
  conv: number;
  source: string;
}

interface ValueItem { event: string; label: string; count: number; }

interface RecentEvent {
  created_at: string;
  event_name: string;
  source: string;
  user_short: string;
  anon_short: string;
  family_short: string;
  path: string | null;
  properties: Record<string, unknown> | null;
}

interface FunnelData {
  period: string;
  counts: Record<string, { cnt: number; uniq: number }>;
  page_views: { views: number; sessions: number };
  funnel: FunnelStep[];
  value_breakdown: ValueItem[];
  recent: RecentEvent[];
  daily_chart: Array<Record<string, unknown>>;
}

const API_URL = (func2url as Record<string, string>)['funnel-stats'] || '';

const EVENT_LABELS: Record<string, string> = {
  signup_started:    'Начало регистрации',
  signup_failed:     'Ошибка регистрации',
  signup_completed:  'Регистрация завершена',
  login_success:     'Вход',
  login_failed:      'Ошибка входа',
  family_created:    'Создана семья',
  task_created:      'Создана задача',
  chat_message_sent: 'Отправлено сообщение',
  ai_request_sent:   'AI-запрос',
  onboarding_started:   'Начат онбординг',
  onboarding_completed: 'Онбординг завершён',
  page_404_hit:      '404',
};

const EVENT_COLORS: Record<string, string> = {
  signup_started:    'bg-blue-50 text-blue-700 border-blue-200',
  signup_completed:  'bg-green-50 text-green-700 border-green-200',
  signup_failed:     'bg-red-50 text-red-700 border-red-200',
  login_success:     'bg-purple-50 text-purple-700 border-purple-200',
  login_failed:      'bg-orange-50 text-orange-700 border-orange-200',
  family_created:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  task_created:      'bg-teal-50 text-teal-700 border-teal-200',
  chat_message_sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ai_request_sent:   'bg-pink-50 text-pink-700 border-pink-200',
};

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 p-3 md:p-4 md:pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
        <div className={`text-2xl md:text-3xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {sub && <p className="text-[10px] md:text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [period, setPeriod] = useState<Period>('7d');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}?period=${p}`);
      if (r.ok) setData(await r.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  const counts = data?.counts || {};
  const funnel = data?.funnel || [];
  const maxFunnelCount = funnel[0]?.count || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-3 sm:p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Заголовок */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Воронка продукта
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Traffic → Signup → Family → First value action
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['24h', '7d', '30d'] as Period[]).map(p => (
              <Button key={p} size="sm" variant={period === p ? 'default' : 'outline'}
                className="h-8 text-xs"
                onClick={() => setPeriod(p)}>
                {p === '24h' ? '24 часа' : p === '7d' ? '7 дней' : '30 дней'}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 text-xs ml-auto"
              onClick={() => window.location.href = '/admin/dashboard'}>
              <Icon name="ArrowLeft" size={12} className="mr-1" />
              Назад
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" className="animate-spin text-purple-500" size={36} />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Два слоя: трафик и продукт */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-semibold">Трафик (page_views)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Просмотров" value={data.page_views.views} color="text-blue-600" />
                <StatCard label="Сессий" value={data.page_views.sessions} color="text-blue-500" />
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-semibold">Продукт (product_events)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['signup_started','signup_completed','login_success','family_created','task_created','chat_message_sent','ai_request_sent','signup_failed'].map(ev => (
                  <StatCard key={ev}
                    label={EVENT_LABELS[ev] || ev}
                    value={counts[ev]?.cnt ?? 0}
                    sub={`${counts[ev]?.uniq ?? 0} уник.`}
                    color="text-purple-600"
                  />
                ))}
              </div>
            </div>

            {/* Воронка */}
            <Card>
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon name="TrendingDown" size={16} className="text-purple-500" />
                  Воронка конверсии
                  <span className="text-xs text-slate-400 font-normal ml-1">Честное сравнение: трафик из page_views, события из product_events — разные пространства ID до stitching</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {funnel.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className="w-5 text-xs text-slate-400 text-right flex-shrink-0">{i + 1}</div>
                    <div className="w-36 sm:w-48 text-xs text-slate-600 flex-shrink-0">{step.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-5 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all"
                        style={{ width: `${Math.max((step.count / maxFunnelCount) * 100, step.count > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-bold text-slate-700 flex-shrink-0">
                      {step.count.toLocaleString()}
                    </div>
                    <div className="w-14 text-right flex-shrink-0">
                      {i > 0 && (
                        <span className={`text-xs font-medium ${step.conv >= 10 ? 'text-green-600' : step.conv >= 1 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {step.conv}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* First Value Action breakdown */}
            <Card>
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon name="Zap" size={16} className="text-yellow-500" />
                  Первое полезное действие
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-3">
                  {data.value_breakdown.map(v => (
                    <div key={v.event} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-2xl font-bold text-slate-700">{v.count}</div>
                      <div className="text-xs text-slate-500 mt-1">{v.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Последние события */}
            <Card>
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon name="Activity" size={16} className="text-green-500" />
                  Последние события
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.recent.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Нет событий за период</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left p-3 text-slate-400 font-medium">Время</th>
                          <th className="text-left p-3 text-slate-400 font-medium">Событие</th>
                          <th className="text-left p-3 text-slate-400 font-medium">User / Anon</th>
                          <th className="text-left p-3 text-slate-400 font-medium">Path</th>
                          <th className="text-left p-3 text-slate-400 font-medium">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent.map((ev, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-3 text-slate-400 whitespace-nowrap">
                              {new Date(ev.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              <span className="block text-[10px]">{new Date(ev.created_at).toLocaleDateString('ru')}</span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-medium ${EVENT_COLORS[ev.event_name] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                {EVENT_LABELS[ev.event_name] || ev.event_name}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              {ev.user_short ? `u:${ev.user_short}` : `a:${ev.anon_short}`}
                              {ev.family_short && <span className="block text-[10px] text-slate-300">f:{ev.family_short}</span>}
                            </td>
                            <td className="p-3 text-slate-400 max-w-[120px] truncate">{ev.path || '—'}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {ev.source}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Честная оговорка */}
            <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <strong>Ограничение воронки:</strong> <code>signup_started</code> хранит <code>anonymous_id</code>, <code>signup_completed</code> — <code>user_id</code>.
              Без identity stitching конверсия считается по отдельным пространствам ID. После накопления событий с <code>identity_linked=true</code> можно будет строить точную сшитую воронку.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
