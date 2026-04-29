import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const hubs = [
  {
    id: 1, icon: 'Wallet', color: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    title: 'Финансы', emoji: '💰',
    sections: ['Бюджет и учёт расходов', 'Счета и карты', 'Долги и кредиты', 'Финансовые цели', 'Антимошенник', 'Кошелёк / СБП', 'Аналитика трат'],
  },
  {
    id: 2, icon: 'Heart', color: 'bg-red-500', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    title: 'Здоровье', emoji: '🏥',
    sections: ['Медицинские карты', 'Прививки и анализы', 'Запись к врачу', 'Симптом-чекер', 'Аптечка', 'ИИ-диета', 'Телемедицина'],
  },
  {
    id: 3, icon: 'Apple', color: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
    title: 'Питание', emoji: '🍽️',
    sections: ['Рецепты (бабушкины)', 'Меню на неделю', 'Список покупок', 'AI-рецепты из продуктов', 'Нутрициология', 'Доставка продуктов'],
  },
  {
    id: 4, icon: 'GraduationCap', color: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
    title: 'Развитие детей', emoji: '🎓',
    sections: ['AI-план развития', 'Трекер навыков', 'Оценки и успеваемость', 'Кружки и секции', 'AI-психолог', 'Конфликт-AI', 'Геймификация'],
  },
  {
    id: 5, icon: 'Calendar', color: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700',
    title: 'Планирование', emoji: '📅',
    sections: ['Семейный календарь', 'Задачи и поручения', 'Напоминания', 'Список дел', 'Совместное планирование', 'Регулярные задачи'],
  },
  {
    id: 6, icon: 'MapPin', color: 'bg-cyan-500', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700',
    title: 'Путешествия', emoji: '✈️',
    sections: ['AI-маршруты', 'AI-идеи для праздников', 'Документы семьи', 'Пакинг-лист', 'Расходы в поездке', 'Отзывы и фото'],
  },
  {
    id: 7, icon: 'Home', color: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    title: 'Быт и дом', emoji: '🏠',
    sections: ['Список покупок', 'Домашние задачи', 'Ремонт и сервис', 'Счётчики и ЖКХ', 'Хранение вещей', 'Умный дом'],
  },
  {
    id: 8, icon: 'Car', color: 'bg-slate-600', light: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700',
    title: 'Гараж', emoji: '🚗',
    sections: ['Техобслуживание', 'ОСАГО/КАСКО', 'Расходы на авто', 'Документы', 'Топливо', 'Страховые случаи'],
  },
  {
    id: 9, icon: 'PawPrint', color: 'bg-lime-600', light: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700',
    title: 'Питомцы', emoji: '🐾',
    sections: ['Карточка питомца', 'Ветеринар и прививки', 'AI-ветеринар', 'Расходы', 'Питание питомца', 'Страхование питомцев'],
  },
  {
    id: 10, icon: 'FileText', color: 'bg-teal-600', light: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700',
    title: 'Госуслуги', emoji: '🏛️',
    sections: ['Господдержка и льготы', 'Маткапитал', 'Льготная ипотека', 'Документы и справки', 'Запись в госорганы', 'Налоговые вычеты'],
  },
  {
    id: 11, icon: 'Sparkles', color: 'bg-pink-500', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700',
    title: 'Семейный код', emoji: '✨',
    sections: ['Личный код', 'Код пары', 'Код семьи', 'Ритуалы примирения', 'Детский код', 'Имя для малыша', 'Астрология', 'Зеркало родителя (тест PARI)'],
  },
  {
    id: 12, icon: 'Users', color: 'bg-violet-500', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700',
    title: 'Управление семьёй', emoji: '👨‍👩‍👧‍👦',
    sections: ['Профили членов семьи', 'Роли и права доступа', 'Семейные соглашения', 'Вовлечённость поколений', 'Геолокация семьи'],
  },
  {
    id: 13, icon: 'Plug', color: 'bg-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700',
    title: 'Интеграции', emoji: '🔌',
    sections: ['Яндекс Алиса (голос)', 'MAX-мессенджер бот', 'СБП-платежи', 'Яндекс Карты', 'Push-уведомления', 'Экспорт ICS/PDF/XLSX'],
  },
  {
    id: 14, icon: 'Shield', color: 'bg-green-600', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-700',
    title: 'Безопасность', emoji: '🛡️',
    sections: ['Семейный VPN', 'Контроль экранного времени', 'Детский режим', 'Защита от мошенников', 'Аудит-логи'],
  },
  {
    id: 15, icon: 'Bot', color: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700',
    title: 'AI-Домовой', emoji: '🤖',
    sections: ['Контекстный ассистент', 'Голосовые команды', 'Персональные советы', 'Автоматизация задач', 'Отчёты по семье', 'Предсказания и тренды'],
  },
];

export function SlideHubs() {
  const [openId, setOpenId] = useState<number | null>(1);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>;
      setPrintMode(!!ce.detail?.active);
    };
    window.addEventListener('presentation:print-mode', handler);
    return () => window.removeEventListener('presentation:print-mode', handler);
  }, []);

  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-purple-600">
          <Icon name="LayoutGrid" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">15 хабов — единая семейная экосистема</h2>
          <p className="text-sm text-gray-500 mt-0.5">Каждый хаб — полноценный блок из 5–7 разделов, связанных между собой</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {hubs.map((hub) => (
          <div key={hub.id} className={`rounded-2xl border ${hub.border} overflow-hidden transition-all`}>
            <button
              className={`w-full flex items-center justify-between px-4 py-3 text-left ${printMode || openId === hub.id ? hub.light : 'bg-white hover:bg-gray-50'} transition-colors`}
              onClick={() => setOpenId(openId === hub.id ? null : hub.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${hub.color} flex-shrink-0`}>
                  <Icon name={hub.icon} size={16} className="text-white" />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  {hub.emoji} {hub.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hub.light} ${hub.text}`}>
                  {hub.sections.length} разделов
                </span>
              </div>
              <Icon
                name={printMode || openId === hub.id ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                className="text-gray-400 flex-shrink-0"
              />
            </button>

            {(printMode || openId === hub.id) && (
              <div className={`px-4 pb-4 pt-2 ${hub.light}`}>
                <div className="flex flex-wrap gap-2">
                  {hub.sections.map((section, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border ${hub.border} ${hub.text} shadow-sm`}
                    >
                      <Icon name="Check" size={11} className={hub.text} />
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-2xl font-bold text-orange-600">15</p>
          <p className="text-xs text-gray-500">хабов</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">90+</p>
          <p className="text-xs text-gray-500">разделов</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-600">1</p>
          <p className="text-xs text-gray-500">платформа</p>
        </div>
      </div>
    </section>
  );
}