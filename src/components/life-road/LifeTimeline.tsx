import { useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_CONFIG, IMPORTANCE_CONFIG, LIFE_SEASONS, type LifeEvent } from './types';

interface Props {
  events: LifeEvent[];
  birthYear?: number;
  onEditEvent?: (event: LifeEvent) => void;
  onDeleteEvent?: (event: LifeEvent) => void;
}

interface TimelineItem {
  type: 'event';
  event: LifeEvent;
  side: 'left' | 'right';
  age: number | null;
  isFuture: boolean;
}

interface SeasonHeader {
  type: 'season';
  seasonId: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  icon: string;
  yearLabel: string | null;
}

interface NowMarker {
  type: 'now';
}

type Row = TimelineItem | SeasonHeader | NowMarker;

function calcAge(date: string, birthYear?: number): number | null {
  if (!birthYear) return null;
  return new Date(date).getFullYear() - birthYear;
}

function formatDateRu(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LifeTimeline({ events, birthYear, onEditEvent, onDeleteEvent }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const rows = useMemo<Row[]>(() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const result: Row[] = [];

    let currentSeasonId: string | null = null;
    let nowInserted = false;

    sorted.forEach((ev, idx) => {
      const age = calcAge(ev.date, birthYear);
      const season = age != null ? LIFE_SEASONS.find((s) => age >= s.ageFrom && age <= s.ageTo) : null;
      const isFuture = ev.date > today || ev.isFuture === true;

      if (!nowInserted && isFuture) {
        result.push({ type: 'now' });
        nowInserted = true;
      }

      if (season && season.id !== currentSeasonId) {
        result.push({
          type: 'season',
          seasonId: season.id,
          title: season.title,
          subtitle: season.subtitle,
          gradient: season.gradient,
          accent: season.accent,
          icon: season.icon,
          yearLabel: birthYear ? `${birthYear + season.ageFrom}` : null,
        });
        currentSeasonId = season.id;
      }

      result.push({ type: 'event', event: ev, side: idx % 2 === 0 ? 'left' : 'right', age, isFuture });
    });

    if (!nowInserted) {
      result.push({ type: 'now' });
    }

    return result;
  }, [events, birthYear, today]);

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
          <Icon name="Sparkles" size={36} className="text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Здесь начнётся твоя дорога</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Добавь первое важное событие — рождение, свадьбу, переезд, мечту, цель. Они станут точками на твоём пути.
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto py-6">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[3px] hidden md:block rounded-full"
        style={{
          background:
            'linear-gradient(to bottom, #ec4899 0%, #a855f7 35%, #6366f1 65%, rgba(99,102,241,0.25) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute left-5 top-0 bottom-0 w-[3px] md:hidden rounded-full"
        style={{
          background:
            'linear-gradient(to bottom, #ec4899 0%, #a855f7 35%, #6366f1 65%, rgba(99,102,241,0.25) 100%)',
        }}
      />

      <div className="space-y-5">
        {rows.map((row, idx) => {
          if (row.type === 'season') {
            return <SeasonRow key={`season-${idx}`} row={row} />;
          }
          if (row.type === 'now') {
            return <NowRow key={`now-${idx}`} />;
          }
          return (
            <EventRow
              key={row.event.id}
              row={row}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
          );
        })}
      </div>
    </div>
  );
}

function SeasonRow({ row }: { row: SeasonHeader }) {
  return (
    <div className="relative py-6">
      <div className={`hidden md:flex items-center gap-4 max-w-3xl mx-auto`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-200" />
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r ${row.gradient} text-white shadow-lg`}>
          <Icon name={row.icon} size={22} />
          <div>
            <div className="text-base font-bold leading-tight">{row.title}</div>
            <div className="text-[11px] opacity-90 leading-tight">{row.subtitle}</div>
          </div>
          {row.yearLabel && (
            <div className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
              {row.yearLabel}
            </div>
          )}
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-200" />
      </div>

      <div className="md:hidden pl-14">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${row.gradient} text-white shadow-md`}>
          <Icon name={row.icon} size={16} />
          <div className="text-sm font-bold">{row.title}</div>
          {row.yearLabel && <span className="text-[10px] opacity-90">· {row.yearLabel}</span>}
        </div>
      </div>
    </div>
  );
}

function NowRow() {
  return (
    <div className="relative py-4">
      <div className="hidden md:flex items-center justify-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-pink-400 opacity-60 animate-ping" />
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-pink-400 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-sm font-bold text-pink-700">Я сейчас</span>
            <span className="text-xs text-gray-500">· {new Date().toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center gap-3 pl-2">
        <div className="relative w-10 flex justify-center">
          <span className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-pink-400 opacity-60 animate-ping" />
          <span className="relative w-4 h-4 rounded-full bg-pink-500 border-2 border-white" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-pink-300 shadow-sm">
          <span className="text-xs font-bold text-pink-700">Я сейчас</span>
        </div>
      </div>
    </div>
  );
}

function EventRow({
  row,
  onEdit,
  onDelete,
}: {
  row: TimelineItem;
  onEdit?: (e: LifeEvent) => void;
  onDelete?: (e: LifeEvent) => void;
}) {
  const { event, side, age, isFuture } = row;
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
  const imp = IMPORTANCE_CONFIG[event.importance] || IMPORTANCE_CONFIG.medium;
  const photo = event.photos && event.photos.length > 0 ? event.photos[0] : null;

  return (
    <div className="relative">
      {/* Desktop: zigzag */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className={side === 'left' ? '' : 'opacity-0 pointer-events-none'}>
          {side === 'left' && (
            <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} photo={photo} align="right" onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>

        <Marker cat={cat} imp={imp} isFuture={isFuture} />

        <div className={side === 'right' ? '' : 'opacity-0 pointer-events-none'}>
          {side === 'right' && (
            <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} photo={photo} align="left" onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
      </div>

      {/* Mobile: одна колонка слева от линии не получится, делаем справа */}
      <div className="md:hidden flex items-start gap-3 pl-2">
        <div className="w-10 pt-3 flex justify-center">
          <Marker cat={cat} imp={imp} isFuture={isFuture} compact />
        </div>
        <div className="flex-1">
          <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} photo={photo} align="left" onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

function Marker({
  cat,
  imp,
  isFuture,
  compact,
}: {
  cat: typeof CATEGORY_CONFIG['other'];
  imp: typeof IMPORTANCE_CONFIG['medium'];
  isFuture: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`relative flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}>
      {imp.label === 'Ключевое' && !isFuture && (
        <span className={`absolute inset-0 rounded-full ${cat.color} opacity-30 animate-ping`} />
      )}
      <div
        className={`relative ${compact ? 'w-7 h-7' : 'w-10 h-10'} rounded-full ${cat.color} flex items-center justify-center text-white shadow-lg ring-4 ${cat.ring} ring-opacity-30 ${
          isFuture ? 'opacity-60 ring-dashed' : ''
        }`}
      >
        <Icon name={cat.icon} size={compact ? 14 : 18} />
      </div>
    </div>
  );
}

function EventCard({
  event,
  cat,
  imp,
  age,
  isFuture,
  photo,
  align,
  onEdit,
  onDelete,
}: {
  event: LifeEvent;
  cat: typeof CATEGORY_CONFIG['other'];
  imp: typeof IMPORTANCE_CONFIG['medium'];
  age: number | null;
  isFuture: boolean;
  photo: string | null;
  align: 'left' | 'right';
  onEdit?: (e: LifeEvent) => void;
  onDelete?: (e: LifeEvent) => void;
}) {
  return (
    <div
      className={`relative group rounded-2xl p-4 backdrop-blur-md border shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5
        ${isFuture
          ? 'bg-white/40 border-dashed border-purple-300'
          : 'bg-white/70 border-white/60'}
      `}
      style={
        photo
          ? {
              backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.92)), url(${photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className={`flex items-start gap-2 mb-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 mb-1 ${align === 'right' ? 'justify-end' : ''}`}>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700">
              {cat.label}
            </Badge>
            <span className={`inline-block rounded-full ${imp.dot} ${imp.size}`} />
            {isFuture && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-300 text-purple-600">
                Будущее
              </Badge>
            )}
          </div>
          <h4 className="font-bold text-gray-900 leading-snug break-words line-clamp-2">{event.title}</h4>
          <p className="text-[11px] text-gray-500">
            {formatDateRu(event.date)}
            {age != null && !isFuture ? ` · ${age} лет` : ''}
          </p>
        </div>
      </div>

      {event.description && (
        <p className={`text-xs text-gray-700 leading-relaxed line-clamp-3 ${align === 'right' ? 'text-right' : ''}`}>
          {event.description}
        </p>
      )}

      {event.quote && (
        <p className={`mt-2 text-xs italic text-purple-700/90 border-l-2 border-purple-300 pl-2 ${align === 'right' ? 'border-l-0 border-r-2 pl-0 pr-2 text-right' : ''}`}>
          «{event.quote}»
        </p>
      )}

      {event.photos && event.photos.length > 0 && (
        <div className={`mt-3 flex gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
          {event.photos.slice(0, 4).map((p, i) => (
            <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-white shadow-sm">
              <img src={p} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className={`absolute top-2 ${align === 'right' ? 'left-2' : 'right-2'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
        {onEdit && (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(event)} title="Редактировать">
            <Icon name="Pencil" size={13} />
          </Button>
        )}
        {onDelete && (
          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => onDelete(event)} title="Удалить">
            <Icon name="Trash2" size={13} />
          </Button>
        )}
      </div>
    </div>
  );
}