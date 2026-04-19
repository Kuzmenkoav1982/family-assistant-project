import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CATEGORY_CONFIG, LIFE_SEASONS, type LifeEvent } from './types';

interface Props {
  events: LifeEvent[];
  birthYear?: number;
  open: boolean;
  onClose: () => void;
}

const SLIDE_DURATION = 6000;

const SLIDE_GRADIENTS = [
  'from-rose-600 via-pink-600 to-purple-700',
  'from-orange-500 via-rose-500 to-fuchsia-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-blue-600 via-indigo-600 to-violet-700',
  'from-purple-600 via-fuchsia-600 to-pink-600',
  'from-amber-500 via-orange-500 to-rose-600',
];

function formatDateRu(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getSeason(date: string, birthYear?: number) {
  if (!birthYear) return null;
  const age = new Date(date).getFullYear() - birthYear;
  return LIFE_SEASONS.find((s) => age >= s.ageFrom && age <= s.ageTo) || null;
}

export default function LifeStoryMode({ events, birthYear, open, onClose }: Props) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => !e.isFuture),
    [events],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || paused || sorted.length === 0) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(p);
      if (p >= 100) {
        if (index >= sorted.length - 1) {
          onClose();
        } else {
          setIndex((i) => i + 1);
          setProgress(0);
        }
      }
    }, 50);
    return () => clearInterval(tick);
  }, [open, paused, index, sorted.length, onClose]);

  useEffect(() => {
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(sorted.length - 1, i + 1));
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, sorted.length, onClose]);

  if (!open) return null;

  if (sorted.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6">
        <Icon name="Inbox" size={48} className="mb-4 opacity-50" />
        <p className="text-lg mb-4">Нет событий для истории</p>
        <Button variant="outline" className="bg-white/10 text-white border-white/30" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    );
  }

  const ev = sorted[index];
  const cat = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.other;
  const season = getSeason(ev.date, birthYear);
  const photo = ev.photos && ev.photos.length > 0 ? ev.photos[0] : null;
  const gradient = SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length];
  const age = birthYear ? new Date(ev.date).getFullYear() - birthYear : null;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
      {/* Фоновый слой */}
      {photo ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
            style={{ backgroundImage: `url(${photo})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={photo}
              alt={ev.title}
              className="max-w-full max-h-full object-contain animate-[fadeIn_1s_ease-out]"
            />
          </div>
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
        </div>
      )}

      {/* Прогресс-полоски сверху */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-3 z-30">
        {sorted.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width: i < index ? '100%' : i === index ? `${progress}%` : '0%',
                transitionDuration: i === index ? '50ms' : '0ms',
              }}
            />
          </div>
        ))}
      </div>

      {/* Хедер */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2 text-white">
          <span className={`w-9 h-9 rounded-full flex items-center justify-center ${cat.color} shadow-lg`}>
            <Icon name={cat.icon} size={16} />
          </span>
          <div>
            <div className="text-xs font-bold opacity-90">{cat.label}</div>
            {season && <div className="text-[10px] opacity-70">{season.title}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-9 w-9"
            onClick={() => setPaused((p) => !p)}
            title={paused ? 'Продолжить' : 'Пауза'}
          >
            <Icon name={paused ? 'Play' : 'Pause'} size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-9 w-9"
            onClick={onClose}
            title="Закрыть"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>
      </div>

      {/* Контент снизу */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-white/80 text-xs sm:text-sm font-medium mb-2 tracking-widest uppercase">
            {formatDateRu(ev.date)}
            {age != null ? ` · ${age} лет` : ''}
          </div>
          <h2 className="text-white text-3xl sm:text-5xl font-black mb-4 drop-shadow-lg leading-tight animate-[slideUp_0.6s_ease-out]">
            {ev.title}
          </h2>
          {ev.quote && (
            <p className="text-white/90 text-base sm:text-xl italic mb-3 max-w-xl mx-auto leading-relaxed">
              «{ev.quote}»
            </p>
          )}
          {ev.description && (
            <p className="text-white/85 text-sm sm:text-base mb-3 max-w-2xl mx-auto leading-relaxed line-clamp-3">
              {ev.description}
            </p>
          )}
        </div>
      </div>

      {/* Зоны клика для навигации */}
      <button
        className="absolute top-0 bottom-0 left-0 w-1/3 z-20"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        aria-label="Предыдущее"
      />
      <button
        className="absolute top-0 bottom-0 right-0 w-1/3 z-20"
        onClick={() => {
          if (index < sorted.length - 1) setIndex(index + 1);
          else onClose();
        }}
        aria-label="Следующее"
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
