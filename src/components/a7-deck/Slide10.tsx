import Icon from '@/components/ui/icon';

const needs = ['Цифровой поток клиентов', 'Предварительная квалификация обращений', 'Запись', 'Сбор документов', 'Продолжение отношений после визита', 'Повторные продажи', 'Сопровождение между посещениями'];

const flow = [
  { num: '1', text: 'Семья формирует задачу в приложении' },
  { num: '2', text: 'Платформа определяет подходящий маршрут' },
  { num: '3', text: 'Пользователь получает перечень документов' },
  { num: '4', text: 'Записывается в офис А7 или начинает онлайн' },
  { num: '5', text: 'После визита документы и сроки сохраняются в семейном контуре' },
  { num: '6', text: 'Приложение напоминает о следующем действии' },
  { num: '7', text: 'А7 получает повторный контакт без новой покупки рекламы' },
];

export default function Slide10() {
  return (
    <section
      id="slide-10"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-orange-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-600 text-white font-black text-sm shrink-0">3</div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 shrink-0">
          <Icon name="Building2" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Цифровой канал для сети «А7 Финансы»</h2>
          <p className="text-sm text-gray-500 mt-0.5">А7 планирует до 1 000 финансовых супермаркетов — офисам нужен цифровой спутник</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Что потребуется масштабируемой сети офисов</p>
        <div className="flex flex-wrap gap-2">
          {needs.map((n) => (
            <span key={n} className="text-xs font-medium px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800">{n}</span>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Возможный сценарий</p>
        <div className="space-y-2">
          {flow.map((f) => (
            <div key={f.num} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {f.num}
              </div>
              <p className="text-xs text-gray-700 font-medium">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-5 text-center">
        <p className="text-white font-bold text-sm sm:text-base">
          Гораздо сильнее, чем фраза «у нас есть аудитория, давайте показывать ей баннер»
        </p>
      </div>
    </section>
  );
}
