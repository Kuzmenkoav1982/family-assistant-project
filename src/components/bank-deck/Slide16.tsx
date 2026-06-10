import SlideFrame from './SlideFrame';

export default function Slide16() {
  return (
    <SlideFrame
      id="slide-16"
      eyebrow="16. Модель подключения"
      title="Что такое одно подключение"
      tone="accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Левый блок — определение */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">👨‍👩‍👧</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-0.5">Расчётная единица</div>
              <div className="text-xl font-bold text-slate-900">1 подключение = 1 семья</div>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Один аккаунт семьи с неограниченным числом членов: родители, дети, бабушки, дедушки. Доплата за каждого члена отсутствует.
          </p>
          <div className="bg-indigo-50 rounded-xl px-4 py-3 text-sm text-indigo-800 font-medium">
            Среднее число членов в семье на платформе — <span className="font-bold">1,5 чел.</span>, потенциал роста до 3–4
          </div>
        </div>

        {/* Правый блок — что входит */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Что входит в подключение</div>
          <ul className="space-y-2.5">
            {[
              { icon: '📅', text: 'Семейный календарь и задачи' },
              { icon: '💊', text: 'Здоровье: лекарства, прививки, врачи' },
              { icon: '💰', text: 'Финансы: бюджет, цели, покупки' },
              { icon: '🌍', text: 'Путешествия, питание, досуг' },
              { icon: '📸', text: 'Семейный альбом и воспоминания' },
              { icon: '🤖', text: 'ИИ-ассистент «Домовой» (базовые запросы)' },
              { icon: '📲', text: 'Push-уведомления, геозоны, трекер' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-sm text-slate-700">
                <span className="text-base shrink-0">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Период */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 text-white rounded-2xl px-6 py-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Базовый период</div>
          <div className="text-3xl font-bold text-white mb-1">12 месяцев</div>
          <p className="text-sm text-slate-300">Рекомендуемый формат для банка — годовой контракт. Обеспечивает предсказуемый бюджет и максимальную вовлечённость семьи.</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-2xl px-6 py-5">
          <div className="text-xs uppercase tracking-wider text-indigo-300 mb-2">Пилотный период</div>
          <div className="text-3xl font-bold text-white mb-1">3–6 месяцев</div>
          <p className="text-sm text-indigo-100">Тестовый формат. Минимальный объём — <strong>500 активированных семей</strong>. Повышенная стоимость покрывает запуск и сопровождение.</p>
        </div>
      </div>

      {/* Пилот: два варианта */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Варианты пилотного запуска</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-1">Вариант А — стандартный</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Объём: от <strong>500 семей</strong></li>
              <li>• Цена: <strong>350 ₽/мес</strong> за активированную семью</li>
              <li>• Период: 3–6 месяцев</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-1">Вариант Б — малый запуск</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Объём: от <strong>100 семей</strong></li>
              <li>• Разовый запуск/внедрение: <strong>от 150 000 ₽</strong></li>
              <li>• Цена: <strong>350 ₽/мес</strong> за активированную семью</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        * Расчёт основан на фактических метриках действующей системы и сценарных допущениях по масштабированию.
        Итоговые условия фиксируются в договоре по согласованному объёму подключений.
      </p>
    </SlideFrame>
  );
}