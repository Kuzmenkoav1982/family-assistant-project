import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '@/../backend/func2url.json';
import AdminRatingCampaigns from '@/components/admin/AdminRatingCampaigns';
import AdminReferralProgram from '@/components/admin/AdminReferralProgram';

const API = (func2url as Record<string, string>)['admin-users'];
const AUTH_HEADERS = { 'X-Admin-Token': 'admin_authenticated', 'Content-Type': 'application/json' };

async function apiGet<T>(resource: string, extra = ''): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}${extra}`, { headers: AUTH_HEADERS });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function apiPost<T>(resource: string, body: object): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch {
    return null;
  }
}

async function apiDelete<T>(resource: string, body: object): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}`, {
      method: 'DELETE',
      headers: AUTH_HEADERS,
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch {
    return null;
  }
}

interface Family {
  id: string;
  name: string;
  created_at: string | null;
  logo_url: string | null;
  member_count: number;
  owner_email: string | null;
  owner_name: string | null;
  last_activity: string | null;
}

interface FamiliesResponse {
  families: Family[];
  summary: { total: number; today: number; week: number; month: number; active_week: number };
}

interface FinanceData {
  total_revenue: number;
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  total_payments: number;
  successful_payments: number;
  methods: Array<{ method: string; count: number; amount: number }>;
  recent_payments: Array<{ id: string; user_id: string | null; amount: number; status: string; method: string | null; created_at: string | null }>;
  by_day: Array<{ date: string; amount: number; count: number }>;
}

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
  valid_until: string | null;
  created_at: string | null;
}

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  sent_count: number;
  created_at: string | null;
  status: string;
}

interface FunnelStep { name: string; count: number }

interface ErrorRow {
  id: string;
  message: string;
  stack: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string | null;
}

interface Ticket {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string | null;
}

interface TopFamily { family_id: string; name: string; score: number }

interface FeatureFlag { key: string; enabled: boolean; description: string | null; updated_at: string | null }

export default function AdminPanel() {
  const { toast } = useToast();
  const [tab, setTab] = useState('families');
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setTab(t);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-3 sm:p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 bg-clip-text text-transparent">
              Панель управления
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Все инструменты администратора</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = '/admin/dashboard')}
          >
            <Icon name="ArrowLeft" size={14} className="mr-1.5" />
            В центр
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full overflow-x-auto flex justify-start h-auto p-1">
            <TabsTrigger value="families" className="text-xs md:text-sm px-2 py-1.5">Семьи</TabsTrigger>
            <TabsTrigger value="finance" className="text-xs md:text-sm px-2 py-1.5">Финансы</TabsTrigger>
            <TabsTrigger value="promo" className="text-xs md:text-sm px-2 py-1.5">Промокоды</TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-xs md:text-sm px-2 py-1.5">Рассылки</TabsTrigger>
            <TabsTrigger value="funnel" className="text-xs md:text-sm px-2 py-1.5">Воронка</TabsTrigger>
            <TabsTrigger value="errors" className="text-xs md:text-sm px-2 py-1.5">Ошибки</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs md:text-sm px-2 py-1.5">Тикеты</TabsTrigger>
            <TabsTrigger value="top" className="text-xs md:text-sm px-2 py-1.5">Топ семей</TabsTrigger>
            <TabsTrigger value="flags" className="text-xs md:text-sm px-2 py-1.5">Фич-флаги</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs md:text-sm px-2 py-1.5">Рейтинги и акции</TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs md:text-sm px-2 py-1.5">Реферальная программа</TabsTrigger>
            <TabsTrigger value="hubs" className="text-xs md:text-sm px-2 py-1.5">Хабы</TabsTrigger>
          </TabsList>

          <TabsContent value="families" className="mt-4">
            <FamiliesTab />
          </TabsContent>
          <TabsContent value="finance" className="mt-4">
            <FinanceTab />
          </TabsContent>
          <TabsContent value="promo" className="mt-4">
            <PromoTab toast={toast} />
          </TabsContent>
          <TabsContent value="broadcasts" className="mt-4">
            <BroadcastsTab toast={toast} />
          </TabsContent>
          <TabsContent value="funnel" className="mt-4">
            <FunnelTab />
          </TabsContent>
          <TabsContent value="errors" className="mt-4">
            <ErrorsTab />
          </TabsContent>
          <TabsContent value="tickets" className="mt-4">
            <TicketsTab />
          </TabsContent>
          <TabsContent value="top" className="mt-4">
            <TopTab />
          </TabsContent>
          <TabsContent value="flags" className="mt-4">
            <FlagsTab toast={toast} />
          </TabsContent>
          <TabsContent value="campaigns" className="mt-4">
            <AdminRatingCampaigns adminToken="admin_authenticated" />
          </TabsContent>
          <TabsContent value="referrals" className="mt-4">
            <AdminReferralProgram adminToken="admin_authenticated" />
          </TabsContent>
          <TabsContent value="hubs" className="mt-4">
            <HubsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FamiliesTab() {
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

function FinanceTab() {
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

function PromoTab({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', discount_value: 10, discount_type: 'percent', max_uses: 100, valid_until: '' });

  const load = async () => {
    setLoading(true);
    const r = await apiGet<{ promo_codes: PromoCode[] }>('promo');
    setCodes(r?.promo_codes || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.code.trim()) {
      toast({ title: 'Укажи код', variant: 'destructive' });
      return;
    }
    const res = await apiPost<{ success?: boolean; error?: string }>('promo', form);
    if (res?.success) {
      toast({ title: 'Промокод создан' });
      setOpen(false);
      setForm({ code: '', discount_value: 10, discount_type: 'percent', max_uses: 100, valid_until: '' });
      load();
    } else {
      toast({ title: 'Ошибка', description: res?.error || 'Не удалось', variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить промокод?')) return;
    const res = await apiDelete<{ success?: boolean }>('promo', { id });
    if (res?.success) {
      toast({ title: 'Удалено' });
      load();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Создавайте скидочные коды для пользователей</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Icon name="Plus" size={14} className="mr-1.5" />
          Новый код
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>
      ) : codes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            <Icon name="Ticket" size={40} className="mx-auto mb-2 opacity-40" />
            <p>Промокодов пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono font-bold text-base">{c.code}</code>
                    <Badge variant={c.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {c.is_active ? 'Активен' : 'Отключён'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Скидка: <strong>{c.discount_value}{c.discount_type === 'percent' ? '%' : '₽'}</strong> ·
                    Использовано: <strong>{c.current_uses}/{c.max_uses}</strong>
                    {c.valid_until && <> · до {new Date(c.valid_until).toLocaleDateString('ru-RU')}</>}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                  <Icon name="Trash2" size={14} className="text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый промокод</DialogTitle>
            <DialogDescription>Заполни параметры и сохрани</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Код (будет приведён к верхнему регистру)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SPRING25" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Скидка</Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: +e.target.value })} />
              </div>
              <div>
                <Label>Тип</Label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-white text-sm"
                >
                  <option value="percent">Процент %</option>
                  <option value="fixed">Сумма ₽</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Максимум использований</Label>
              <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: +e.target.value })} />
            </div>
            <div>
              <Label>Действителен до (необязательно)</Label>
              <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={create}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BroadcastsTab({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
  const [list, setList] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });

  const load = async () => {
    setLoading(true);
    const r = await apiGet<{ broadcasts: Broadcast[] }>('broadcasts');
    setList(r?.broadcasts || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: 'Заполни поля', variant: 'destructive' });
      return;
    }
    const res = await apiPost<{ success?: boolean; sent_to?: number; error?: string }>('broadcasts', form);
    if (res?.success) {
      toast({ title: 'Отправлено', description: `Целевая аудитория: ${res.sent_to} чел.` });
      setOpen(false);
      setForm({ title: '', message: '', target: 'all' });
      load();
    } else {
      toast({ title: 'Ошибка', description: res?.error, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Массовые уведомления пользователям</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Icon name="Send" size={14} className="mr-1.5" />
          Создать
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            <Icon name="Megaphone" size={40} className="mx-auto mb-2 opacity-40" />
            <p>Рассылок ещё не было</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{b.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{b.sent_count} получ.</Badge>
                </div>
                <p className="text-xs text-gray-700 line-clamp-2">{b.message}</p>
                <div className="flex gap-3 text-[10px] text-gray-500 mt-2">
                  {b.created_at && <span>{new Date(b.created_at).toLocaleString('ru-RU')}</span>}
                  <span>Аудитория: {b.target}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая рассылка</DialogTitle>
            <DialogDescription>Сообщение попадёт в журнал рассылок</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Заголовок</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Текст сообщения</Label>
              <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div>
              <Label>Кому</Label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full h-10 px-3 rounded-md border bg-white text-sm"
              >
                <option value="all">Всем пользователям</option>
                <option value="verified">Только подтверждённым</option>
                <option value="today">Зарегистрированным сегодня</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={send}>Отправить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FunnelTab() {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ funnel: FunnelStep[] }>('funnel').then((r) => {
      setSteps(r?.funnel || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;
  const max = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Воронка регистрации за 30 дней</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {steps.map((s, i) => {
          const pct = Math.round((s.count / max) * 100);
          const prev = i > 0 ? steps[i - 1].count : s.count;
          const conv = prev > 0 ? Math.round((s.count / prev) * 100) : 0;
          return (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {i + 1}. {s.name}
                </span>
                <div className="text-sm">
                  <span className="font-bold">{s.count}</span>
                  {i > 0 && <span className="text-gray-500 text-xs ml-2">→ {conv}% от пред.</span>}
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{ width: `${Math.max(pct, 3)}%` }}
                >
                  {pct > 15 && `${pct}%`}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ErrorsTab() {
  const [list, setList] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ errors: ErrorRow[] }>('errors').then((r) => {
      setList(r?.errors || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          <Icon name="CheckCircle" size={40} className="mx-auto mb-2 text-green-500" />
          <p>Ошибок не зафиксировано</p>
          <p className="text-xs mt-1">Сбор начнётся после первого инцидента</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((e) => (
        <Card key={e.id} className="border-red-100">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900 break-words">{e.message}</p>
                {e.path && <p className="text-xs text-gray-600 mt-0.5">Путь: {e.path}</p>}
                {e.created_at && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(e.created_at).toLocaleString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TicketsTab() {
  const [list, setList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ tickets: Ticket[] }>('tickets').then((r) => {
      setList(r?.tickets || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          <Icon name="Inbox" size={40} className="mx-auto mb-2 opacity-40" />
          <p>Обращений пока нет</p>
        </CardContent>
      </Card>
    );
  }

  const typeColor = (t: string) =>
    t === 'support' ? 'bg-red-100 text-red-800'
      : t === 'review' ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';

  return (
    <div className="space-y-2">
      {list.map((t) => (
        <Card key={t.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge className={`text-[10px] ${typeColor(t.type)}`}>{t.type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                </div>
                <h4 className="font-medium text-sm">{t.title}</h4>
                <p className="text-xs text-gray-700 mt-1 line-clamp-3">{t.description}</p>
                {t.created_at && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(t.created_at).toLocaleString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TopTab() {
  const [top, setTop] = useState<TopFamily[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ top: TopFamily[] }>('top').then((r) => {
      setTop(r?.top || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;

  if (top.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          <Icon name="Trophy" size={40} className="mx-auto mb-2 opacity-40" />
          <p>Данных активности пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Топ-20 активных семей</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {top.map((f, i) => (
          <div key={f.family_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {i + 1}
            </div>
            <span className="flex-1 text-sm font-medium truncate">{f.name}</span>
            <Badge variant="outline" className="text-xs">{f.score} баллов</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FlagsTab({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await apiGet<{ flags: FeatureFlag[] }>('flags');
    setFlags(r?.flags || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (flag: FeatureFlag) => {
    const res = await apiPost<{ success?: boolean }>('flags', {
      key: flag.key,
      enabled: !flag.enabled,
      description: flag.description,
    });
    if (res?.success) {
      toast({ title: `${flag.key}: ${!flag.enabled ? 'включено' : 'выключено'}` });
      load();
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin" size={30} /></div>;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Тумблеры функций</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {flags.map((f) => (
          <div key={f.key} className="flex items-center justify-between p-3 bg-gray-50 rounded gap-3">
            <div className="flex-1 min-w-0">
              <code className="text-xs font-mono font-bold">{f.key}</code>
              {f.description && <p className="text-xs text-gray-600 mt-0.5">{f.description}</p>}
            </div>
            <Switch checked={f.enabled} onCheckedChange={() => toggle(f)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const ANALYTICS_URL = (func2url as Record<string, string>)['analytics'];

interface HubStat {
  hub: string;
  label: string;
  views: number;
  unique_families: number;
  unique_sessions: number;
}

interface HubStatsData {
  hubs: HubStat[];
  total_views: number;
  total_families: number;
  avg_depth: number;
  days: number;
  daily: { day: string; views: number }[];
}

function HubsTab() {
  const [data, setData] = useState<HubStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${ANALYTICS_URL}?action=hub_stats&days=${d}`);
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const maxViews = data?.hubs?.[0]?.views || 1;

  return (
    <div className="space-y-4">
      {/* Переключатель периода */}
      <div className="flex gap-2">
        {[7, 30, 90].map(d => (
          <Button
            key={d}
            size="sm"
            variant={days === d ? 'default' : 'outline'}
            onClick={() => setDays(d)}
          >
            {d} дней
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" className="animate-spin" size={30} />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Сводка */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <MiniStat label="Просмотров хабов" value={data.total_views} color="blue" />
            <MiniStat label="Уникальных семей" value={data.total_families} color="green" />
            <MiniStat label="Глубина (хабов/семью)" value={data.avg_depth} color="purple" />
          </div>

          {/* Топ хабов */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">Топ разделов за {days} дней</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {data.hubs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Данных пока нет — они появятся по мере использования приложения</p>
              )}
              {data.hubs.map((h, i) => (
                <div key={h.hub} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                      <span className="font-medium">{h.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{h.unique_families} семей</span>
                      <span className="font-bold text-gray-800">{h.views} просм.</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden ml-7">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((h.views / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* График по дням */}
          {data.daily.length > 0 && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base">Динамика просмотров</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-end gap-1 h-24">
                  {(() => {
                    const maxDay = Math.max(...data.daily.map(d => d.views), 1);
                    return data.daily.map(d => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full bg-violet-400 rounded-t hover:bg-violet-500 transition-colors cursor-default"
                          style={{ height: `${Math.round((d.views / maxDay) * 80)}px` }}
                          title={`${d.day}: ${d.views}`}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{data.daily[0]?.day?.slice(5)}</span>
                  <span>{data.daily[data.daily.length - 1]?.day?.slice(5)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    slate: 'from-slate-50 to-slate-100 text-slate-900',
    green: 'from-green-50 to-emerald-100 text-green-900',
    blue: 'from-blue-50 to-indigo-100 text-blue-900',
    purple: 'from-purple-50 to-pink-100 text-purple-900',
    orange: 'from-orange-50 to-amber-100 text-orange-900',
  };
  return (
    <div className={`p-3 bg-gradient-to-br rounded-lg ${colors[color] || colors.slate}`}>
      <p className="text-[10px] md:text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg md:text-xl font-bold mt-1 truncate">{value}</p>
    </div>
  );
}