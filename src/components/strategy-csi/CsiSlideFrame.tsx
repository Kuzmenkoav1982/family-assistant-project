import { ReactNode } from 'react';

interface CsiSlideFrameProps {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'default' | 'accent' | 'dark';
  footnote?: string;
}

// Тёплый архивно-музейный визуальный язык: бумага, охра, сепия —
// сознательно НЕ банковская палитра indigo/purple из strategy-v21.
const toneStyles = {
  default: 'bg-[#fdfbf7] border border-amber-900/10',
  accent: 'bg-gradient-to-br from-amber-50 via-[#fdfbf7] to-orange-50/60 border border-amber-800/15',
  dark: 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white border border-stone-800',
};

export default function CsiSlideFrame({
  id,
  title,
  eyebrow,
  subtitle,
  children,
  tone = 'default',
  footnote,
}: CsiSlideFrameProps) {
  const isDark = tone === 'dark';
  return (
    <section
      id={id}
      data-pdf-slide
      data-slide-title={title}
      className={`scroll-mt-20 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-10 md:p-14 mb-6 sm:mb-8 ${toneStyles[tone]}`}
    >
      {eyebrow && (
        <div
          className={`text-xs sm:text-sm uppercase tracking-wider mb-4 font-medium ${
            isDark ? 'text-amber-300' : 'text-amber-800'
          }`}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4 ${
          isDark ? 'text-white' : 'text-stone-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-3xl ${
            isDark ? 'text-amber-100' : 'text-stone-600'
          }`}
        >
          {subtitle}
        </p>
      )}
      <div className={isDark ? 'text-stone-100' : 'text-stone-800'}>{children}</div>
      {footnote && (
        <p
          className={`text-xs sm:text-sm mt-6 pt-4 border-t ${
            isDark ? 'text-stone-400 border-stone-700' : 'text-stone-400 border-amber-900/10'
          }`}
        >
          {footnote}
        </p>
      )}
    </section>
  );
}
