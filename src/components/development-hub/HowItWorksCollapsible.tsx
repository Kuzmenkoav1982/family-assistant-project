import Icon from '@/components/ui/icon';
import CollapsibleBlock from './CollapsibleBlock';

const STEPS = [
  { icon: 'LayoutDashboard', title: 'Шаг 1. Панорама', text: 'Откройте «Портфолио развития» — живую карту по 8 сферам для каждого члена семьи. Это отправная точка: видим картину целиком.' },
  { icon: 'Hammer', title: 'Шаг 2. Практика', text: 'Превращайте картину в шаги: планы развития, навыки, достижения, мастерская жизни. Здесь рост становится привычкой.' },
  { icon: 'MessagesSquare', title: 'Шаг 3. Диалог', text: 'ИИ-психолог, техники релаксации, упражнения для семьи и справочник кризисов. Бережный собеседник для тонких вопросов.' },
  { icon: 'HeartHandshake', title: 'Шаг 4. Рефлексия', text: 'Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Тихий взгляд внутрь — без оценок.' },
];

export default function HowItWorksCollapsible() {
  return (
    <CollapsibleBlock
      icon="Info"
      iconBg="bg-violet-100 text-violet-600"
      title="Как это работает?"
      borderColor="border-violet-200"
      bgGradient="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50"
    >
      <div className="space-y-3">
        <p className="text-sm text-violet-900/80 leading-relaxed">
          «Развитие» — смысловой хаб личностного и семейного роста. Четыре слоя ведут вас от живой картины семьи к ежедневной практике, бережному диалогу и честной рефлексии. Без оценок и диагнозов — только наблюдение и осознанные шаги.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STEPS.map(s => (
            <div key={s.title} className="bg-white/60 rounded-lg p-3 border border-violet-100">
              <p className="text-xs font-semibold text-violet-900 mb-1.5 flex items-center gap-1.5">
                <Icon name={s.icon} size={14} className="text-violet-600" />
                {s.title}
              </p>
              <p className="text-[11px] text-violet-800/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
          <p className="text-[11px] text-violet-800/80 leading-relaxed flex items-start gap-1.5">
            <Icon name="Sparkles" size={13} className="text-violet-600 mt-0.5 flex-shrink-0" />
            <span>Переключайте слои кнопками ниже — каждый открывает свои сервисы. Здесь рождаются смыслы, которые потом становятся договорённостями и действиями.</span>
          </p>
        </div>
      </div>
    </CollapsibleBlock>
  );
}
