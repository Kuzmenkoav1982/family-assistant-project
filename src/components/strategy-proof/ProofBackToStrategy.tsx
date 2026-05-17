import Icon from '@/components/ui/icon';

export default function ProofBackToStrategy() {
  return (
    <section className="no-print mb-6 sm:mb-8">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            После доказательного блока
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Вернуться к стратегической логике
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Доказательная часть — материал для углубления. Дальше предлагаю
            продолжить разговор от стратегического тезиса.
          </p>
        </div>
        <a
          href="/strategy#slide-13"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition shrink-0"
        >
          <Icon name="ArrowLeft" size={18} />
          К стратегической логике
        </a>
      </div>
    </section>
  );
}
