import { STRATEGY_SECTIONS } from './sections';

interface AnchorNavProps {
  activeId?: string;
}

// Те же якоря, что и раньше (без титула и без слайдов 9/12 — в навигацию вынесены только ключевые).
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

const items = NAV_IDS.map((id) => {
  const s = STRATEGY_SECTIONS.find((x) => x.id === id);
  return { id, label: s?.short ?? id };
});

export default function AnchorNav({ activeId }: AnchorNavProps) {
  return (
    <div
      data-strategy-nav
      className="sticky top-14 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6"
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((it) => {
          const isActive = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`shrink-0 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition ${
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
    </div>
  );
}
