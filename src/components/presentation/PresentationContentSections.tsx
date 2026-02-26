import Icon from '@/components/ui/icon';

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-8 ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ icon, iconColor, title }: { icon: string; iconColor: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColor}`}>
        <Icon name={icon} size={28} className="text-white" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 text-center">
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
    { label: 'Данные в РФ', us: true, foreign: false, todo: false, bank: true },
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
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-purple-200">
            <th className="text-left py-2 px-2 text-gray-600 font-medium">Критерий</th>
            <th className="text-center py-2 px-1 text-purple-700 font-bold text-xs">Наша семья</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-xs">Зарубежные</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-xs">Todoist</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-xs">Банки</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
              <td className="py-1.5 px-2 text-gray-700 text-xs">{row.label}</td>
              <td className="text-center py-1.5">{row.us ? '✅' : '❌'}</td>
              <td className="text-center py-1.5">{row.foreign ? '✅' : '❌'}</td>
              <td className="text-center py-1.5">{row.todo ? '✅' : '❌'}</td>
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
              «Наша семья» — это не просто приложение. Это инструмент для восстановления 
              семейных связей, справедливого распределения обязанностей и воспитания 
              ответственности у каждого члена семьи.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'Baby', color: 'text-pink-500', text: 'Дети вырастают ответственными' },
            { icon: 'Users', color: 'text-blue-500', text: 'Родители чувствуют поддержку' },
            { icon: 'Heart', color: 'text-red-500', text: 'Старшее поколение вовлечено в жизнь близких' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Icon name={item.icon} size={28} className={`${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-gray-600 text-center">
          <strong>Видение:</strong> стать национальной платформой №1 для российских семей — единым 
          цифровым центром, где каждый член семьи от ребёнка до бабушки находит свою роль.
        </p>
      </SectionCard>

      {/* СЛАЙД: Уникальность */}
      <SectionCard>
        <SectionTitle icon="Shield" iconColor="bg-blue-500" title="Полностью российский продукт. Аналогов нет." />
        <ComparisonTable />
        <p className="text-sm text-gray-500 mt-4 text-center">
          На рынке нет комплексного решения, объединяющего все аспекты семейной жизни. 
          Ближайшие конкуренты покрывают 1–2 функции, «Наша семья» — все 12 направлений.
        </p>
      </SectionCard>

      {/* СЛАЙД: 12 разделов платформы */}
      <SectionCard className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <SectionTitle icon="LayoutGrid" iconColor="bg-purple-600" title="12 разделов — единая экосистема" />
        <p className="text-sm text-gray-500 mb-6">10 реализованных + 2 в активной разработке</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 1. Семья */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
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
              <li>• Семейное древо (в разработке)</li>
            </ul>
          </div>

          {/* 2. Планирование */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cyan-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
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
              <li>• Раздел «Вера» (в разработке)</li>
            </ul>
          </div>

          {/* 8. Развитие */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
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

        {/* В разработке */}
        <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Icon name="Wrench" size={18} className="text-amber-600" />
            В активной разработке
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="Wallet" size={14} className="text-green-600" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">11. Финансы</h4>
              </div>
              <p className="text-xs text-gray-600">
                Семейный бюджет, учёт трат, финансовые цели, детская финансовая грамотность. 
                Семейный кошелёк уже работает как платёжный инструмент внутри платформы.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon name="Car" size={14} className="text-slate-600" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">12. Гараж</h4>
              </div>
              <p className="text-xs text-gray-600">
                Учёт автопарка семьи: профили авто, напоминания о ТО, расходы на топливо, 
                ОСАГО/КАСКО, штрафы ГИБДД, история обслуживания.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Связность экосистемы */}
      <SectionCard>
        <SectionTitle icon="Network" iconColor="bg-teal-500" title="Как разделы связаны в экосистему" />
        <p className="text-sm text-gray-500 mb-5">Уникальная связность — каждый раздел усиливает остальные</p>
        
        <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 mb-5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Icon name="Users" size={16} className="text-purple-600" />
              <span className="font-bold text-purple-800 text-sm">СЕМЬЯ (профили)</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: 'CalendarCheck', label: 'Планирование', color: 'bg-blue-100 text-blue-600' },
              { icon: 'HeartPulse', label: 'Здоровье', color: 'bg-red-100 text-red-600' },
              { icon: 'UtensilsCrossed', label: 'Питание', color: 'bg-orange-100 text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 rounded-xl ${item.color.split(' ')[0]} flex items-center justify-center mx-auto mb-1`}>
                  <Icon name={item.icon} size={18} className={item.color.split(' ')[1]} />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <Icon name="Brain" size={16} className="text-indigo-600" />
              <span className="font-bold text-indigo-800 text-sm">«ДОМОВОЙ» (AI-ассистент)</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'Plane', label: 'Досуг', color: 'bg-cyan-100 text-cyan-600' },
              { icon: 'TrendingUp', label: 'Развитие', color: 'bg-violet-100 text-violet-600' },
              { icon: 'Landmark', label: 'Государство', color: 'bg-emerald-100 text-emerald-600' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 rounded-xl ${item.color.split(' ')[0]} flex items-center justify-center mx-auto mb-1`}>
                  <Icon name={item.icon} size={18} className={item.color.split(' ')[1]} />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium mb-2">Примеры связности:</p>
          {[
            'Профиль ребёнка → прививки → напоминания → задача маме → календарь',
            'AI знает возраст ребёнка → план развития → задачи → трекинг прогресса',
            'Путешествие → бюджет в «Финансах» → список покупок → задачи по сборам',
            'ТО авто в «Гараже» → расход в «Финансах» → задача в «Планировании»',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <Icon name="ArrowRight" size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* СЛАЙД: Целевая аудитория */}
      <SectionCard className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <SectionTitle icon="Users" iconColor="bg-blue-600" title="Целевая аудитория" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { icon: 'Baby', color: 'text-pink-600', bg: 'bg-pink-50', title: 'Семьи с детьми до 7 лет', desc: 'Развитие ребёнка с ИИ, здоровье, прививки, медкарты' },
            { icon: 'GraduationCap', color: 'text-blue-600', bg: 'bg-blue-50', title: 'Семьи со школьниками', desc: 'Организация учёбы, кружков, мотивация через геймификацию' },
            { icon: 'Heart', color: 'text-red-600', bg: 'bg-red-50', title: 'Многопоколенные семьи', desc: 'Вовлечение бабушек/дедушек, семейное древо, связь поколений' },
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
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-purple-600">50 млн</p>
              <p className="text-xs text-gray-500">TAM — семей в России</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">15 млн</p>
              <p className="text-xs text-gray-500">SAM — городских с детьми</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">1,5 млн</p>
              <p className="text-xs text-gray-500">SOM — цель (3 года)</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* СЛАЙД: Текущие показатели */}
      <SectionCard>
        <SectionTitle icon="BarChart3" iconColor="bg-indigo-500" title="Текущие показатели (MVP)" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <StatCard value="40+" label="Пользователей" icon="UserCheck" />
          <StatCard value="51" label="Семей" icon="Users" />
          <StatCard value="90+" label="Экранов" icon="Monitor" />
          <StatCard value="86" label="API-функций" icon="Server" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard value="151" label="Таблиц БД" icon="Database" />
          <StatCard value="30K+" label="Аналитических событий" icon="Activity" />
          <StatCard value="12" label="Направлений" icon="LayoutGrid" />
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
              <p>• Python 3.11 — 86 облачных функций (serverless)</p>
              <p>• PostgreSQL — 151 таблица</p>
              <p>• Cloud Functions — автомасштабирование</p>
              <p>• S3 Cloud Storage</p>
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
            { icon: 'MapPin', title: 'Данные в РФ', desc: 'Все данные хранятся исключительно на серверах в Российской Федерации' },
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
        <div className="bg-white rounded-2xl p-5 border border-sky-200 mb-4">
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
        <div className="space-y-2 text-xs text-gray-600">
          {[
            'Разработчик — ИП, зарегистрированный в РФ',
            'Все данные на серверах в Российской Федерации',
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
      </SectionCard>

      {/* СЛАЙД: Бизнес-модель */}
      <SectionCard>
        <SectionTitle icon="TrendingUp" iconColor="bg-emerald-600" title="Бизнес-модель" />
        <p className="text-sm text-gray-500 mb-5">Гибридная модель: подписка + семейный кошелёк</p>
        
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Подписочные тарифы</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-emerald-200">
                  <th className="text-left py-2 px-2 text-gray-600">Тариф</th>
                  <th className="text-left py-2 px-2 text-gray-600">Цена</th>
                  <th className="text-left py-2 px-2 text-gray-600">Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50/50">
                  <td className="py-1.5 px-2 font-medium">Free</td>
                  <td className="py-1.5 px-2">0 ₽</td>
                  <td className="py-1.5 px-2 text-gray-500">До 2 членов, 5 AI-запросов/день</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-medium">Premium 1 мес</td>
                  <td className="py-1.5 px-2">299 ₽/мес</td>
                  <td className="py-1.5 px-2 text-gray-500">Безлимит: AI, фото, члены семьи</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-1.5 px-2 font-medium">Premium 3 мес</td>
                  <td className="py-1.5 px-2">799 ₽ <span className="text-emerald-600">(267 ₽/мес)</span></td>
                  <td className="py-1.5 px-2 text-gray-500">Экономия 11%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-medium">Premium 6 мес</td>
                  <td className="py-1.5 px-2">1 499 ₽ <span className="text-emerald-600">(250 ₽/мес)</span></td>
                  <td className="py-1.5 px-2 text-gray-500">Экономия 17%</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-1.5 px-2 font-medium">Premium 12 мес</td>
                  <td className="py-1.5 px-2">2 699 ₽ <span className="text-emerald-600">(225 ₽/мес)</span></td>
                  <td className="py-1.5 px-2 text-gray-500">Экономия 25%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Семейный кошелёк (pay-per-use для AI)</h3>
          <p className="text-xs text-gray-500 mb-3">
            Единый баланс семьи для AI-сервисов. Пополнение через карту или СБП (от 50 ₽).
          </p>
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
          <h3 className="font-bold text-gray-800 text-sm mb-3">Юнит-экономика</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-purple-700">13 200 ₽</p>
              <p className="text-xs text-gray-500">LTV (3 года)</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-700">500–800 ₽</p>
              <p className="text-xs text-gray-500">CAC</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">16–26x</p>
              <p className="text-xs text-gray-500">LTV / CAC</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>10 000 пользователей</span>
              <span className="font-bold">44 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>100 000 пользователей</span>
              <span className="font-bold">440 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-purple-50 rounded-lg p-2">
              <span>1 000 000 пользователей</span>
              <span className="font-bold text-purple-700">4,4 млрд ₽/год</span>
            </div>
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

        <div className="bg-white rounded-2xl p-5 border border-amber-200">
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
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/776cc6df-d74c-4dfd-8b9e-ea9aea6d4bc8.png"
                alt="MAX Канал"
                className="w-16 h-16 rounded-2xl shadow-md object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-800">Канал «Наша Семья»</h3>
                <p className="text-sm text-blue-600">811 подписчиков</p>
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
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/2b12a45f-18b1-4a9d-a0e7-4c3f58414268.png"
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

      {/* СЛАЙД: Дорожная карта */}
      <SectionCard>
        <SectionTitle icon="Map" iconColor="bg-violet-600" title="Дорожная карта при партнёрстве" />
        <div className="space-y-3">
          {[
            { period: '0–3 мес', action: 'Интеграция в экосистему', result: 'Адаптация UI/UX, SSO, банковские API, запуск «Финансов»', color: 'border-blue-400 bg-blue-50' },
            { period: '3–6 мес', action: 'Пилотный запуск', result: '10 000 семей сотрудников банка', color: 'border-emerald-400 bg-emerald-50' },
            { period: '6–12 мес', action: 'Открытый запуск', result: '100 000+ семей клиентов банка', color: 'border-purple-400 bg-purple-50' },
            { period: '12–24 мес', action: 'Масштабирование', result: '500 000+ семей, кросс-продажи', color: 'border-amber-400 bg-amber-50' },
            { period: '24–36 мес', action: 'Национальный масштаб', result: '1 500 000+ семей', color: 'border-red-400 bg-red-50' },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-4 border-l-4 ${item.color}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400">ЭТАП {i + 1}</span>
                  <h4 className="font-bold text-gray-800 text-sm">{item.action}</h4>
                  <p className="text-xs text-gray-500">{item.result}</p>
                </div>
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{item.period}</span>
              </div>
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
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium text-gray-500">Наименование:</span> ИП Кузьменко А.В.</p>
            <p><span className="font-medium text-gray-500">ОГРНИП:</span> 325774600908955</p>
            <p><span className="font-medium text-gray-500">ИНН:</span> 231805288780</p>
            <p><span className="font-medium text-gray-500">Платформа:</span> nasha-semiya.ru</p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
