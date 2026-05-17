import { useEffect, useState } from 'react';

interface AnchorItem {
  id: string;
  label: string;
}

const items: AnchorItem[] = [
  { id: 'slide-2', label: 'Сейчас' },
  { id: 'slide-3', label: 'Проблема' },
  { id: 'slide-4', label: 'Семейный ID' },
  { id: 'slide-5', label: 'Ценность банку' },
  { id: 'slide-6', label: 'Платформа' },
  { id: 'slide-7', label: 'Домовой' },
  { id: 'slide-8', label: 'Готовность' },
  { id: 'slide-10', label: 'Контроль' },
  { id: 'slide-11', label: 'Форматы' },
  { id: 'slide-13', label: 'Следующий шаг' },
];

export default function AnchorNav() {
  const [active, setActive] = useState<string>('slide-2');

  useEffect(() => {
    const handleScroll = () => {
      const offset = 200;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActive(items[i].id);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-14 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((it) => {
          const isActive = active === it.id;
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
