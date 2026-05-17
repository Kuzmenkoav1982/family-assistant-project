import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const touchpoints = [
  {
    icon: 'Home' as const,
    title: 'ЖКХ как семейный расход',
    text: 'Признак нагрузки → релевантное предложение банка',
  },
  {
    icon: 'HandCoins' as const,
    title: 'Меры поддержки и льготы',
    text: 'Сценарии оформления и сопровождения → банковские продукты вокруг',
  },
  {
    icon: 'Target' as const,
    title: 'Семейные цели',
    text: 'Долгосрочные цели семьи → финансовые сервисы под них',
  },
  {
    icon: 'CalendarClock' as const,
    title: 'Документы и сроки',
    text: 'Контекст семейного цикла → точный момент предложения',
  },
];

export default function Proof04Bank() {
  return (
    <ProofSlideFrame
      id="proof-4"
      code="Д4"
      title="Где здесь банк"
      subtitle="Банковский сценарий встраивается в уже созревший семейный маршрут, а не размещается баннером"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {touchpoints.map((t, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-5 flex gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Icon name={t.icon} size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {t.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Главное:</span>{' '}
          контекстный канал дистрибуции и удержания семьи — не вместо банка, а
          поверх семейного слоя.
        </p>
      </div>
    </ProofSlideFrame>
  );
}
