import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const scenes = [
  {
    id: 1,
    image: 'https://cdn.poehali.dev/files/3b6481e0-1553-4182-94c5-1596ca458aec.jpg',
    quote: 'Привет! Я — Домовёнок. Я тысячу лет берегу русские семьи — от лучины до смартфона. Менялись избы, менялись времена. А главное — не менялось никогда. Семья.',
    label: 'Знакомство',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-orange-200',
    accent: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    imgBg: 'bg-amber-100',
  },
  {
    id: 2,
    image: 'https://cdn.poehali.dev/files/e737bff4-7537-4d19-8c71-372664cda452.jpg',
    quote: 'Но время нынче — особое. Угроз много, забот ещё больше. И я придумал, как помочь. Собрал в один мешок всё, что нужно крепкой семье. Смотрите...',
    label: 'Новое время',
    bg: 'from-rose-50 to-pink-50',
    border: 'border-pink-200',
    accent: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-700',
    imgBg: 'bg-rose-100',
  },
  {
    id: 3,
    image: 'https://cdn.poehali.dev/files/ca712a09-b06f-4b9d-9369-d3baaa169b7e.jpg',
    quote: 'Вот он — мешок мастера. А зовётся — "Наша Семья".',
    label: 'Мешок мастера',
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    imgBg: 'bg-yellow-100',
  },
  {
    id: 4,
    image: 'https://cdn.poehali.dev/files/56dd1a64-098e-4403-ae09-9de6508be482.jpg',
    quote: 'Двенадцать опор. Двенадцать дел. Собрались вместе — и стала семья крепостью.',
    label: '12 опор',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    imgBg: 'bg-emerald-100',
  },
  {
    id: 5,
    image: 'https://cdn.poehali.dev/files/e03008a4-c00e-4729-9a55-db66d6c1ea4c.png',
    quote: 'Я слежу за делами каждого — никто ничего не забудет!',
    label: 'Планирование',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    imgBg: 'bg-blue-100',
  },
  {
    id: 6,
    image: 'https://cdn.poehali.dev/files/60de9dee-ead5-4091-8871-69dba42ea135.jpg',
    quote: 'И всё это — бесплатно. Для каждой семьи!',
    label: 'Бесплатно',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    imgBg: 'bg-violet-100',
  },
  {
    id: 7,
    image: 'https://cdn.poehali.dev/files/72442757-aff2-49a4-b817-47d2a95a993f.png',
    quote: 'Когда крепка каждая семья — крепка и вся Россия. Наш щит — это мы сами.',
    label: 'Крепкая Россия',
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    accent: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    imgBg: 'bg-red-100',
  },
  {
    id: 8,
    image: 'https://cdn.poehali.dev/files/3927b3db-0d09-4833-82f7-df839d8d8523.jpg',
    quote: 'Присоединяйтесь в "Нашу Семью". Вместе будем укреплять семьи, общество, страну.',
    label: 'Призыв',
    bg: 'from-orange-50 to-amber-50',
    border: 'border-orange-300',
    accent: 'text-orange-800',
    badge: 'bg-orange-200 text-orange-800',
    imgBg: 'bg-orange-100',
  },
];

export default function WelcomeDomovoy() {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const navigate = useNavigate();
  const scene = scenes[active];

  const prev = () => setActive(i => (i - 1 + scenes.length) % scenes.length);
  const next = () => setActive(i => (i + 1) % scenes.length);

  // Свайп
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/40 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🏠 История Домовёнка
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Тысячу лет на страже семьи
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Листайте историю Домовёнка — хранителя русских семей
          </p>
        </div>

        <div
          className={`rounded-3xl border-2 ${scene.border} bg-gradient-to-br ${scene.bg} overflow-hidden shadow-xl transition-colors duration-500`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Фото — полный ракурс через object-contain, клик открывает лайтбокс */}
            <div
              className={`flex items-center justify-center ${scene.imgBg} cursor-zoom-in rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none min-h-[280px] md:min-h-[420px] p-4`}
              onClick={() => setLightbox(true)}
              title="Нажмите для просмотра"
            >
              <img
                key={scene.id}
                src={scene.image}
                alt={scene.label}
                className="w-full h-full max-h-[420px] object-contain transition-opacity duration-500 hover:scale-[1.02] transition-transform"
              />
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10">
              <div>
                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${scene.badge}`}>
                  Сцена {active + 1} — {scene.label}
                </span>

                <blockquote className={`text-xl sm:text-2xl font-bold leading-snug ${scene.accent} mb-6`}>
                  «{scene.quote}»
                </blockquote>

                <div className="flex gap-2 mb-8 flex-wrap">
                  {scenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === active ? `w-8 bg-current ${scene.accent}` : 'w-2 bg-gray-300'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setLightbox(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-2"
                >
                  <Icon name="ZoomIn" size={13} />
                  Открыть фото на весь экран
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prev}
                    className="flex-1 rounded-xl"
                  >
                    <Icon name="ChevronLeft" size={16} className="mr-1" />
                    Назад
                  </Button>
                  <Button
                    size="sm"
                    onClick={next}
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0"
                  >
                    {active === scenes.length - 1 ? 'Сначала' : 'Далее'}
                    <Icon name="ChevronRight" size={16} className="ml-1" />
                  </Button>
                </div>

                {active === scenes.length - 1 && (
                  <Button
                    onClick={() => navigate('/register')}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-lg"
                  >
                    <Icon name="Rocket" size={16} className="mr-2" />
                    Присоединиться бесплатно
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Лайтбокс */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <Icon name="X" size={24} />
          </button>
          <img
            src={scene.image}
            alt={scene.label}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}