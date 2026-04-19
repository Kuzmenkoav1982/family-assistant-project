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
    icon: 'Hammer',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    title: 'Мастерская жизни',
    text: 'Ты — мастер своей жизни. Здесь собраны инструменты, чтобы осознанно её творить.',
    bullets: [
      'Прошлое — что уже пройдено',
      'Настоящее — точка «Я сейчас»',
      'Будущее — цели и мечты',
    ],
  },
  {
    icon: 'Layers',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    title: 'Сезоны жизни',
    text: 'Укажи дату рождения в профиле — путь разделится на 6 эпох, от Детства до Мудрости.',
    bullets: [
      'У каждой эпохи свой цвет',
      'Видно, где ты сейчас',
      'Ярче запоминаются моменты',
    ],
  },
  {
    icon: 'Compass',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    title: 'Инструменты для будущего',
    text: 'Цели по проверенным методикам и ИИ-Домовой, который знает твой путь.',
    bullets: [
      '5 методик: SMART, Икигай и др.',
      'Колесо баланса по 8 сферам',
      'Подсказки от Домового',
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
    setTimeout(() => setStep(0), 200);
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="p-0 overflow-hidden border-0 w-[calc(100vw-2rem)] max-w-sm rounded-2xl sm:rounded-3xl max-h-[90vh] flex flex-col gap-0">
        <div className={`relative bg-gradient-to-br ${slide.gradient} text-white px-5 pt-8 pb-6 text-center flex-shrink-0`}>
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md items-center justify-center mb-3 shadow-lg">
              <Icon name={slide.icon} size={26} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black mb-2 leading-tight break-words">{slide.title}</h2>
            <p className="text-sm opacity-95 leading-relaxed">{slide.text}</p>
          </div>
        </div>

        <div className="bg-white px-5 py-4 space-y-2.5 overflow-y-auto flex-1 min-h-0">
          {slide.bullets.map((b, i) => (
            <div key={`${step}-${i}`} className="flex items-start gap-2.5 text-sm text-gray-700">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mt-0.5`}>
                <Icon name="Check" size={12} className="text-white" />
              </div>
              <span className="leading-snug">{b}</span>
            </div>
          ))}
        </div>

        <div className="bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
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
          <div className="flex gap-1.5">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)} className="h-8 px-2.5 text-xs">
                Назад
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {isLast ? 'Начать' : 'Дальше'}
              <Icon name={isLast ? 'Sparkles' : 'ArrowRight'} size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}