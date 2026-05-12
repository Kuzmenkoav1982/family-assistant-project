import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

const HEALTH_API = (func2url as Record<string, string>)['portfolio-health'];

interface HealthData {
  range_hours: number;
  totals: {
    portfolios: number;
    snapshot_overdue: number;
    low_completeness: number;
  };
  recent: {
    aggregates: number;
    snapshots: number;
    ai_insights: number;
    new_badges: number;
  };
  completeness_buckets: Record<string, number>;
  empty_spheres: Array<{ sphere: string; empty_count: number }>;
  plans: { active: number; completed: number };
  top_events: Array<{ event_name: string; n: number }>;
}

const SPHERE_LABEL: Record<string, string> = {
  intellect: 'Интеллект',
  emotions: 'Эмоции',
  body: 'Тело',
  creativity: 'Творчество',
  social: 'Социум',
  finance: 'Финансы',
  values: 'Ценности',
  life_skills: 'Самостоятельность',
};

export default function AdminPortfolioHealth() {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'24h' | '7d'>('24h');

  useEffect(() => {
    const token = localStorage.getItem('authToken') || '';
    const isAdmin = localStorage.getItem('adminToken') === 'admin_authenticated';
    if (!token && !isAdmin) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (token) headers['X-Auth-Token'] = token;
    if (isAdmin) headers['X-Admin-Bypass'] = '1';
    fetch(`${HEALTH_API}?range=${range}`, { headers })
      .then(async (res) => {
        if (res.status === 403) {
          setForbidden(true);
          return null;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((d: HealthData | null) => {
        if (d) setData(d);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Загружаем метрики…</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <Icon name="ShieldAlert" size={32} className="mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Доступ запрещён</h2>
            <p className="text-sm text-muted-foreground">
              Эта страница доступна только внутренней команде проекта.
            </p>
            <Button onClick={() => navigate('/')}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-destructive mb-3">{error || 'Не удалось загрузить'}</p>
            <Button onClick={() => navigate('/')}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completenessTotal = Object.values(data.completeness_buckets).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead title="Health · Портфолио" description="Внутренний дашборд состояния модуля" />
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Icon name="Activity" size={22} className="text-primary" />
              Портфолио · Health
            </h1>
            <p className="text-xs text-muted-foreground">
              Операционный дашборд (только для внутренней команды)
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={range === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRange('24h')}
            >
              За 24 часа
            </Button>
            <Button
              variant={range === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRange('7d')}
            >
              За 7 дней
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-5">
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Всего портфолио</p>
              <p className="text-2xl font-bold">{data.totals.portfolios}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Aggregate за период</p>
              <p className="text-2xl font-bold text-primary">{data.recent.aggregates}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Snapshots за период</p>
              <p className="text-2xl font-bold">{data.recent.snapshots}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Новые бейджи</p>
              <p className="text-2xl font-bold text-amber-600">{data.recent.new_badges}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Завершённость портфолио</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(data.completeness_buckets).map(([bucket, count]) => {
                const pct = Math.round((count / completenessTotal) * 100);
                return (
                  <div key={bucket} className="flex items-center gap-2">
                    <span className="text-xs w-14 text-muted-foreground">{bucket}%</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs w-12 text-right tabular-nums">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Алерты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-xs">Snapshot &gt; 25 дней</span>
                <Badge variant="outline" className="bg-white">{data.totals.snapshot_overdue}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xs">Completeness &lt; 40%</span>
                <Badge variant="outline" className="bg-white">{data.totals.low_completeness}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs">AI-инсайты за период</span>
                <Badge variant="outline" className="bg-white">{data.recent.ai_insights}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Топ пустых сфер по системе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data.empty_spheres.map((s) => (
                <div key={s.sphere} className="flex items-center justify-between text-xs">
                  <span>{SPHERE_LABEL[s.sphere] || s.sphere}</span>
                  <span className="font-mono text-muted-foreground">{s.empty_count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Топ событий за период</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data.top_events.length === 0 ? (
                <p className="text-xs text-muted-foreground">Событий пока нет</p>
              ) : (
                data.top_events.map((e) => (
                  <div key={e.event_name} className="flex items-center justify-between text-xs">
                    <span className="truncate">{e.event_name}</span>
                    <span className="font-mono text-muted-foreground">{e.n}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Активные планы: {data.plans.active}</span>
              <span>Завершённые планы: {data.plans.completed}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}