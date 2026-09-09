import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const examples = [
  {
    icon: 'NotebookPen' as const,
    title: '«Прожито»',
    meta: 'Россия · Европейский университет в Санкт-Петербурге',
    text: 'Корпус личных дневников XX века: волонтёры и родственники расшифровывают рукописные дневники обычных людей и публикуют их в открытой базе — более 700 дневников и сотен тысяч записей.',
  },
  {
    icon: 'Landmark' as const,
    title: '«Мой ГУЛАГ»',
    meta: 'Россия · Музей истории ГУЛАГа',
    text: 'Цикл видеоинтервью с людьми, пережившими репрессии или помнящими своих близких: семейная история одного человека становится частью общей документальной памяти музея.',
  },
];

export default function SlideCSI17RussianBenchmarks() {
  return (
    <CsiSlideFrame
      id="csi-17"
      eyebrow="Приложение 6 · Российский опыт"
      title="В России такая практика тоже уже есть"
      subtitle="Похожая логика — личный архив как часть общей памяти — работает и на отечественных проектах"
      tone="accent"
      footnote="Источники: prozhito.org · gulagmuseum.org"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="bg-white/70 border border-amber-900/10 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Icon name={ex.icon} size={18} />
              </div>
              <div className="text-sm font-semibold text-stone-900">{ex.title}</div>
            </div>
            <div className="text-[11px] text-stone-500 mb-2">{ex.meta}</div>
            <p className="text-sm text-stone-700 leading-relaxed">{ex.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 bg-white/60 border border-amber-900/10 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Наше предложение не изобретает новый жанр, а продолжает уже
          понятную логику — только в масштабе одной семьи и в закрытом,
          частном формате.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
