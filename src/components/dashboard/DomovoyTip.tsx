import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Hub } from './types';

const DOMOVOY_IMG = 'https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png';

interface Props {
  hubs: Hub[];
  overall: number;
}

export default function DomovoyTip({ hubs, overall }: Props) {
  const [hidden, setHidden] = useState(false);

  const tip = useMemo(() => {
    if (overall === 0) {
      return { emoji: '👋', text: 'Привет! Давай вместе наполним семейный дашборд. Начни с любого хаба!' };
    }
    if (overall === 100) {
      return { emoji: '🏆', text: 'Невероятно! Все хабы заполнены. Ты настоящий хранитель семьи!' };
    }

    const almostDone = hubs
      .filter((h) => h.progress >= 60 && h.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0];

    if (almostDone) {
      const left = 100 - almostDone.progress;
      return {
        emoji: '🎯',
        text: `Заверши «${almostDone.title}» — осталось всего ${left}% до 100%!`,
      };
    }

    const empty = hubs.find((h) => h.progress === 0);
    if (empty) {
      return {
        emoji: '✨',
        text: `Загляни в «${empty.title}» — там ещё ничего не настроено`,
      };
    }

    const lowest = [...hubs].sort((a, b) => a.progress - b.progress)[0];
    return {
      emoji: '💪',
      text: `Подтяни «${lowest.title}» — там пока только ${lowest.progress}%`,
    };
  }, [hubs, overall]);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full bg-white shadow-lg ring-2 ring-orange-200 overflow-hidden hover:scale-110 transition-transform"
        aria-label="Подсказка"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${DOMOVOY_IMG})`,
            backgroundSize: '130%',
            backgroundPosition: '50% 18%',
          }}
        />
      </button>
    );
  }

  return (
    <div className="relative mb-3 animate-fade-in">
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 border border-orange-200/60 shadow-[0_4px_20px_-6px_rgba(251,146,60,0.3)]">
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full bg-white ring-2 ring-orange-200 overflow-hidden"
            style={{
              backgroundImage: `url(${DOMOVOY_IMG})`,
              backgroundSize: '130%',
              backgroundPosition: '50% 18%',
            }}
          />
          <span className="absolute -top-1 -right-1 text-base animate-bounce-gentle">
            {tip.emoji}
          </span>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">
            Домовёнок советует
          </div>
          <div className="text-[13px] text-slate-700 leading-snug">{tip.text}</div>
        </div>
        <button
          onClick={() => setHidden(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-600 flex-shrink-0"
          aria-label="Скрыть"
        >
          <Icon name="X" size={14} />
        </button>
      </div>
      <style>{`
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-gentle {
          animation: bounceGentle 2s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
