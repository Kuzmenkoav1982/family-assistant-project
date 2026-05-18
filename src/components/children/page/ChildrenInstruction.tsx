import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface Props {
  onAddChild: () => void;
}

export default function ChildrenInstruction({ onAddChild }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6 relative z-10">
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 rounded-full p-2 shadow-md">
            <Icon name="Info" className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-blue-900 text-lg">📖 Как работает раздел Дети</h3>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">Инструкция</span>
              </div>
              <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} className="h-6 w-6 text-blue-600 transition-transform group-hover:scale-110" />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-blue-800">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">👶 Для чего нужен раздел Дети?</p>
                    <p className="text-sm">
                      Раздел помогает следить за развитием и достижениями детей, отслеживать их активности,
                      навыки и интересы. Родители видят полную картину развития ребёнка, а дети получают
                      мотивацию через систему достижений и наград.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">⚡ Возможности раздела</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Два режима:</strong> Родительский (аналитика и контроль) и Детский (профиль ребёнка)</li>
                      <li><strong>Оценка развития с ИИ:</strong> Анализ навыков по возрасту, персональный план развития</li>
                      <li><strong>Личный календарь:</strong> События, врачи, кружки, напоминания для каждого ребёнка</li>
                      <li><strong>Дневник настроения:</strong> Отслеживание эмоций и благополучия</li>
                      <li><strong>Копилка:</strong> Реальные накопления, цели, история транзакций</li>
                      <li><strong>Достижения и значки:</strong> Система наград и мотивации</li>
                      <li><strong>Магазин наград:</strong> Обмен баллов на привилегии и подарки</li>
                      <li><strong>Игры, книги, мечты:</strong> Трекеры интересов и целей ребёнка</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🎯 Родительский режим (Дашборд)</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>ИИ-оценка развития:</strong> Проводите анализ по возрасту (0-7 лет), получайте план упражнений</li>
                      <li><strong>Календарь:</strong> Планируйте врачей, школу, кружки, спорт с напоминаниями</li>
                      <li><strong>Здоровье:</strong> Отслеживайте рост, вес, прививки, анализы</li>
                      <li><strong>Финансы:</strong> Управляйте копилкой — добавляйте/снимайте деньги, ставьте цели</li>
                      <li><strong>Магазин наград:</strong> Создавайте награды, которые ребёнок может купить за баллы</li>
                      <li><strong>Статистика:</strong> Просматривайте динамику развития всех детей</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">😊 Детский режим (Профиль ребёнка)</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Главная:</strong> Балансы баллов и денег, интересный факт дня</li>
                      <li><strong>Дневник настроения:</strong> Отмечает как чувствует себя каждый день</li>
                      <li><strong>Достижения:</strong> Коллекция значков и наград за успехи</li>
                      <li><strong>Магазин:</strong> Покупает награды за баллы (кино, сладкое, прогулка)</li>
                      <li><strong>Копилка:</strong> Видит свои накопления, цели сбережений, историю</li>
                      <li><strong>Календарь:</strong> Личные события с фильтрами по категориям</li>
                      <li><strong>Игры/Книги/Мечты:</strong> Управляет своими желаниями и интересами</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📝 Как добавить ребёнка?</p>
                    <div className="space-y-3">
                      <ol className="text-sm space-y-1.5 list-decimal list-inside">
                        <li>Нажмите на кнопку "Добавить ребёнка" ниже, или на вкладке <strong>"Семья"</strong> на главной</li>
                        <li>Заполните форму: <strong>имя</strong>, <strong>роль</strong> (Сын/Дочь/Ребёнок), <strong>возраст</strong> (необязательно)</li>
                        <li>Выберите <strong>аватар</strong> или загрузите фото профиля</li>
                        <li>Нажмите "Добавить" — профиль появится автоматически в разделе "Дети"</li>
                        <li>В Родительском режиме добавьте навыки, интересы и достижения</li>
                        <li>Регулярно обновляйте информацию о прогрессе</li>
                      </ol>

                      <div className="flex justify-center pt-2">
                        <Button onClick={onAddChild} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg">
                          <Icon name="Baby" className="mr-2" size={18} />
                          Добавить ребёнка
                        </Button>
                      </div>

                      <p className="text-xs text-blue-700 italic">
                        ℹ️ Для ребёнка не нужен телефон или email — это просто профиль в вашей семье для отслеживания развития.
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🧠 Оценка развития (ИИ)</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Нажмите "Оценка развития" в Родительском режиме</li>
                      <li>Выберите возраст ребёнка (8 диапазонов от 0 до 7 лет)</li>
                      <li>Заполните анкету: оцените навыки (Не умеет / Частично / Уверенно)</li>
                      <li>ИИ создаст отчёт с процентами по 5 категориям</li>
                      <li>Получите персональный план развития с упражнениями</li>
                      <li>Отмечайте выполнение — прогресс обновляется автоматически</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📅 Личный календарь ребёнка</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Добавляйте события по категориям: Здоровье, Школа, Кружки, Спорт, Другое</li>
                      <li>Устанавливайте дату, время, описание</li>
                      <li>Включайте напоминания за день до события</li>
                      <li>Фильтруйте по категориям или смотрите все сразу</li>
                      <li>Доступен в Родительском режиме и в профиле ребёнка (вкладка Календарь)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🔄 Переключение между детьми</p>
                    <p className="text-sm">
                      Если в семье несколько детей, используйте кнопки с именами вверху страницы
                      для переключения между профилями. Вся информация сохраняется отдельно для каждого ребёнка.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">💡 Полезные советы</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Дайте доступ ребёнку:</strong> Переключайтесь в Детский режим, чтобы ребёнок видел свой профиль</li>
                      <li><strong>Регулярная оценка:</strong> Проводите ИИ-анализ каждые 3-6 месяцев для отслеживания прогресса</li>
                      <li><strong>Используйте календарь:</strong> Планируйте всё для каждого ребёнка отдельно</li>
                      <li><strong>Копилка как мотивация:</strong> Платите за задачи, учите копить на цели</li>
                      <li><strong>Магазин наград:</strong> Создавайте привилегии, которые действительно интересны ребёнку</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-blue-200">
                    <Button variant="link" onClick={() => navigate('/instructions')} className="text-blue-600 hover:underline p-0 h-auto text-sm">
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
