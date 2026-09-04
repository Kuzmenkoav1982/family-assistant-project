import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '@/../backend/func2url.json';

const PAGE_VIEWS_URL = (func2url as Record<string, string>)['page-views'] || '';

interface DeckRow {
  path: string;
  title: string;
  views: number;
  sessions: number;
  unique_ips: number;
  last_view: string | null;
}

interface Visit {
  session_id: string;
  started: string | null;
  ended: string | null;
  duration_sec: number;
  hits: number;
  ip: string;
  device: string;
  os: string;
  browser: string;
  referrer: string;
  source: string;
}

interface DeckDetail {
  path: string;
  title: string;
  views: number;
  sessions: number;
  unique_ips: number;
  first_view: string | null;
  last_view: string | null;
  visits: Visit[];
  sources: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  daily: Array<{ date: string; views: number; sessions: number }>;
}

const DEVICE_ICON: Record<string, string> = {
  mobile: 'Smartphone',
  tablet: 'Tablet',
  desktop: 'Monitor',
  unknown: 'HelpCircle',
};

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'Телефон',
  tablet: 'Планшет',
  desktop: 'Компьютер',
  unknown: 'Неизвестно',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m} мин ${s} сек` : `${m} мин`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
}

export default function DecksAnalyticsTab() {
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [detail, setDetail] = useState<DeckDetail | null>(null);
  const [selected, setSelected] = useState<string>('/strategy/csi');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const url = `${PAGE_VIEWS_URL}?action=decks${path ? `&path=${encodeURIComponent(path)}` : ''}`;
      const r = await fetch(url);
      const data = await r.json();
      setDecks(data.decks || []);
      setDetail(data.detail || null);
    } catch {
      setDecks([]);
      setDetail(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(selected);
  }, [selected, load]);

  if (loading && !detail) {
    return (
      <div className="flex justify-center py-10">
        <Icon name="Loader2" className="animate-spin" size={30} />
      </div>
    );
  }

  const maxDaily = Math.max(1, ...(detail?.daily || []).map((d) => d.views));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Все презентации</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {decks.map((d) => (
            <button
              key={d.path}
              onClick={() => setSelected(d.path)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                selected === d.path
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium text-sm truncate">{d.title}</div>
              <code
                className={`text-[10px] ${selected === d.path ? 'text-slate-300' : 'text-gray-400'}`}
              >
                {d.path}
              </code>
              <div className="flex gap-3 mt-1.5 text-xs">
                <span className={selected === d.path ? 'text-amber-300' : 'text-amber-600'}>
                  {d.views} просм.
                </span>
                <span className={selected === d.path ? 'text-emerald-300' : 'text-emerald-600'}>
                  {d.sessions} визитов
                </span>
              </div>
              <div
                className={`text-[10px] mt-1 ${selected === d.path ? 'text-slate-400' : 'text-gray-400'}`}
              >
                посл.: {fmtDate(d.last_view)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {detail && (
        <>
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h3 className="text-base font-semibold">{detail.title}</h3>
              <a
                href={detail.path}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                открыть <Icon name="ExternalLink" size={11} />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Всего просмотров</div>
                  <div className="text-2xl font-bold">{detail.views}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Визитов (сессий)</div>
                  <div className="text-2xl font-bold text-emerald-600">{detail.sessions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Уникальных IP</div>
                  <div className="text-2xl font-bold text-indigo-600">{detail.unique_ips}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Последний просмотр</div>
                  <div className="text-sm font-semibold pt-1.5">{fmtDate(detail.last_view)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Icon name="Share2" size={14} /> Откуда приходили
                  </div>
                  <div className="space-y-1.5">
                    {detail.sources.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{s.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {s.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Icon name="MonitorSmartphone" size={14} /> С каких устройств
                  </div>
                  <div className="space-y-1.5">
                    {detail.devices.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          <Icon name={DEVICE_ICON[d.name] || 'HelpCircle'} size={12} />
                          {DEVICE_LABEL[d.name] || d.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {d.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {detail.daily.length > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Icon name="TrendingUp" size={14} /> По дням
                  </div>
                  <div className="space-y-1">
                    {detail.daily.map((d) => (
                      <div key={d.date} className="flex items-center gap-2 text-xs">
                        <span className="w-20 shrink-0 text-gray-500">
                          {new Date(d.date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full flex items-center justify-end pr-1.5"
                            style={{ width: `${Math.max(6, (d.views / maxDaily) * 100)}%` }}
                          >
                            <span className="text-[9px] text-white font-medium">{d.views}</span>
                          </div>
                        </div>
                        <span className="w-16 shrink-0 text-gray-400 text-[10px]">
                          {d.sessions} виз.
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Icon name="Users" size={14} /> Кто и когда смотрел ({detail.visits.length})
                </div>
                <div className="space-y-2">
                  {detail.visits.map((v) => (
                    <div key={v.session_id} className="bg-gray-50 rounded-lg p-3 text-xs">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon
                            name={DEVICE_ICON[v.device] || 'HelpCircle'}
                            size={14}
                            className="text-gray-500"
                          />
                          <span className="font-medium">{fmtDate(v.started)}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {v.source}
                          </Badge>
                        </div>
                        <div className="text-gray-500">
                          {v.hits} экранов · {fmtDuration(v.duration_sec)}
                        </div>
                      </div>
                      <div className="mt-1.5 text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                        <span>IP: {v.ip || '—'}</span>
                        <span>{v.os}</span>
                        <span>{v.browser}</span>
                        {v.referrer && (
                          <span className="truncate max-w-full" title={v.referrer}>
                            откуда: {v.referrer}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {detail.visits.length === 0 && (
                    <div className="text-center py-6 text-gray-400">Пока нет визитов</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
