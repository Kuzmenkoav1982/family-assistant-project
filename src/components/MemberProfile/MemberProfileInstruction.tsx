import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

export function MemberProfileInstruction() {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  return (
    <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
      <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-purple-900 text-lg">
                Как работать с профилем
              </h3>
              <Icon 
                name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-purple-800">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">👤 Для чего нужен профиль члена семьи?</p>
                    <p className="text-sm">
                      Профиль — это личное пространство каждого члена семьи. Здесь хранятся мечты, достижения, настроение, 
                      личные цели и финансы. Каждый может развиваться в своём темпе и видеть свой прогресс.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">✨ Возможности профиля</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Базовая инфо:</strong> Имя, возраст, роль в семье, фото или аватар</li>
                      <li><strong>Геймификация:</strong> Баллы, уровень, достижения</li>
                      <li><strong>Мечты:</strong> Личные цели и желания с прогрессом</li>
                      <li><strong>Копилка:</strong> Личные сбережения и финансовые цели</li>
                      <li><strong>Календарь:</strong> Личные события и задачи</li>
                      <li><strong>Настроение:</strong> Отметка текущего эмоционального состояния</li>
                      <li><strong>Анкета:</strong> Расширенная информация о личности</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🎯 Вкладки профиля</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Общее:</strong> Основная информация, баллы, уровень</li>
                      <li><strong>Мечты:</strong> Управление личными целями и желаниями</li>
                      <li><strong>Копилка:</strong> Личные финансы и сбережения</li>
                      <li><strong>Календарь:</strong> Личные события и напоминания</li>
                      <li><strong>Редактировать:</strong> Изменение информации о себе</li>
                      <li><strong>Анкета:</strong> Подробная информация о личности</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🔒 Доступ и права</p>
                    <p className="text-sm">
                      Владелец семьи видит все профили и может управлять правами доступа. 
                      Каждый участник видит свой профиль и может вносить изменения в свою информацию.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">💡 Советы</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Заполните анкету для более персонализированного опыта</li>
                      <li>Добавляйте мечты и отслеживайте прогресс к их достижению</li>
                      <li>Используйте копилку для накопления на личные цели</li>
                      <li>Отмечайте настроение — это поможет отслеживать эмоциональное состояние</li>
                    </ul>
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
