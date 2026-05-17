import { ReactNode } from 'react';

interface SlideFrameProps {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'default' | 'accent' | 'dark';
  footnote?: string;
}

const toneStyles = {
  default: 'bg-white border border-gray-200',
  accent: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100',
  dark: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800',
};

export default function SlideFrame({
  id,
  title,
  eyebrow,
  subtitle,
  children,
  tone = 'default',
  footnote,
}: SlideFrameProps) {
  const isDark = tone === 'dark';
  return (
    <section
      id={id}
      data-pdf-slide
      data-slide-title={title}
      className={`scroll-mt-20 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 mb-6 sm:mb-8 ${toneStyles[tone]}`}
    >
      {eyebrow && (
        <div
          className={`text-xs sm:text-sm uppercase tracking-wider mb-4 ${
            isDark ? 'text-indigo-300' : 'text-indigo-600'
          }`}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-3xl ${
            isDark ? 'text-indigo-100' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
      <div className={isDark ? 'text-slate-100' : 'text-slate-800'}>{children}</div>
      {footnote && (
        <p
          className={`text-xs sm:text-sm mt-6 pt-4 border-t ${
            isDark
              ? 'text-slate-400 border-slate-700'
              : 'text-slate-400 border-slate-100'
          }`}
        >
          {footnote}
        </p>
      )}
    </section>
  );
}
