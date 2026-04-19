import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const STORAGE_KEY = 'life-road-onboarding-seen';

interface Slide {
  icon: string;
  gradient: string;
  title: string;
  text: string;
  bullets: string[];
}

const SLIDES: Slide[] = [
  {
    icon: 'Sparkles',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    title: 'Это твоя Дорога жизни',
    text: 'Не просто хронология воспоминаний — а инструмент, который помогает увидеть свой путь со стороны и осознанно идти дальше.',
    bullets: [
      'Прошлое — что уже пройдено',
      'Настоящее — точка «Я сейчас»',
      'Будущее — план, цели, мечты',
    ],
  },
  {
    icon: 'Layers',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    title: 'Сезоны жизни',
    text: 'Если ты укажешь дату рождения в профиле, путь автоматически разделится на 6 эпох — от Детства до Мудрости. Каждая со своим цветом и настроением.',
    bullets: [
      'Детство · Юность · Становление',
      'Зрелость · Расцвет · Мудрость',
      'Видишь, в какой эпохе сейчас и что было ярким',
    ],
  },
  {
    icon: 'Compass',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    title: 'Инструменты для будущего',
    text: 'Цели по проверенным методикам, Колесо баланса жизни и ИИ-Домовой, который видит твой путь и подсказывает следующий шаг.',
    bullets: [
      '5 методик: SMART, Икигай, 7 навыков Кови и др.',
      'Колесо баланса по 8 сферам',
      'Домовой — твой личный наставник',
    ],
  },
];

export default function LifeRoadOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
    setStep(0);
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        <div className={`relative bg-gradient-to-br ${slide.gradient} text-white p-8 text-center`}>
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center mb-4 shadow-lg">
              <Icon name={slide.icon} size={28} />
            </div>
            <h2 className="text-2xl font-black mb-3 leading-tight">{slide.title}</h2>
            <p className="text-sm opacity-95 leading-relaxed mb-5 max-w-sm mx-auto">{slide.text}</p>

            <div className="space-y-1.5 text-left bg-white/15 backdrop-blur-md rounded-xl p-3">
              {slide.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-purple-600' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                Назад
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {isLast ? 'Начать путь' : 'Дальше'}
              <Icon name={isLast ? 'Sparkles' : 'ArrowRight'} size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
