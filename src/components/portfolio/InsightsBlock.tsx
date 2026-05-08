import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { portfolioApi } from '@/services/portfolioApi';
import type { Insight } from '@/types/portfolio.types';

interface InsightsBlockProps {
  memberId: string;
}

interface SeverityMeta {
  icon: string;
  iconColor: string;
  bg: string;
  border: string;
  label: string;
}

const SEVERITY_META: Record<Insight['severity'], SeverityMeta> = {
  success: {
    icon: 'CheckCircle2',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    label: 'Успех',
  },
  info: {
    icon: 'Lightbulb',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    label: 'Подсказка',
  },
  warning: {
    icon: 'AlertCircle',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    label: 'Внимание',
  },
};

function pluralInsights(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'наблюдение';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'наблюдения';
  return 'наблюдений';
}

export default function InsightsBlock({ memberId }: InsightsBlockProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAiInsights([]);
    setAiError(null);
    portfolioApi
      .insights(memberId)
      .then((res) => {
        if (!cancelled) setInsights(res.insights || []);
      })
      .catch(() => {
        if (!cancelled) setInsights([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const handleAskAi = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const r = await portfolioApi.aiInsights(memberId);
      if (r.error) setAiError(r.error);
      setAiInsights(r.insights || []);
    } catch (e) {
      setAiError(String(e));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Lightbulb" size={20} className="text-primary" />
            Наблюдения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-muted/40 animate-pulse" />
            <div className="h-16 rounded-lg bg-muted/40 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0 && aiInsights.length === 0 && !aiError) return null;

  const sorted = [...insights].sort((a, b) => {
    const order: Record<Insight['severity'], number> = { warning: 0, info: 1, success: 2 };
    return order[a.severity] - order[b.severity];
  });

  const renderInsight = (ins: Insight, i: number, isAi = false) => {
    const meta = SEVERITY_META[ins.severity];
    return (
      <div
        key={`${ins.rule_key}-${i}-${isAi}`}
        className={`p-3 rounded-lg border ${meta.bg} ${meta.border}`}
      >
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 flex-shrink-0 ${meta.iconColor}`}>
            <Icon name={isAi ? 'Sparkles' : meta.icon} size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-sm font-semibold leading-tight">{ins.title}</span>
              {isAi && (
                <Badge variant="outline" className="text-[10px] py-0 border-purple-400 text-purple-600">
                  ИИ
                </Badge>
              )}
              {!isAi && ins.sphere_label && (
                <Badge variant="outline" className="text-[10px] py-0">
                  {ins.sphere_label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground/80 leading-snug">{ins.text}</p>
            {ins.suggestion && (
              <div className="mt-1.5 flex items-start gap-1 text-xs text-muted-foreground">
                <Icon name="ArrowRight" size={11} className="mt-0.5 flex-shrink-0" />
                <span>{ins.suggestion}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
          <Icon name="Lightbulb" size={20} className="text-primary" />
          Наблюдения
          <Badge variant="secondary" className="text-xs">
            {insights.length + aiInsights.length} {pluralInsights(insights.length + aiInsights.length)}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAskAi}
            disabled={aiLoading}
            className="ml-auto h-7 text-xs"
          >
            <Icon name={aiLoading ? 'Loader' : 'Sparkles'} size={14} className={`mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? 'Думаю…' : aiInsights.length ? 'Обновить ИИ' : 'Спросить ИИ'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aiError && (
          <p className="text-xs text-amber-600 mb-3">ИИ временно недоступен: {aiError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((ins, i) => renderInsight(ins, i, true))}
          {sorted.map((ins, i) => renderInsight(ins, i, false))}
        </div>
      </CardContent>
    </Card>
  );
}