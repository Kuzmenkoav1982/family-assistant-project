import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getReligionEmoji, getReligionLabel } from '../constants';
import { SAINTS_BY_RELIGION } from '../data/saints';
import type { SaintEntry } from '../types';

export default function SaintOfDayTab({ religion }: { religion: string }) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const saintsList = SAINTS_BY_RELIGION[religion] || SAINTS_BY_RELIGION['orthodox'];
  const todaySaint = saintsList[dayOfYear % saintsList.length];
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('faith_saint_favorites') || '{}'); } catch { return {}; }
  });

  const toggleFavorite = (name: string) => {
    const next = { ...favorites, [name]: !favorites[name] };
    setFavorites(next);
    localStorage.setItem('faith_saint_favorites', JSON.stringify(next));
  };

  const sectionLabel: Record<string, string> = {
    orthodox: 'Святой дня',
    catholic: 'Святой дня',
    protestant: 'Реформатор дня',
    islam: 'Мудрец дня',
    judaism: 'Мудрец дня',
    buddhism: 'Учитель дня',
    hinduism: 'Учитель дня',
    other: 'Мудрец дня',
  };

  const otherLabel: Record<string, string> = {
    orthodox: 'Другие святые',
    catholic: 'Другие святые',
    protestant: 'Другие реформаторы',
    islam: 'Другие мудрецы',
    judaism: 'Другие мудрецы',
    buddhism: 'Другие учителя',
    hinduism: 'Другие учителя',
    other: 'Другие мудрецы',
  };

  const [showStats, setShowStats] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Crown" size={18} className="text-amber-600" />
        {sectionLabel[religion] || 'Мудрец дня'} — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <button
        onClick={() => setShowStats(!showStats)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
          <Icon name="BarChart2" size={14} className="text-amber-500" />
          Святых в мире: <span className="font-bold text-amber-900">~10 000+</span>
        </span>
        <Icon name={showStats ? 'ChevronUp' : 'ChevronDown'} size={15} className="text-amber-400" />
      </button>

      {showStats && (
        <div className="space-y-2 px-1">
          <div className="grid grid-cols-2 gap-2">
            {[
              { rel: 'orthodox', label: 'Православие', total: '~5 000', ours: SAINTS_BY_RELIGION.orthodox?.length || 0 },
              { rel: 'catholic', label: 'Католицизм', total: '~7 000', ours: SAINTS_BY_RELIGION.catholic?.length || 0 },
              { rel: 'protestant', label: 'Протестантизм', total: '~500', ours: SAINTS_BY_RELIGION.protestant?.length || 0 },
              { rel: 'islam', label: 'Ислам', total: '~124 000', ours: SAINTS_BY_RELIGION.islam?.length || 0 },
              { rel: 'judaism', label: 'Иудаизм', total: '~300', ours: SAINTS_BY_RELIGION.judaism?.length || 0 },
              { rel: 'buddhism', label: 'Буддизм', total: '~500', ours: SAINTS_BY_RELIGION.buddhism?.length || 0 },
              { rel: 'hinduism', label: 'Индуизм', total: '~330 млн', ours: SAINTS_BY_RELIGION.hinduism?.length || 0 },
            ].map(({ rel, label, total, ours }) => (
              <div
                key={rel}
                className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg border text-xs ${rel === religion ? 'bg-amber-100 border-amber-400' : 'bg-white border-amber-100'}`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{getReligionEmoji(rel)}</span>
                  <span className="text-amber-800 font-medium truncate">{label}</span>
                </div>
                <span className="font-bold text-amber-900">{total}</span>
                <span className="text-[10px] text-amber-500">у нас: {ours}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-500 text-center px-2">Мы постепенно добавляем всех — база пополняется ✨</p>
        </div>
      )}

      <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Badge>
            <button onClick={() => toggleFavorite(todaySaint.name)} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
              <Icon name={favorites[todaySaint.name] ? 'HeartHandshake' : 'Heart'} size={18} className={favorites[todaySaint.name] ? 'text-rose-500' : 'text-amber-400'} />
            </button>
          </div>
          <div className="flex items-start gap-3">
            <img src={todaySaint.image} alt={todaySaint.name} className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-amber-300 shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-amber-900">{todaySaint.name}</p>
              <p className="text-xs text-amber-700 font-medium">{todaySaint.title} · {todaySaint.period}</p>
            </div>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{todaySaint.description}</p>
          <a
            href={todaySaint.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Подробнее: {todaySaint.source}
          </a>
        </CardContent>
      </Card>

      {saintsList.length > 1 && (
        <>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-amber-200" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{otherLabel[religion] || 'Другие'}</span>
            <div className="h-px flex-1 bg-amber-200" />
          </div>

          <div className="space-y-2">
            {saintsList.filter((s: SaintEntry) => s.name !== todaySaint.name).map((saint: SaintEntry, i: number) => (
              <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <img src={saint.image} alt={saint.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-amber-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-amber-900">{saint.name}</p>
                        <button onClick={() => toggleFavorite(saint.name)} className="p-0.5">
                          <Icon name={favorites[saint.name] ? 'HeartHandshake' : 'Heart'} size={14} className={favorites[saint.name] ? 'text-rose-500' : 'text-amber-300'} />
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-600 font-medium">{saint.title} · {saint.period}</p>
                      <p className="text-xs text-amber-700/70 mt-1 line-clamp-2">{saint.description}</p>
                      <a
                        href={saint.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1.5"
                      >
                        <Icon name="ExternalLink" size={10} />
                        {saint.source}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
