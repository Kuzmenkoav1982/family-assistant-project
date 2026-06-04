import SlideFrame from "./SlideFrame";

// ─── Данные ───────────────────────────────────────────────────────────────────

const BLOCKS = [
  {
    id: "nav",
    emoji: "🚪",
    title: "Входы / навигация",
    color: "bg-slate-50 border-slate-200",
    badge: "bg-slate-200 text-slate-700",
    events: [
      {
        name: "kids_safety_block_open",
        desc: "Открыт блок «Что делать, если…»",
        props: [],
      },
      {
        name: "kids_region_open",
        desc: "Открыт раздел «Мой край»",
        props: [],
      },
    ],
  },
  {
    id: "safety",
    emoji: "🆘",
    title: "Safety-действия",
    color: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    events: [
      { name: "kids_safety_call_112", desc: "Нажата кнопка вызова 112", props: [] },
      { name: "kids_safety_call_101", desc: "Нажата кнопка вызова 101 (пожарные)", props: [] },
      { name: "kids_safety_call_102", desc: "Нажата кнопка вызова 102 (полиция)", props: [] },
      { name: "kids_safety_call_103", desc: "Нажата кнопка вызова 103 (скорая)", props: [] },
      { name: "kids_safety_mchs_click", desc: "Переход на сайт МЧС России", props: [] },
      { name: "kids_safety_antiscam_click", desc: "Вход в anti-scam (kids mode)", props: [] },
    ],
  },
  {
    id: "tests",
    emoji: "🧠",
    title: "Safety tests",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    events: [
      {
        name: "kids_safety_tests_open",
        desc: "Открыт экран тестов",
        props: ["age_group", "age_group_source"],
      },
      {
        name: "kids_safety_age_group_selected",
        desc: "Возрастная группа выбрана вручную",
        props: ["age_group", "age_group_source"],
      },
      {
        name: "kids_safety_test_start",
        desc: "Начато прохождение теста",
        props: ["test_id", "age_group", "age_group_source"],
      },
      {
        name: "kids_safety_test_finish",
        desc: "Тест завершён",
        props: ["test_id", "score", "age_group", "age_group_source"],
      },
      {
        name: "kids_safety_level_reached",
        desc: "Зафиксирован уровень знаний",
        props: ["test_id", "level", "age_group", "age_group_source"],
      },
    ],
  },
  {
    id: "region",
    emoji: "🗺️",
    title: "Региональный модуль",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    events: [
      { name: "kids_region_facts_open", desc: "Открыт раздел «Факты»", props: [] },
      { name: "kids_region_quiz_start", desc: "Запущен квиз по региону", props: [] },
      {
        name: "kids_region_quiz_finish",
        desc: "Квиз завершён",
        props: ["score"],
      },
      {
        name: "kids_region_best_score",
        desc: "Обновлён лучший результат квиза",
        props: ["score", "level"],
      },
    ],
  },
];

const TOTAL = BLOCKS.reduce((sum, b) => sum + b.events.length, 0);

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function SlideAppF() {
  return (
    <SlideFrame
      id="slide-app-f"
      eyebrow="Приложение F — Детский модуль"
      title="Событийная аналитика"
      subtitle={`${TOTAL} события, покрывающих 4 пользовательских контура детского модуля`}
    >
      {/* Сетка блоков */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {BLOCKS.map(block => (
          <div key={block.id} className={`rounded-2xl border p-4 flex flex-col gap-2.5 ${block.color}`}>
            {/* Заголовок блока */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{block.emoji}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${block.badge}`}>
                {block.title}
              </span>
              <span className="ml-auto text-[10px] text-slate-400 font-medium">
                {block.events.length} {block.events.length === 1 ? "событие" : block.events.length < 5 ? "события" : "событий"}
              </span>
            </div>

            {/* Список событий */}
            <div className="flex flex-col gap-1.5">
              {block.events.map(ev => (
                <div key={ev.name} className="flex flex-col gap-0.5">
                  <div className="flex items-start gap-2">
                    <code className="text-[11px] font-mono font-semibold text-slate-700 bg-white/70 px-1.5 py-0.5 rounded border border-white/80 leading-tight shrink-0">
                      {ev.name}
                    </code>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug pl-0.5">{ev.desc}</p>
                  {ev.props.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-0.5 mt-0.5">
                      {ev.props.map(p => (
                        <span key={p} className="text-[10px] bg-white/80 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Props legend */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden mb-4">
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Ключевые параметры событий</span>
          <span className="text-[10px] text-slate-400">передаются в props</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {[
            { key: "age_group", val: '"7_10" | "11_15"', note: "Возрастная группа" },
            { key: "age_group_source", val: '"manual" | "profile" | "fallback"', note: "Источник группы" },
            { key: "test_id", val: '"fire" | "scam" | "internet" | "lost"', note: "Идентификатор теста" },
            { key: "score", val: "0 – 100", note: "Результат в процентах" },
          ].map(p => (
            <div key={p.key} className="px-3 py-2.5 flex flex-col gap-0.5">
              <code className="text-[11px] font-mono font-bold text-violet-700">{p.key}</code>
              <span className="text-[10px] text-slate-400 font-mono leading-snug">{p.val}</span>
              <span className="text-[10px] text-slate-500 leading-snug">{p.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — честные ограничения */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 items-start">
        <span className="text-base shrink-0 mt-0.5">⚠️</span>
        <p className="text-[12px] text-amber-800 leading-relaxed">
          <span className="font-bold">Ограничение demo/web-среды:</span>{" "}
          <code className="text-[11px] font-mono">tel:</code>-ссылки зависят от устройства и ОС.
          Аналитика фиксирует факт пользовательского клика, а не успешный исходящий звонок.
          На мобильном устройстве вызов инициируется корректно; на desktop — открывается системный диалог.
        </p>
      </div>
    </SlideFrame>
  );
}
