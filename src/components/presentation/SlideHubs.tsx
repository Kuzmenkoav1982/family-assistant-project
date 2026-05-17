import Icon from '@/components/ui/icon';

const hubs = [
  {
    name: 'Семья',
    icon: 'Users',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    sections: [
      'Профили семьи',
      'Семейное древо',
      'Дорога жизни',
      'Альбом поколений',
      'Дети',
      'Семейный маячок',
      'Чат семьи',
    ],
  },
  {
    name: 'Здоровье',
    icon: 'Heart',
    color: 'from-red-500 to-pink-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    sections: ['Здоровье семьи'],
  },
  {
    name: 'Питание',
    icon: 'Apple',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    sections: [
      'Питание',
      'ИИ-Диета',
      'Готовые режимы',
      'Рецепт из продуктов',
      'Счётчик БЖУ',
      'Меню на неделю',
      'Рецепты',
    ],
  },
  {
    name: 'Ценности',
    icon: 'Sparkles',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    sections: [
      'Ценности',
      'Вера',
      'Традиции',
      'Мудрость народа',
      'Правила дома',
    ],
  },
  {
    name: 'Планирование',
    icon: 'Calendar',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    sections: [
      'Цели',
      'Задачи',
      'Календарь',
      'План покупок',
      'Аналитика',
    ],
  },
  {
    name: 'Финансы',
    icon: 'Wallet',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    sections: [
      'Финансовый пульс',
      'Стратегия погашения',
      'Кэш-флоу прогноз',
      'Бюджет',
      'Счета и карты',
      'Кредиты и долги',
      'Финансовые цели',
      'Финграмотность',
      'Имущество',
      'Скидочные карты',
      'Антимошенник',
      'Кошелёк сервиса',
    ],
  },
  {
    name: 'Дом и быт',
    icon: 'Home',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    sections: ['Покупки', 'Голосования', 'Транспорт', 'Дом'],
  },
  {
    name: 'Путешествия',
    icon: 'Plane',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    sections: ['Путешествия', 'Досуг', 'Праздники'],
  },
  {
    name: 'Развитие',
    icon: 'GraduationCap',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    sections: ['Портфолио развития', 'Мастерская жизни', 'Психолог ИИ', 'ИИ-план развития'],
  },
  {
    name: 'Семейный код',
    icon: 'KeyRound',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    sections: [
      'Личный код',
      'Код пары',
      'Код семьи',
      'Ритуалы примирения',
      'Детский код',
      'Имя для малыша',
      'Астрология',
      'Зеркало родителя',
    ],
  },
  {
    name: 'Питомцы',
    icon: 'PawPrint',
    color: 'from-lime-500 to-green-500',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    sections: [
      'Питомцы',
      'ИИ-ветеринар',
      'Вакцинация',
      'Визиты к ветеринару',
      'Лекарства',
      'Питание',
      'Груминг',
      'Активность',
      'Расходы',
      'Показатели здоровья',
      'Вещи и игрушки',
      'Фото питомца',
    ],
  },
  {
    name: 'Госуслуги',
    icon: 'Landmark',
    color: 'from-teal-600 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    sections: [
      'Навигатор мер поддержки',
      'Что такое семья',
      'Семейный кодекс РФ',
      'Господдержка семей',
      'Семейная политика',
      'Новости и инициативы',
    ],
  },
];

const totalSections = hubs.reduce((sum, h) => sum + h.sections.length, 0);

export function SlideHubs() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 md:p-12 text-white">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Icon name="LayoutGrid" size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              {hubs.length} хабов — единая семейная экосистема
            </h2>
            <p className="text-base md:text-lg text-white/90 mt-2">
              {totalSections} разделов, связанных в единую логику жизни семьи
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-4">
        {hubs.map((hub) => (
          <div
            key={hub.name}
            className={`${hub.bg} ${hub.border} border-2 rounded-2xl p-5 md:p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <Icon name={hub.icon} size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                  {hub.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {hub.sections.length}{' '}
                  {hub.sections.length === 1
                    ? 'раздел'
                    : hub.sections.length < 5
                    ? 'раздела'
                    : 'разделов'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {hub.sections.map((section) => (
                <span
                  key={section}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs md:text-sm text-gray-700 font-medium"
                >
                  <Icon
                    name="Check"
                    size={12}
                    className="text-green-600 flex-shrink-0"
                  />
                  <span className="truncate max-w-[200px]">{section}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SlideHubs;