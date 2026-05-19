interface PreflightItem {
  title: string;
  body: React.ReactNode;
}

const items: PreflightItem[] = [
  {
    title: 'Стартовый маршрут',
    body: (
      <>
        Открывать первым:{' '}
        <a
          href="/strategy?mode=meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-indigo-700 hover:underline"
        >
          /strategy?mode=meeting
        </a>
        . Проверить: стрелки, Esc, активный экран, якорь.
      </>
    ),
  },
  {
    title: 'Главная формулировка',
    body: (
      <>
        Звучит дословно:{' '}
        <span className="font-semibold text-slate-900">
          «Семья как единый клиент — Семейный ID»
        </span>
        . Без «семейный аккаунт», «общий профиль семьи», «единый семейный
        кабинет».
      </>
    ),
  },
  {
    title: 'Цифры платформы',
    body: (
      <>
        Везде одинаково:{' '}
        <span className="font-mono text-slate-900">12 / 146 / 90 / 151</span> ·
        закрытое тестирование запущено.
      </>
    ),
  },
  {
    title: 'Домовой — 5 сценариев в утверждённой формулировке',
    body: (
      <ol className="list-decimal pl-5 space-y-0.5 text-slate-700 marker:text-slate-400">
        <li>Навигация по мерам поддержки и льготам</li>
        <li>Жизненная ситуация → маршрут действий</li>
        <li>Семейный план, цели и напоминания</li>
        <li>Документы, сроки и задачи семьи</li>
        <li>Переход к релевантным партнёрским сервисам, включая банковские</li>
      </ol>
    ),
  },
  {
    title: 'Форматы взаимодействия — только эти 3, без переименований',
    body: (
      <ul className="space-y-0.5 text-slate-700">
        <li>— Пилот / совместный запуск</li>
        <li>— Глубокое стратегическое партнёрство</li>
        <li>— Стратегическая интеграция в контур банка</li>
      </ul>
    ),
  },
];



export default function PreflightChecklist() {
  return (
    <>
      {/* Preflight · 7 пунктов */}
      <section className="mb-4 border border-slate-200 rounded-xl bg-white p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">
            Preflight · 60 секунд перед встречей
          </div>
          <div className="text-[11px] text-slate-400 tabular-nums">5 пунктов</div>
        </div>

        <ol className="space-y-2.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="text-slate-400 tabular-nums w-5 shrink-0 pt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-0.5">
                  {it.title}
                </div>
                <div className="text-slate-700">{it.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>


    </>
  );
}