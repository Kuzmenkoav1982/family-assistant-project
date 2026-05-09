import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  ENTITIES,
  SECTIONS,
  HUBS,
  SEMANTICS,
  OVERLAP_CASES,
} from '@/data/atlas';
import type { RoleType } from '@/data/atlas';

const ROLE_COLOR: Record<RoleType, string> = {
  source: 'bg-blue-500',
  interpretation: 'bg-violet-500',
  action: 'bg-amber-500',
  reflection: 'bg-emerald-500',
  communication: 'bg-pink-500',
  unknown: 'bg-gray-300',
};

export default function AtlasOverlapsTab() {
  // Матрица «раздел × сущность» — показывает что в каких разделах создаётся
  const matrix = useMemo(() => {
    const sectionsWithEntities = SECTIONS.filter((s) =>
      ENTITIES.some(
        (e) =>
          e.createdIn.includes(s.id) ||
          e.editedIn.includes(s.id) ||
          e.aggregatedIn.includes(s.id),
      ),
    );

    // Группируем разделы по хабам
    const byHub: Record<string, typeof sectionsWithEntities> = {};
    for (const sec of sectionsWithEntities) {
      if (!byHub[sec.hubId]) byHub[sec.hubId] = [];
      byHub[sec.hubId].push(sec);
    }

    return { sectionsWithEntities, byHub };
  }, []);

  const getCell = (sectionId: string, entityId: string): 'created' | 'edited' | 'aggregated' | 'shown' | null => {
    const e = ENTITIES.find((x) => x.id === entityId);
    if (!e) return null;
    if (e.createdIn.includes(sectionId)) return 'created';
    if (e.editedIn.includes(sectionId)) return 'edited';
    if (e.aggregatedIn.includes(sectionId)) return 'aggregated';
    if (e.shownIn.includes(sectionId)) return 'shown';
    return null;
  };

  const cellColor = {
    created: 'bg-amber-500',
    edited: 'bg-amber-300',
    aggregated: 'bg-violet-500',
    shown: 'bg-blue-300',
  } as const;

  const cellTitle = {
    created: 'Создаётся',
    edited: 'Редактируется',
    aggregated: 'Агрегируется',
    shown: 'Витрина',
  } as const;

  const openCases = OVERLAP_CASES.filter((c) => c.status === 'open');

  // Распределение разделов по roleType
  const roleStats: Record<RoleType, number> = {
    source: 0,
    interpretation: 0,
    action: 0,
    reflection: 0,
    communication: 0,
    unknown: 0,
  };
  for (const s of SECTIONS) {
    const role: RoleType = SEMANTICS[s.id]?.roleType ?? 'unknown';
    roleStats[role]++;
  }

  return (
    <div className="space-y-5">
      {/* Распределение по roleType */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="PieChart" size={18} />
            Распределение разделов по роли в архитектуре
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {(Object.keys(roleStats) as RoleType[]).map((role) => (
              <div key={role} className="text-center p-3 rounded-lg border">
                <div
                  className={`w-3 h-3 rounded-full ${ROLE_COLOR[role]} mx-auto mb-1.5`}
                />
                <div className="text-2xl font-bold">{roleStats[role]}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {role}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Матрица раздел × сущность */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Grid3x3" size={18} />
            Матрица: раздел × сущность
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-amber-500 mr-1" />
            создаётся
            <span className="inline-block w-2 h-2 rounded-sm bg-amber-300 mx-1 ml-3" />
            редактируется
            <span className="inline-block w-2 h-2 rounded-sm bg-violet-500 mx-1 ml-3" />
            агрегируется
            <span className="inline-block w-2 h-2 rounded-sm bg-blue-300 mx-1 ml-3" />
            витрина
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white p-2 text-left font-semibold border-b border-r min-w-[200px]">
                    Раздел \ Сущность
                  </th>
                  {ENTITIES.map((e) => (
                    <th
                      key={e.id}
                      className="p-1 border-b font-normal align-bottom"
                      style={{ minWidth: 28 }}
                    >
                      <div
                        className="inline-block whitespace-nowrap text-[10px] text-muted-foreground"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        title={e.name}
                      >
                        {e.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HUBS.map((hub) => {
                  const sections = matrix.byHub[hub.id] ?? [];
                  if (sections.length === 0) return null;
                  return (
                    <>
                      <tr key={`hub-${hub.id}`}>
                        <td
                          colSpan={ENTITIES.length + 1}
                          className="sticky left-0 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 border-b"
                        >
                          {hub.title}
                        </td>
                      </tr>
                      {sections.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/20">
                          <td className="sticky left-0 bg-white p-2 border-b border-r whitespace-nowrap">
                            {s.label}
                          </td>
                          {ENTITIES.map((e) => {
                            const cell = getCell(s.id, e.id);
                            return (
                              <td key={e.id} className="border-b text-center">
                                {cell ? (
                                  <div
                                    className={`w-3 h-3 ${cellColor[cell]} rounded-sm mx-auto`}
                                    title={`${cellTitle[cell]}: ${e.name}`}
                                  />
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Топ открытых конфликтов */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="AlertCircle" size={18} className="text-amber-600" />
            Открытые конфликты по матрице
            <Badge variant="secondary" className="ml-auto">
              {openCases.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Подробный разбор и решения по каждому — на вкладке «Решения».
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
