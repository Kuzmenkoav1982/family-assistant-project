import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { OVERLAP_CASES, SECTIONS } from '@/data/atlas';
import type { OverlapCase } from '@/data/atlas';

const RISK_COLOR: Record<OverlapCase['riskLevel'], string> = {
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_COLOR: Record<OverlapCase['status'], string> = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  decided: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  deferred: 'bg-gray-100 text-gray-600 border-gray-200',
};

const DECISION_LABEL: Record<NonNullable<OverlapCase['decision']>, string> = {
  keep: 'Оставить как есть',
  merge: 'Слить',
  split: 'Развести',
  rename: 'Переименовать',
  move: 'Перенести',
  deprecate: 'Удалить',
  'needs-review': 'Требует решения',
};

export default function AtlasDecisionsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const filtered = OVERLAP_CASES.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (riskFilter !== 'all' && c.riskLevel !== riskFilter) return false;
    return true;
  });

  const getLabel = (id: string) => SECTIONS.find((s) => s.id === id)?.label ?? id;

  const stats = {
    total: OVERLAP_CASES.length,
    open: OVERLAP_CASES.filter((c) => c.status === 'open').length,
    decided: OVERLAP_CASES.filter((c) => c.status === 'decided').length,
    high: OVERLAP_CASES.filter((c) => c.riskLevel === 'high').length,
  };

  return (
    <div className="space-y-4">
      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Всего кейсов</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Открыто</div>
            <div className="text-3xl font-bold text-amber-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Решено</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.decided}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Высокий риск</div>
            <div className="text-3xl font-bold text-red-600">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="decided">Решённые</SelectItem>
            <SelectItem value="deferred">Отложенные</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Риск" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой риск</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список кейсов */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="GitMerge" size={16} className="text-violet-600" />
                  {getLabel(c.sectionA)} ↔ {getLabel(c.sectionB)}
                </CardTitle>
                <div className="flex gap-1.5">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${RISK_COLOR[c.riskLevel]}`}
                  >
                    {c.riskLevel}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLOR[c.status]}`}
                  >
                    {c.status}
                  </span>
                  {c.decision && (
                    <Badge variant="outline" className="text-[10px]">
                      {DECISION_LABEL[c.decision]}
                    </Badge>
                  )}
                </div>
              </div>
              {(c.sharedEntity || c.sharedFunction) && (
                <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                  {c.sharedEntity && (
                    <span>
                      <span className="font-semibold">Сущность:</span> {c.sharedEntity}
                    </span>
                  )}
                  {c.sharedFunction && (
                    <span>
                      <span className="font-semibold">Функция:</span> {c.sharedFunction}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-0.5">
                  Проблема
                </div>
                <p className="text-foreground/80 leading-relaxed">{c.problem}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-0.5">
                  Рекомендация
                </div>
                <p className="text-foreground/80 leading-relaxed">{c.recommendation}</p>
              </div>
              {c.notes && (
                <div className="text-[11px] text-muted-foreground italic border-l-2 border-violet-300 pl-2">
                  {c.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              По текущим фильтрам ничего нет.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
