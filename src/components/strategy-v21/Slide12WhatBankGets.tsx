import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const pilot = [
  'Новый канал дистрибуции',
  'Проверяемый сценарий работы с семьёй',
  'Первые измеримые показатели за 3–6 месяцев',
  'База для решения о следующем формате',
];

const deep = [
  'Готовая платформа',
  'Семейная продуктовая логика',
  'Семейная модель данных',
  'Слой оркестрации на базе ИИ',
  'Банковские сценарии',
  'Уже собранная основа для быстрого запуска',
  'Существенно меньший риск реализации',
  'Команда и сопровождение перехода',
];

export default function Slide12WhatBankGets() {
  return (
    <SlideFrame
      id="slide-12"
      eyebrow="Что получает банк"
      title="Что получает банк в каждом из форматов"
      subtitle="Иными словами, это способ ускоренно занять позицию в семейном клиентском слое без длинного цикла сборки с нуля"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Icon name="Rocket" size={20} className="text-emerald-700" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
                В пилоте
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Проверяемый канал и сценарий
              </h3>
            </div>
          </div>
          <ul className="space-y-2.5">
            {pilot.map((p, i) => (
              <li
                key={i}
                className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 text-sm text-slate-800 leading-snug"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-indigo-200 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Icon name="Building2" size={20} className="text-indigo-700" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                В случае глубокой интеграции
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Контроль над семейным слоем
              </h3>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-1.5">
            {deep.map((d, i) => (
              <li
                key={i}
                className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 text-sm text-slate-800 leading-snug"
              >
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}
