import Icon from '@/components/ui/icon';

const beforeSteps = [
  { icon: 'Search', text: 'Ищет способ оплатить обучение за рубежом' },
  { icon: 'HelpCircle', text: 'Не понимает, какой инструмент подойдёт' },
  { icon: 'Building2', text: 'Едет в офис или звонит наугад' },
  { icon: 'FileWarning', text: 'Собирает документы без чёткого списка' },
  { icon: 'Clock', text: 'Транзакция происходит один раз, контакт теряется' },
];

const afterSteps = [
  { icon: 'Target', text: 'Семья создаёт цель «обучение ребёнка за рубежом»' },
  { icon: 'FileCheck', text: 'Платформа собирает счёт, документы, дедлайн оплаты' },
  { icon: 'ArrowRightLeft', text: 'Получает предложение провести платёж через А7' },
  { icon: 'Eye', text: 'Контролирует статус операции в приложении' },
  { icon: 'Archive', text: 'Сохраняет подтверждение оплаты в семейном архиве' },
];

function StepList({ items, tone }: { items: typeof beforeSteps; tone: 'slate' | 'emerald' }) {
  const isEmerald = tone === 'emerald';
  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div
          key={s.text}
          className={`flex items-center gap-3 p-3 rounded-xl border ${
            isEmerald ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            isEmerald ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
          }`}>
            {i + 1}
          </div>
          <Icon name={s.icon} size={15} className={isEmerald ? 'text-emerald-700' : 'text-slate-500'} />
          <p className={`text-xs font-medium leading-snug ${isEmerald ? 'text-emerald-900' : 'text-gray-600'}`}>{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function Slide06() {
  return (
    <section
      id="slide-6"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 shrink-0">
          <Icon name="GitCompare" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Было / стало — на примере оплаты обучения ребёнка</h2>
          <p className="text-sm text-gray-500 mt-0.5">Разница принципиальна: не кнопка перевода, а вход в жизненный сценарий</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Сегодня, без «Нашей семьи»</p>
          <StepList items={beforeSteps} tone="slate" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">С «Нашей семьёй»</p>
          <StepList items={afterSteps} tone="emerald" />
        </div>
      </div>

      <div className="mt-5 bg-gradient-to-r from-slate-800 to-orange-700 rounded-2xl p-5 text-center">
        <p className="text-white font-bold text-sm sm:text-base">
          Мы продаём А7 не рекламное место, а вход в жизненный цикл потребности
        </p>
      </div>
    </section>
  );
}
