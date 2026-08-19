import { NASHA_SEMYA_LOGO } from '@/lib/assets';
import Icon from '@/components/ui/icon';

export default function Slide01() {
  return (
    <section
      id="slide-1"
      data-pdf-slide
      data-slide-title="А7 × Наша семья"
      className="scroll-mt-20 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #f97316 130%)' }}
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
        <div className="flex-1">
          <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-200 mb-6">
            Предложение о стратегическом партнёрстве
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
            А7 × Наша семья:<br />цифровая финансовая<br />среда российской семьи
          </h1>
          <p className="text-base sm:text-xl text-slate-200 leading-relaxed mb-8 max-w-xl">
            Не витрина продаж, а инвестиция в семейный цифровой фронт-офис — вход в финансовую жизнь
            человека раньше, чем возникает конкретная операция
          </p>
          <div className="text-sm text-slate-300 border-t border-white/10 pt-5 mt-5">
            Предложение к рассмотрению · 2026
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-64">
          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-14 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
              <span className="text-slate-900 font-black text-sm tracking-tight">A7</span>
            </div>
            <div>
              <div className="font-semibold text-white text-sm">А7</div>
              <div className="text-slate-300 text-xs mt-0.5">Международные расчёты и финансовая инфраструктура</div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <img src={NASHA_SEMYA_LOGO} alt="Наша семья" className="w-9 h-9 shrink-0 rounded-xl object-cover" />
            <div>
              <div className="font-semibold text-white text-sm">Наша семья</div>
              <div className="text-slate-300 text-xs mt-0.5">Семейный цифровой фронт-офис</div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <Icon name="Handshake" size={28} className="text-orange-300 shrink-0" />
            <div>
              <div className="font-semibold text-white text-sm">Партнёрство</div>
              <div className="text-slate-300 text-xs mt-0.5">Пилот → инвестиция → инфраструктура</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
