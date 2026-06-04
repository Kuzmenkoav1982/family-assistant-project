import { NASHA_SEMYA_LOGO } from '@/lib/assets';
import PsbCardImg from './PsbCardImg';

export default function Slide01() {
  return (
    <section
      id="slide-1"
      data-pdf-slide
      data-slide-title="Детская карта + цифровая среда развития"
      className="scroll-mt-20 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
        {/* Left */}
        <div className="flex-1">
          <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-200 mb-6">
            Предложение к рассмотрению
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
            Детская карта +<br />цифровая среда<br />развития
          </h1>
          <p className="text-base sm:text-xl text-indigo-100 leading-relaxed mb-8 max-w-xl">
            Совместный продукт банка и платформы «Наша семья» для Ярославской области
          </p>
          <div className="text-sm text-indigo-300 border-t border-white/10 pt-5 mt-5">
            Предложение к рассмотрению · 2026
          </div>
        </div>

        {/* Right — три слоя продукта */}
        <div className="flex flex-col gap-4 lg:w-64">
          {/* Карта ПСБ */}
          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <PsbCardImg className="w-14 h-9 shadow-md" />
            <div>
              <div className="font-semibold text-white text-sm">Карта ПСБ</div>
              <div className="text-indigo-200 text-xs mt-0.5">Финансовый инструмент для ребёнка</div>
            </div>
          </div>

          {/* Наша семья */}
          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <img src={NASHA_SEMYA_LOGO} alt="Наша Семья" className="w-9 h-9 shrink-0 rounded-xl object-cover" />
            <div>
              <div className="font-semibold text-white text-sm">Наша семья</div>
              <div className="text-indigo-200 text-xs mt-0.5">Платформа семейного развития</div>
            </div>
          </div>

          {/* Развитие */}
          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
            <span className="text-3xl shrink-0">🌱</span>
            <div>
              <div className="font-semibold text-white text-sm">Развитие ребёнка</div>
              <div className="text-indigo-200 text-xs mt-0.5">Навыки, привычки, контент</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
