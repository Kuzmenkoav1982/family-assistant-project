import Icon from '@/components/ui/icon';

const notCompetitor = ['А7', 'ПСБ', 'Брокерское приложение', 'Платёжный кабинет', 'Страховую компанию'];

const weDo = [
  { icon: 'MessageSquare', text: 'Помогает семье сформулировать задачу' },
  { icon: 'Users', text: 'Организует совместное решение' },
  { icon: 'FileCheck', text: 'Собирает необходимые документы и действия' },
  { icon: 'Target', text: 'В нужный момент предлагает продукт А7 или партнёра' },
  { icon: 'ArrowRightLeft', text: 'Передаёт пользователя в регулируемый контур' },
  { icon: 'RotateCcw', text: 'Возвращает результат в семейный сценарий' },
];

export default function Slide05() {
  return (
    <section
      id="slide-5"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 shrink-0">
          <Icon name="Layers" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Позиционирование: надфинансовый семейный слой</h2>
          <p className="text-sm text-gray-500 mt-0.5">Это важно правильно объяснить А7 с самого начала</p>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl p-4 border border-red-100 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
          <Icon name="XCircle" size={13} /> Мы НЕ предлагаем заменить
        </p>
        <div className="flex flex-wrap gap-2">
          {notCompetitor.map((n) => (
            <span key={n} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-red-200 text-red-800">{n}</span>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
          <Icon name="CheckCircle2" size={13} /> Мы предлагаем стать надфинансовым семейным слоем, который
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {weDo.map((w) => (
            <div key={w.text} className="flex items-center gap-2.5 bg-white/70 rounded-xl p-2.5">
              <Icon name={w.icon} size={16} className="text-emerald-700 shrink-0" />
              <p className="text-xs text-emerald-900 font-medium">{w.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Не так</p>
          <p className="text-sm text-gray-700">«Купить вексель»</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1.5">А так</p>
          <p className="text-xs text-indigo-900 leading-relaxed">
            Семья формирует цель «образование ребёнка через 5 лет» → рассчитывает сумму → выбирает горизонт и риск →
            получает регулируемые предложения → оформляет продукт в контуре А7/партнёра → отслеживает цель в «Нашей семье»
          </p>
        </div>
      </div>
    </section>
  );
}
