import Icon from '@/components/ui/icon';

const surroundings = [
  { icon: 'Users' as const, label: 'Общие расходы' },
  { icon: 'CreditCard' as const, label: 'Совместные счета' },
  { icon: 'Fingerprint' as const, label: 'Единый ID для банков' },
  { icon: 'ShoppingBag' as const, label: 'Единый ID для маркетплейсов' },
];

const tezisy = [
  'Семья принимает значимую часть решений не как отдельные люди, а как единый контур',
  'Банку нужен не только взгляд на отдельного человека, но и семейный слой',
  'Семейный контекст открывает новые сценарии удержания и дистрибуции',
];

export default function Slide04FamilyId() {
  return (
    <section
      id="slide-4"
      data-pdf-slide
      data-slide-title="Семья как единый клиент — Семейный ID"
      className="scroll-mt-20 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-200 mb-4">
          Центральный тезис встречи
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-8 max-w-4xl">
          Семья как единый клиент —{' '}
          <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            Семейный ID
          </span>
        </h2>

        <blockquote className="border-l-4 border-amber-300 pl-5 sm:pl-7 py-2 mb-10 max-w-4xl">
          <p className="text-lg sm:text-2xl leading-relaxed text-white font-medium">
            «Единый цифровой профиль семьи открывает новое качество клиентского
            опыта: общие расходы, совместные счета, единый ID для банков и
            маркетплейсов.»
          </p>
        </blockquote>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {surroundings.map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur rounded-xl px-4 py-4 border border-white/20 text-center"
            >
              <Icon name={item.icon} size={22} className="mx-auto mb-2 text-amber-300" />
              <div className="text-xs sm:text-sm font-medium text-white">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl">
          {tezisy.map((text, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5"
            >
              <div className="text-amber-300 text-xs font-bold mb-2">
                {String(i + 1).padStart(2, '0')}
              </div>
              <p className="text-sm sm:text-base text-indigo-50 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
