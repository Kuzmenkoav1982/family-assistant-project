import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { ENTITIES, SECTIONS, getMultiHomeEntities } from '@/data/atlas';

export default function AtlasEntitiesTab() {
  const [search, setSearch] = useState('');
  const conflicts = getMultiHomeEntities();
  const filtered = ENTITIES.filter((e) =>
    !search ? true : e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()),
  );

  const getLabel = (id: string) => SECTIONS.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="space-y-4">
      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Сущностей в реестре</div>
            <div className="text-3xl font-bold text-violet-600">{ENTITIES.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">С конфликтом «несколько домов»</div>
            <div className="text-3xl font-bold text-amber-600">{conflicts.length}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              создаются в нескольких разделах
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Без конфликтов</div>
            <div className="text-3xl font-bold text-emerald-600">
              {ENTITIES.length - conflicts.length}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">один home — чисто</div>
          </CardContent>
        </Card>
      </div>

      <Input
        placeholder="Поиск по сущности…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Список сущностей */}
      <div className="space-y-2">
        {filtered.map((e) => {
          const isConflict = e.createdIn.length > 1;
          return (
            <Card key={e.id} className={isConflict ? 'border-amber-300' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {e.name}
                      {isConflict && (
                        <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700">
                          <Icon name="AlertTriangle" size={10} className="mr-1" />
                          несколько домов
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.description}</div>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground shrink-0">{e.id}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <Field
                    label="Дом (рекомендуемый)"
                    value={e.homeSection ? getLabel(e.homeSection) : '—'}
                    accent="emerald"
                  />
                  <Field
                    label="Создаётся в"
                    items={e.createdIn.map(getLabel)}
                    accent={isConflict ? 'amber' : 'gray'}
                  />
                  {e.editedIn.length > 0 && (
                    <Field label="Редактируется в" items={e.editedIn.map(getLabel)} accent="gray" />
                  )}
                  {e.aggregatedIn.length > 0 && (
                    <Field label="Агрегируется в" items={e.aggregatedIn.map(getLabel)} accent="violet" />
                  )}
                  {e.shownIn.length > 0 && (
                    <Field label="Показывается в" items={e.shownIn.map(getLabel)} accent="blue" />
                  )}
                </div>

                {e.notes && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 border-l-2 border-amber-400 px-2 py-1 rounded">
                    {e.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  items,
  accent,
}: {
  label: string;
  value?: string;
  items?: string[];
  accent: 'emerald' | 'amber' | 'gray' | 'violet' | 'blue';
}) {
  const colorMap = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    gray: 'text-gray-700 bg-gray-50 border-gray-200',
    violet: 'text-violet-700 bg-violet-50 border-violet-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
  } as const;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {value && (
        <span className={`inline-block text-[11px] px-2 py-0.5 rounded border ${colorMap[accent]}`}>
          {value}
        </span>
      )}
      {items && (
        <div className="flex flex-wrap gap-1">
          {items.map((it) => (
            <span
              key={it}
              className={`inline-block text-[11px] px-2 py-0.5 rounded border ${colorMap[accent]}`}
            >
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
