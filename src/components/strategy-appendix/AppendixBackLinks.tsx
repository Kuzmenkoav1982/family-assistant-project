import Icon from '@/components/ui/icon';

export default function AppendixBackLinks() {
  return (
    <section className="no-print mb-5">
      <div className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
            После резервного блока
          </div>
          <p className="text-sm text-slate-700 leading-snug max-w-2xl">
            Резерв собран для уточняющих вопросов. Дальше предлагаю вернуться
            либо к доказательной логике, либо к основному стратегическому
            тезису.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href="/strategy/proof"
            className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium px-4 py-2.5 rounded-lg text-sm transition"
          >
            <Icon name="ArrowLeft" size={16} />
            К доказательной логике
          </a>
          <a
            href="/strategy#slide-13"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition"
          >
            <Icon name="ArrowLeft" size={16} />
            К стратегической логике
          </a>
        </div>
      </div>
    </section>
  );
}
