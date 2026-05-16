import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { MemorySort } from './types';
import { MEMORY_SORT_OPTIONS } from './types';

interface MemberOption {
  id: number;
  name: string;
  avatar?: string | null;
}

interface EventOption {
  id: string;
  title: string;
  date?: string | null;
}

interface MemoryFiltersBarProps {
  q: string;
  memberId?: number;
  eventId?: string;
  year?: number;
  sort: MemorySort;
  years: number[];
  members: MemberOption[];
  events: EventOption[];
  hasAny: boolean;
  onChangeQ: (q: string) => void;
  onChangeMember: (id?: number) => void;
  onChangeEvent: (id?: string) => void;
  onChangeYear: (year?: number) => void;
  onChangeSort: (sort: MemorySort) => void;
  onResetAll: () => void;
}

const ALL = '__all__';

export default function MemoryFiltersBar({
  q,
  memberId,
  eventId,
  year,
  sort,
  years,
  members,
  events,
  hasAny,
  onChangeQ,
  onChangeMember,
  onChangeEvent,
  onChangeYear,
  onChangeSort,
  onResetAll,
}: MemoryFiltersBarProps) {
  // локальный buffer для debounce
  const [localQ, setLocalQ] = useState(q);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
    if (localQ === q) return;
    const t = setTimeout(() => onChangeQ(localQ), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  return (
    <div className="mb-4 space-y-2 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Icon
            name="Search"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={localQ}
            onChange={e => setLocalQ(e.target.value)}
            placeholder="Поиск по воспоминаниям"
            className="pl-8"
          />
          {localQ && (
            <button
              type="button"
              onClick={() => setLocalQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent"
              aria-label="Очистить"
            >
              <Icon name="X" size={12} />
            </button>
          )}
        </div>

        <Select
          value={memberId != null ? String(memberId) : ALL}
          onValueChange={v => onChangeMember(v === ALL ? undefined : Number(v))}
        >
          <SelectTrigger className="w-[160px]">
            <Icon name="User" size={14} className="mr-1.5" />
            <SelectValue placeholder="Человек" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все люди</SelectItem>
            {members.map(m => (
              <SelectItem key={m.id} value={String(m.id)}>
                <span className="mr-1">{m.avatar || '👤'}</span> {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={eventId ?? ALL}
          onValueChange={v => onChangeEvent(v === ALL ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <Icon name="Calendar" size={14} className="mr-1.5" />
            <SelectValue placeholder="Событие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все события</SelectItem>
            {events.map(e => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year != null ? String(year) : ALL}
          onValueChange={v => onChangeYear(v === ALL ? undefined : Number(v))}
        >
          <SelectTrigger className="w-[110px]">
            <Icon name="CalendarDays" size={14} className="mr-1.5" />
            <SelectValue placeholder="Год" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все годы</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={v => onChangeSort(v as MemorySort)}>
          <SelectTrigger className="w-[210px]">
            <Icon name="ArrowDownUp" size={14} className="mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMORY_SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasAny && (
          <Button variant="ghost" size="sm" onClick={onResetAll} className="ml-auto">
            <Icon name="X" size={14} className="mr-1.5" />
            Сбросить всё
          </Button>
        )}
      </div>
    </div>
  );
}
