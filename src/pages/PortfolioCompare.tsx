import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { portfolioApi, type CompareMember } from '@/services/portfolioApi';
import { SPHERE_ORDER } from '@/types/portfolio.types';

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function PortfolioCompare() {
  const navigate = useNavigate();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<CompareMember[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [icons, setIcons] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('familyId') || localStorage.getItem('family_id');
    setFamilyId(stored);
  }, []);

  useEffect(() => {
    if (!familyId) return;
    setLoading(true);
    portfolioApi
      .compare(familyId)
      .then((r) => {
        const withPortfolio = (r.members || []).filter((m) => m.has_portfolio);
        setMembers(withPortfolio);
        setLabels(r.sphere_labels_child || {});
        setIcons(r.sphere_icons || {});
        setSelected(new Set(withPortfolio.slice(0, 3).map((m) => m.id)));
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [familyId]);

  const chartData = useMemo(() => {
    return SPHERE_ORDER.map((sphere) => {
      const point: Record<string, number | string> = {
        sphere,
        label: labels[sphere] || sphere,
      };
      members.forEach((m) => {
        if (selected.has(m.id)) {
          point[m.name] = Math.round(m.scores[sphere] || 0);
        }
      });
      return point;
    });
  }, [members, selected, labels]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!familyId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Семья не выбрана</p>
            <Button onClick={() => navigate('/')}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Собираем сравнение…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Назад</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead title="Сравнение портфолио семьи" description="Сравнение развития членов семьи" />
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')}>
            <Icon name="ArrowLeft" size={18} className="mr-1" />
            К списку
          </Button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Icon name="GitCompare" size={22} className="text-primary" />
            Сравнение портфолио
          </h1>
          <div className="w-[80px]" />
        </div>

        {members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Icon name="Users" size={32} className="mx-auto mb-2 opacity-50" />
              <p>Нет участников с заполненным портфолио</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Кого сравниваем</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {members.map((m, i) => {
                    const isOn = selected.has(m.id);
                    const color = PALETTE[i % PALETTE.length];
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggle(m.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                          isOn
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-muted/30 border-border opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: color }}
                        />
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                          <AvatarFallback className="text-[10px]">
                            {m.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{m.name}</span>
                        {m.age !== null && (
                          <span className="text-xs text-muted-foreground">{m.age}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Radar" size={18} className="text-primary" />
                  Радар
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[420px] md:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData} margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {members
                        .filter((m) => selected.has(m.id))
                        .map((m, i) => (
                          <Radar
                            key={m.id}
                            name={m.name}
                            dataKey={m.name}
                            stroke={PALETTE[members.findIndex((x) => x.id === m.id) % PALETTE.length]}
                            fill={PALETTE[members.findIndex((x) => x.id === m.id) % PALETTE.length]}
                            fillOpacity={0.18}
                          />
                        ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Таблица по сферам</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Сфера</th>
                      {members
                        .filter((m) => selected.has(m.id))
                        .map((m) => (
                          <th key={m.id} className="text-center p-3 font-medium">
                            {m.name}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SPHERE_ORDER.map((sphere) => {
                      const sel = members.filter((m) => selected.has(m.id));
                      const vals = sel.map((m) => Math.round(m.scores[sphere] || 0));
                      const maxVal = Math.max(...vals, 0);
                      return (
                        <tr key={sphere} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon name={icons[sphere] || 'Circle'} size={14} className="text-primary" />
                              <span className="font-medium">{labels[sphere] || sphere}</span>
                            </div>
                          </td>
                          {sel.map((m) => {
                            const v = Math.round(m.scores[sphere] || 0);
                            const isLeader = v === maxVal && v > 0 && sel.length > 1;
                            return (
                              <td key={m.id} className="p-3 text-center">
                                <span className={`font-bold ${isLeader ? 'text-primary' : ''}`}>
                                  {v}
                                </span>
                                {isLeader && sel.length > 1 && (
                                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                                    лидер
                                  </Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {members
                .filter((m) => selected.has(m.id))
                .map((m) => (
                  <Link key={m.id} to={`/portfolio/${m.id}`}>
                    <Button variant="outline" size="sm">
                      <Icon name="ExternalLink" size={12} className="mr-1" />
                      Портфолио {m.name}
                    </Button>
                  </Link>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
