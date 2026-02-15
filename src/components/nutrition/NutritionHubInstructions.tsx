import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NutritionHubInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-3">
          <Icon name="Utensils" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-green-900 text-sm">
                Как пользоваться разделом Питание
              </h3>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-green-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Что здесь есть?</p>
                    <p className="text-xs leading-relaxed">
                      Полный контроль питания семьи: персональные ИИ-диеты, готовые программы (кето, веган, медицинские столы), 
                      счётчик калорий, рецепты из ваших продуктов и трекинг прогресса.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">С чего начать?</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">1. ИИ-Диета по данным</p>
                        <p className="text-[11px] text-green-700">Заполните анкету о здоровье и целях — ИИ составит план питания на неделю</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">2. Готовые режимы питания</p>
                        <p className="text-[11px] text-green-700">6 проверенных программ: Стол 1, 5, 9, Кето, Веган, Облегчённое</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">3. Рецепт из продуктов</p>
                        <p className="text-[11px] text-green-700">Укажите что есть дома — ИИ предложит варианты с рецептами</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">4. Прогресс диеты</p>
                        <p className="text-[11px] text-green-700">Трекинг веса, графики, SOS-кнопка и мотивация от ИИ</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="font-medium text-xs mb-0.5">Стоимость ИИ-сервисов</p>
                    <p className="text-[11px]">
                      Генерация диеты — 17 руб, фото блюда — 7 руб, рецепт из продуктов — 5 руб. 
                      Оплата из семейного кошелька.
                    </p>
                  </div>

                  <Link 
                    to="/instructions?section=nutrition-hub" 
                    className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium"
                  >
                    <Icon name="BookOpen" size={12} />
                    Полная инструкция
                    <Icon name="ChevronRight" size={12} />
                  </Link>
                </div>
              </AlertDescription>
            </CollapsibleContent>
          </div>
        </div>
      </Alert>
    </Collapsible>
  );
}