import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

export default function RuleInstructionPanel() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-3">
          <div className="bg-purple-500 rounded-full p-2 shadow-md">
            <Icon name="Info" className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-purple-900 text-lg">Как работают семейные правила</h3>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">Инструкция</span>
              </div>
              <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} className="h-6 w-6 text-purple-600 transition-transform group-hover:scale-110" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-purple-800">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">⚖️ Для чего нужны семейные правила?</p>
                    <p className="text-sm">Семейные правила — это договорённости, которые помогают всем членам семьи жить в гармонии, избегать конфликтов и понимать, что можно, а что нельзя. Правила создают структуру и предсказуемость в семейной жизни.</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">✨ Основные возможности</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Создание правил:</strong> Любой член семьи может предложить новое правило</li>
                      <li><strong>Категории:</strong> Общие, Традиции, Технологии, Финансы, Распорядок, Учёба, Домашние дела</li>
                      <li><strong>Голосование:</strong> Правила обычных членов семьи требуют одобрения</li>
                      <li><strong>Статусы:</strong> Утверждено, На голосовании, Отклонено</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">🎯 Как использовать</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Владелец и Администратор</strong> могут утверждать правила единолично — они вступают в силу сразу</li>
                      <li><strong>Обычные участники</strong> предлагают правило на голосование — нужно одобрение всех остальных</li>
                      <li>Голосуйте "За" или "Против" предложенных правил</li>
                      <li>Правила можно удалять (с подтверждением)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">💡 Советы</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Формулируйте правила чётко и конкретно</li>
                      <li>Обсуждайте правила на семейных советах</li>
                      <li>Регулярно пересматривайте и обновляйте правила</li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <Button variant="link" onClick={() => navigate('/instructions')} className="text-purple-600 hover:underline p-0 h-auto text-sm">
                      📖 <strong>Подробнее:</strong> Полная инструкция
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </CollapsibleContent>
          </div>
        </div>
      </Alert>
    </Collapsible>
  );
}
