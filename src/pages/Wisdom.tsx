import { useState, useMemo, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useToast } from '@/hooks/use-toast';
import {
  wisdoms,
  CATEGORIES,
  SOURCES,
  CATEGORY_IMAGES,
  TYPES,
} from '@/data/wisdomData';
import type { Wisdom as WisdomType } from '@/data/wisdomData';

const APP_URL = 'https://nasha-semiya.ru';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem('wisdom_favorites');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function saveFavorites(ids: number[]) {
  localStorage.setItem('wisdom_favorites', JSON.stringify(ids));
}

function getCategoryLabel(catId: string): string {
  return CATEGORIES.find((c) => c.id === catId)?.label ?? catId;
}

function getCategoryEmoji(catId: string): string {
  return CATEGORIES.find((c) => c.id === catId)?.emoji ?? '';
}

function getTypeLabel(typeId: string): string {
  return TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

export default function Wisdom() {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);

  // Wisdom of the day — deterministic by date
  const wisdomOfDay: WisdomType = useMemo(() => {
    const idx = getDayOfYear() % wisdoms.length;
    return wisdoms[idx];
  }, []);

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const handleCopy = async (w: WisdomType) => {
    const text = `\u00AB${w.text}\u00BB\n\n${w.meaning}\n\u2014 ${w.source} мудрость`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано', description: 'Мудрость скопирована в буфер обмена' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось скопировать текст' });
    }
  };

  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharingWisdom, setSharingWisdom] = useState<WisdomType | null>(null);

  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    const el = shareCardRef.current;
    if (!el) return null;
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1)
      );
    } catch {
      return null;
    }
  }, []);

  const handleShare = useCallback(async (w: WisdomType) => {
    setSharingWisdom(w);
    await new Promise((r) => setTimeout(r, 300));

    const blob = await generateShareImage();
    const text = `«${w.text}»\n\n${w.meaning}\n— ${w.source} мудрость\n\n📲 Приложение «Наша Семья»: ${APP_URL}`;

    if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], 'wisdom.png', { type: 'image/png' })] })) {
      try {
        const file = new File([blob], 'wisdom.png', { type: 'image/png' });
        await navigator.share({ title: w.text, text, files: [file] });
      } catch {
        /* user cancelled */
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title: w.text, text });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Скопировано', description: 'Текст мудрости скопирован с ссылкой на приложение' });
      } catch {
        toast({ title: 'Ошибка', description: 'Не удалось поделиться' });
      }
    }
    setSharingWisdom(null);
  }, [generateShareImage, toast]);

  // Filtered wisdoms
  const filtered = useMemo(() => {
    let list = wisdoms;

    if (showFavorites) {
      list = list.filter((w) => favorites.includes(w.id));
    }

    if (activeCategory) {
      list = list.filter((w) => w.category === activeCategory);
    }

    if (activeSource) {
      list = list.filter((w) => w.source === activeSource);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.text.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q),
      );
    }

    return list;
  }, [search, activeCategory, activeSource, showFavorites, favorites]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
      {sharingWisdom && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div
            ref={shareCardRef}
            style={{
              width: 600,
              padding: 40,
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 50%, #FEF3C7 100%)',
              borderRadius: 24,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 160, height: 160, borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.15)',
            }} />
            <div style={{
              position: 'absolute', bottom: -30, left: -30,
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(251, 146, 60, 0.1)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 28 }}>{getCategoryEmoji(sharingWisdom.category)}</span>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: '#92400E',
                  background: '#FDE68A', padding: '4px 12px', borderRadius: 20,
                }}>
                  {sharingWisdom.source} мудрость
                </span>
              </div>
              <p style={{
                fontSize: 28, fontWeight: 700, lineHeight: 1.35,
                color: '#78350F', marginBottom: 16,
              }}>
                «{sharingWisdom.text}»
              </p>
              <p style={{
                fontSize: 17, lineHeight: 1.5, color: '#A16207',
                fontStyle: 'italic', marginBottom: 32, opacity: 0.9,
              }}>
                {sharingWisdom.meaning}
              </p>
              <div style={{
                borderTop: '2px solid rgba(217, 119, 6, 0.15)',
                paddingTop: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#92400E' }}>
                    Наша Семья
                  </p>
                  <p style={{ fontSize: 12, color: '#B45309' }}>
                    nasha-semiya.ru
                  </p>
                </div>
                <div style={{
                  fontSize: 11, color: '#B45309', background: '#FEF3C7',
                  padding: '6px 14px', borderRadius: 12, fontWeight: 500,
                }}>
                  {getTypeLabel(sharingWisdom.type)} · {sharingWisdom.age || getCategoryLabel(sharingWisdom.category)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto p-4 space-y-5">
        {/* Hero */}
        <SectionHero
          title="Мудрость народа"
          subtitle="Вековая мудрость разных народов мира"
          imageUrl={CATEGORY_IMAGES.wisdom}
          backPath="/values-hub"
        />

        {/* Wisdom of the Day */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          <div className="relative">
            <img
              src={CATEGORY_IMAGES[wisdomOfDay.category]}
              alt="Мудрость дня"
              className="w-full h-36 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-amber-500 text-white border-0">
                <Icon name="Sparkles" size={12} className="mr-1" />
                Мудрость дня
              </Badge>
            </div>
          </div>
          <CardContent className="pt-4 pb-4">
            <p className="text-lg font-semibold text-amber-900 mb-2 leading-snug">
              {'\u00AB'}{wisdomOfDay.text}{'\u00BB'}
            </p>
            <p className="text-sm text-muted-foreground italic mb-3">
              {wisdomOfDay.meaning}
            </p>
            {wisdomOfDay.history && (
              <div className="p-3 bg-white/60 rounded-lg border border-amber-100 mb-3">
                <p className="text-sm text-amber-900 leading-relaxed mb-1">
                  {wisdomOfDay.history}
                </p>
                {wisdomOfDay.age && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Clock" size={13} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Возраст: {wisdomOfDay.age}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {wisdomOfDay.source} мудрость
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(wisdomOfDay.id)}
                  className="text-amber-600 hover:bg-amber-100"
                >
                  <Icon
                    name="Heart"
                    size={18}
                    className={favorites.includes(wisdomOfDay.id) ? 'fill-red-500 text-red-500' : ''}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(wisdomOfDay)}
                  className="text-amber-600 hover:bg-amber-100"
                >
                  <Icon name="Copy" size={18} />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleShare(wisdomOfDay)}
                  className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-full"
                >
                  <Icon name="Share2" size={14} className="mr-1" />
                  <span className="text-xs font-medium">Поделиться</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Поиск мудрости..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-amber-200 focus-visible:ring-amber-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <Badge
            onClick={() => setActiveCategory(null)}
            className={`cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors ${
              activeCategory === null
                ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            Все
          </Badge>
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
              }`}
            >
              {cat.emoji} {cat.label}
            </Badge>
          ))}
        </div>

        {/* Source filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <Badge
            variant="outline"
            onClick={() => setActiveSource(null)}
            className={`cursor-pointer whitespace-nowrap flex-shrink-0 text-xs transition-colors ${
              activeSource === null
                ? 'bg-orange-100 text-orange-800 border-orange-400'
                : 'text-muted-foreground hover:bg-orange-50'
            }`}
          >
            Все народы
          </Badge>
          {SOURCES.map((src) => (
            <Badge
              key={src}
              variant="outline"
              onClick={() =>
                setActiveSource(activeSource === src ? null : src)
              }
              className={`cursor-pointer whitespace-nowrap flex-shrink-0 text-xs transition-colors ${
                activeSource === src
                  ? 'bg-orange-100 text-orange-800 border-orange-400'
                  : 'text-muted-foreground hover:bg-orange-50'
              }`}
            >
              {src}
            </Badge>
          ))}
        </div>

        {/* Favorites toggle + results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Найдено: {filtered.length}{' '}
            {filtered.length === 1
              ? 'мудрость'
              : filtered.length >= 2 && filtered.length <= 4
                ? 'мудрости'
                : 'мудростей'}
          </p>
          <Button
            variant={showFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavorites((v) => !v)}
            className={
              showFavorites
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'border-amber-300 text-amber-700 hover:bg-amber-50'
            }
          >
            <Icon
              name="Heart"
              size={16}
              className={showFavorites ? 'fill-white mr-1' : 'mr-1'}
            />
            Избранное
            {favorites.length > 0 && (
              <span className="ml-1">({favorites.length})</span>
            )}
          </Button>
        </div>

        {/* Wisdom cards grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((w) => (
              <WisdomCard
                key={w.id}
                wisdom={w}
                isFavorite={favorites.includes(w.id)}
                onToggleFavorite={() => toggleFavorite(w.id)}
                onCopy={() => handleCopy(w)}
                onShare={() => handleShare(w)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="SearchX" size={36} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-sm text-muted-foreground">
                Попробуйте изменить параметры поиска или сбросить фильтры
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-amber-300 text-amber-700"
                onClick={() => {
                  setSearch('');
                  setActiveCategory(null);
                  setActiveSource(null);
                  setShowFavorites(false);
                }}
              >
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wisdom Card                                                       */
/* ------------------------------------------------------------------ */

interface WisdomCardProps {
  wisdom: WisdomType;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
}

function WisdomCard({ wisdom, isFavorite, onToggleFavorite, onCopy, onShare }: WisdomCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-all border border-amber-100">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <img
            src={CATEGORY_IMAGES[wisdom.category]}
            alt={getCategoryLabel(wisdom.category)}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base leading-snug text-foreground mb-1.5">
              {wisdom.text}
            </p>
            <p className="text-sm text-muted-foreground italic mb-2 leading-relaxed">
              {wisdom.meaning}
            </p>

            {wisdom.history && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 mb-2 transition-colors"
              >
                <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
                {expanded ? 'Скрыть историю' : 'История и происхождение'}
              </button>
            )}

            {expanded && wisdom.history && (
              <div className="mb-3 p-3 bg-amber-50/80 rounded-lg border border-amber-100 space-y-2">
                <p className="text-sm text-amber-900 leading-relaxed">
                  {wisdom.history}
                </p>
                {wisdom.age && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Clock" size={13} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">
                      Возраст: {wisdom.age}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                {wisdom.source}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {getCategoryEmoji(wisdom.category)} {getCategoryLabel(wisdom.category)}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {getTypeLabel(wisdom.type)}
              </Badge>
              {wisdom.age && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                  <Icon name="Clock" size={10} className="mr-1" />
                  {wisdom.age}
                </Badge>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className="h-8 px-2 hover:bg-red-50"
              >
                <Icon
                  name="Heart"
                  size={16}
                  className={
                    isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  }
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-8 px-2 text-muted-foreground hover:bg-amber-50 hover:text-amber-700"
              >
                <Icon name="Copy" size={16} className="mr-1" />
                <span className="text-xs">Копировать</span>
              </Button>
              <Button
                size="sm"
                onClick={onShare}
                className="h-8 px-3 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-full"
              >
                <Icon name="Share2" size={14} className="mr-1" />
                <span className="text-xs font-medium">Поделиться</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}