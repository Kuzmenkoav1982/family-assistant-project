import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

export default function LifeRoadInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Icon name="Sparkles" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-purple-900 text-sm">
                Что такое «Дорога жизни» и как ей пользоваться
              </h3>
              <Icon
                name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
              <AlertDescription className="text-purple-900/90">
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    <strong>Дорога жизни</strong> — это не просто хронология воспоминаний. Это инструмент,
                    который помогает увидеть свой путь со стороны, осмыслить пройденное и осознанно спланировать будущее.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-white/70 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Clock" size={14} className="text-pink-600" />
                        <span className="font-semibold">Прошлое</span>
                      </div>
                      <p className="text-[11px] text-purple-800/80">
                        Запиши важные моменты — рождение, свадьбы, переезды, достижения. Они станут точками на пути.
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="MapPin" size={14} className="text-purple-600" />
                        <span className="font-semibold">Настоящее</span>
                      </div>
                      <p className="text-[11px] text-purple-800/80">
                        Якорная точка «Я сейчас» — между прошлым и будущим. Помогает увидеть, где ты находишься.
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Compass" size={14} className="text-indigo-600" />
                        <span className="font-semibold">Будущее</span>
                      </div>
                      <p className="text-[11px] text-purple-800/80">
                        Планы, цели, мечты. ИИ-советник поможет выбрать методику и подскажет следующий шаг.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-700/80 italic">
                    Совет: указывая год рождения в настройках, ты получаешь автоматическое разделение пути
                    на «сезоны жизни» — Детство, Юность, Становление, Зрелость, Расцвет, Мудрость.
                  </p>
                </div>
              </AlertDescription>
            </CollapsibleContent>
          </div>
        </div>
      </Alert>
    </Collapsible>
  );
}
