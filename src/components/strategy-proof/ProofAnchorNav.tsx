import { useEffect, useState } from 'react';
import { PROOF_SECTIONS } from './proofSections';

export default function ProofAnchorNav() {
  const [active, setActive] = useState<string>(PROOF_SECTIONS[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 200;
      for (let i = PROOF_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(PROOF_SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActive(PROOF_SECTIONS[i].id);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      data-strategy-nav
      className="sticky top-14 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6"
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {PROOF_SECTIONS.map((it) => {
          const isActive = active === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`shrink-0 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {it.short}
            </a>
          );
        })}
      </div>
    </div>
  );
}
