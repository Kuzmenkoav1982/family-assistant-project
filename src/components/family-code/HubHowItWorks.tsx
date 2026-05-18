import Icon from '@/components/ui/icon';
import CollapsibleBlock from '@/components/ui/collapsible-block';

const STEPS = [
  { icon: 'UserCircle2', title: 'Шаг 1. Заполните профили', text: 'Укажите дату рождения и ФИО каждого члена семьи в разделе «Семья». Этого достаточно для полного расчёта нумерологии, астрологии и арканов.' },
  { icon: 'Calculator', title: 'Шаг 2. Автоматический расчёт', text: 'Система рассчитает все числа судьбы, квадрат Пифагора, знак зодиака, карту Бацзы (4 столпа судьбы) и 4 аркана Таро — полностью автоматически.' },
  { icon: 'Heart', title: 'Шаг 3. Совместимость пары', text: 'Совместимость считается по 4 пластам одновременно: числа + стихии + арканы + психотипы. Оценка 0-100% по каждому направлению.' },
  { icon: 'MessageCircle', title: 'Шаг 4. Персональные советы', text: 'Домовой даёт рекомендации, анализирует конфликты и составляет персональные прогнозы на основе ВСЕХ расчётов.' },
];

export default function HubHowItWorks() {
  return (
    <CollapsibleBlock
      icon="Info"
      iconBg="bg-amber-100 text-amber-600"
      title="Как это работает?"
      borderColor="border-amber-200"
      bgGradient="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"
    >
      <div className="space-y-3">
        <p className="text-sm text-amber-900/80 leading-relaxed">
          «Семейный код» — объединённая система глубокого эзотерического анализа: нумерология, астрология,
          карта Бацзы, арканы Таро и ИИ-советник. Всё рассчитывается автоматически на основе имени и даты рождения.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STEPS.map(s => (
            <div key={s.title} className="bg-white/60 rounded-lg p-3 border border-amber-100">
              <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                <Icon name={s.icon} size={14} className="text-amber-600" />
                {s.title}
              </p>
              <p className="text-[11px] text-amber-800/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleBlock>
  );
}
