import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function HealthInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Alert className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <div className="flex items-start gap-3">
          <Icon name="Heart" className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-rose-900 text-lg">
                Умная система управления здоровьем семьи
              </h3>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                className="h-5 w-5 text-rose-600 transition-transform group-hover:scale-110" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <AlertDescription className="text-rose-800">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">🏥 Возможности раздела</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>ИИ-анализ медицинских документов</strong> — загружайте фото анализов, получайте расшифровку и предупреждения</li>
                      <li><strong>Автоматические напоминания</strong> — не пропустите приём лекарств с push-уведомлениями</li>
                      <li><strong>Дашборд здоровья</strong> — графики показателей, отчёты для врача, экспорт в PDF</li>
                      <li><strong>Мониторинг показателей</strong> — давление, пульс, температура, вес с историей и графиками</li>
                      <li><strong>Медицинская история</strong> — посещения врачей, диагнозы, рекомендации</li>
                      <li><strong>График прививок</strong> — напоминания о следующих вакцинациях</li>
                      <li><strong>База врачей</strong> — контакты, специализация, заметки</li>
                      <li><strong>Страховые полисы</strong> — ОМС, ДМС, путешествия с отслеживанием сроков</li>
                      <li><strong>Телемедицина</strong> — запись на онлайн-консультации</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📋 Быстрый старт</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-white rounded border-l-4 border-rose-500">
                        <p className="font-medium">1. Выберите профиль члена семьи</p>
                        <p className="text-xs text-gray-600">Вверху страницы нажмите на карточку с фото и именем</p>
                      </div>
                      <div className="p-2 bg-white rounded border-l-4 border-rose-500">
                        <p className="font-medium">2. Заполните общую информацию</p>
                        <p className="text-xs text-gray-600">Вкладка "Обзор" → кнопка ✏️ → укажите группу крови, аллергии, хронические заболевания</p>
                      </div>
                      <div className="p-2 bg-white rounded border-l-4 border-rose-500">
                        <p className="font-medium">3. Добавьте показатели</p>
                        <p className="text-xs text-gray-600">Вкладка "Дашборд" → "Добавить показатель" → выберите тип, введите значение</p>
                      </div>
                      <div className="p-2 bg-white rounded border-l-4 border-rose-500">
                        <p className="font-medium">4. Настройте напоминания о лекарствах</p>
                        <p className="text-xs text-gray-600">Вкладка "Лекарства" → добавьте препарат → нажмите 🔔 → включите уведомления</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🤖 ИИ-анализ медицинских документов</p>
                    <p className="text-sm mb-2">
                      YandexGPT распознаёт текст и интерпретирует результаты:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Загрузите фото анализа крови, мочи, гормонов</li>
                      <li>ИИ извлечёт показатели и их значения</li>
                      <li>Получите расшифровку простым языком</li>
                      <li>Увидите предупреждения о значениях вне нормы</li>
                      <li>Результат сохранится в истории визитов</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">💊 Напоминания о лекарствах</p>
                    <div className="space-y-2 text-sm">
                      <p>Push-уведомления приходят на устройство в нужное время:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Выберите время: утро (8:00), день (14:00), вечер (20:00) или точное время</li>
                        <li>В уведомлении: название препарата, дозировка, кнопки "Принял" / "Отложить"</li>
                        <li>Отложенное напоминание придёт через 30 минут</li>
                        <li>История приёма сохраняется автоматически</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📊 Дашборд и отчёты для врача</p>
                    <p className="text-sm mb-2">
                      Вкладка "Дашборд" — ваш медицинский центр управления:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Графики показателей</strong> — динамика давления, пульса за 30 дней</li>
                      <li><strong>Текущие значения</strong> — последние измерения с датой и временем</li>
                      <li><strong>Настройка отчёта</strong> — выберите разделы для включения (чекбоксы)</li>
                      <li><strong>Экспорт в PDF</strong> — готовый документ для врача</li>
                      <li><strong>Печать</strong> — отчёт оптимизирован для печати на бумаге</li>
                      <li><strong>Быстрое внесение</strong> — кнопка "Добавить показатель" с автозаполнением даты/времени</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">📈 Мониторинг показателей</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-white rounded border">
                        <p className="font-medium text-rose-700">🩺 Давление</p>
                        <p className="text-xs">Систолическое/диастолическое, график на 30 дней</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <p className="font-medium text-orange-700">❤️ Пульс</p>
                        <p className="text-xs">Уд/мин, динамика изменений</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <p className="font-medium text-blue-700">🌡️ Температура</p>
                        <p className="text-xs">°C, отслеживание при болезни</p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <p className="font-medium text-green-700">⚖️ Вес</p>
                        <p className="text-xs">Кг, контроль изменений</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">🎯 Примеры использования</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-white rounded border-l-4 border-rose-500">
                        <p className="font-medium text-rose-700">Подготовка к визиту к врачу</p>
                        <p className="text-xs text-gray-600">
                          Дашборд → выберите нужные разделы → Экспорт в PDF → распечатайте отчёт. 
                          Врач увидит полную картину вашего здоровья за месяц.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                        <p className="font-medium text-blue-700">Контроль хронических состояний</p>
                        <p className="text-xs text-gray-600">
                          Гипертония? Вносите давление утром/вечером → график покажет динамику → 
                          поделитесь с кардиологом через PDF.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-green-500">
                        <p className="font-medium text-green-700">Курс лечения</p>
                        <p className="text-xs text-gray-600">
                          Добавьте антибиотик с датами курса → включите напоминания → 
                          не пропустите ни одного приёма.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-purple-500">
                        <p className="font-medium text-purple-700">Расшифровка анализов</p>
                        <p className="text-xs text-gray-600">
                          История → Добавить запись → прикрепите фото анализа → 
                          ИИ распознает и объяснит результаты.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-rose-200">
                    <p className="text-sm">
                      📖 <Link to="/instructions?section=health" className="text-rose-700 hover:text-rose-900 underline font-medium">
                        Подробная инструкция по разделу Здоровье
                      </Link>
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
