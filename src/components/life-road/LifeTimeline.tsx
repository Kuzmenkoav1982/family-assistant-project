import { useMemo, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_CONFIG, IMPORTANCE_CONFIG, LIFE_SEASONS, type LifeEvent } from './types';
import func2url from '../../../backend/func2url.json';
import { readActorMemberId } from '@/lib/identity';

const API_URL = (func2url as Record<string, string>)['life-road'];

interface Props {
  events: LifeEvent[];
  birthYear?: number;
  onEditEvent?: (event: LifeEvent) => void;
  onDeleteEvent?: (event: LifeEvent) => void;
  onQuickPhoto?: (eventId: string, photos: string[]) => Promise<void>;
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

export default function LifeTimeline({ events, birthYear, onEditEvent, onDeleteEvent, onQuickPhoto }: Props) {
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
              onQuickPhoto={onQuickPhoto}
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
  onQuickPhoto,
}: {
  row: TimelineItem;
  onEdit?: (e: LifeEvent) => void;
  onDelete?: (e: LifeEvent) => void;
  onQuickPhoto?: (eventId: string, photos: string[]) => Promise<void>;
}) {
  const { event, side, age, isFuture } = row;
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
  const imp = IMPORTANCE_CONFIG[event.importance] || IMPORTANCE_CONFIG.medium;

  return (
    <div className="relative">
      {/* Desktop: zigzag */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className={side === 'left' ? '' : 'opacity-0 pointer-events-none'}>
          {side === 'left' && (
            <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} align="right" onEdit={onEdit} onDelete={onDelete} onQuickPhoto={onQuickPhoto} />
          )}
        </div>

        <Marker cat={cat} imp={imp} isFuture={isFuture} />

        <div className={side === 'right' ? '' : 'opacity-0 pointer-events-none'}>
          {side === 'right' && (
            <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} align="left" onEdit={onEdit} onDelete={onDelete} onQuickPhoto={onQuickPhoto} />
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-start gap-3 pl-2">
        <div className="w-10 pt-3 flex justify-center">
          <Marker cat={cat} imp={imp} isFuture={isFuture} compact />
        </div>
        <div className="flex-1">
          <EventCard event={event} cat={cat} imp={imp} age={age} isFuture={isFuture} align="left" onEdit={onEdit} onDelete={onDelete} onQuickPhoto={onQuickPhoto} />
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
  align,
  onEdit,
  onDelete,
  onQuickPhoto,
}: {
  event: LifeEvent;
  cat: typeof CATEGORY_CONFIG['other'];
  imp: typeof IMPORTANCE_CONFIG['medium'];
  age: number | null;
  isFuture: boolean;
  align: 'left' | 'right';
  onEdit?: (e: LifeEvent) => void;
  onDelete?: (e: LifeEvent) => void;
  onQuickPhoto?: (eventId: string, photos: string[]) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const photos = event.photos || [];
  const coverPhoto = photos[0] || null;
  const extraPhotos = photos.slice(1, 4);

  const handleQuickUpload = async (files: FileList | null) => {
    if (!files || !onQuickPhoto) return;
    setUploading(true);
    try {
      const actorMemberId = readActorMemberId();
      if (!actorMemberId) throw new Error('Не найден member_id');
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const base64 = dataUrl.split(',')[1];
        const resp = await fetch(`${API_URL}?resource=photo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Id': actorMemberId },
          body: JSON.stringify({ photo: base64, filename: file.name, contentType: file.type }),
        });
        const data = (await resp.json()) as { url?: string };
        if (data.url) newUrls.push(data.url);
      }
      if (newUrls.length > 0) {
        await onQuickPhoto(event.id, [...photos, ...newUrls]);
      }
    } catch (e) {
      console.error('Ошибка загрузки фото:', e);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <div
        className={`relative group rounded-2xl overflow-hidden border shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5
          ${isFuture ? 'border-dashed border-purple-300' : 'border-white/60'}
        `}
      >
        {/* Обложка */}
        {coverPhoto ? (
          <div
            className="relative w-full h-40 cursor-pointer overflow-hidden"
            onClick={() => setLightboxIdx(0)}
          >
            <img
              src={coverPhoto}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {/* Тёмный градиент снизу для читаемости */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {/* Счётчик фото если больше одного */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                <Icon name="Images" size={11} />
                {photos.length}
              </div>
            )}
            {/* Категория поверх фото */}
            <div className="absolute top-2 left-2">
              <Badge className={`text-[10px] px-1.5 py-0 ${cat.color} text-white border-0`}>
                {cat.label}
              </Badge>
            </div>
          </div>
        ) : (
          /* Заглушка-градиент если фото нет */
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!onQuickPhoto || uploading}
            className={`w-full h-20 flex flex-col items-center justify-center gap-1.5 transition-opacity
              bg-gradient-to-br ${cat.gradient || 'from-purple-100 to-pink-100'}
              ${onQuickPhoto ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
            `}
          >
            {uploading ? (
              <Icon name="Loader2" size={20} className="text-white/80 animate-spin" />
            ) : (
              <>
                <Icon name="ImagePlus" size={18} className="text-white/80" />
                {onQuickPhoto && <span className="text-[10px] text-white/70">Добавить фото</span>}
              </>
            )}
          </button>
        )}

        {/* Тело карточки */}
        <div className={`p-3.5 ${isFuture ? 'bg-white/50' : 'bg-white/80'} backdrop-blur-md`}>
          <div className={`flex items-start gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 min-w-0">
              {!coverPhoto && (
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
              )}

              <h4 className={`font-bold text-gray-900 leading-snug break-words ${align === 'right' ? 'text-right' : ''}`}>
                {event.title}
              </h4>
              <p className={`text-[11px] text-gray-500 mt-0.5 ${align === 'right' ? 'text-right' : ''}`}>
                {formatDateRu(event.date)}
                {age != null && !isFuture ? ` · ${age} лет` : ''}
              </p>
            </div>
          </div>

          {event.description && (
            <p className={`mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3 ${align === 'right' ? 'text-right' : ''}`}>
              {event.description}
            </p>
          )}

          {event.quote && (
            <p className={`mt-2 text-xs italic text-purple-700/80 border-l-2 border-purple-300 pl-2 ${align === 'right' ? 'border-l-0 border-r-2 pl-0 pr-2 text-right' : ''}`}>
              «{event.quote}»
            </p>
          )}

          {/* Доп. фото-миниатюры */}
          {extraPhotos.length > 0 && (
            <div className={`mt-2.5 flex gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
              {extraPhotos.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIdx(i + 1)}
                  className="w-10 h-10 rounded-lg overflow-hidden border border-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {photos.length > 4 && (
                <button
                  type="button"
                  onClick={() => setLightboxIdx(4)}
                  className="w-10 h-10 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-600"
                >
                  +{photos.length - 4}
                </button>
              )}
            </div>
          )}

          {/* Нижняя панель действий */}
          <div className={`mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between`}>
            <div className="flex gap-1">
              {onQuickPhoto && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 transition-colors px-1.5 py-0.5 rounded-md hover:bg-purple-50"
                  title="Добавить фото"
                >
                  {uploading
                    ? <Icon name="Loader2" size={12} className="animate-spin" />
                    : <Icon name="ImagePlus" size={12} />
                  }
                  <span>{uploading ? 'Загрузка…' : '+ фото'}</span>
                </button>
              )}
            </div>
            <div className="flex gap-0.5">
              {onEdit && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(event)} title="Редактировать">
                  <Icon name="Pencil" size={12} />
                </Button>
              )}
              {onDelete && (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-500 hover:text-rose-700" onClick={() => onDelete(event)} title="Удалить">
                  <Icon name="Trash2" size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleQuickUpload(e.target.files)}
        />
      </div>

      {/* Лайтбокс */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIdx(null)}
          >
            <Icon name="X" size={28} />
          </button>
          {photos.length > 1 && lightboxIdx > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.max(0, (i ?? 1) - 1)); }}
            >
              <Icon name="ChevronLeft" size={36} />
            </button>
          )}
          <img
            src={photos[lightboxIdx]}
            alt=""
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && lightboxIdx < photos.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.min(photos.length - 1, (i ?? 0) + 1)); }}
            >
              <Icon name="ChevronRight" size={36} />
            </button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIdx + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}