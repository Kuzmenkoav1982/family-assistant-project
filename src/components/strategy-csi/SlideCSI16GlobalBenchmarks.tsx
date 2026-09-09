import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const examples = [
  {
    icon: 'Globe' as const,
    title: 'Europeana',
    meta: 'Евросоюз · цифровая платформа наследия',
    text: 'В рамках проекта «Europeana Migration» музеи и архивы проводят Collection Days — дни, когда люди приносят семейные фото, письма и открытки, чтобы вплести личную историю в общую историю Европы.',
  },
  {
    icon: 'Mic' as const,
    title: 'StoryCorps',
    meta: 'США · некоммерческая организация, с 2003 года',
    text: 'Записывает разговоры обычных людей друг с другом в специальных студиях. Архив из более чем 50 000 интервью хранится в Библиотеке Конгресса как часть национальной памяти.',
  },
  {
    icon: 'Users' as const,
    title: 'Smithsonian · Community Curation',
    meta: 'США · Национальный музей афроамериканской истории',
    text: 'Программа выезжает в сообщества и помогает семьям бесплатно оцифровать фото, видео и истории на платформе communitycuration.org — с бесплатной вводной сессией по генеалогии.',
  },
  {
    icon: 'ShieldCheck' as const,
    title: 'Mukurtu CMS',
    meta: 'Международный проект · открытый код',
    text: 'Платформа, созданная вместе с коренными сообществами: у каждой общины свои гибкие правила доступа к материалам — кто, что и на каких условиях может видеть и рассказывать.',
  },
  {
    icon: 'BookHeart' as const,
    fallback: 'BookOpen',
    title: 'Museu da Pessoa',
    meta: 'Бразилия · виртуальный музей, с 1991 года',
    text: 'Коллаборативный музей жизненных историй: любой человек может записать свою биографию и стать частью общего цифрового архива — сегодня в нём собрано около 17 тысяч историй.',
  },
];

export default function SlideCSI16GlobalBenchmarks() {
  return (
    <CsiSlideFrame
      id="csi-16"
      eyebrow="Приложение 5 · Международный опыт"
      title="Похожие практики цифровой семейной памяти в мире"
      subtitle="Разные страны и институции независимо приходят к одной логике: личная история ценна сама по себе и достойна бережного цифрового архива"
      tone="accent"
      footnote="Источники: europeana.eu · storycorps.org · communitycuration.org (Смитсоновский NMAAHC) · mukurtu.org · museudapessoa.org"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="bg-white/70 border border-amber-900/10 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Icon name={ex.icon} fallback={ex.fallback} size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900">{ex.title}</div>
                <div className="text-[11px] text-stone-500">{ex.meta}</div>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{ex.text}</p>
          </div>
        ))}
      </div>
    </CsiSlideFrame>
  );
}
