import { CSI_SECTIONS } from './csiSections';

interface CsiAnchorNavProps {
  activeId?: string;
}

export default function CsiAnchorNav({ activeId }: CsiAnchorNavProps) {
  return (
    <div
      data-strategy-nav
      className="sticky top-14 z-40 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-amber-900/10 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6 relative"
    >
      <div
        className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pr-16 sm:pr-20"
        style={{ scrollPaddingRight: '5rem' }}
      >
        {CSI_SECTIONS.map((it) => {
          const isActive = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`shrink-0 whitespace-nowrap text-[11px] sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition ${
                isActive
                  ? 'bg-amber-800 text-white shadow-sm'
                  : it.appendix
                    ? 'text-amber-700/70 hover:bg-amber-100'
                    : 'text-stone-600 hover:bg-amber-100'
              }`}
            >
              {it.short}
            </a>
          );
        })}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-16 sm:w-20 bg-gradient-to-l from-[#fdfbf7]/95 to-transparent"
      />
    </div>
  );
}