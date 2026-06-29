import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

export default function HeaderAndInstructions() {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden mb-2">
        <img
          src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2760770a-4c93-462f-8458-4e964ee731f5.jpg"
          alt="Семейный ИИ-помощник"
          className="w-full h-36 sm:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5">Семейный ИИ-помощник</h1>
          <p className="text-xs sm:text-sm text-white/80">Информационный сервис для саморефлексии и семейного диалога</p>
        </div>
      </div>

      <Alert className="bg-amber-50 border-amber-200 mb-2">
        <Icon name="Info" className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          Сервис не является психологической, психотерапевтической или медицинской помощью,
          не ставит диагнозы и не заменяет обращение к специалисту. В кризисной ситуации
          звоните 112 или на детский телефон доверия 8-800-2000-122.
        </AlertDescription>
      </Alert>

      <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <Alert className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
          <div className="flex items-start gap-3">
            <Icon name="Brain" className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-teal-900 text-sm">Как пользоваться</h3>
                <Icon name={isInstructionOpen ? 'ChevronUp' : 'ChevronDown'} className="h-5 w-5 text-teal-600 transition-transform group-hover:scale-110" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-teal-800">
                  <div className="space-y-2 text-xs">
                    <div className="p-1.5 bg-white/60 rounded border-l-[3px] border-teal-500">
                      <p className="font-medium">1. Консультация</p>
                      <p className="text-[11px] text-teal-700">Опишите семейную ситуацию — ИИ-помощник предложит идеи для размышления. Стоимость: 3 руб.</p>
                    </div>
                    <div className="p-1.5 bg-white/60 rounded border-l-[3px] border-teal-500">
                      <p className="font-medium">2. Релаксация</p>
                      <p className="text-[11px] text-teal-700">5 техник снятия стресса с таймером: дыхание, медитация, заземление</p>
                    </div>
                    <div className="p-1.5 bg-white/60 rounded border-l-[3px] border-teal-500">
                      <p className="font-medium">3. Упражнения</p>
                      <p className="text-[11px] text-teal-700">Семейные практики для укрепления отношений: чек-ин, зеркальное слушание, семейный совет</p>
                    </div>
                    <div className="p-1.5 bg-white/60 rounded border-l-[3px] border-teal-500">
                      <p className="font-medium">4. Возрастные кризисы</p>
                      <p className="text-[11px] text-teal-700">Справочник по кризисам детей от 0 до 19 лет: признаки, помощь, когда к врачу</p>
                    </div>
                    <div className="p-1.5 bg-white/60 rounded border-l-[3px] border-teal-500">
                      <p className="font-medium">5. Тесты и прогресс</p>
                      <p className="text-[11px] text-teal-700">Психологические тесты и отслеживание вашей активности</p>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>
    </>
  );
}