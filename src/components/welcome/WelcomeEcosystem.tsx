import { useState } from 'react';
import Icon from '@/components/ui/icon';

const hubs = [
  {
    name: 'Семья',
    icon: 'Users',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    sections: ['Профили семьи', 'Семейное древо', 'Дети', 'Семейный маячок'],
  },
  {
    name: 'Здоровье',
    icon: 'Heart',
    color: 'from-red-500 to-pink-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    sections: ['Здоровье семьи', 'Медкарты', 'Прививки', 'Запись к врачу'],
  },
  {
    name: 'Питание',
    icon: 'Apple',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    sections: ['Питание', 'ИИ-Диета', 'Готовые режимы', 'Рецепт из продуктов', 'Счётчик БЖУ', 'Меню на неделю', 'Рецепты'],
  },
  {
    name: 'Ценности',
    icon: 'Sparkles',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    sections: ['Ценности', 'Вера', 'Традиции', 'Мудрость народа', 'Правила дома'],
  },
  {
    name: 'Планирование',
    icon: 'Calendar',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    sections: ['Цели', 'Задачи', 'Календарь', 'План покупок', 'Аналитика'],
  },
  {
    name: 'Финансы',
    icon: 'Wallet',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    sections: ['Финансовый пульс', 'Бюджет', 'Кэш-флоу', 'Счета и карты', 'Кредиты и долги', 'Цели', 'Финграмотность', 'Имущество', 'Скидочные карты', 'Антимошенник'],
  },
  {
    name: 'Быт',
    icon: 'Home',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    sections: ['Покупки', 'Голосования', 'Гараж'],
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
    sections: ['Развитие', 'Психолог ИИ', 'Мастерская жизни'],
  },
  {
    name: 'Семейный код',
    icon: 'KeyRound',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    sections: ['Личный код', 'Код пары', 'Код семьи', 'Ритуалы примирения', 'Детский код', 'Имя для малыша', 'Астрология', 'Зеркало родителя'],
  },
  {
    name: 'Питомцы',
    icon: 'PawPrint',
    color: 'from-lime-500 to-green-500',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    sections: ['Питомцы', 'ИИ-ветеринар', 'Вакцинация', 'Визиты', 'Лекарства', 'Груминг', 'Активность', 'Фотоальбом'],
  },
  {
    name: 'Госуслуги',
    icon: 'Landmark',
    color: 'from-teal-600 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    sections: ['Что такое семья', 'Семейный кодекс РФ', 'Господдержка', 'Семейная политика', 'Новости'],
  },
];

const totalSections = hubs.reduce((sum, h) => sum + h.sections.length, 0);

function pluralize(n: number) {
  if (n === 1) return 'раздел';
  if (n < 5) return 'раздела';
  return 'разделов';
}

export default function WelcomeEcosystem() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon name="LayoutGrid" size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              12 хабов — экосистема семьи
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-0.5">
              {totalSections}+ разделов в едином пространстве
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">Нажмите на хаб, чтобы посмотреть, что внутри</p>

        {/* Hub list — accordion */}
        <div className="space-y-3">
          {hubs.map((hub, i) => {
            const isOpen = active === i;
            return (
              <div
                key={hub.name}
                className={`rounded-2xl border-2 transition-all overflow-hidden ${
                  isOpen ? `${hub.bg} ${hub.border}` : 'bg-white border-gray-100'
                }`}
              >
                <button
                  onClick={() => setActive(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <Icon name={hub.icon} size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base truncate">{hub.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {hub.sections.length} {pluralize(hub.sections.length)}
                    </div>
                  </div>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {hub.sections.map((section) => (
                        <span
                          key={section}
                          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-gray-700 font-medium"
                        >
                          <Icon name="Check" size={12} className="text-green-600 flex-shrink-0" />
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
