import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const questions = [
  'В каком качестве Спартак участвует в инициативе?',
  'Это его гипотеза или запрос самого Центра?',
  'С кем из ЦСИ можно провести предметную встречу?',
  'Какая задача Центра сейчас приоритетна?',
  'Есть ли действующая программа, к которой можно подключить пилот?',
  'ЦСИ больше заинтересован в просвещении или в формировании народного архива?',
  'Как Центр сейчас собирает и хранит материалы жителей?',
  'Есть ли утверждённая методика описания и формы согласий?',
  'Кто принимает решение: ЦСИ или руководство музея-заповедника?',
  'Предполагается бесплатный пилот, грант, бюджет учреждения или внешний спонсор?',
];

export default function SlideCSI10Questions() {
  return (
    <CsiSlideFrame
      id="csi-10"
      eyebrow="Приложение 2 · Для внутреннего разговора"
      title="Что важно выяснить до подготовки официального предложения"
      tone="dark"
      footnote="Этот слайд предназначен для обсуждения и может не входить в версию, которую позднее покажем самому ЦСИ."
    >
      <div className="space-y-2.5">
        {questions.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3"
          >
            <Icon name="HelpCircle" size={16} className="text-amber-300 shrink-0 mt-0.5" />
            <span className="text-sm text-stone-100 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>
    </CsiSlideFrame>
  );
}
