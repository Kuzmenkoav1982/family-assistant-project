import { STRATEGY_SECTIONS } from './sections';

interface AnchorNavProps {
  activeId?: string;
}

// Якоря для верхней навигации (без титула и без слайдов 9/12 — только ключевые точки).
const NAV_IDS = [
  'slide-2',
  'slide-3',
  'slide-4',
  'slide-5',
  'slide-6',
  'slide-7',
  'slide-8',
  'slide-10',
  'slide-11',
  'slide-13',
];

// Подменяем длинный лейбл «Следующий шаг» на «Следующий» — он подрезался на узких ширинах.
const LABEL_OVERRIDES: Record<string, string> = {
  'slide-13': 'Следующий',
};

const items = NAV_IDS.map((id) => {
  const s = STRATEGY_SECTIONS.find((x) => x.id === id);
  return { id, label: LABEL_OVERRIDES[id] ?? s?.short ?? id };
});

export default function AnchorNav({ activeId }: AnchorNavProps) {
  return (
    <div
      data-strategy-nav
      className="sticky top-14 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6 relative"
    >
      <div
        className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pr-6"
        style={{ scrollPaddingRight: '1.5rem' }}
      >
        {items.map((it) => {
          const isActive = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`shrink-0 whitespace-nowrap text-[11px] sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
      {/* лёгкий fade-out справа — подсказывает, что есть прокрутка */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white/85 to-transparent"
      />
    </div>
  );
}