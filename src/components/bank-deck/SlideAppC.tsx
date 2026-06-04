import SlideFrame from './SlideFrame';

type Status = 'ready' | 'partial' | 'mvp' | 'stage2' | 'no';

interface FeatureRow {
  feature: string;
  status: Status;
  pilotUse: boolean;
  comment: string;
}

const features: FeatureRow[] = [
  { feature: 'Профиль ребёнка', status: 'ready', pilotUse: true, comment: 'Имя, возраст, аватар, личное пространство' },
  { feature: 'Кабинет ребёнка (главный экран)', status: 'ready', pilotUse: true, comment: 'Мастер-экран с персонализированным контентом' },
  { feature: 'Цели / Мечты', status: 'ready', pilotUse: true, comment: 'Постановка целей, прогресс, копилка мечты' },
  { feature: 'Развитие / «Мой рост»', status: 'ready', pilotUse: true, comment: 'Фиксация занятий, навыков, прогресса' },
  { feature: 'Достижения и бейджи', status: 'ready', pilotUse: true, comment: 'Дипломы, маленькие победы, видимый прогресс' },
  { feature: 'Семейный контекст / корни', status: 'ready', pilotUse: true, comment: 'Связь с родителями, семейные истории' },
  { feature: 'Safe Money (финансовая безопасность)', status: 'partial', pilotUse: true, comment: 'Контентный слой — сценарии безопасного обращения с деньгами' },
  { feature: 'Финансовые цели / «Коплю на...»', status: 'partial', pilotUse: true, comment: 'Логика есть, требует доработки UX для пилота' },
  { feature: 'Онбординг из банкового приложения', status: 'mvp', pilotUse: true, comment: 'Необходимо разработать: webview / deeplink / SSO-lite' },
  { feature: 'Co-brand / белый лейбл', status: 'mvp', pilotUse: true, comment: 'Брендирование под банк: логотип, цвета, entry screens' },
  { feature: 'Событийная аналитика (пилот)', status: 'mvp', pilotUse: true, comment: 'Подключение метрик: входы, активации, цели, возвраты' },
  { feature: 'Реальный банковый контур (лимиты, транзакции)', status: 'no', pilotUse: false, comment: 'Остаётся на стороне банка; в MVP не требуется' },
  { feature: 'Образовательный контент / библиотека (Альпина)', status: 'stage2', pilotUse: false, comment: 'Этап 2 — партнёрская интеграция после старта пилота' },
  { feature: 'Партнёрские предложения / reward-экосистема', status: 'stage2', pilotUse: false, comment: 'Масштабирование после подтверждения пилота' },
];

const STATUS_CONFIG: Record<Status, { label: string; badge: string }> = {
  ready:   { label: 'Есть сейчас',   badge: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Частично',      badge: 'bg-blue-100 text-blue-700' },
  mvp:     { label: 'MVP пилота',    badge: 'bg-indigo-100 text-indigo-700' },
  stage2:  { label: 'Этап 2',        badge: 'bg-amber-100 text-amber-700' },
  no:      { label: 'Не в MVP',      badge: 'bg-slate-100 text-slate-500' },
};

export default function SlideAppC() {
  return (
    <SlideFrame
      id="slide-app-c"
      eyebrow="Приложение C"
      title="Что уже есть в платформе"
      subtitle="Статус функций по состоянию на июнь 2026"
    >
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(STATUS_CONFIG).map(([, cfg]) => (
          <span key={cfg.label} className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_1fr] bg-slate-900 text-white">
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Функция</div>
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-center w-32">Статус</div>
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-center w-24">В пилоте</div>
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Комментарий</div>
        </div>

        {features.map((row, i) => {
          const cfg = STATUS_CONFIG[row.status];
          return (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_auto_auto_1fr] items-start border-t border-slate-100 ${
                i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              <div className="px-4 py-3 text-sm text-slate-800 font-medium leading-snug">{row.feature}</div>
              <div className="px-4 py-3 w-32 flex items-start justify-center pt-3">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="px-4 py-3 w-24 flex items-start justify-center pt-3">
                <span className={`text-base ${row.pilotUse ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {row.pilotUse ? '✓' : '—'}
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-slate-500 leading-relaxed">{row.comment}</div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Внутренний продуктовый аудит. Статусы отражают состояние на момент подготовки материалов.
      </p>
    </SlideFrame>
  );
}
