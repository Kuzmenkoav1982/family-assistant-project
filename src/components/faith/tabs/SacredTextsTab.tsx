import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TEXT_CATEGORIES, getReligionEmoji, getReligionLabel } from '../constants';
import { SACRED_TEXTS } from '../data/sacredTexts';

export default function SacredTextsTab({ religion }: { religion: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [readItems, setReadItems] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('faith_texts_read') || '{}'); } catch { return {}; }
  });

  const texts = SACRED_TEXTS[religion] || SACRED_TEXTS.orthodox;
  const categories = ['all', ...Array.from(new Set(texts.map(t => t.category)))];
  const filtered = filter === 'all' ? texts : texts.filter(t => t.category === filter);

  const toggleRead = (title: string) => {
    const next = { ...readItems, [title]: !readItems[title] };
    setReadItems(next);
    localStorage.setItem('faith_texts_read', JSON.stringify(next));
  };

  const readCount = texts.filter(t => readItems[t.title]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="BookText" size={18} className="text-amber-600" />
          Священные тексты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
          {readCount}/{texts.length} прочитано
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => {
          const info = TEXT_CATEGORIES[cat] || { label: cat, icon: 'Book' };
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                filter === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Icon name={info.icon} size={11} />
              {info.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((text, i) => {
          const isExpanded = expanded === i;
          const isRead = readItems[text.title];
          return (
            <Card key={i} className={`border-amber-100 overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'} ${isRead ? 'opacity-75' : ''}`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                  {isRead ? (
                    <Icon name="Check" size={16} className="text-emerald-600" />
                  ) : (
                    <Icon name="BookText" size={16} className="text-amber-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{text.title}</p>
                  <p className="text-xs text-amber-600/70 mt-0.5 line-clamp-1">{text.excerpt}</p>
                </div>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{text.fullText}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={isRead ? 'outline' : 'default'}
                      onClick={(e) => { e.stopPropagation(); toggleRead(text.title); }}
                      className={isRead ? 'border-emerald-300 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                    >
                      <Icon name={isRead ? 'RotateCcw' : 'Check'} size={14} className="mr-1" />
                      {isRead ? 'Прочитано' : 'Прочитал'}
                    </Button>
                    <a
                      href={text.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Источник: {text.source}
                    </a>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200/60 bg-blue-50/50">
        <CardContent className="p-3">
          <p className="text-xs text-blue-700 flex items-center gap-1.5">
            <Icon name="Info" size={14} className="shrink-0" />
            Тексты приведены в сокращённом виде. Полные версии доступны по ссылкам на первоисточники.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
