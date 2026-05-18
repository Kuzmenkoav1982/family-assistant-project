import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { PRAYER_CATEGORIES, getReligionEmoji, getReligionLabel } from '../constants';
import type { Prayer } from '../types';

export default function PrayersTab({ prayers, religion }: { prayers: Prayer[]; religion: string }) {
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = category === 'all' ? prayers : prayers.filter(p => p.category === category);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'morning': return 'Sunrise';
      case 'evening': return 'Moon';
      case 'meal': return 'UtensilsCrossed';
      case 'family': return 'Users';
      default: return 'BookOpen';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="BookOpen" size={18} className="text-rose-600" />
        Молитвы — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <div className="flex flex-wrap gap-1.5">
        {PRAYER_CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              category === c.key
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <Icon name={c.icon} size={12} />
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="BookOpen" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет молитв в этой категории</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <Card key={i} className={`border-amber-100 cursor-pointer transition-all ${expanded === i ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'}`}>
              <CardContent className="p-0">
                <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-3 flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center shrink-0">
                    <Icon name={categoryIcon(p.category)} size={16} className="text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900">{p.title}</p>
                    {p.time_of_day && (
                      <p className="text-[10px] text-amber-500">{p.time_of_day === 'morning' ? 'Утром' : 'Вечером'}</p>
                    )}
                  </div>
                  <Icon name={expanded === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100">
                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line font-serif">{p.text}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
