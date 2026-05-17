import Icon from '@/components/ui/icon';

export default function Slide01Title() {
  return (
    <section
      id="slide-1"
      data-pdf-slide
      data-slide-title="Наша Семья"
      className="scroll-mt-20 bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-6 text-indigo-200 text-xs sm:text-sm uppercase tracking-[0.2em]">
          <Icon name="Sparkles" size={16} />
          Стратегическая презентация для банка
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6">
          Наша Семья
        </h1>

        <p className="text-lg sm:text-2xl text-indigo-100 leading-relaxed mb-8 max-w-3xl">
          Семейная операционная система — единый цифровой слой для поддержки,
          развития семьи и встроенной дистрибуции сервисов партнёров
        </p>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <a
            href="#slide-5"
            className="bg-white/15 hover:bg-white/25 transition backdrop-blur rounded-xl px-4 py-2 text-sm font-medium border border-white/20 inline-flex items-center gap-2"
          >
            Почему это важно банку
            <Icon name="ArrowRight" size={14} />
          </a>
          <a
            href="#slide-10"
            className="bg-white/10 hover:bg-white/20 transition backdrop-blur rounded-xl px-4 py-2 text-sm font-medium border border-white/15 inline-flex items-center gap-2"
          >
            Стратегическая логика
            <Icon name="ArrowRight" size={14} />
          </a>
          <a
            href="#slide-13"
            className="bg-white/10 hover:bg-white/20 transition backdrop-blur rounded-xl px-4 py-2 text-sm font-medium border border-white/15 inline-flex items-center gap-2"
          >
            Следующий шаг
            <Icon name="ArrowRight" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
