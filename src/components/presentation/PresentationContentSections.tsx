import Icon from '@/components/ui/icon';

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section data-pdf-slide className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 md:p-10 mb-6 sm:mb-8 ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ icon, iconColor, title }: { icon: string; iconColor: string; title: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon name={icon} size={22} className="text-white sm:hidden" />
        <Icon name={icon} size={28} className="text-white hidden sm:block" />
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-3 sm:p-5 border border-slate-100 text-center">
      <Icon name={icon} size={24} className="text-purple-500 mx-auto mb-2" />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function FeatureRow({ icon, iconBg, title, desc }: { icon: string; iconBg: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={18} className="text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    { label: 'Российская юрисдикция', us: true, foreign: false, todo: false, bank: true },
    { label: 'Локализация данных в РФ', us: true, foreign: false, todo: false, bank: true },
    { label: 'Всё-в-одном для семьи', us: true, foreign: false, todo: false, bank: false },
    { label: 'AI-ассистент', us: true, foreign: false, todo: false, bank: false },
    { label: 'Голосовое управление', us: true, foreign: false, todo: false, bank: false },
    { label: 'Здоровье + медкарты', us: true, foreign: false, todo: false, bank: false },
    { label: 'Развитие детей с ИИ', us: true, foreign: false, todo: false, bank: false },
    { label: 'Семейные финансы', us: true, foreign: false, todo: false, bank: true },
    { label: 'Госпрограммы и пособия', us: true, foreign: false, todo: false, bank: false },
    { label: 'Геолокация семьи', us: true, foreign: false, todo: false, bank: false },
  ];

  return (
    <div className="overflow-x-auto -mx-2 sm:-mx-2">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b-2 border-purple-200">
            <th className="text-left py-2 px-1.5 sm:px-2 text-gray-600 font-medium text-[10px] sm:text-xs">Критерий</th>
            <th className="text-center py-2 px-1 text-purple-700 font-bold text-[10px] sm:text-xs">Наша семья</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Зарубежные</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Todoist</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs">Банки</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
              <td className="py-1.5 px-1.5 sm:px-2 text-gray-700 text-[10px] sm:text-xs">{row.label}</td>
              <td className="text-center py-1.5">{row.us ? '✅' : '❌'}</td>
              <td className="text-center py-1.5 hidden sm:table-cell">{row.foreign ? '✅' : '❌'}</td>
              <td className="text-center py-1.5 hidden sm:table-cell">{row.todo ? '✅' : '❌'}</td>
              <td className="text-center py-1.5">{row.bank ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PresentationContentSections() {
  return (
    <>
      {/* СЛАЙД: Социальная значимость */}
      <SectionCard>
        <SectionTitle icon="Heart" iconColor="bg-red-500" title="Почему это важно для страны" />
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <div className="bg-amber-50 rounded-2xl p-5 border-l-4 border-amber-400">
            <p className="font-semibold text-amber-900 mb-2">
              Президент РФ объявил 2024–2034 годы Десятилетием семьи
            </p>
            <p className="text-sm text-amber-800">
              Укрепление семейных ценностей — государственный приоритет
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: 'AlertTriangle', text: '70% родителей испытывают стресс от хаоса в семейной организации' },
              { icon: 'Smartphone', text: 'Семьи используют 5–10 разных приложений (задачи, календарь, финансы, здоровье)' },
              { icon: 'Unlink', text: 'Связь между поколениями (бабушки, дедушки) ослабевает' },
              { icon: 'UserX', text: 'Дети не вовлечены в семейные дела и не учатся ответственности' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-red-50/60 rounded-xl p-3">
                <Icon name={item.icon} size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 rounded-2xl p-5 border-l-4 border-purple-500">
            <p className="text-purple-900 font-medium text-sm">
              «Наша Семья» — это не просто приложение. Это инструмент для гармонизации 
              семейных связей, справедливого распределения обязанностей и воспитания 
              ответственности у каждого члена семьи.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200 mt-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-500">Источники данных:</span>{' '}
              Указ Президента РФ №809 от 09.11.2022 «Об утверждении Основ государственной политики по сохранению и укреплению традиционных российских духовно-нравственных ценностей»; 
              Указ Президента РФ №987 от 22.11.2023 «Об объявлении в Российской Федерации Десятилетия семьи»; 
              исследования ВЦИОМ по теме семейного стресса и цифровых привычек домохозяйств (актуализируются ежегодно, wciom.ru); 
              аналитика data.ai (App Annie) по среднему числу используемых приложений на домохозяйство (State of Mobile, актуальные данные на дату подготовки презентации).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Миссия */}
      <SectionCard className="bg-gradient-to-br from-emerald-50 to-teal-50">
        <SectionTitle icon="Target" iconColor="bg-emerald-500" title="Миссия и видение" />
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-6 border-2 border-emerald-300 text-center mb-6">
          <p className="font-bold text-xl text-emerald-900">
            «Объединяя семьи, мы укрепляем общество»
          </p>
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">
          Семья — фундамент общества. Когда семьи работают как единая команда:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'Baby', color: 'text-pink-500', text: 'Дети обучаются и вырастают ответственными' },
            { icon: 'Users', color: 'text-blue-500', text: 'Родители чувствуют поддержку и вовлечённость' },
            { icon: 'Heart', color: 'text-red-500', text: 'Старшее поколение активно участвует в жизни близких' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Icon name={item.icon} size={28} className={`${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-gray-600 text-center">
          <strong>Видение:</strong> стать национальной платформой №1 для российских семей (семейной экосистемой) — единым 
          цифровым центром, где каждый член семьи от ребёнка до бабушки находит свою роль.
        </p>
      </SectionCard>



      {/* СЛАЙД: 12 разделов платформы */}
      <SectionCard className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <SectionTitle icon="LayoutGrid" iconColor="bg-purple-600" title="13 разделов — единая экосистема" />
        <p className="text-sm text-gray-500 mb-6">13 реализованных разделов</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 1. Семья */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icon name="Users" size={16} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800">1. Семья</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Профили каждого члена семьи, ролевая система доступа</li>
              <li>• Детские аккаунты, семейный код для приглашений</li>
              <li>• Раздел «Дети» — полная картина развития, достижения, награды</li>
              <li>• Семейный маячок на Яндекс.Картах</li>
            </ul>
          </div>

          {/* 2. Планирование */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="CalendarCheck" size={16} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">2. Планирование</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Умные задачи с ИИ-распределением по загруженности</li>
              <li>• Геймификация: баллы, достижения, награды</li>
              <li>• Семейные цели с трекингом прогресса</li>
              <li>• Единый семейный календарь</li>
              <li>• Аналитика активности, план покупок</li>
            </ul>
          </div>

          {/* 3. Питание */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Icon name="UtensilsCrossed" size={16} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800">3. Питание</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Персональные ИИ-диеты на 7/14/30 дней</li>
              <li>• 6+ готовых типов диет (кето, веган, медицинские столы)</li>
              <li>• Рецепт из имеющихся продуктов (ИИ-подбор)</li>
              <li>• Трекинг прогресса, графики веса, БЖУ и калории</li>
              <li>• ИИ-мотивация, SOS-поддержка, квизы</li>
            </ul>
          </div>

          {/* 4. Здоровье */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon name="HeartPulse" size={16} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800">4. Здоровье</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Электронные медкарты, ИИ-анализ документов</li>
              <li>• Трекинг прививок по нац. календарю</li>
              <li>• Лекарства с напоминаниями, база врачей</li>
              <li>• Витальные показатели с дашбордом, экспорт PDF</li>
              <li>• Строгое разграничение доступа к медданным</li>
            </ul>
          </div>

          {/* 5. Быт */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Icon name="Home" size={16} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-800">5. Быт и хозяйство</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Умный список покупок (совместный, с категориями)</li>
              <li>• Семейные голосования</li>
              <li>• Семейные правила дома</li>
              <li>• Учёт крупных покупок</li>
            </ul>
          </div>

          {/* 6. Путешествия и досуг */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-cyan-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Icon name="Plane" size={16} className="text-cyan-600" />
              </div>
              <h3 className="font-bold text-gray-800">6. Путешествия и досуг</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Планирование поездок: бюджет, брони, маршруты</li>
              <li>• Wish List мест с AI-рекомендациями</li>
              <li>• Дневник впечатлений и фотоальбомы</li>
              <li>• Организация праздников с AI-генерацией</li>
              <li>• Досуг: кино, рестораны, AI-идеи, маршруты</li>
            </ul>
          </div>

          {/* 7. Ценности */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Icon name="Gem" size={16} className="text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-800">7. Ценности и культура</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Семейные ценности — определение и поддержание принципов</li>
              <li>• Традиции — сохранение и создание новых</li>
              <li>• Культурное наследие, народы России</li>
              <li>• Мудрость народа — пословицы, поговорки, мудрые изречения</li>
              <li>• Раздел «Вера» — духовная составляющая</li>
              <li>• Семейное дерево</li>
            </ul>
          </div>

          {/* 8. Развитие */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Icon name="TrendingUp" size={16} className="text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-800">8. Развитие</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• AI-оценка развития детей (12 возрастных групп, 0–12 лет)</li>
              <li>• Алгоритм на базе Выготского и Эльконина</li>
              <li>• Отчёты по развитию (assessment reports)</li>
              <li>• Индивидуальные планы, навыки, достижения</li>
              <li>• Образовательные ресурсы</li>
            </ul>
          </div>

          {/* 9. Государство */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Icon name="Landmark" size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800">9. Семья и государство</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Актуальные госпрограммы и пособия</li>
              <li>• Материнский капитал — как получить и использовать</li>
              <li>• Семейный кодекс — права и обязанности</li>
              <li>• Дайджест изменений в законодательстве</li>
            </ul>
          </div>

          {/* 10. AI */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon name="Brain" size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-800">10. AI-помощники</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• «Домовой» — персональный AI-ассистент семьи</li>
              <li>• Интеграция с Яндекс Алисой (голосовое управление)</li>
              <li>• AI-генерация: диеты, рецепты, маршруты, планы развития</li>
              <li>• Семейный психолог на ИИ, AI-Астрология</li>
            </ul>
          </div>
        </div>

        {/* 11. Финансы */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon name="Wallet" size={16} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">11. Финансы</h3>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Семейный бюджет, учёт доходов и расходов</li>
            <li>• Счета и карты, кредиты и долги</li>
            <li>• Финансовые цели с трекингом прогресса</li>
            <li>• Детская финансовая грамотность</li>
            <li>• Имущество, скидочные карты, антимошенник</li>
            <li>• Семейный кошелёк — платёжный инструмент внутри платформы</li>
          </ul>
        </div>

        {/* 12. Гараж */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon name="Car" size={16} className="text-slate-600" />
            </div>
            <h3 className="font-bold text-gray-800">12. Гараж</h3>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Учёт автопарка семьи: профили авто</li>
            <li>• Напоминания о ТО, расходы на топливо</li>
            <li>• ОСАГО/КАСКО, штрафы ГИБДД</li>
            <li>• История обслуживания</li>
          </ul>
        </div>

        {/* 13. Мудрость народа */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Icon name="BookOpen" size={16} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-800">13. Мудрость народа</h3>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Сборник пословиц, поговорок и мудрых изречений</li>
            <li>• Категоризация по темам, поиск и фильтрация</li>
            <li>• Избранное и возможность делиться</li>
            <li>• Сохранение культурного наследия для семьи</li>
          </ul>
        </div>
      </SectionCard>

      {/* СЛАЙД: Связность экосистемы */}
      <SectionCard>
        <SectionTitle icon="Network" iconColor="bg-teal-500" title="Реальные связи внутри экосистемы" />
        <p className="text-sm text-gray-500 mb-6">Нажатие одной кнопки запускает цепочку автоматических действий через разделы</p>

        <div className="space-y-4">
          {/* Цепочка 1: Питание */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-3 sm:p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Icon name="UtensilsCrossed" size={14} className="text-white" />
              </div>
              <h4 className="font-bold text-orange-900 text-sm">Питание → Быт → Покупки — одним нажатием</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg font-medium">Создаёшь ИИ-диету</span>
              <Icon name="ArrowRight" size={12} className="text-orange-400" />
              <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg font-medium">Формируется меню на неделю</span>
              <Icon name="ArrowRight" size={12} className="text-orange-400" />
              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-medium">Система рассчитывает ингредиенты</span>
              <Icon name="ArrowRight" size={12} className="text-orange-400" />
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-medium">Список покупок готов автоматически</span>
            </div>
          </div>

          {/* Цепочка 2: Ребёнок */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-3 sm:p-5 border border-pink-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Baby" size={14} className="text-white" />
              </div>
              <h4 className="font-bold text-pink-900 text-sm">Здоровье → Планирование → Задача маме</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-pink-100 text-pink-800 px-2.5 py-1 rounded-lg font-medium">Профиль ребёнка</span>
              <Icon name="ArrowRight" size={12} className="text-pink-400" />
              <span className="bg-pink-100 text-pink-800 px-2.5 py-1 rounded-lg font-medium">Прививки по нац. календарю</span>
              <Icon name="ArrowRight" size={12} className="text-pink-400" />
              <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-medium">Напоминание маме</span>
              <Icon name="ArrowRight" size={12} className="text-pink-400" />
              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-medium">Задача в календарь</span>
            </div>
          </div>

          {/* Цепочка 3: Путешествие */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-3 sm:p-5 border border-cyan-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Plane" size={14} className="text-white" />
              </div>
              <h4 className="font-bold text-cyan-900 text-sm">Путешествия → Финансы → Покупки → Задачи</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-lg font-medium">Планируем поездку</span>
              <Icon name="ArrowRight" size={12} className="text-cyan-400" />
              <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-lg font-medium">Бюджет в «Финансах»</span>
              <Icon name="ArrowRight" size={12} className="text-cyan-400" />
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-medium">Список покупок к поездке</span>
              <Icon name="ArrowRight" size={12} className="text-cyan-400" />
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-medium">Задачи по сборам в календарь</span>
            </div>
          </div>

          {/* Цепочка 4: Развитие + ИИ */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-3 sm:p-5 border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Brain" size={14} className="text-white" />
              </div>
              <h4 className="font-bold text-violet-900 text-sm">AI-ассистент «Домовой» — связывает всё</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg font-medium">Знает возраст ребёнка</span>
              <Icon name="ArrowRight" size={12} className="text-violet-400" />
              <span className="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg font-medium">Формирует план развития</span>
              <Icon name="ArrowRight" size={12} className="text-violet-400" />
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg font-medium">Ставит задачи родителям</span>
              <Icon name="ArrowRight" size={12} className="text-violet-400" />
              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-medium">Трекинг прогресса</span>
            </div>
          </div>

          {/* Цепочка 5: Авто */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-3 sm:p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Car" size={14} className="text-white" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Гараж → Финансы → Планирование</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">ТО авто в «Гараже»</span>
              <Icon name="ArrowRight" size={12} className="text-slate-400" />
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-medium">Расход в «Финансах»</span>
              <Icon name="ArrowRight" size={12} className="text-slate-400" />
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-medium">Задача в «Планировании»</span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200 text-center">
          <p className="text-sm font-semibold text-teal-800">
            Ближайшие конкуренты покрывают 1–2 функции. «Наша Семья» — все 12 направлений в единой связке.
          </p>
        </div>
      </SectionCard>

      {/* СЛАЙД: Целевая аудитория */}
      <SectionCard className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <SectionTitle icon="Users" iconColor="bg-blue-600" title="Целевая аудитория" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { icon: 'Baby', color: 'text-pink-600', bg: 'bg-pink-50', title: 'Семьи с детьми до 7 лет', desc: 'Развитие ребёнка с ИИ, здоровье, прививки, медкарты' },
            { icon: 'GraduationCap', color: 'text-blue-600', bg: 'bg-blue-50', title: 'Семьи со школьниками', desc: 'Организация учёбы, кружков, мотивация через геймификацию' },
            { icon: 'Heart', color: 'text-red-600', bg: 'bg-red-50', title: 'Семьи с несколькими поколениями', desc: 'Вовлечение бабушек/дедушек, семейное древо, связь поколений' },
            { icon: 'Compass', color: 'text-cyan-600', bg: 'bg-cyan-50', title: 'Активные семьи', desc: 'Совместные мероприятия, путешествия, традиции' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name={item.icon} size={20} className={item.color} />
                <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
              </div>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3">Рынок</h4>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div>
              <p className="text-lg sm:text-xl font-bold text-purple-600">50 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">TAM — семей в России</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-blue-600">15 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">SAM — городских с детьми</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600">1,5 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">SOM — цель (3 года)</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-500">Источники:</span>{' '}
              Росстат, Демографический ежегодник России (rosstat.gov.ru) — данные о числе домохозяйств с детьми до 18 лет;
              Минцифры РФ, аналитика об интернет-аудитории городских семей (digital.gov.ru);
              внутренние расчёты команды на основе данных о проникновении мобильных приложений.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Текущие показатели */}
      <SectionCard>
        <SectionTitle icon="BarChart3" iconColor="bg-indigo-500" title="Текущие показатели (MVP)" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <StatCard value="146+" label="Экранов" icon="Monitor" />
          <StatCard value="90" label="API-функций" icon="Server" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard value="151" label="Таблиц БД" icon="Database" />
          <StatCard value="30K+" label="Аналитических событий" icon="Activity" />
          <StatCard value="13" label="Направлений" icon="LayoutGrid" />
        </div>
        <div className="mt-5 bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-emerald-800">
            Статус: MVP полностью разработан, работает в production на домене nasha-semiya.ru
          </p>
        </div>
      </SectionCard>

      {/* СЛАЙД: Технологии */}
      <SectionCard className="bg-gradient-to-br from-slate-50 to-gray-50">
        <SectionTitle icon="Code2" iconColor="bg-slate-700" title="Технологическая платформа" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Monitor" size={16} className="text-blue-500" />
              Frontend
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>• React 18 + TypeScript + Vite</p>
              <p>• Tailwind CSS + Radix UI / ShadCN</p>
              <p>• PWA — работает как мобильное приложение</p>
              <p>• Three.js — 3D-визуализации</p>
              <p>• Sentry — мониторинг ошибок</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Server" size={16} className="text-green-500" />
              Backend
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>• Python 3.11 — 90 облачных функций (serverless)</p>
              <p>• PostgreSQL — 151 таблица</p>
              <p>• Cloud Functions — автомасштабирование</p>
              <p>• S3 Cloud Storage</p>
              <p>• Yandex Cloud — российская облачная инфраструктура</p>
              <p>• REST API</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Brain" size={16} className="text-purple-500" />
              AI / ИИ
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>• Интеграция с российскими AI-моделями</p>
              <p>• «Домовой» — контекстный ассистент</p>
              <p>• AI-генерация: диеты, рецепты, маршруты, планы развития</p>
              <p>• Яндекс Алиса — голосовое управление</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Plug" size={16} className="text-orange-500" />
              Интеграции
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>• Яндекс Алиса, Яндекс Карты</p>
              <p>• Платежи: СБП, Сбер, Т-Банк</p>
              <p>• Push-уведомления, МАХ-бот</p>
              <p>• Экспорт в ICS, XLSX, PDF</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Безопасность */}
      <SectionCard>
        <SectionTitle icon="ShieldCheck" iconColor="bg-green-600" title="Безопасность и защита данных" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: 'MapPin', title: 'Данные в РФ (Yandex Cloud)', desc: 'Все данные хранятся исключительно на российской инфраструктуре Yandex Cloud' },
            { icon: 'Lock', title: 'Шифрование', desc: 'Шифрование данных при передаче (TLS 1.3) и хранении' },
            { icon: 'HeartPulse', title: 'Защита медданных', desc: 'Строгое разграничение доступа: каждый видит только свои медицинские записи' },
            { icon: 'Users', title: 'Ролевая система', desc: 'Администратор, редактор, наблюдатель — на уровне семьи' },
            { icon: 'Key', title: 'Аутентификация', desc: 'Аутентификация по токенам с контролем сессий' },
            { icon: 'FileText', title: 'Аудит-логирование', desc: 'Полная история всех действий пользователей' },
            { icon: 'Shield', title: 'Защита от атак', desc: 'Rate-limiter для DDoS и brute-force, валидация всех данных (Pydantic)' },
            { icon: 'Scale', title: 'ФЗ-152', desc: 'Соответствие требованиям ФЗ-152 «О персональных данных»' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-green-50/60 rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-xs">{item.title}</h4>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-700 font-medium">
            Готовность к прохождению аудита безопасности при интеграции с банковской инфраструктурой
          </p>
        </div>
      </SectionCard>

      {/* СЛАЙД: Реестр ПО */}
      <SectionCard className="bg-gradient-to-br from-sky-50 to-blue-50">
        <SectionTitle icon="FileCheck" iconColor="bg-sky-600" title="Реестр российского ПО" />
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-sky-200 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">На стадии регистрации</p>
              <p className="text-xs text-gray-500">Включение в Единый реестр российского ПО ожидается в ближайшее время</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-xs text-gray-600 mb-4">
          {[
            'Разработчик — ИП, зарегистрированный в РФ',
            'Все данные на серверах в Российской Федерации (Yandex Cloud)',
            'Открытые фреймворки без санкционных рисков',
            'Полностью русскоязычный интерфейс',
            'Соответствие требованиям ФЗ-152',
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon name="Check" size={14} className="text-sky-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Депонирование — выполнено */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Icon name="ShieldCheck" size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-emerald-900 text-sm">Депонирование ПО — выполнено ✓</h4>
                <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">РЦИС.РФ</span>
              </div>
              <p className="text-xs text-emerald-800 mb-3">
                Программный код «Наша Семья» депонирован в Национальном реестре интеллектуальной 
                собственности (н'РИС / РЦИС). Авторство подтверждено и защищено.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide font-medium">Свидетельство №</p>
                  <p className="font-bold text-gray-800">0607-331-313</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide font-medium">Дата регистрации</p>
                  <p className="font-bold text-gray-800">04.03.2026</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide font-medium">Рег. номер н'РИС</p>
                  <p className="font-bold text-gray-800">518-830-027</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide font-medium">Правообладатель</p>
                  <p className="font-bold text-gray-800">ИП Кузьменко А.В.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-emerald-200">
                <img 
                  src="https://cdn.poehali.dev/files/ad2ee2fd-dd83-4691-aa61-aa83fdf80c5d.PNG"
                  alt="Свидетельство РЦИС"
                  className="w-10 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">Свидетельство РЦИС №0607-331-313</p>
                  <p className="text-[10px] text-gray-500">«Наша Семья — цифровая платформа благополучия семейной жизни»</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Тип объекта: Компьютерная программа</p>
                  <a
                    href="https://nris.ru/deposits/check-certificate/?num=518-830-027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1 font-medium"
                  >
                    <Icon name="ExternalLink" size={10} />
                    Проверить на nris.ru
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Бизнес-модель */}
      <SectionCard>
        <SectionTitle icon="TrendingUp" iconColor="bg-emerald-600" title="Бизнес-модель" />
        <p className="text-sm text-gray-500 mb-5">Семейный кошелёк — pay-per-use модель</p>
        
        <div className="mb-6">
          <div className="bg-emerald-50 rounded-2xl p-3 sm:p-5 border border-emerald-200 mb-5">
            <h3 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
              <Icon name="Wallet" size={16} className="text-emerald-600" />
              Семейный кошелёк
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Единый баланс семьи для всех платных сервисов платформы. Пополнение через карту или СБП (от 50 ₽).
              Прозрачная модель: платишь только за то, чем пользуешься.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-white rounded-xl p-2 sm:p-3">
                <p className="text-base sm:text-lg font-bold text-emerald-700">от 50 ₽</p>
                <p className="text-[10px] sm:text-xs text-gray-500">мин. пополнение</p>
              </div>
              <div className="bg-white rounded-xl p-2 sm:p-3">
                <p className="text-base sm:text-lg font-bold text-emerald-700">СБП + карта</p>
                <p className="text-[10px] sm:text-xs text-gray-500">способы оплаты</p>
              </div>
              <div className="bg-white rounded-xl p-2 sm:p-3">
                <p className="text-base sm:text-lg font-bold text-emerald-700">Pay-per-use</p>
                <p className="text-[10px] sm:text-xs text-gray-500">платишь за использование</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 text-sm mb-3">Тарификация AI-сервисов</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { service: 'ИИ-диета', price: '17 ₽', icon: 'Brain' },
              { service: 'AI-фото блюда', price: '7 ₽', icon: 'Image' },
              { service: 'Рецепт из продуктов', price: '5 ₽', icon: 'ChefHat' },
              { service: 'ИИ-открытка', price: '7 ₽', icon: 'Gift' },
              { service: 'Рецепт (короткий)', price: '2 ₽', icon: 'BookOpen' },
              { service: 'Рекомендации досуга', price: '4 ₽', icon: 'MapPin' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2">
                <Icon name={item.icon} size={14} className="text-emerald-600" />
                <span className="text-xs text-gray-700">{item.service}</span>
                <span className="text-xs font-bold text-emerald-700 ml-auto">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-3">Юнит-экономика (кошелёк + партнёры)</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-purple-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-purple-700">~200 ₽/мес</p>
              <p className="text-[10px] sm:text-xs text-gray-500">ARPU (ср. чек)</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-blue-700">500–800 ₽</p>
              <p className="text-[10px] sm:text-xs text-gray-500">CAC</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-emerald-700">7 200 ₽</p>
              <p className="text-[10px] sm:text-xs text-gray-500">LTV (3 года)</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>10 000 семей</span>
              <span className="font-bold">24 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>100 000 семей</span>
              <span className="font-bold">240 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-purple-50 rounded-lg p-2">
              <span>1 000 000 семей</span>
              <span className="font-bold text-purple-700">2,4 млрд ₽/год</span>
            </div>
          </div>
        </div>

        {/* Партнёрская выручка */}
        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3 sm:p-5 border border-amber-200">
          <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
            <Icon name="Handshake" size={16} className="text-amber-600" />
            Партнёрская выручка (% от транзакций)
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Дополнительный доход без прямых вложений — платформа получает комиссию с каждой транзакции, 
            совершённой через интегрированные сервисы партнёров.
          </p>
          <div className="space-y-2 text-xs mb-4">
            {[
              { partner: 'Маркетплейсы (WB, Озон, Яндекс Маркет)', commission: '2–5%', icon: 'ShoppingCart', color: 'text-violet-600' },
              { partner: 'Банки — финансовые продукты (ипотека, кредиты)', commission: '0.5–1.5%', icon: 'Landmark', color: 'text-blue-600' },
              { partner: 'Страхование (ДМС, КАСКО, имущество)', commission: '5–10%', icon: 'Shield', color: 'text-emerald-600' },
              { partner: 'Туристические сервисы (билеты, отели)', commission: '3–8%', icon: 'Plane', color: 'text-sky-600' },
              { partner: 'Образование и курсы для детей', commission: '10–15%', icon: 'GraduationCap', color: 'text-pink-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <Icon name={item.icon} size={14} className={item.color} />
                  <span className="text-gray-700">{item.partner}</span>
                </div>
                <span className="font-bold text-amber-700 ml-3 flex-shrink-0">{item.commission}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-white rounded-xl p-2 sm:p-3">
              <p className="text-sm sm:text-base font-bold text-amber-700">+20–40%</p>
              <p className="text-[10px] sm:text-xs text-gray-500">к выручке от кошелька</p>
            </div>
            <div className="bg-white rounded-xl p-2 sm:p-3">
              <p className="text-sm sm:text-base font-bold text-amber-700">0 ₽</p>
              <p className="text-[10px] sm:text-xs text-gray-500">доп. затрат</p>
            </div>
            <div className="bg-white rounded-xl p-2 sm:p-3">
              <p className="text-sm sm:text-base font-bold text-amber-700">Win-Win</p>
              <p className="text-[10px] sm:text-xs text-gray-500">партнёр платит за конверсию</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Семейный ID */}
      <SectionCard className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <SectionTitle icon="Fingerprint" iconColor="bg-blue-600" title="Семейный ID — новый клиентский опыт" />
        <p className="text-sm text-gray-600 mb-5">
          Единый цифровой профиль семьи создаёт уникальный клиентский опыт для банков, 
          маркетплейсов и сервисных компаний. Семья — это не набор индивидуальных клиентов, 
          а <strong>единый центр принятия финансовых решений</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Банки */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon name="Landmark" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Банки и финтех</h4>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>Общие семейные счета и карты</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>Единый кэшбэк на всю семью</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>Семейные ипотечные и кредитные программы</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>Накопительные цели для детей</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>Страховые продукты (ДМС, КАСКО)</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" /><span><strong>Сбер, Т-Банк, Яндекс</strong> — партнёры экосистемы</span></li>
            </ul>
          </div>

          {/* Маркетплейсы */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Icon name="ShoppingCart" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Маркетплейсы и ритейл</h4>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-violet-500 mt-0.5 flex-shrink-0" /><span>Список покупок → прямая интеграция в корзину маркетплейса</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-violet-500 mt-0.5 flex-shrink-0" /><span>Семейные бонусные программы (общие баллы)</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-violet-500 mt-0.5 flex-shrink-0" /><span>ИИ-диета → автоматический заказ продуктов</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-violet-500 mt-0.5 flex-shrink-0" /><span>Рекомендации к праздникам и событиям</span></li>
              <li className="flex items-start gap-1.5"><Icon name="Check" size={12} className="text-violet-500 mt-0.5 flex-shrink-0" /><span><strong>Wildberries, Озон, Яндекс Маркет</strong> — площадки интеграции</span></li>
            </ul>
          </div>
        </div>

        {/* Ценности для партнёра */}
        <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-3 sm:p-5">
          <h4 className="font-bold text-indigo-900 text-sm mb-3">Почему это выгодно партнёру:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
            {[
              { icon: 'Heart', label: 'Ценности семьи', sub: 'лояльность на годы' },
              { icon: 'Sparkles', label: 'Гармония и порядок', sub: 'снижение стресса клиента' },
              { icon: 'Users', label: 'Единый клиент', sub: 'семья, а не отдельные люди' },
              { icon: 'TrendingUp', label: 'Клиентский опыт', sub: 'глубокий и персональный' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3">
                <Icon name={item.icon} size={20} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Потенциал для банка */}
      <SectionCard className="bg-gradient-to-br from-amber-50 to-yellow-50">
        <SectionTitle icon="Building2" iconColor="bg-amber-600" title="Потенциал для стратегического партнёра" />
        <div className="space-y-3 mb-6">
          {[
            { icon: 'Heart', title: 'Лояльность клиентов', desc: 'Семейная платформа привязывает клиентов на годы — семья = долгосрочные отношения' },
            { icon: 'Database', title: 'Данные о семьях', desc: 'Понимание потребностей: ипотека, образование, здоровье, путешествия — для таргетированных продуктов' },
            { icon: 'Layers', title: 'Суперапп-стратегия', desc: 'Семейная платформа — идеальный элемент экосистемы банка' },
            { icon: 'HandHeart', title: 'Социальная ответственность', desc: 'Поддержка института семьи = репутационный капитал и ESG-отчётность' },
            { icon: 'ArrowLeftRight', title: 'Кросс-продажи', desc: 'От бюджета к ипотеке, от путешествий к страховке, от здоровья к ДМС, от «Гаража» к КАСКО' },
            { icon: 'Wallet', title: 'Готовый раздел «Финансы»', desc: 'Открытая площадка для продуктов банка: карты, накопительные программы, кэшбэк, кредиты — в контексте жизни семьи' },
            { icon: 'Flag', title: 'Государственная повестка', desc: 'Поддержка «Десятилетия семьи» — репутация, гранты, преференции' },
            { icon: 'Trophy', title: 'Конкурентное преимущество', desc: 'Ни один банк РФ не имеет собственной семейной платформы' },
          ].map((item, i) => (
            <FeatureRow key={i} icon={item.icon} iconBg="bg-amber-500" title={item.title} desc={item.desc} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-amber-200">
          <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
            <Icon name="Lightbulb" size={16} className="text-amber-500" />
            Раздел «Финансы» — стратегическая возможность
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Раздел спроектирован как открытая точка интеграции. Банк-партнёр может наполнить его собственными сервисами:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {[
              'Семейные счета и карты',
              'Накопительные программы',
              'Кэшбэк за семейные покупки',
              'Страховые продукты (ДМС, КАСКО)',
              'Аналитика расходов на базе банковских данных',
              'Кредитные продукты с семейными условиями',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Icon name="Check" size={12} className="text-amber-500 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Каналы коммуникации — MAX */}
      <SectionCard>
        <SectionTitle icon="MessageCircle" iconColor="bg-blue-500" title="Каналы коммуникации" />
        <p className="text-sm text-gray-500 mb-5">
          Платформа присутствует в мессенджере MAX — российском аналоге Telegram
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Канал */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/9079c4ae-4ba2-4aa1-9e41-811ec09039e2.jpeg"
                alt="MAX Канал"
                className="w-16 h-16 rounded-2xl shadow-md object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-800">Канал «Наша Семья»</h3>
                
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Информационный канал платформы в MAX — новости, обновления, полезный контент для семей. 
              Регулярные публикации, запланированные посты, 3 администратора.
            </p>
            <a 
              href="https://max.ru/id231805288780_biz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium"
            >
              <Icon name="ExternalLink" size={12} />
              max.ru/id231805288780_biz
            </a>
          </div>

          {/* Бот */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-3 sm:p-5 border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/94fa0fe5-a480-435c-9ffd-909d10b3e26e.jpeg"
                alt="MAX Чат-бот"
                className="w-16 h-16 rounded-2xl shadow-md object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-800">Чат-бот «Наша семья»</h3>
                <p className="text-sm text-slate-500">@id231805288780_bot</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              «Наша Семья» — управляйте семьёй онлайн! Место, где Ваша семья становится командой. 
              Интерактивный бот для быстрого доступа к функциям платформы.
            </p>
            <a 
              href="https://max.ru/id231805288780_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium"
            >
              <Icon name="ExternalLink" size={12} />
              max.ru/id231805288780_bot
            </a>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Доска идей */}
      <SectionCard className="bg-gradient-to-br from-yellow-50 to-amber-50">
        <SectionTitle icon="Lightbulb" iconColor="bg-yellow-500" title="Доска идей — развитие с пользователями" />
        <p className="text-sm text-gray-600 mb-4">
          В платформу встроена «Доска идей» — инструмент совместного развития продукта с аудиторией.
          Каждый пользователь может предложить идею, голосовать за предложения других и участвовать в обсуждениях.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: 'MessageSquare', title: 'Прямая обратная связь', desc: 'От целевой аудитории' },
            { icon: 'BarChart3', title: 'Приоритизация', desc: 'На основе реального спроса' },
            { icon: 'Users', title: 'Вовлечённость', desc: 'Пользователи влияют на продукт' },
            { icon: 'ShieldCheck', title: 'Снижение рисков', desc: 'Строим то, что нужно семьям' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <Icon name={item.icon} size={20} className="text-yellow-600 mb-2" />
              <h4 className="font-semibold text-gray-800 text-xs">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>



      {/* СЛАЙД: Команда */}
      <SectionCard className="bg-gradient-to-br from-gray-50 to-slate-50">
        <SectionTitle icon="User" iconColor="bg-slate-600" title="Команда" />
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-gray-800 text-lg mb-1">Кузьменко А.В.</h3>
          <p className="text-sm text-purple-600 font-medium mb-3">CEO, основатель, продуктовый визионер</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Платформа создана на основе реальных потребностей собственной семьи</p>
            <p>• Глубокое понимание проблем целевой аудитории</p>
            <p>• Архитектура продукта спроектирована с учётом масштабирования</p>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Юридическая информация */}
      <SectionCard>
        <SectionTitle icon="Building2" iconColor="bg-gray-600" title="Юридическая информация" />
        <div className="bg-slate-50 rounded-2xl p-3 sm:p-5 border border-slate-200">
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium text-gray-500">Наименование:</span> ИП Кузьменко А.В.</p>
            <p><span className="font-medium text-gray-500">ОГРНИП:</span> 325774600908955</p>
            <p><span className="font-medium text-gray-500">ИНН:</span> 231805288780</p>
            <p><span className="font-medium text-gray-500">Платформа:</span> nasha-semiya.ru</p>
          </div>
        </div>
      </SectionCard>

      {/* ============================================== */}
      {/* БЛОК ДЛЯ КОНКУРСА GENERATION AI AWARDS 2026    */}
      {/* 7 слайдов: AI-фокус, номинация «Лучший стартап» */}
      {/* ============================================== */}

      {/* РАЗДЕЛИТЕЛЬ */}
      <SectionCard className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Icon name="Award" size={16} className="text-white" />
            <span className="text-xs font-semibold uppercase tracking-wider">Generation AI Awards 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Заявка на премию</h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Номинация «Лучший стартап в области генеративного AI»
          </p>
          <p className="text-xs text-white/60 mt-4">
            Далее — 7 слайдов с фокусом на генеративный AI для подачи заявки
          </p>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 1: ТИТУЛ */}
      <SectionCard className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-6">
            <Icon name="Sparkles" size={14} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Generation AI Awards 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3">
            «Наша Семья»
          </h1>
          <p className="text-base sm:text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
            Единая AI-платформа для управления семейной жизнью на базе YandexGPT и Yandex Vision
          </p>
          <div className="inline-block bg-white rounded-2xl px-6 py-3 shadow-md border border-purple-200 mb-6">
            <p className="text-xs text-gray-500 mb-0.5">Номинация</p>
            <p className="text-sm font-bold text-purple-700">Лучший стартап в области генеративного AI</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Icon name="Building2" size={14} className="text-purple-500" />
              <span>ИП Кузьменко А.В.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="Globe" size={14} className="text-purple-500" />
              <span>nasha-semiya.ru</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="Calendar" size={14} className="text-purple-500" />
              <span>2024 — настоящее время</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 2: ПРОБЛЕМА */}
      <SectionCard className="bg-gradient-to-br from-red-50 to-orange-50">
        <SectionTitle icon="AlertCircle" iconColor="bg-red-500" title="Проблема" />
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-l-4 border-red-400 shadow-sm">
            <p className="text-gray-800 font-medium mb-2">
              Родители тратят <span className="text-red-600 font-bold">5–8 часов в неделю</span> на координацию семейного быта
            </p>
            <p className="text-sm text-gray-600">
              Распределение задач, меню, финансы, здоровье детей, праздники, поездки — всё ведётся
              в 5–10 разных приложениях. Информация теряется, решения принимаются хаотично.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
              <Icon name="Clock" size={22} className="text-red-500 mb-2" />
              <p className="text-xs font-bold text-gray-800 mb-1">Рутина съедает время</p>
              <p className="text-xs text-gray-600">Планирование меню на неделю — до 2 часов. Расшифровка анализов — визит к врачу 1–3 дня.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
              <Icon name="Wallet" size={22} className="text-red-500 mb-2" />
              <p className="text-xs font-bold text-gray-800 mb-1">Дорогие консультации</p>
              <p className="text-xs text-gray-600">Диетолог, психолог, врач-консультант — недоступны большинству семей по цене.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
              <Icon name="Layers" size={22} className="text-red-500 mb-2" />
              <p className="text-xs font-bold text-gray-800 mb-1">Нет единого инструмента</p>
              <p className="text-xs text-gray-600">На рынке РФ нет платформы, которая объединяла бы все сферы семейной жизни с помощью GenAI.</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-900">
              <strong>70% родителей</strong> испытывают стресс от хаоса в семейной организации.
              При этом <strong>Президент РФ объявил 2024–2034 годы Десятилетием семьи</strong> — 
              укрепление семейных ценностей стало государственным приоритетом.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 3: РЕШЕНИЕ */}
      <SectionCard className="bg-gradient-to-br from-emerald-50 to-teal-50">
        <SectionTitle icon="Sparkles" iconColor="bg-emerald-500" title="Решение: AI-платформа «Наша Семья»" />
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100">
            <p className="text-gray-700 leading-relaxed">
              Единая SPA-платформа (PWA), которая объединяет <strong>13 реализованных разделов</strong> управления 
              семейной жизнью и <strong>10 генеративных AI-функций</strong> на базе российских моделей 
              YandexGPT и Yandex Vision. Заменяет десятки разрозненных приложений одним семейным AI-ассистентом.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
            {[
              { value: '13', label: 'разделов', icon: 'LayoutGrid', color: 'text-purple-600' },
              { value: '10', label: 'AI-функций', icon: 'Brain', color: 'text-indigo-600' },
              { value: '146+', label: 'экранов', icon: 'Monitor', color: 'text-blue-600' },
              { value: '90', label: 'API-функций', icon: 'Server', color: 'text-green-600' },
              { value: '151', label: 'таблиц БД', icon: 'Database', color: 'text-orange-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-3 text-center shadow-sm border border-emerald-100">
                <Icon name={s.icon} size={18} className={`${s.color} mx-auto mb-1`} />
                <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <Icon name="Brain" size={16} className="text-indigo-500" />
                AI-функции на базе YandexGPT
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• AI-ассистент «Домовой» (RAG, контекст семьи)</li>
                <li>• AI-анализ медицинских документов (OCR + LLM)</li>
                <li>• AI-диетолог (персональные планы питания)</li>
                <li>• AI-психолог (семейные консультации)</li>
                <li>• AI-рецепты из имеющихся продуктов</li>
                <li>• AI-генератор событий и праздников</li>
                <li>• AI-планирование поездок и маршрутов</li>
                <li>• AI-оценка развития детей (по Выготскому)</li>
                <li>• AI-Астрология и Нумерология</li>
                <li>• Голосовое управление через Яндекс Алису</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <Icon name="LayoutGrid" size={16} className="text-purple-500" />
                13 разделов платформы
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Семья, Планирование, Питание, Здоровье</li>
                <li>• Быт и хозяйство, Путешествия и досуг</li>
                <li>• Ценности и культура, Развитие</li>
                <li>• Семья и государство, AI-помощники</li>
                <li>• <strong>Финансовый хаб</strong> (бюджет, кошелёк, цели)</li>
                <li>• <strong>Гараж</strong> (учёт авто, ТО, страховки)</li>
                <li>• <strong>Мудрость народа</strong> (пословицы, изречения)</li>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 4: ТЕХНОЛОГИЧЕСКАЯ ГЛУБИНА */}
      <SectionCard className="bg-gradient-to-br from-slate-50 to-indigo-50">
        <SectionTitle icon="Cpu" iconColor="bg-indigo-600" title="Технологическая глубина AI" />
        <p className="text-sm text-gray-600 mb-4">
          Это не «обёртка над LLM». В основе — кастомные пайплайны, RAG, разные модели под разные задачи.
        </p>

        <div className="space-y-3">
          {/* OCR → LLM пайплайн */}
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Icon name="ScanLine" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Двухэтапный пайплайн OCR → LLM для медицинских анализов</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg font-medium">Фото бумажного анализа</span>
              <Icon name="ArrowRight" size={12} className="text-indigo-400" />
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg font-medium">Yandex Vision OCR</span>
              <Icon name="ArrowRight" size={12} className="text-indigo-400" />
              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-medium">Извлечение 13+ маркеров</span>
              <Icon name="ArrowRight" size={12} className="text-indigo-400" />
              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-medium">YandexGPT (t=0.3)</span>
              <Icon name="ArrowRight" size={12} className="text-indigo-400" />
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-medium">Интерпретация + рекомендации</span>
            </div>
            <p className="text-xs text-gray-500">
              Извлекаются гемоглобин, лейкоциты, эритроциты, глюкоза, АЛТ, АСТ, креатинин, холестерин и др.
              Низкая температура для медицинской точности.
            </p>
          </div>

          {/* RAG */}
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <Icon name="MessageSquare" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">RAG-подход в AI-ассистенте «Домовой»</h4>
            </div>
            <p className="text-xs text-gray-600">
              Ассистент подгружает в контекст последние 10 сообщений из истории чата семьи + данные профиля 
              (возраст детей, состав семьи, предпочтения). Это обеспечивает персонализацию ответов без fine-tuning модели.
            </p>
          </div>

          {/* Модели под задачи */}
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon name="Settings2" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Разные модели и температуры под разные задачи</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="font-bold text-blue-900">YandexGPT-lite, t=0.7</p>
                <p className="text-blue-700">Чат, идеи событий, рецепты — где нужна креативность</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="font-bold text-purple-900">YandexGPT, t=0.3</p>
                <p className="text-purple-700">Медицинские анализы — где нужна точность</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="font-bold text-emerald-900">Async Operations API</p>
                <p className="text-emerald-700">Диетпланы на неделю — тяжёлая длинная генерация</p>
              </div>
            </div>
          </div>

          {/* Промпт-инжиниринг */}
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Icon name="FileCode" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Специализированные системные промпты по доменам</h4>
            </div>
            <p className="text-xs text-gray-600">
              Отдельные промпты под общий анализ крови, биохимию, анализ мочи, педиатрию, диетологию, психологию семьи.
              Каждый промпт задаёт роль, ограничения, формат ответа и требования безопасности (не ставить диагнозы, 
              рекомендовать обращение к врачу).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 5: КЛЮЧЕВЫЕ AI-КЕЙСЫ */}
      <SectionCard>
        <SectionTitle icon="Zap" iconColor="bg-yellow-500" title="Ключевые AI-кейсы: было → стало" />
        <div className="space-y-3">
          {/* Кейс 1 */}
          <div className="bg-gradient-to-r from-red-50 to-emerald-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Icon name="HeartPulse" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">AI-анализ медицинских документов</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-100 rounded-lg p-3">
                <p className="font-bold text-red-900 mb-1">БЫЛО</p>
                <p className="text-red-800">Визит к врачу или платная расшифровка анализов. 1–3 дня ожидания, 1500–3000 ₽.</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="font-bold text-emerald-900 mb-1">СТАЛО</p>
                <p className="text-emerald-800">Фото анализа → расшифровка и рекомендации за 30 секунд. 5 ₽ через кошелёк.</p>
              </div>
            </div>
          </div>

          {/* Кейс 2 */}
          <div className="bg-gradient-to-r from-red-50 to-emerald-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Icon name="UtensilsCrossed" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">AI-диетолог — план питания на неделю</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-100 rounded-lg p-3">
                <p className="font-bold text-red-900 mb-1">БЫЛО</p>
                <p className="text-red-800">Мама тратит 2 часа: подбор рецептов, расчёт БЖУ, список покупок вручную.</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="font-bold text-emerald-900 mb-1">СТАЛО</p>
                <p className="text-emerald-800">Квиз 2 минуты → AI генерирует меню на 7 дней + автоматический список покупок в раздел «Быт».</p>
              </div>
            </div>
          </div>

          {/* Кейс 3 */}
          <div className="bg-gradient-to-r from-red-50 to-emerald-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                <Icon name="Brain" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">AI-психолог для семейных ситуаций</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-100 rounded-lg p-3">
                <p className="font-bold text-red-900 mb-1">БЫЛО</p>
                <p className="text-red-800">Семейный психолог — 3000–8000 ₽ за сессию, запись за неделю. Недоступно большинству.</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="font-bold text-emerald-900 mb-1">СТАЛО</p>
                <p className="text-emerald-800">Первичная AI-консультация с учётом состава семьи и возраста детей — 24/7, 10 ₽ за запрос.</p>
              </div>
            </div>
          </div>

          {/* Кейс 4 */}
          <div className="bg-gradient-to-r from-red-50 to-emerald-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Icon name="Baby" size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">AI-оценка развития ребёнка (по Выготскому и Эльконину)</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-100 rounded-lg p-3">
                <p className="font-bold text-red-900 mb-1">БЫЛО</p>
                <p className="text-red-800">Приём у детского психолога, оценка по возрастным нормам вручную, длинная анкета.</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="font-bold text-emerald-900 mb-1">СТАЛО</p>
                <p className="text-emerald-800">Анкета → AI формирует отчёт по 12 возрастным группам и индивидуальный план развития.</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 6: БИЗНЕС-МОДЕЛЬ И РЫНОК */}
      <SectionCard className="bg-gradient-to-br from-green-50 to-emerald-50">
        <SectionTitle icon="TrendingUp" iconColor="bg-green-600" title="Бизнес-модель и рынок" />
        
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-green-100 mb-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="Wallet" size={16} className="text-green-600" />
            Семейный кошелёк — микроплатежи за AI-запросы
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Вместо классических подписок реализован внутренний кошелёк: пользователь пополняет баланс семьи 
            и платит за каждое AI-действие. Прозрачно, честно, без абонплаты.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="font-bold text-green-900">3 ₽</p>
              <p className="text-green-700">AI-ассистент, запрос</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="font-bold text-green-900">5 ₽</p>
              <p className="text-green-700">Анализ медицинского документа</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="font-bold text-green-900">10 ₽</p>
              <p className="text-green-700">AI-психолог, сессия</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="font-bold text-green-900">10–30 ₽</p>
              <p className="text-green-700">Генерация диетплана / маршрута</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Пополнение через СБП, Сбер, Т-Банк. Кошелёк общий на семью — все участники используют один баланс.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-green-100 mb-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="Target" size={16} className="text-green-600" />
            Рынок
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div>
              <p className="text-lg sm:text-2xl font-black text-purple-600">50 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">TAM — семей в России</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-blue-600">15 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">SAM — городских с детьми</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-emerald-600">1,5 млн</p>
              <p className="text-[10px] sm:text-xs text-gray-500">SOM — цель на 3 года</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>Социальное влияние:</strong> проект делает AI-услуги (медицина, психология, нутрициология) 
            доступными семьям, которые раньше не могли их себе позволить. Это прямой вклад в 
            государственную программу «Десятилетие семьи 2024–2034».
          </p>
        </div>
      </SectionCard>

      {/* AI-СЛАЙД 7: КОМАНДА, КОНТАКТЫ, ДЕМО */}
      <SectionCard className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <SectionTitle icon="Rocket" iconColor="bg-purple-600" title="Команда и контакты" />
        
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-purple-100 mb-4">
          <h4 className="font-bold text-gray-800 text-lg mb-1">Кузьменко Анастасия</h4>
          <p className="text-sm text-purple-600 font-medium mb-3">CEO, основатель, продуктовый визионер</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>• Платформа создана на основе реальных потребностей собственной семьи</p>
            <p>• Глубокое понимание проблем целевой аудитории</p>
            <p>• Архитектура продукта спроектирована с учётом масштабирования</p>
            <p>• Стартап-стадия, готовность к коммерческому запуску и привлечению партнёров</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Globe" size={16} className="text-purple-600" />
              Демо и материалы
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <Icon name="ExternalLink" size={12} className="text-purple-500" />
                <span>Платформа: <strong>nasha-semiya.ru</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="ExternalLink" size={12} className="text-purple-500" />
                <span>Презентация: <strong>nasha-semiya.ru/presentation</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="MessageCircle" size={12} className="text-purple-500" />
                <span>Канал в MAX: <strong>«Наша Семья»</strong></span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Icon name="Mail" size={16} className="text-purple-600" />
              Контакты
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <Icon name="Mail" size={12} className="text-purple-500" />
                <span>ip.kuzmenkoav@yandex.ru</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="Phone" size={12} className="text-purple-500" />
                <span>+7 (985) 080-78-88</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="Building2" size={12} className="text-purple-500" />
                <span>ИП Кузьменко А.В., ИНН 231805288780</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white text-center">
          <Icon name="Sparkles" size={24} className="text-white mx-auto mb-2" />
          <p className="text-lg font-bold mb-1">«Наша Семья» — AI, который заботится о главном</p>
          <p className="text-xs text-white/80">Generation AI Awards 2026 · Лучший стартап в области генеративного AI</p>
        </div>
      </SectionCard>
    </>
  );
}