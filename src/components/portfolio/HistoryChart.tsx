import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { portfolioApi, type PortfolioHistoryPoint } from '@/services/portfolioApi';
import { SPHERE_ORDER, type SphereKey } from '@/types/portfolio.types';

interface HistoryChartProps {
  memberId: string;
}

interface ChartPoint {
  date: string;
  label: string;
  Средний: number;
  count: number;
}

function formatMonth(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function pluralPoints(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'точка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'точки';
  return 'точек';
}

export default function HistoryChart({ memberId }: HistoryChartProps) {
  const [points, setPoints] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    portfolioApi
      .history(memberId, 12)
      .then((r) => {
        if (!cancelled) setPoints(r.history || []);
      })
      .catch(() => {
        if (!cancelled) setPoints([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="LineChart" size={20} className="text-primary" />
            Динамика по месяцам
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Sprint B.2: единый стиль skeleton в языке Hub+Hero. */}
          <div className="h-[200px] rounded-2xl bg-white/60 border border-white/60 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (points.length < 2) {
    return null;
  }

  const data: ChartPoint[] = points.map((p) => {
    const vals = SPHERE_ORDER.map((s) => Number(p.scores[s as SphereKey] ?? 0));
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return {
      date: p.date,
      label: formatMonth(p.date),
      Средний: Math.round(avg),
      count: p.source_count ?? 0,
    };
  });

  const first = data[0].Средний;
  const last = data[data.length - 1].Средний;
  const totalDelta = last - first;
  const trend =
    totalDelta > 0 ? { tone: 'text-green-600', sign: '↗ +' } :
    totalDelta < 0 ? { tone: 'text-orange-600', sign: '↘ ' } :
    { tone: 'text-muted-foreground', sign: '→ ' };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="LineChart" size={20} className="text-primary" />
          Динамика по месяцам
          <Badge variant="secondary" className="ml-auto text-xs">
            {points.length} {pluralPoints(points.length)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Сейчас
            </p>
            <p className="text-2xl font-bold text-primary">{last}</p>
          </div>
          <div className={`text-sm font-semibold ${trend.tone}`}>
            {trend.sign}
            {Math.abs(totalDelta)} за период
          </div>
        </div>

        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="Средний"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}