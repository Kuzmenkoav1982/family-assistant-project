import Icon from '@/components/ui/icon';

export default function SlideCSI01Cover() {
  return (
    <section
      id="csi-1"
      data-pdf-slide
      data-slide-title="Семейная история продолжается дома"
      className="scroll-mt-20 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-stone-900 relative overflow-hidden border border-amber-900/10"
    >
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-orange-200/25 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-6 text-amber-800 text-xs sm:text-sm uppercase tracking-[0.2em]">
          <Icon name="BookOpen" size={16} />
          Рабочая концепция для обсуждения
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-4">
          Семейная история продолжается дома
        </h1>

        <p className="text-base sm:text-xl text-stone-700 leading-relaxed mb-6 max-w-2xl">
          «Наша Семья» × Центр семейной истории: рабочая концепция цифрового
          продолжения музейных и просветительских программ
        </p>

        <div className="bg-white/60 border border-amber-900/10 rounded-xl px-5 py-4 mb-8 max-w-2xl">
          <p className="text-sm sm:text-base text-stone-800 leading-relaxed">
            Центр помогает человеку начать исследование.
            <br />
            «Наша Семья» помогает продолжить его вместе с родственниками.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900 bg-amber-100/80 border border-amber-800/20 rounded-full px-4 py-2 w-fit">
          <Icon name="AlertCircle" size={14} className="shrink-0" />
          Рабочая концепция для обсуждения. Партнёрство не согласовано.
        </div>
      </div>
    </section>
  );
}
