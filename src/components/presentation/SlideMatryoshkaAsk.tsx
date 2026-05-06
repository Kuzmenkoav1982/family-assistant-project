import Icon from '@/components/ui/icon';

interface AskRow {
  direction: string;
  built: string;
  toBuild: string;
  result: string;
}

const ROWS: AskRow[] = [
  {
    direction: 'Навигатор мер поддержки',
    built: 'Профиль семьи, кабинет, документы',
    toBuild: 'Модуль support-navigator: матчинг семьи и льгот',
    result: 'MVP + 2 пилотных региона',
  },
  {
    direction: 'Многодетная семья',
    built: 'Дети, бюджет, календарь, задачи',
    toBuild: 'Кабинет 3+: целевые сценарии и KPI',
    result: 'Запуск кабинета многодетной семьи',
  },
  {
    direction: 'Беременность и 1-й год',
    built: 'Здоровье, напоминания, AI-ассистент',
    toBuild: 'Маршрут maternity-journey 0–12 мес',
    result: 'Узкий маршрут беременности и младенца',
  },
  {
    direction: 'Особые жизненные ситуации',
    built: 'Профиль, сопровождение, документы',
    toBuild: 'Семейный кейс-менеджер',
    result: 'Пилот сегмента семей СВО и кризисных ситуаций',
  },
  {
    direction: 'ЗОЖ и питание',
    built: 'Питание, БЖУ, диетолог, программы',
    toBuild: 'Сборка в единый сервис ЗОЖ',
    result: 'Запуск сервиса по 4 факторам риска',
  },
  {
    direction: 'Каналы государства',
    built: 'Web, MAX, Реестр ПО (на рассмотрении)',
    toBuild: 'Госуслуги, Соцказна, региональный API',
    result: '1 регион + 1 партнёрский пилот за 6–12 мес',
  },
];

export function SlideMatryoshkaAsk() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-3">
          <Icon name="Target" size={14} className="text-purple-700" />
          <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
            Инвестиции — на достройку, не на идею
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Что уже есть и что достраиваем
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Каркас платформы построен. Инвестиции идут на завершение прикладных сервисов
          по Стратегии 615-р и выход на каналы государства.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="text-left p-3 border-b-2 border-gray-300 font-bold text-xs uppercase tracking-wide">
                Направление
              </th>
              <th className="text-left p-3 border-b-2 border-emerald-300 font-bold text-xs uppercase tracking-wide text-emerald-800">
                <Icon name="CheckCircle2" size={12} className="inline mr-1" />
                Что уже есть
              </th>
              <th className="text-left p-3 border-b-2 border-amber-300 font-bold text-xs uppercase tracking-wide text-amber-800">
                <Icon name="Hammer" size={12} className="inline mr-1" />
                Достраиваем
              </th>
              <th className="text-left p-3 border-b-2 border-purple-300 font-bold text-xs uppercase tracking-wide text-purple-800">
                <Icon name="Flag" size={12} className="inline mr-1" />
                Результат за 6–12 мес
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50/50 transition">
                <td className="p-3 font-semibold text-gray-900 text-xs sm:text-sm align-top">
                  {row.direction}
                </td>
                <td className="p-3 text-xs text-gray-700 bg-emerald-50/30 align-top">
                  {row.built}
                </td>
                <td className="p-3 text-xs text-gray-700 bg-amber-50/30 align-top">
                  {row.toBuild}
                </td>
                <td className="p-3 text-xs text-gray-700 bg-purple-50/30 align-top">
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200 rounded-xl p-5">
        <p className="text-sm text-gray-800 leading-relaxed">
          <strong className="text-amber-800">Ключевая мысль для инвестора:</strong>{' '}
          ядро платформы и базовая архитектура уже построены. Деньги идут не на «придумать»,
          а на достройку конкретных модулей под государственный заказ Стратегии 615-р
          и выход в каналы государства.
        </p>
      </div>
    </section>
  );
}

export default SlideMatryoshkaAsk;
