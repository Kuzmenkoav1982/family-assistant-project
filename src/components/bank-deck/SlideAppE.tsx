import SlideFrame from './SlideFrame';

// ─── Карта экранов детского контура ──────────────────────────────────────────

const SCREENS = [
  {
    id: 'cabinet',
    emoji: '🏠',
    title: 'Кабинет ребёнка',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    status: 'Demo-ready',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      'Онбординг «С чего начать» (первый вход)',
      'Блок «Мой прогресс» с возвратом к сценарию',
      '«Коплю на...»: цель, сумма, прогресс, достижение',
      'Мой рост (занятия, навыки)',
      'Шаги недели',
      'Достижения',
    ],
  },
  {
    id: 'safety',
    emoji: '🛡️',
    title: 'Безопасность',
    color: 'bg-rose-50 border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    status: 'Demo-ready',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      '112 — единый экстренный',
      '101 / 102 / 103',
      'МЧС (внешняя ссылка)',
      'Вход в Anti-Scam (kids)',
      'Блок тестов',
    ],
  },
  {
    id: 'tests',
    emoji: '🧠',
    title: 'Safety-тесты',
    color: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    status: 'Demo-ready',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      '🔥 Пожар и ЧС (4 вопроса)',
      '📵 Мошенники (4 вопроса)',
      '🌐 Интернет (4 вопроса)',
      '🗺️ Если потерялся (4 вопроса)',
      'Статус каждого теста (Начать / Пройден)',
      'Общий прогресс: X из 4 + уровень знаний',
    ],
  },
  {
    id: 'antiscam',
    emoji: '🔒',
    title: 'Anti-Scam (kids mode)',
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    status: 'Demo-ready',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      'Intro-экран: 5 правил',
      'Понятный язык для детей',
      'Переход в полный раздел',
      'Вход: /anti-scam?mode=kids',
    ],
  },
  {
    id: 'region',
    emoji: '🐻',
    title: 'Мой край — Ярославль',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    status: 'Demo-ready',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      '8 фактов о регионе',
      'Квиз — 10 вопросов',
      '4 уровня: Путешественник → Эксперт',
      '5 идей семейного досуга',
      'Лучший счёт в localStorage',
    ],
  },
  {
    id: 'analytics',
    emoji: '📊',
    title: 'Событийная аналитика',
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    status: 'Работает',
    statusColor: 'bg-emerald-100 text-emerald-700',
    children: [
      'safety_block_open',
      'safety_mchs_click / antiscam_click',
      'safety_call_112 / 101 / 102 / 103',
      'safety_test_start / finish / level (+ age_group)',
      'safety_age_group_selected',
      'region_open / facts / quiz / best_score',
    ],
  },
];

// ─── Таблица честного статуса ─────────────────────────────────────────────────

const HONEST_TABLE = [
  { item: 'Весь контент — статически заданный', note: 'Не требует backend. Быстро работает, легко обновлять.' },
  { item: 'Прогресс хранится в браузере', note: 'Без серверного профиля — не синхронизируется между устройствами.' },
  { item: 'tel: ссылки работают на mobile', note: 'На desktop откроется диалог выбора приложения (нормально).' },
  { item: 'Аналитика идёт в собственный трекер', note: '17 событий подключены, включая age_group_selected. Видно что, когда и какая возрастная группа открывает.' },
  { item: 'Возрастная адаптация реализована (7–10 / 11–15)', note: 'Разные вопросы, примеры, объяснения. Выбор сохраняется, прогресс хранится раздельно.' },
  { item: 'Банковский контур не подключён', note: 'Реальные транзакции и лимиты — на стороне банка, не входят в MVP пилота.' },
];

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function SlideAppE() {
  return (
    <SlideFrame
      id="slide-app-e"
      eyebrow="Приложение E — Детский модуль"
      title="Раздел «Дети» — текущий статус (as-is)"
      subtitle="Полная карта экранов, возможностей и ограничений по состоянию на июнь 2026"
    >
      {/* Карта экранов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {SCREENS.map(s => (
          <div key={s.id} className={`rounded-2xl border p-4 flex flex-col gap-2 ${s.color}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.title}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${s.statusColor}`}>
                {s.status}
              </span>
            </div>
            <ul className="flex flex-col gap-1 mt-1">
              {s.children.map(c => (
                <li key={c} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                  <span className="text-slate-400 mt-0.5 shrink-0">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Честный статус */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-sm font-bold text-white">Ограничения и технические детали текущей версии</span>
        </div>
        {HONEST_TABLE.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_1fr] items-start border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
          >
            <div className="px-4 py-2.5 text-sm text-slate-800 font-medium leading-snug">{row.item}</div>
            <div className="px-4 py-2.5 text-xs text-slate-500 leading-relaxed border-l border-slate-100">{row.note}</div>
          </div>
        ))}
      </div>

      {/* Executive summary */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Готово к демонстрации</p>
          <p className="text-sm text-emerald-800 leading-snug">6 экранов готовы к показу без оговорок</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Следующий шаг</p>
          <p className="text-sm text-amber-800 leading-snug">Интеграция входа из банковского приложения</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Не входит в MVP пилота</p>
          <p className="text-sm text-slate-700 leading-snug">Серверная синхронизация прогресса, банковский транзакционный контур, геймифицированная экосистема</p>
        </div>
      </div>
    </SlideFrame>
  );
}