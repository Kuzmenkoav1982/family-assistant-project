import SlideFrame from './SlideFrame';

const inMVP = [
  { icon: '👶', label: 'Профиль ребёнка', note: 'Имя, возраст, кружки, занятия' },
  { icon: '🎯', label: 'Цели и копилки', note: 'До 5 целей на семью, прогресс' },
  { icon: '📊', label: 'Финансовый контроль', note: 'Расходы, лимиты, уведомления' },
  { icon: '🛡️', label: 'Антифрод-блок', note: '7 карточек безопасности для детей' },
  { icon: '📚', label: 'Финансовая грамотность', note: '8 мини-уроков, возраст 6–14 лет' },
  { icon: '🗺️', label: 'Семейные маршруты', note: '12 маршрутов по Ярославской области' },
  { icon: '📸', label: 'Воспоминания о поездке', note: 'Фото + заметки → семейный альбом' },
  { icon: '🏆', label: 'Достижения ребёнка', note: 'Бейджи, дипломы, маленькие победы' },
  { icon: '🔔', label: 'Онбординг и уведомления', note: 'Push, email, регулярные напоминания' },
  { icon: '📈', label: 'Дашборд для банка', note: 'KPI, активации, retention, NPS' },
];

const notInMVP = [
  { icon: '📖', label: 'Библиотека / Альпина', note: 'Этап 2 — партнёрская интеграция' },
  { icon: '🌳', label: 'Семейное древо (полное)', note: 'Упрощённый вариант — MVP, полный — этап 2' },
  { icon: '🏥', label: 'Здоровье и питание', note: 'Не в рамках банковского пилота' },
  { icon: '🏠', label: 'Умный дом и быт', note: 'Экосистемный модуль, не детская карта' },
  { icon: '🔗', label: 'Real-time транзакции', note: 'Требует deep API-интеграции с банком' },
  { icon: '⚙️', label: 'Управление лимитами из нашего UI', note: 'Остаётся в банковском приложении' },
];

export default function Slide17() {
  return (
    <SlideFrame
      id="slide-17"
      eyebrow="17. Пилотный scope"
      title="Что входит в MVP пилота, а что — нет"
      subtitle="Чёткие границы помогают запустить быстро и без лишних рисков"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">✓</span>
            <span className="font-bold text-slate-800 text-sm">Входит в MVP · Этап 1</span>
            <span className="ml-auto text-xs text-slate-400">6–8 недель</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {inMVP.map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <span className="font-semibold text-sm text-slate-800">{item.label}</span>
                  <span className="text-xs text-slate-500 ml-2">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold shrink-0">→</span>
            <span className="font-bold text-slate-800 text-sm">Не входит в MVP · Этап 2+</span>
            <span className="ml-auto text-xs text-slate-400">после пилота</span>
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            {notInMVP.map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <span className="text-base shrink-0 mt-0.5 opacity-50">{item.icon}</span>
                <div>
                  <span className="font-semibold text-sm text-slate-500">{item.label}</span>
                  <span className="text-xs text-slate-400 ml-2">{item.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-indigo-800 mb-1">Почему это правильная стратегия</p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Узкий чёткий MVP запускается за 6–8 недель, легко согласуется юридически
              и даёт банку измеримый результат уже через 3 месяца пилота.
              Расширение — только после подтверждения гипотезы данными.
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
