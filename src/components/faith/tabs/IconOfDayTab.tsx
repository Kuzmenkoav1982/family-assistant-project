import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getReligionEmoji, getReligionLabel } from '../constants';
import { ICONS_DATA } from '../data/icons';

export default function IconOfDayTab({ religion }: { religion: string }) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todayIcon = ICONS_DATA[dayOfYear % ICONS_DATA.length];
  const [showPrayer, setShowPrayer] = useState(false);
  const [showIconStats, setShowIconStats] = useState(false);

  if (religion !== 'orthodox' && religion !== 'catholic') {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Image" size={18} className="text-amber-600" />
          Икона дня — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Card className="border-amber-200/60 bg-amber-50/50">
          <CardContent className="py-8 text-center">
            <span className="text-4xl mb-3 block">🖼️</span>
            <p className="text-sm text-amber-800 font-medium">Раздел икон доступен для Православия и Католицизма</p>
            <p className="text-xs text-amber-600/70 mt-1">Выберите соответствующую конфессию на главной вкладке</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Image" size={18} className="text-amber-600" />
        Икона дня — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <button
        onClick={() => setShowIconStats(!showIconStats)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
          <Icon name="Image" size={14} className="text-amber-500" />
          Православных икон в мире: <span className="font-bold text-amber-900">~50 000+</span>
        </span>
        <Icon name={showIconStats ? 'ChevronUp' : 'ChevronDown'} size={15} className="text-amber-400" />
      </button>

      {showIconStats && (
        <div className="space-y-2 px-1">
          <div className="grid grid-cols-1 gap-1.5">
            {ICONS_DATA.map((icon, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${icon.name === todayIcon.name ? 'bg-amber-100 border-amber-400 font-semibold' : 'bg-white border-amber-100'}`}>
                <Icon name="ImageIcon" fallback="Image" size={12} className="text-amber-400 shrink-0" />
                <span className="text-amber-800 truncate">{icon.name}</span>
                {icon.name === todayIcon.name && <span className="ml-auto text-[10px] text-amber-600 shrink-0">сегодня</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-500 text-center px-2">У нас сейчас {ICONS_DATA.length} икон — пополняем постепенно ✨</p>
        </div>
      )}

      <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/60 shadow-md">
        <CardContent className="p-4 space-y-3">
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Badge>
          <div className="flex items-start gap-3">
            <img src={todayIcon.image} alt={todayIcon.name} className="w-20 h-24 rounded-xl object-cover shrink-0 border-2 border-amber-300 shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-amber-900">{todayIcon.name}</p>
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                <Icon name="Calendar" size={11} />
                Празднование: {todayIcon.feast}
              </p>
            </div>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{todayIcon.description}</p>

          <button
            onClick={() => setShowPrayer(!showPrayer)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/70 border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Icon name="BookOpen" size={14} className="text-amber-600" />
              Молитва перед иконой
            </span>
            <Icon name={showPrayer ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400" />
          </button>

          {showPrayer && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
              <p className="text-sm text-amber-900 leading-relaxed italic">{todayIcon.prayer}</p>
            </div>
          )}

          <a
            href={todayIcon.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Подробнее: {todayIcon.source}
          </a>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-amber-200" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Почитаемые иконы</span>
        <div className="h-px flex-1 bg-amber-200" />
      </div>

      <div className="space-y-2">
        {ICONS_DATA.filter(ic => ic.name !== todayIcon.name).map((icon, i) => (
          <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <img src={icon.image} alt={icon.name} className="w-12 h-14 rounded-lg object-cover shrink-0 border border-amber-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">{icon.name}</p>
                  <p className="text-[10px] text-amber-600 font-medium">Празднование: {icon.feast}</p>
                  <p className="text-xs text-amber-700/70 mt-1 line-clamp-2">{icon.description}</p>
                  <a
                    href={icon.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1.5"
                  >
                    <Icon name="ExternalLink" size={10} />
                    {icon.source}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
