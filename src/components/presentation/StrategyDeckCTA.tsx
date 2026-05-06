import Icon from '@/components/ui/icon';

export function StrategyDeckCTA() {
  return (
    <section className="no-print mb-6 sm:mb-8">
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 text-white text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs uppercase tracking-wider border border-white/20 mb-4">
          <Icon name="Layers" size={14} />
          Дополнительная презентация
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Стратегия и видение до 2036 года
        </h3>
        <p className="text-purple-100 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
          Государственная рамка по Распоряжению № 615-р, архитектура экосистемы,
          печатные карточки модулей и фокус первого этапа — семьи военнослужащих и участников СВО.
        </p>
        <a
          href="/strategy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-lg transition-all hover:scale-105 text-sm sm:text-base"
        >
          Стратегия до 2036 года
          <Icon name="ArrowRight" size={20} />
        </a>
        <p className="text-purple-200 text-xs mt-4 opacity-80">
          Откроется в новой вкладке
        </p>
      </div>
    </section>
  );
}

export default StrategyDeckCTA;
