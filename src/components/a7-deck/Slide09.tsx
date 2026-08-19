import Icon from '@/components/ui/icon';

const scenarios = ['Обучение ребёнка за рубежом', 'Лечение', 'Покупка недвижимости или авто', 'Оплата зарубежного счёта', 'Поддержка родственников', 'Аренда жилья', 'Путешествия', 'Товары и услуги по инвойсу'];

const process = [
  { icon: 'Target', text: 'Цель платежа' },
  { icon: 'User', text: 'Ответственный член семьи' },
  { icon: 'Calendar', text: 'Срок' },
  { icon: 'Banknote', text: 'Сумма' },
  { icon: 'Folder', text: 'Комплект документов' },
  { icon: 'FileText', text: 'Счёт или инвойс' },
  { icon: 'Activity', text: 'Статус операции' },
  { icon: 'Bell', text: 'Напоминания' },
  { icon: 'Archive', text: 'Семейный архив операции' },
];

const interests = ['Новый поток розничных клиентов', 'Снижение числа незавершённых заявок', 'Более качественно подготовленные обращения', 'Повторные обращения', 'Понимание жизненных сценариев спроса'];

export default function Slide09() {
  return (
    <section
      id="slide-9"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-blue-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 text-white font-black text-sm shrink-0">2</div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 shrink-0">
          <Icon name="Globe" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Международные семейные платежи</h2>
          <p className="text-sm text-gray-500 mt-0.5">Реальное, но не главное направление</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Сценарии физических лиц, с которыми уже работает А7</p>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800">{s}</span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Не кнопка «перевести», а семейный процесс
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {process.map((p) => (
            <div key={p.text} className="flex flex-col items-center text-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Icon name={p.icon} size={16} className="text-blue-600" />
              <p className="text-[10px] text-gray-700 font-medium leading-tight">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Интерес А7</p>
          <ul className="space-y-1">
            {interests.map((i) => (
              <li key={i} className="text-xs text-emerald-900 flex items-start gap-1.5">
                <Icon name="ArrowRight" size={12} className="mt-0.5 shrink-0" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <Icon name="Info" size={13} /> Условия комиссии
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            Публично упоминалась комиссия около 0,5% для физических лиц — точные условия необходимо
            перепроверить непосредственно перед презентацией и переговорами.
          </p>
        </div>
      </div>
    </section>
  );
}
