import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import type { NextAction, SphereKey } from '@/types/portfolio.types';
import { track, bucketConfidence } from '@/lib/analytics';

interface WhySuggestedPopoverProps {
  action: NextAction;
  /** Текущий балл по сфере */
  score: number;
  /** Полнота картины по сфере (0–100) */
  confidence: number;
  /** Динамика по сфере за период */
  delta: number;
  /** Возраст ребёнка */
  age: number | null;
  /** Дата последнего измерения по сфере */
  lastMeasuredAt: string | null;
  /** Количество источников по сфере */
  sourcesCount: number;
  sphereLabel: string;
}

function buildReasons(args: {
  source: NextAction['source'];
  score: number;
  confidence: number;
  delta: number;
  lastMeasuredAt: string | null;
  sourcesCount: number;
}): string[] {
  const reasons: string[] = [];
  const { source, score, confidence, delta, lastMeasuredAt, sourcesCount } = args;

  if (source === 'plan') {
    reasons.push('у вас есть активный план развития по этой сфере');
  }
  if (source === 'rule_low_data' || confidence < 40) {
    reasons.push('по этой сфере пока мало данных');
  }
  if (source === 'rule_low_score' || (score < 40 && confidence >= 40)) {
    reasons.push('текущая картина по сфере просит внимания');
  }
  if (sourcesCount > 0 && sourcesCount < 2 && confidence < 70) {
    reasons.push('пока используется мало разных источников');
  }
  if (lastMeasuredAt) {
    const days = Math.floor(
      (Date.now() - new Date(lastMeasuredAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days > 60) {
      reasons.push(`по этой сфере давно не было новых данных (${days} дн.)`);
    }
  }
  if (delta < -3) {
    reasons.push('за последний период картина немного просела');
  } else if (delta > 5) {
    reasons.push('по этой сфере есть положительная динамика');
  }
  if (reasons.length === 0) {
    reasons.push('советы подобраны по текущей картине, возрасту и активным планам');
  }
  return reasons.slice(0, 3);
}

export default function WhySuggestedPopover({
  action,
  score,
  confidence,
  delta,
  lastMeasuredAt,
  sourcesCount,
  sphereLabel,
}: WhySuggestedPopoverProps) {
  const reasons = buildReasons({
    source: action.source,
    score,
    confidence,
    delta,
    lastMeasuredAt,
    sourcesCount,
  });
  const isLowData = confidence < 40;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          track('portfolio_why_suggested_open', {
            props: {
              sphere: action.sphere,
              source: action.source,
              confidence_bucket: bucketConfidence(confidence),
            },
          });
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
          aria-label="Почему мы это советуем?"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon name="HelpCircle" size={11} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 text-xs p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon name="Lightbulb" size={12} className="text-primary" />
          <p className="font-semibold text-sm">Почему мы это советуем?</p>
        </div>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Совет по сфере <span className="font-medium text-foreground">{sphereLabel}</span> опирается на:
        </p>
        <ul className="space-y-1 mb-3">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-foreground/80">
              <Icon name="Dot" size={12} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="leading-snug">{r}</span>
            </li>
          ))}
        </ul>
        {isLowData ? (
          <p className="text-[10px] text-muted-foreground border-t pt-2 leading-snug">
            Если данных пока мало, советы будут более общими. Добавьте несколько свежих записей —
            и они станут точнее.
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground border-t pt-2 leading-snug">
            Подсказки строятся по текущей картине, возрасту ребёнка и активным планам развития.
          </p>
        )}
        <Link
          to="/portfolio/about"
          onClick={() =>
            track('portfolio_about_open', {
              props: { source: 'why_suggested_popover' },
            })
          }
          className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-primary hover:underline"
        >
          Как работает Портфолио
          <Icon name="ArrowRight" size={10} />
        </Link>
      </PopoverContent>
    </Popover>
  );
}

/** Утилита: посчитать вспомогательные параметры для popover из data + sphere */
export function buildPopoverContext(
  data: {
    scores: Record<SphereKey, number>;
    confidence: Record<SphereKey, number>;
    deltas: Record<SphereKey, number>;
    recent_metrics: Array<{ sphere_key: SphereKey; measured_at: string }>;
    member: { age: number | null };
  },
  sphere: SphereKey,
) {
  const sphereMetrics = data.recent_metrics.filter((m) => m.sphere_key === sphere);
  const lastMeasuredAt =
    sphereMetrics.length > 0
      ? sphereMetrics
          .map((m) => m.measured_at)
          .sort((a, b) => (a < b ? 1 : -1))[0]
      : null;
  return {
    score: data.scores[sphere] ?? 0,
    confidence: data.confidence[sphere] ?? 0,
    delta: data.deltas[sphere] ?? 0,
    age: data.member.age,
    lastMeasuredAt,
    sourcesCount: sphereMetrics.length,
  };
}