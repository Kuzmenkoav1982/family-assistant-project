import AppendixSlideFrame from './AppendixSlideFrame';

const formats = [
  {
    title: 'Пилот / совместный запуск',
    plug: 'Стартовые сценарии: меры поддержки, ЖКХ → банковский продукт',
    keep: 'Платформа, продуктовая логика, оркестрация, сопровождение',
    bank: 'Куратор, точки входа, релевантные предложения',
    integ: 'Минимально необходимая, под двумя брендами',
    org: 'Рабочая группа на стороне розницы',
  },
  {
    title: 'Глубокое стратегическое партнёрство',
    plug: 'Согласованные точки входа и расширенный набор сценариев',
    keep: 'Развитие платформы и сценариев совместно с банком',
    bank: 'Эксклюзивный трек, расширение под задачи розницы',
    integ: 'Более плотная интеграция в контур партнёра',
    org: 'Совместная продуктовая команда',
  },
  {
    title: 'Стратегическая интеграция в контур банка',
    plug: 'Платформа становится частью розничного контура',
    keep: 'Передача знаний и сопровождение перехода',
    bank: 'Контроль над семейным клиентским слоем',
    integ: 'Глубокая, под контуром банка',
    org: 'Внутренние команды банка + сопровождение со стороны',
  },
];

export default function Apx4Formats() {
  return (
    <AppendixSlideFrame
      id="apx-4"
      code="А4"
      title="Форматы взаимодействия с банком"
      subtitle="Три формата — разные уровни глубины встраивания, а не разные продукты. Выбор уровня — за банком."
    >
      <div className="space-y-3">
        {formats.map((f, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 tabular-nums">
                Формат {i + 1}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {f.title}
              </h3>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
              <Row label="Что подключается" text={f.plug} />
              <Row label="Что остаётся с нашей стороны" text={f.keep} />
              <Row label="Что даёт банк" text={f.bank} />
              <Row label="Уровень интеграции" text={f.integ} />
              <Row label="Орг. контур" text={f.org} />
            </dl>
          </div>
        ))}
      </div>
    </AppendixSlideFrame>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 leading-snug">{text}</dd>
    </div>
  );
}
