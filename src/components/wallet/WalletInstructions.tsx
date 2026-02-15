import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WalletInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <Icon name="Wallet" className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-emerald-900 text-sm">
                Как работает семейный кошелёк
              </h3>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                className="h-5 w-5 text-emerald-600 transition-transform group-hover:scale-110" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-emerald-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Для чего нужен кошелёк?</p>
                    <p className="text-xs leading-relaxed">
                      Семейный кошелёк — единый баланс для всех ИИ-сервисов приложения. 
                      Пополняете один раз, а средства расходуются автоматически при использовании ИИ-функций.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">На что тратятся средства?</p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="Brain" size={14} className="text-violet-500" />
                        <span>ИИ-диета — 17 руб</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="Image" size={14} className="text-blue-500" />
                        <span>Фото блюда — 7 руб</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="ChefHat" size={14} className="text-orange-500" />
                        <span>Рецепт из продуктов — 5 руб</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="Gift" size={14} className="text-pink-500" />
                        <span>ИИ-открытка — 7 руб</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="BookOpen" size={14} className="text-amber-500" />
                        <span>Рецепт (короткий) — 2 руб</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded">
                        <Icon name="MapPin" size={14} className="text-emerald-500" />
                        <span>Рекомендации досуга — 4 руб</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как пополнить?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Пополнить» на карточке баланса</li>
                      <li>Введите сумму (от 50 руб)</li>
                      <li>Выберите способ: банковская карта или СБП</li>
                      <li>Оплатите — средства зачислятся автоматически</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Баланс общий для всей семьи — каждый участник может использовать ИИ-сервисы.
                    </p>
                  </div>

                  <Link 
                    to="/instructions?section=wallet" 
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium"
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