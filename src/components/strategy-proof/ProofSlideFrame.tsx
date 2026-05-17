import { ReactNode } from 'react';

interface ProofSlideFrameProps {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footnote?: string;
}

export default function ProofSlideFrame({
  id,
  code,
  title,
  subtitle,
  children,
  footnote,
}: ProofSlideFrameProps) {
  return (
    <section
      id={id}
      data-pdf-slide
      data-slide-title={title}
      className="scroll-mt-20 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-10 md:p-12 mb-6 sm:mb-8"
    >
      <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 tabular-nums">
          {code}
        </span>
        <span className="text-xs uppercase tracking-wider text-slate-500">
          Доказательная продуктовая логика
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2 sm:mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8 max-w-4xl">
          {subtitle}
        </p>
      )}
      <div className="text-slate-800">{children}</div>
      {footnote && (
        <p className="text-xs sm:text-sm text-slate-400 mt-6 pt-4 border-t border-slate-100">
          {footnote}
        </p>
      )}
    </section>
  );
}
