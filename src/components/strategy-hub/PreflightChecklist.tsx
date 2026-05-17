import Icon from '@/components/ui/icon';

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
  {
    title: 'Тон разговора',
    body: (
      <>
        Не «продажа платформы». Рамка: встраивание, формат взаимодействия,
        семейный цифровой слой, системный игрок. Для госбанка — стратегически
        уместно.
      </>
    ),
  },
  {
    title: 'Маршрут по материалам — если разговор меняется',
    body: (
      <ul className="space-y-1 text-slate-700">
        <li>
          основной проход →{' '}
          <span className="font-mono text-indigo-700">/strategy?mode=meeting</span>
        </li>
        <li>
          «покажите, что уже собрано» →{' '}
          <span className="font-mono text-indigo-700">/strategy/proof</span>
        </li>
        <li>
          архитектура / данные / ИБ / пилот →{' '}
          <span className="font-mono text-indigo-700">/strategy/appendix</span>
        </li>
        <li>
          старый образный контур →{' '}
          <span className="font-mono text-indigo-700">/strategy-legacy</span>
        </li>
      </ul>
    ),
  },
];

const dontSay = [
  'Мы хотим продать платформу банку',
  'Это семейный суперапп',
  'Данные уже можно передавать как угодно',
  'Правильный вариант — только стратегическая интеграция',
  'Это просто социальная тема',
];

const doSay = [
  'Обсуждаем формат встраивания в контур банка',
  'Это семейный цифровой слой и сценарный контур',
  'Вопрос пользовательских данных рассматривается отдельно',
  'Есть три формата взаимодействия',
  'Для госбанка это сочетание социальной значимости, клиентского контекста и стратегической уместности',
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
          <div className="text-[11px] text-slate-400 tabular-nums">7 пунктов</div>
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

      {/* Не говорить · Говорить */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-rose-700 font-semibold mb-3">
            <Icon name="X" size={12} />
            Не говорить
          </div>
          <ul className="space-y-1.5">
            {dontSay.map((s, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 leading-snug flex gap-2"
              >
                <span className="text-rose-400 shrink-0">—</span>
                <span>«{s}»</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-700 font-semibold mb-3">
            <Icon name="Check" size={12} />
            Говорить
          </div>
          <ul className="space-y-1.5">
            {doSay.map((s, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 leading-snug flex gap-2"
              >
                <span className="text-emerald-500 shrink-0">—</span>
                <span>«{s}»</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
