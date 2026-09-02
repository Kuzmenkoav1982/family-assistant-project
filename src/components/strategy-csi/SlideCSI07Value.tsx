import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const columns = [
  {
    icon: 'Users' as const,
    title: 'Для семьи',
    items: [
      'понятный первый шаг',
      'вовлечение разных поколений',
      'сохранение историй и связей',
      'продолжение работы после посещения Центра',
      'частный семейный контур',
    ],
  },
  {
    icon: 'Landmark' as const,
    title: 'Для ЦСИ',
    items: [
      'продолжение просветительской программы дома',
      'измеримое вовлечение посетителей',
      'возвращение участников',
      'подготовленные семьи для будущих лабораторий',
      'возможность добровольного пополнения тематических проектов',
    ],
  },
  {
    icon: 'Home' as const,
    title: 'Для «Нашей Семьи»',
    items: [
      'экспертная верификация блока семейной памяти',
      'понимание реальных потребностей семей',
      'пилот с авторитетной культурной институцией',
      'основание для продуктовых доработок',
      'модель для дальнейшего тиражирования',
    ],
  },
];

export default function SlideCSI07Value() {
  return (
    <CsiSlideFrame id="csi-7" eyebrow="Польза для каждой стороны" title="Что даст пилот">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, i) => (
          <div key={i} className="bg-white/70 border border-amber-900/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-3 uppercase tracking-wider">
              <Icon name={col.icon} size={16} className="text-amber-700" />
              {col.title}
            </div>
            <ul className="space-y-2">
              {col.items.map((text, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-stone-700 leading-relaxed">
                  <Icon name="Dot" size={18} className="text-amber-600 shrink-0 -mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </CsiSlideFrame>
  );
}
