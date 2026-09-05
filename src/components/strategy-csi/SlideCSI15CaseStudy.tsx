import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const actions = [
  {
    icon: 'MessagesSquare' as const,
    title: 'Глубинные интервью',
    text: 'Основа модели — не анкеты, а личный разговор с каждой семьёй.',
  },
  {
    icon: 'Users' as const,
    title: 'Диалог, а не лекция',
    text: 'Музей не «читает нотации», а приглашает одних людей делиться опытом с другими.',
  },
  {
    icon: 'Layers' as const,
    title: 'Параллельные повествования',
    text: 'Выставка строится как несколько равноправных семейных историй рядом, а не один общий рассказ.',
  },
  {
    icon: 'Heart' as const,
    title: 'Сквозные темы',
    text: 'Корни рода, связь дома и города, забота и поддержка — темы, общие для разных семей.',
  },
];

export default function SlideCSI15CaseStudy() {
  return (
    <CsiSlideFrame
      id="csi-15"
      eyebrow="Приложение 4 · Проверенный опыт ЦСИ"
      title="Модель диалога уже опробована самим Центром"
      subtitle="Выставочный проект центра построен на глубинных интервью с представителями 21 семьи из Тульской области, включая Поленово"
      tone="accent"
      footnote="Источник: видеоинтервью представителей ЦСИ о работе центра."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((a, i) => (
          <div
            key={i}
            className="bg-white/70 border border-amber-900/10 rounded-xl p-5 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Icon name={a.icon} size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900 mb-1">{a.title}</div>
              <p className="text-sm text-stone-700 leading-relaxed">{a.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-stone-900 text-amber-50 rounded-xl px-5 py-4 text-sm sm:text-base leading-relaxed">
        Наше предложение не вводит новую методику — оно продолжает уже
        проверенную ЦСИ модель диалога и параллельных повествований в
        цифровом, домашнем формате: то, что начиналось на выставке очно,
        может продолжиться дома вместе с родственниками.
      </div>

      <div className="mt-3 flex items-start gap-3 bg-white/60 border border-amber-900/10 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Детали методики интервью и отбора семей уточняем вместе с Центром —
          здесь фиксируем только сам факт и логику уже проверенного формата.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
