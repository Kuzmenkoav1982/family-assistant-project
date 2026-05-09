import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { HUBS, SECTIONS, getSemantic } from '@/data/atlas';
import type { RoleType } from '@/data/atlas';

const ROLE_LABEL: Record<RoleType, string> = {
  source: 'Источник',
  interpretation: 'Интерпретация',
  action: 'Действие',
  reflection: 'Осмысление',
  communication: 'Коммуникация',
  unknown: '—',
};

const ROLE_COLOR: Record<RoleType, string> = {
  source: 'bg-blue-100 text-blue-800 border-blue-200',
  interpretation: 'bg-violet-100 text-violet-800 border-violet-200',
  action: 'bg-amber-100 text-amber-800 border-amber-200',
  reflection: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  communication: 'bg-pink-100 text-pink-800 border-pink-200',
  unknown: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AtlasSectionsTab() {
  const [search, setSearch] = useState('');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return SECTIONS.filter((s) => {
      if (hubFilter !== 'all' && s.hubId !== hubFilter) return false;
      const sem = getSemantic(s.id);
      const role: RoleType = sem?.roleType ?? 'unknown';
      if (roleFilter !== 'all' && role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.label.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, hubFilter, roleFilter]);

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Поиск по названию или id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={hubFilter} onValueChange={setHubFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Хаб" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все хабы</SelectItem>
            {HUBS.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="source">Источник</SelectItem>
            <SelectItem value="interpretation">Интерпретация</SelectItem>
            <SelectItem value="action">Действие</SelectItem>
            <SelectItem value="reflection">Осмысление</SelectItem>
            <SelectItem value="communication">Коммуникация</SelectItem>
            <SelectItem value="unknown">Не классифицировано</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">
        Показано: <span className="font-mono font-bold">{filtered.length}</span> из{' '}
        <span className="font-mono font-bold">{SECTIONS.length}</span>
      </div>

      {/* Таблица */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr className="text-left">
                  <th className="p-3 font-semibold w-8"></th>
                  <th className="p-3 font-semibold">Раздел</th>
                  <th className="p-3 font-semibold">Хаб</th>
                  <th className="p-3 font-semibold">Роль</th>
                  <th className="p-3 font-semibold">Статус</th>
                  <th className="p-3 font-semibold">Маршрут</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const hub = HUBS.find((h) => h.id === s.hubId);
                  const sem = getSemantic(s.id);
                  const role: RoleType = sem?.roleType ?? 'unknown';
                  return (
                    <tr key={s.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <Icon name={s.icon} size={16} className="text-muted-foreground" />
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{s.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs">{hub?.title ?? s.hubId}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${ROLE_COLOR[role]}`}
                        >
                          {ROLE_LABEL[role]}
                        </span>
                      </td>
                      <td className="p-3">
                        {sem ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {sem.status}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">не паспортизировано</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Link
                          to={s.path}
                          className="text-xs text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.path}
                          <Icon name="ExternalLink" size={10} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      Ничего не найдено по текущим фильтрам.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
