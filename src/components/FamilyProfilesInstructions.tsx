import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

export function FamilyProfilesInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-blue-900 text-lg">
                Как работают умные виджеты членов семьи
              </h3>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <AlertDescription className="text-blue-800">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">🎯 Что показывают виджеты?</p>
                    <p className="text-sm">
                      Виджеты членов семьи теперь отображают реальную загруженность каждого человека. 
                      Вы сразу видите, кто свободен, кто занят, а кто перегружен. Это помогает справедливо 
                      распределять задачи и не перегружать одних членов семьи.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📊 Прогресс-бар загруженности</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong className="text-green-600">Зелёный (0-50%)</strong> — человек свободен, можно смело давать задачи</li>
                      <li><strong className="text-yellow-600">Жёлтый (50-80%)</strong> — загружен, но справляется</li>
                      <li><strong className="text-red-600">Красный (80-100%)</strong> — перегружен, лучше не добавлять новых задач</li>
                    </ul>
                    <p className="text-sm mt-2">
                      Загруженность рассчитывается автоматически на основе активных задач, обязанностей и событий на сегодня.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🔢 Метрики виджета</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="ListTodo" size={14} className="text-blue-500" />
                          <strong>Активные задачи</strong>
                        </div>
                        <p className="text-xs text-gray-600">Сколько задач сейчас в работе</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="CheckCircle2" size={14} className="text-green-500" />
                          <strong>Завершено сегодня</strong>
                        </div>
                        <p className="text-xs text-gray-600">Сколько задач выполнено за день</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Calendar" size={14} className="text-purple-500" />
                          <strong>События на сегодня</strong>
                        </div>
                        <p className="text-xs text-gray-600">Запланированные мероприятия</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Trophy" size={14} className="text-yellow-500" />
                          <strong>Достижения за неделю</strong>
                        </div>
                        <p className="text-xs text-gray-600">Новые награды и успехи</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">⚡ Быстрые действия</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Кнопка "+ Задача"</strong> — мгновенно назначить задание этому члену семьи</li>
                      <li><strong>Клик на виджет</strong> — открыть полный профиль с подробной информацией</li>
                      <li><strong>Стрелка →</strong> — быстрый переход в профиль</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">⚙️ Настройка виджетов</p>
                    <p className="text-sm mb-2">
                      Нажмите кнопку <strong>"Настроить виджеты"</strong> справа вверху, чтобы:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Выбрать готовый пресет: <strong>Минималист</strong>, <strong>Стандарт</strong> или <strong>Подробный</strong></li>
                      <li>Включить/выключить отображение возраста и роли</li>
                      <li>Настроить метрики: какие показатели показывать</li>
                      <li>Управлять быстрыми действиями</li>
                      <li>Изменить размер виджета</li>
                    </ul>
                    <p className="text-sm mt-2 text-blue-700 font-medium">
                      💡 Настройки сохраняются автоматически и применяются ко всем виджетам сразу
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🎨 Примеры использования</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-white rounded border-l-4 border-green-500">
                        <p className="font-medium text-green-700">Распределение задач</p>
                        <p className="text-xs text-gray-600">
                          Посмотрите на прогресс-бары загруженности. Назначайте новые задачи тем, 
                          у кого зелёный статус "Свободен".
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                        <p className="font-medium text-blue-700">Мотивация</p>
                        <p className="text-xs text-gray-600">
                          Отслеживайте "Завершено сегодня" — хвалите членов семьи за продуктивность!
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-purple-500">
                        <p className="font-medium text-purple-700">Планирование</p>
                        <p className="text-xs text-gray-600">
                          Смотрите "События на сегодня" — учитывайте занятость при планировании дел.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📱 Адаптивность</p>
                    <p className="text-sm">
                      Виджеты автоматически подстраиваются под размер экрана. На мобильных 
                      устройствах информация компактнее, на десктопе — более детальная.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-sm italic">
                      💡 <strong>Совет:</strong> Используйте виджеты как панель управления семьёй. 
                      Один взгляд на главную страницу даёт полную картину загруженности всех членов семьи!
                    </p>
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
