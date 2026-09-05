import Icon from '@/components/ui/icon';

const CSI_LOGO_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/5a2d382f-2406-4676-abfb-6e92d1fbc421.png';
const NS_LOGO_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/c0fcb6ce-d833-4fce-b2d4-26dda0c44c4b.png';
const RESEARCH_DOC_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/5550d906-0aea-4cd5-83e1-fbeac8979ad1.docx';

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

        <div className="flex items-center justify-center gap-5 sm:gap-8 mb-8">
          <img
            src={CSI_LOGO_URL}
            alt="Центр семейной истории"
            className="h-12 sm:h-16 w-auto"
          />
          <span className="text-2xl sm:text-3xl text-stone-400 font-light">×</span>
          <img src={NS_LOGO_URL} alt="Наша Семья" className="h-14 sm:h-20 w-auto" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-4 text-center">
          Семейная история продолжается дома
        </h1>

        <p className="text-base sm:text-xl text-stone-700 leading-relaxed mb-6 max-w-2xl mx-auto text-center">
          Центр семейной истории × «Наша Семья»: рабочая концепция цифрового
          продолжения музейных и просветительских программ
        </p>

        <div className="bg-white/60 border border-amber-900/10 rounded-xl px-5 py-4 mb-8 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-stone-800 leading-relaxed text-center">
            Центр помогает человеку начать исследование.
            <br />
            «Наша Семья» помогает продолжить его вместе с родственниками.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900 bg-amber-100/80 border border-amber-800/20 rounded-full px-4 py-2 w-fit mx-auto">
          <Icon name="AlertCircle" size={14} className="shrink-0" />
          Рабочая концепция для обсуждения. Партнёрство не согласовано.
        </div>

        <div className="no-print flex flex-wrap items-center justify-center gap-3 mt-5">
          <a
            href={RESEARCH_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-white bg-amber-800 hover:bg-amber-900 shadow-md rounded-full px-5 py-2.5 transition"
          >
            <Icon name="FileText" size={16} className="shrink-0" />
            Исследовательская работа
            <Icon name="ExternalLink" size={13} className="text-amber-200 shrink-0" />
          </a>
          <a
            href="/strategy-legacy?ops=1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-white bg-amber-800 hover:bg-amber-900 shadow-md rounded-full px-5 py-2.5 transition"
          >
            <Icon name="Landmark" size={16} className="shrink-0" />
            Презентация о гос. рамке
            <Icon name="ExternalLink" size={13} className="text-amber-200 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}