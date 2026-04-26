import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function FinanceHubInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="LayoutDashboard" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает финансовый хаб
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Центр управления семейными финансами</p>
                    <p className="text-xs leading-relaxed">
                      Финансовый хаб объединяет 12 модулей: финансовый пульс, стратегия погашения, кэш-флоу прогноз,
                      бюджет, счета, кредиты и долги, цели, финграмотность, имущество, скидочные карты,
                      антимошенник и кошелёк сервиса. Начните с добавления счетов и настройки бюджета —
                      остальные модули подключатся автоматически.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">С чего начать?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Добавьте счета и карты — система покажет общий баланс</li>
                      <li>Настройте бюджет — категории доходов/расходов и лимиты</li>
                      <li>Внесите кредиты и долги — для полной финансовой картины</li>
                      <li>Создайте финансовые цели — копите на мечты всей семьёй</li>
                      <li>Откройте «Финансовый пульс» — ИИ оценит здоровье финансов</li>
                      <li>Постройте «Стратегию погашения» и «Кэш-флоу прогноз» на 24 месяца</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Новые модули</p>
                    <ul className="text-xs space-y-0.5 ml-4 list-disc">
                      <li><b>Финансовый пульс</b> — полный анализ здоровья финансов, ИИ-рекомендации и прогнозы</li>
                      <li><b>Стратегия погашения</b> — Лавина, Снежный ком, симулятор «Что если?» и план досрочных платежей</li>
                      <li><b>Кэш-флоу прогноз</b> — прогноз движения денег на 24 месяца с предупреждениями о кассовых разрывах</li>
                    </ul>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Финансовые данные защищены шифрованием и доступны только членам вашей семьи.
                      Бюджет, долги, счета и аналитика видны только владельцу семьи.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceBudgetInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="PieChart" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает бюджет
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Планирование доходов и расходов</p>
                    <p className="text-xs leading-relaxed">
                      Бюджет помогает контролировать денежные потоки семьи на каждый месяц.
                      Записывайте доходы и расходы, устанавливайте лимиты по категориям,
                      отслеживайте исполнение. Система покажет сколько потрачено и сколько осталось.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как вести бюджет?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Запись» — добавьте доход или расход с категорией и датой</li>
                      <li>Вкладка «Бюджет» — создайте лимиты по категориям на месяц</li>
                      <li>Вкладка «Аналитика» — графики расходов и динамика за 6 месяцев</li>
                      <li>Подключите регулярные платежи — они учтутся как плановые операции</li>
                      <li>Подтверждайте плановые платежи — они превратятся в реальные записи</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Система предупредит о превышении лимитов и возможных кассовых разрывах.
                      Бюджет можно экспортировать в PDF для отчётности.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceDebtsInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Receipt" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работают кредиты и долги
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Учёт всех обязательств семьи</p>
                    <p className="text-xs leading-relaxed">
                      Ведите учёт ипотеки, кредитов, кредитных карт, автокредитов, микрозаймов и
                      личных долгов. Система рассчитает прогноз погашения, переплату и срок закрытия.
                      Если не указать процентную ставку — подставится средняя по рынку (30% для кредиток,
                      18% для кредитов, 12% для ипотеки).
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как добавить и отслеживать?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Добавить» — выберите тип долга и укажите сумму, ставку, платёж</li>
                      <li>Для кредитных карт: укажите лимит, текущий долг и мин. платёж (%)</li>
                      <li>Нажмите на долг — увидите прогноз погашения, переплату и график</li>
                      <li>Кнопка «Платёж» — внесите очередной или досрочный платёж</li>
                      <li>Симулятор покажет экономию при увеличении ежемесячного платежа</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Отмечайте приоритетные долги звёздочкой. Долги с галочкой «Показать в бюджете»
                      автоматически появятся как плановые расходы.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceAccountsInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="CreditCard" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работают счета и карты
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Все балансы семьи в одном месте</p>
                    <p className="text-xs leading-relaxed">
                      Добавьте банковские карты, счета в банке, вклады, наличные и электронные
                      кошельки. Система покажет общий баланс семьи и распределение средств.
                      Счета привязываются к транзакциям в бюджете для точного учёта.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как добавить счёт?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Добавить» — выберите тип (карта, вклад, наличные, e-кошелёк)</li>
                      <li>Укажите банк, название, баланс и последние 4 цифры</li>
                      <li>Выберите цвет и иконку для быстрого узнавания</li>
                      <li>Обновляйте баланс вручную — нажмите на карточку счёта</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Деактивируйте неиспользуемые счета — они скроются из общего баланса,
                      но данные сохранятся. Общий баланс учитывает только активные счета.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceGoalsInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Target" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работают финансовые цели
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Накопления на мечты всей семьёй</p>
                    <p className="text-xs leading-relaxed">
                      Создавайте цели для крупных покупок: квартира, машина, отпуск, образование,
                      подушка безопасности. Устанавливайте целевую сумму и срок — система рассчитает
                      сколько нужно откладывать ежемесячно и покажет прогресс.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как создать цель?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Цель» — выберите иконку и цвет из 12 шаблонов</li>
                      <li>Укажите название, целевую сумму и дату достижения</li>
                      <li>Внесите уже накопленные средства, если есть</li>
                      <li>Кнопка «Отложить» на карточке — добавить деньги к цели</li>
                      <li>При достижении 100% цель автоматически помечается как выполненная</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Визуальный прогресс-бар и обратный отсчёт дней мотивируют копить регулярно.
                      Общая сумма накоплений видна на карточке сверху.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceLiteracyInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="GraduationCap" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает финансовая грамотность
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Обучение для всей семьи</p>
                    <p className="text-xs leading-relaxed">
                      Курсы и тесты по финансовой грамотности, разделённые по возрастам:
                      6-10 лет, 11-14 лет, 15-17 лет и взрослые. Темы от первых карманных
                      денег и основ бюджетирования до инвестиций, налогов и страхования.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как проходить обучение?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Выберите возрастную группу с помощью фильтра вверху</li>
                      <li>Откройте курс — проходите уроки последовательно</li>
                      <li>Нажмите «Урок пройден» после прочтения материала</li>
                      <li>Сдавайте тесты — система запомнит лучший результат</li>
                      <li>Отслеживайте прогресс по каждому курсу на прогресс-баре</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Курсы подходят для совместного изучения. Обсуждайте пройденные темы
                      с детьми — это укрепляет финансовые привычки всей семьи.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceRecurringInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Repeat" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работают регулярные платежи
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Автоматический учёт повторяющихся операций</p>
                    <p className="text-xs leading-relaxed">
                      Зарплата, аренда, ЖКХ, интернет, подписки, кредитные платежи — добавьте один раз,
                      и система будет автоматически учитывать их в бюджете каждый месяц. Платежи
                      появятся как плановые операции, которые можно подтвердить одной кнопкой.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как настроить?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Добавить» или выберите шаблон (ЖКХ, зарплата, интернет)</li>
                      <li>Укажите сумму, тип (доход/расход), частоту и день месяца</li>
                      <li>Для квартальных/годовых платежей выберите конкретные месяцы</li>
                      <li>Привяжите категорию бюджета для автоматической группировки</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Система рассчитает среднемесячные доходы и расходы с учётом всех регулярных
                      платежей, включая квартальные и годовые (приведённые к месячному эквиваленту).
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceAssetsInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Home" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает учёт имущества
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Все активы семьи в одном реестре</p>
                    <p className="text-xs leading-relaxed">
                      Ведите учёт недвижимости, транспорта, техники, мебели, ювелирных изделий,
                      инвестиций, земельных участков и бизнеса. Отслеживайте общую стоимость
                      имущества и её изменение со временем для реальной оценки благосостояния.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как вести учёт?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Добавить» — выберите тип актива из 9 категорий</li>
                      <li>Укажите название, дату покупки, стоимость покупки и текущую стоимость</li>
                      <li>Добавьте описание и местоположение при необходимости</li>
                      <li>Периодически обновляйте текущую стоимость — нажмите на карточку</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Общая стоимость всех активных объектов отображается на карточке сверху.
                      Вместе со счетами и долгами это даёт полную картину чистого капитала семьи.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceLoyaltyInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Ticket" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работают скидочные карты
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Карты лояльности всей семьи</p>
                    <p className="text-xs leading-relaxed">
                      Бонусные карты магазинов, аптек, АЗС, кафе и ресторанов — добавьте один
                      раз, и вся семья сможет пользоваться. Штрихкоды и номера карт можно
                      показывать на кассе прямо с экрана телефона.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Как пользоваться?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Нажмите «Добавить» — укажите магазин, номер карты и категорию</li>
                      <li>Введите данные штрихкода — его можно показать на кассе</li>
                      <li>Укажите бонусный баланс и срок действия, если есть</li>
                      <li>Нажмите на карту — откроется полная информация и штрихкод</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Вся семья видит все карты — больше не нужно пересылать фото штрихкодов
                      или носить пластиковые карточки с собой.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceAnalyticsInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Activity" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает финансовая аналитика
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Полный анализ финансового здоровья</p>
                    <p className="text-xs leading-relaxed">
                      ИИ анализирует все ваши данные — доходы, расходы, долги, накопления — и
                      оценивает финансовое здоровье по 100-балльной шкале. Вы получите персональные
                      рекомендации: что улучшить, где сэкономить, как быстрее закрыть долги.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Что анализируется?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Долговая нагрузка (DTI) — отношение платежей по долгам к доходам</li>
                      <li>Подушка безопасности — сколько месяцев расходов покрывают накопления</li>
                      <li>Норма сбережений — какой процент дохода откладывается</li>
                      <li>ИИ-советник — задайте любой вопрос о своей финансовой ситуации</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Чем больше данных вы внесёте (счета, долги, бюджет, регулярные платежи),
                      тем точнее будет анализ и полезнее рекомендации.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceStrategyInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="Swords" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает стратегия погашения
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Два метода погашения долгов</p>
                    <p className="text-xs leading-relaxed">
                      «Лавина» — сначала гасите самые дорогие долги по процентной ставке
                      (максимальная экономия на процентах). «Снежный ком» — сначала закрываете
                      мелкие долги (быстрый психологический эффект, мотивация). Система сравнит
                      оба метода и выделит оптимальный для вашей ситуации.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Симулятор «Что если?»</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Выберите конкретный долг из выпадающего списка</li>
                      <li>Укажите сумму дополнительного ежемесячного платежа</li>
                      <li>Или выберите быстрый сценарий: 10%, 25%, 50% от дохода</li>
                      <li>График покажет разницу между базовым и ускоренным погашением</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Калькулятор досрочного погашения (бонус/премия)</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Укажите свободную сумму — например, премию или 13-ю зарплату</li>
                      <li>Выберите приоритет: «Меньше переплата», «Легче платить» или «Быстрый результат»</li>
                      <li>Нажмите «Закрыть» у нужного кредита — сумма заполнится автоматически</li>
                      <li>Введите частичную сумму вручную → кнопка «Внести платёж … в историю» зафиксирует платёж в БД</li>
                      <li>Если суммы хватает на полное закрытие — появится кнопка «Подтвердить — закрыть N кредита»: нажмите, и кредит будет отмечен погашенным в системе</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Таймлайн и достижения</p>
                    <p className="text-xs leading-relaxed">
                      Для каждой стратегии виден порядок закрытия долгов по месяцам и карточки
                      достижений: сколько кредитов закроется за год, когда исчезнет последний платёж,
                      общая экономия на процентах.
                    </p>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Рекомендованная стратегия отмечена звёздочкой. Даже небольшая доплата
                      (10% дохода) может сократить срок кредита на годы. Раздел доступен только
                      владельцу семьи.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceCashflowInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="TrendingUp" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает прогноз денежного потока
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Проекция на 24 месяца вперёд</p>
                    <p className="text-xs leading-relaxed">
                      Система прогнозирует движение денег на 2 года: доходы, расходы, платежи
                      по долгам и свободный остаток. Видно когда ожидается дефицит (кассовый разрыв)
                      и когда появятся свободные деньги — это помогает планировать крупные покупки.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Что показывает прогноз?</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Средние свободные средства в месяц и минимальный остаток</li>
                      <li>Месяцы с отрицательным балансом выделены красным</li>
                      <li>График сгорания долгов — когда будут закрыты все кредиты</li>
                      <li>Динамика количества активных долгов по месяцам</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Прогноз строится на основе регулярных платежей, бюджета и текущих долгов.
                      Чем точнее данные — тем надёжнее прогноз.
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

export function FinanceAntiscamInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <Icon name="ShieldAlert" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
              <h3 className="font-semibold text-indigo-900 text-sm">
                Как работает антимошенник
              </h3>
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 space-y-3">
              <AlertDescription className="text-indigo-800">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">Защита семьи от финансовых мошенников</p>
                    <p className="text-xs leading-relaxed">
                      База знаний о самых распространённых схемах обмана: телефонные звонки
                      «из банка», фишинговые ссылки, поддельные сайты Госуслуг, инвестиционные
                      пирамиды, взлом мессенджеров. Узнайте как распознать мошенника заранее.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1 text-sm">Ключевые возможности</p>
                    <ol className="text-xs space-y-0.5 ml-4 list-decimal">
                      <li>Тревожная кнопка «Мне звонят мошенники!» — пошаговая инструкция из 5 шагов</li>
                      <li>Проверка ссылок, номеров телефонов и текстов SMS на подозрительность</li>
                      <li>12+ карточек мошеннических схем с признаками и способами защиты</li>
                      <li>Горячие линии банков для экстренной блокировки карт</li>
                    </ol>
                  </div>

                  <div className="bg-white/50 p-2 rounded-lg">
                    <p className="text-xs">
                      Изучите базу заранее и расскажите о популярных схемах пожилым родственникам.
                      Настоящий банк никогда не звонит с просьбой перевести деньги на «безопасный счёт».
                    </p>
                  </div>

                  <Link
                    to="/instructions?section=finance"
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
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

const SECTION_MAP: Record<string, () => JSX.Element> = {
  hub: FinanceHubInstructions,
  budget: FinanceBudgetInstructions,
  debts: FinanceDebtsInstructions,
  accounts: FinanceAccountsInstructions,
  goals: FinanceGoalsInstructions,
  literacy: FinanceLiteracyInstructions,
  recurring: FinanceRecurringInstructions,
  assets: FinanceAssetsInstructions,
  loyalty: FinanceLoyaltyInstructions,
  analytics: FinanceAnalyticsInstructions,
  strategy: FinanceStrategyInstructions,
  cashflow: FinanceCashflowInstructions,
  antiscam: FinanceAntiscamInstructions,
};

export default function FinanceInstructions({ section }: { section: string }) {
  const Component = SECTION_MAP[section];
  if (!Component) return null;
  return <Component />;
}