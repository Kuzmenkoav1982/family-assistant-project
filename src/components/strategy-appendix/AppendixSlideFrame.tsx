import { ReactNode } from 'react';

interface AppendixSlideFrameProps {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footnote?: string;
}

export default function AppendixSlideFrame({
  id,
  code,
  title,
  subtitle,
  children,
  footnote,
}: AppendixSlideFrameProps) {
  return (
    <section
      id={id}
      data-pdf-slide
      data-slide-title={title}
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl p-6 sm:p-9 mb-5"
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 tabular-nums">
          {code}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          Внутренний резерв
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-1.5">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6 max-w-4xl">
          {subtitle}
        </p>
      )}
      <div className="text-slate-800 text-sm sm:text-[15px] leading-relaxed">
        {children}
      </div>
      {footnote && (
        <p className="text-xs text-slate-400 mt-5 pt-4 border-t border-slate-100">
          {footnote}
        </p>
      )}
    </section>
  );
}
