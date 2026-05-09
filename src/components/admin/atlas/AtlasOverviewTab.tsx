import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  HUBS,
  SECTIONS,
  countSectionsByHub,
  getHypotheses,
  getAcceptedPrinciples,
  OVERLAP_CASES,
  ENTITIES,
  SEMANTICS,
} from '@/data/atlas';

export default function AtlasOverviewTab() {
  const counts = countSectionsByHub();
  const hypotheses = getHypotheses();
  const accepted = getAcceptedPrinciples();
  const semanticsCount = Object.keys(SEMANTICS).length;
  const openCases = OVERLAP_CASES.filter((c) => c.status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Сводка цифрами */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon="LayoutGrid" label="Хабов" value={String(HUBS.length)} color="blue" />
        <SummaryCard icon="Layers" label="Разделов" value={String(SECTIONS.length)} color="emerald" />
        <SummaryCard
          icon="Sparkles"
          label="Сущностей"
          value={String(ENTITIES.length)}
          color="violet"
          hint={ENTITIES.length === 0 ? 'Шаг 5' : undefined}
        />
        <SummaryCard
          icon="AlertTriangle"
          label="Открытых конфликтов"
          value={String(openCases)}
          color="amber"
          hint={openCases === 0 ? 'Шаг 7' : undefined}
        />
      </div>

      {/* Прогресс паспорта */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="ListChecks" size={18} />
            Состояние паспорта v1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <ProgressRow label="Шаг 1. Инвентаризация" done={SECTIONS.length > 0} note={`${SECTIONS.length} разделов`} />
            <ProgressRow label="Шаг 2. Нормализация справочника" done={SECTIONS.length > 0} note="canonical name + path для каждого" />
            <ProgressRow label="Шаг 3. Классификация по roleType" done={false} note="Шаг 4 (большой проход)" />
            <ProgressRow
              label="Шаг 4. Смысловой паспорт"
              done={false}
              note={`${semanticsCount} из ${SECTIONS.length} разделов`}
            />
            <ProgressRow label="Шаг 5. Карта сущностей" done={ENTITIES.length > 0} note="следующая сессия" />
            <ProgressRow label="Шаг 6. Матрица пересечений" done={false} note="следующая сессия" />
            <ProgressRow label="Шаг 7. Журнал решений" done={openCases > 0} note="следующая сессия" />
          </div>
        </CardContent>
      </Card>

      {/* Принципы и гипотезы */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="ShieldCheck" size={18} className="text-emerald-600" />
              Принятые принципы
              <Badge variant="secondary" className="ml-auto">
                {accepted.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {accepted.map((p) => (
              <div key={p.id} className="text-sm border-l-2 border-emerald-500 pl-3">
                <div className="font-semibold">{p.title}</div>
                <div className="text-muted-foreground text-xs leading-relaxed mt-1">{p.body}</div>
              </div>
            ))}
            {accepted.length === 0 && (
              <p className="text-xs text-muted-foreground">Пока ни одного принятого принципа.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Beaker" size={18} className="text-amber-600" />
              Гипотезы для проверки
              <Badge variant="secondary" className="ml-auto">
                {hypotheses.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hypotheses.map((p) => (
              <div key={p.id} className="text-sm border-l-2 border-amber-500 pl-3">
                <div className="font-semibold">{p.title}</div>
                <div className="text-muted-foreground text-xs leading-relaxed mt-1">{p.body}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Распределение разделов по хабам */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="BarChart3" size={18} />
            Распределение разделов по хабам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {HUBS.map((hub) => {
              const n = counts[hub.id] ?? 0;
              const pct = (n / SECTIONS.length) * 100;
              return (
                <div key={hub.id} className="flex items-center gap-3 text-sm">
                  <Icon name={hub.icon} size={16} className="text-muted-foreground" />
                  <span className="w-40 shrink-0">{hub.title}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-xs">{n}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
  hint?: string;
}) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-700',
    emerald: 'from-emerald-500 to-emerald-700',
    violet: 'from-violet-500 to-violet-700',
    amber: 'from-amber-500 to-amber-700',
  } as const;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Icon name={icon} size={14} />
          {label}
        </div>
        <div className={`text-3xl font-bold bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
          {value}
        </div>
        {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, done, note }: { label: string; done: boolean; note?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        name={done ? 'CheckCircle2' : 'Circle'}
        size={16}
        className={done ? 'text-emerald-600' : 'text-muted-foreground'}
      />
      <span className={done ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
      {note && <span className="text-xs text-muted-foreground ml-auto">{note}</span>}
    </div>
  );
}
