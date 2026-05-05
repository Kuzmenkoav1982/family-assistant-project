import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import MiniStat from './MiniStat';
import { apiGet, FamiliesResponse, FinanceData } from './types';

export function FamiliesTab() {
  const [data, setData] = useState<FamiliesResponse | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = `&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const res = await apiGet<FamiliesResponse>('families', q);
    setData(res);
    setLoading(false);
  }, [search, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          <MiniStat label="Всего семей" value={data.summary.total} color="slate" />
          <MiniStat label="Сегодня" value={data.summary.today} color="green" />
          <MiniStat label="За неделю" value={data.summary.week} color="blue" />
          <MiniStat label="За месяц" value={data.summary.month} color="purple" />
          <MiniStat label="Активных" value={data.summary.active_week} color="orange" />
        </div>
      )}

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по названию, email владельца или имени..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                className="pl-9"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 rounded-md border bg-white text-sm"
            >
              <option value="recent">Новые сверху</option>
              <option value="members">По числу участников</option>
              <option value="name">По названию (А-Я)</option>
            </select>
            <Button onClick={load} size="sm">
              <Icon name="RefreshCcw" size={14} className="mr-1.5" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" className="animate-spin" size={30} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data?.families.map((f) => (
            <Card key={f.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{f.name}</h3>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {f.member_count} чел
                      </Badge>
                    </div>
                    {f.owner_email && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        <Icon name="User" size={11} className="inline mr-1" />
                        {f.owner_name || '—'} · {f.owner_email}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                      {f.created_at && (
                        <span>Создана: {new Date(f.created_at).toLocaleDateString('ru-RU')}</span>
                      )}
                      {f.last_activity && (
                        <span>Активн: {new Date(f.last_activity).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.families.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <Icon name="Search" size={36} className="mx-auto mb-2 opacity-40" />
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FinanceTab() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<FinanceData>('finance').then((r) => {
      setData(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;
  if (!data) return <div className="text-center py-10 text-gray-500">Нет данных</div>;

  const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <MiniStat label="Доход всего" value={fmt(data.total_revenue)} color="green" />
        <MiniStat label="Сегодня" value={fmt(data.today_revenue)} color="blue" />
        <MiniStat label="За неделю" value={fmt(data.week_revenue)} color="purple" />
        <MiniStat label="За месяц" value={fmt(data.month_revenue)} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MiniStat label="Всего платежей" value={data.total_payments} color="slate" />
        <MiniStat label="Успешных" value={data.successful_payments} color="green" />
        <MiniStat
          label="Конверсия оплат"
          value={data.total_payments > 0 ? `${Math.round((data.successful_payments / data.total_payments) * 100)}%` : '—'}
          color="blue"
        />
      </div>

      {data.methods.length > 0 && (
        <Card>
          <CardHeader className="p-4"><CardTitle className="text-base">Способы оплаты</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {data.methods.map((m) => (
              <div key={m.method} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{m.method || 'неизвестно'}</span>
                <div className="text-xs">
                  <span className="font-bold">{fmt(m.amount)}</span>
                  <span className="text-gray-500 ml-2">({m.count} опер.)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.recent_payments.length > 0 && (
        <Card>
          <CardHeader className="p-4"><CardTitle className="text-base">Последние транзакции</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {data.recent_payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{fmt(p.amount)}</div>
                  <div className="text-gray-500 truncate">
                    {p.method || '—'} · {p.created_at ? new Date(p.created_at).toLocaleString('ru-RU') : '—'}
                  </div>
                </div>
                <Badge
                  variant={p.status === 'success' || p.status === 'completed' || p.status === 'paid' ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.recent_payments.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            <Icon name="CreditCard" size={40} className="mx-auto mb-2 opacity-40" />
            <p>Платежей пока нет</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
