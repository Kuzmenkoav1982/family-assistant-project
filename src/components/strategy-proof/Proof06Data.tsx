import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const entities = [
  { icon: 'Users' as const, label: 'Семья и её участники' },
  { icon: 'Baby' as const, label: 'Дети и зависимые члены' },
  { icon: 'Calendar' as const, label: 'События и даты' },
  { icon: 'FileText' as const, label: 'Документы' },
  { icon: 'ListChecks' as const, label: 'Задачи и сроки' },
  { icon: 'HandCoins' as const, label: 'Меры поддержки' },
  { icon: 'Wallet' as const, label: 'Семейные расходы' },
  { icon: 'Target' as const, label: 'Цели и планирование' },
];

const principles = [
  'Семейный ID как ключ доступа',
  'Роли внутри семьи и явные согласия',
  'Разделение личного и семейного контура',
  'Минимально необходимый объём доступа',
  'Журналирование действий и изменений',
];

export default function Proof06Data() {
  return (
    <ProofSlideFrame
      id="proof-6"
      code="Д6"
      title="Семейная модель данных"
      subtitle="151 таблица в модели данных. Семейный ID связывает участников, события, документы, расходы и задачи."
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Сущности
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {entities.map((e, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-3"
              >
                <Icon name={e.icon} size={16} className="text-slate-500 shrink-0" />
                <span className="text-sm text-slate-800">{e.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Принципы доступа
          </div>
          <ul className="space-y-2">
            {principles.map((p, i) => (
              <li
                key={i}
                className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ProofSlideFrame>
  );
}
