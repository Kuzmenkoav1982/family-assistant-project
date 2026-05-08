import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  PLAN_TEMPLATES,
  ageToBand,
  AGE_BAND_LABELS,
  type AgeBand,
  type PlanTemplate,
} from '@/data/portfolioPlanTemplates';
import { SPHERE_ORDER, type SphereKey } from '@/types/portfolio.types';
import { portfolioApi } from '@/services/portfolioApi';
import { track } from '@/lib/analytics';

interface PlanTemplatesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  memberId: string;
  age: number | null;
  sphereLabels: Record<SphereKey, string>;
  sphereIcons: Record<SphereKey, string>;
  onCreated: () => void;
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function PlanTemplatesDialog({
  open,
  onOpenChange,
  memberId,
  age,
  sphereLabels,
  sphereIcons,
  onCreated,
}: PlanTemplatesDialogProps) {
  const detectedBand = ageToBand(age);
  const [activeBand, setActiveBand] = useState<AgeBand | 'all'>(detectedBand || 'all');
  const [activeSphere, setActiveSphere] = useState<SphereKey | 'all'>('all');
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PLAN_TEMPLATES.filter((t) => {
      const matchBand = activeBand === 'all' || t.age_bands.includes(activeBand);
      const matchSphere = activeSphere === 'all' || t.sphere === activeSphere;
      return matchBand && matchSphere;
    });
  }, [activeBand, activeSphere]);

  const usedSpheres = useMemo(() => {
    const set = new Set<SphereKey>();
    PLAN_TEMPLATES.forEach((t) => {
      if (activeBand === 'all' || t.age_bands.includes(activeBand)) {
        set.add(t.sphere);
      }
    });
    return set;
  }, [activeBand]);

  const handleTake = async (tpl: PlanTemplate) => {
    setCreatingId(tpl.id);
    setError(null);
    try {
      await portfolioApi.planCreate(memberId, {
        sphere_key: tpl.sphere,
        title: tpl.title,
        description: tpl.description,
        milestone: tpl.milestone,
        next_step: tpl.next_step,
        target_date: addDaysIso(tpl.duration_days),
        progress: 0,
      });
      track('portfolio_template_apply', {
        member_id: memberId,
        props: {
          sphere: tpl.sphere,
          template_id: tpl.id,
          age_band: tpl.age_bands[0],
          source: 'plan_templates_dialog',
        },
      });
      onCreated();
      onOpenChange(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setCreatingId(null);
    }
  };

  const allBands: (AgeBand | 'all')[] = ['all', '0-3', '4-6', '7-10', '11-14', '15-17', '18+'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Library" size={18} className="text-primary" />
            Готовые планы развития
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Выбери шаблон под возраст ребёнка — план создастся в один клик с готовой целью, вехой
            и сроком. Потом всё можно отредактировать.
          </p>
        </DialogHeader>

        <div className="space-y-3 pb-3 border-b">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Возраст</p>
            <div className="flex flex-wrap gap-1.5">
              {allBands.map((b) => {
                const label = b === 'all' ? 'Все' : AGE_BAND_LABELS[b];
                const isActive = activeBand === b;
                const isDetected = detectedBand === b;
                return (
                  <Button
                    key={b}
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => setActiveBand(b)}
                    className="h-7 text-xs"
                  >
                    {label}
                    {isDetected && b !== 'all' && (
                      <span className="ml-1 text-[10px] opacity-80">★</span>
                    )}
                  </Button>
                );
              })}
            </div>
            {detectedBand && (
              <p className="text-[10px] text-muted-foreground mt-1">
                ★ — рекомендовано для возраста ребёнка
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Сфера</p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={activeSphere === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveSphere('all')}
                className="h-7 text-xs"
              >
                Все сферы
              </Button>
              {SPHERE_ORDER.filter((s) => usedSpheres.has(s)).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={activeSphere === s ? 'default' : 'outline'}
                  onClick={() => setActiveSphere(s)}
                  className="h-7 text-xs gap-1"
                >
                  <Icon name={sphereIcons[s] || 'Circle'} size={12} />
                  {sphereLabels[s]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600">
              {error}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Под выбранные фильтры шаблонов нет</p>
              <p className="text-xs">Попробуйте сбросить фильтры или создать свою цель</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              {filtered.map((tpl) => {
                const isCreating = creatingId === tpl.id;
                const sphereLabel = sphereLabels[tpl.sphere] || tpl.sphere;
                const sphereIcon = sphereIcons[tpl.sphere] || 'Circle';
                return (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl border bg-gradient-to-br from-background to-muted/20 hover:shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl flex-shrink-0">{tpl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[10px] py-0 h-4 gap-1">
                            <Icon name={sphereIcon} size={10} />
                            {sphereLabel}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] py-0 h-4">
                            {tpl.age_bands.map((b) => AGE_BAND_LABELS[b]).join(', ')}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm leading-tight">{tpl.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {tpl.description}
                    </p>

                    <div className="space-y-1 mb-3 text-xs">
                      <div className="flex items-start gap-1.5">
                        <Icon
                          name="Flag"
                          size={11}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <span className="text-foreground/80">
                          <span className="font-medium">Веха:</span> {tpl.milestone}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Icon
                          name="ArrowRight"
                          size={11}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <span className="text-foreground/80">
                          <span className="font-medium">Шаг 1:</span> {tpl.next_step}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon name="Calendar" size={11} />
                        <span>Срок: ~{tpl.duration_days} дней</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleTake(tpl)}
                      disabled={isCreating || !!creatingId}
                      className="w-full h-8 text-xs"
                    >
                      <Icon
                        name={isCreating ? 'Loader' : 'Plus'}
                        size={12}
                        className={`mr-1 ${isCreating ? 'animate-spin' : ''}`}
                      />
                      {isCreating ? 'Создаю…' : 'Взять в план'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}