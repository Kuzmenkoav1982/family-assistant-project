import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { SPHERE_ORDER, type PortfolioData, type SphereKey } from '@/types/portfolio.types';
import { getConfidenceMeta } from '@/utils/portfolioConfidence';
import {
  getActionableSourcesForSphere,
  type SourceRegistryEntry,
} from '@/data/portfolioSourcesRegistry';
import { isAdultMember } from '@/utils/familyRole';
import { track } from '@/lib/analytics';

interface ImproveAccuracyBlockProps {
  data: PortfolioData;
}

interface SphereSuggestion {
  sphere: SphereKey;
  label: string;
  icon: string;
  confidence: number;
  level: 'low' | 'medium';
  sources: SourceRegistryEntry[];
}

function buildSuggestions(data: PortfolioData, audience: 'child' | 'adult'): SphereSuggestion[] {
  const items: SphereSuggestion[] = [];
  const labels = audience === 'adult' ? data.sphere_labels_adult : data.sphere_labels_child;
  for (const sphere of SPHERE_ORDER) {
    const conf = data.confidence[sphere] ?? 0;
    if (conf >= 70) continue;
    const sources = getActionableSourcesForSphere(sphere, 3, audience);
    if (sources.length === 0) continue;
    items.push({
      sphere,
      label: labels?.[sphere] ?? data.sphere_labels_child[sphere],
      icon: data.sphere_icons[sphere],
      confidence: conf,
      level: conf < 40 ? 'low' : 'medium',
      sources,
    });
  }
  // Сначала сферы с минимальной полнотой, потом по убыванию confidence
  items.sort((a, b) => a.confidence - b.confidence);
  return items.slice(0, 3);
}

export default function ImproveAccuracyBlock({ data }: ImproveAccuracyBlockProps) {
  const audience: 'child' | 'adult' = isAdultMember(data.member) ? 'adult' : 'child';
  const suggestions = buildSuggestions(data, audience);
  const [expandedSphere, setExpandedSphere] = useState<SphereKey | null>(
    suggestions[0]?.sphere ?? null,
  );

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/5 via-background to-background">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Sparkles" size={20} className="text-amber-600 dark:text-amber-400" />
              Что добавить, чтобы картина стала точнее
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Несколько свежих записей в этих разделах — и подсказки по сферам станут предметнее.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] flex-shrink-0">
            {suggestions.length} {suggestions.length === 1 ? 'сфера' : 'сферы'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((s) => {
          const meta = getConfidenceMeta(s.confidence);
          const isExpanded = expandedSphere === s.sphere;
          return (
            <div
              key={s.sphere}
              className={`rounded-lg border transition-colors ${
                isExpanded ? 'bg-card' : 'bg-muted/20 hover:bg-muted/30'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedSphere(isExpanded ? null : s.sphere)}
                className="w-full flex items-center gap-2.5 p-3 text-left"
                aria-expanded={isExpanded}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    s.level === 'low' ? 'bg-muted' : 'bg-amber-500/15'
                  }`}
                >
                  <Icon
                    name={s.icon}
                    size={16}
                    className={s.level === 'low' ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                    <span className={`text-[10px] flex items-center gap-1 ${meta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.short}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Что добавить:{' '}
                    {s.sources.map((src, i) => (
                      <span key={src.source_type}>
                        {i > 0 && ', '}
                        <span className="text-foreground/70">{src.label.toLowerCase()}</span>
                      </span>
                    ))}
                  </p>
                </div>
                <Icon
                  name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                  size={16}
                  className="text-muted-foreground flex-shrink-0"
                />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t bg-muted/10">
                  <p className="text-[11px] text-muted-foreground pt-2">
                    Откройте раздел и добавьте 2–3 свежие записи:
                  </p>
                  {s.sources.map((src) => (
                    <Link
                      key={src.source_type}
                      to={src.route as string}
                      onClick={() =>
                        track('portfolio_improve_cta_click', {
                          props: {
                            sphere: s.sphere,
                            source_type: src.source_type,
                            route: src.route as string,
                            level: s.level,
                          },
                        })
                      }
                      className="flex items-center gap-2 p-2 rounded-md border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15">
                        <Icon name="Plus" size={13} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{src.label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {src.hint}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 whitespace-nowrap">
                        {src.cta_text}
                        <Icon
                          name="ArrowRight"
                          size={11}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/portfolio/about"
                    onClick={() =>
                      track('portfolio_about_open', {
                        props: { source: 'improve_block' },
                      })
                    }
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="HelpCircle" size={11} />
                    Почему мы это предлагаем?
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}