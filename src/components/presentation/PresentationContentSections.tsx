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
      {/* СЛАЙД: Государственная стратегическая рамка */}
      <SectionCard>
        <SectionTitle icon="Landmark" iconColor="bg-amber-600" title="Государственная рамка: семья — стратегический приоритет до 2036 года" />
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border-l-4 border-amber-500">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="FileCheck" size={22} className="text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-base mb-1">
                  Распоряжение Правительства РФ № 615-р от 15.03.2025
                </p>
                <p className="text-sm text-amber-800">
                  Утверждена «Стратегия действий по реализации семейной и демографической политики, поддержке многодетности в Российской Федерации до 2036 года»
                </p>
              </div>
            </div>
            <div className="bg-white/70 rounded-xl p-3 mt-3">
              <p className="text-xs text-amber-900 font-semibold mb-1.5">Документ задаёт прямой запрос на наш продукт:</p>
              <ul className="text-xs text-amber-900 space-y-1 ml-1">
                <li>• «семейноцентричный» подход к политике поддержки</li>
                <li>• развитие <strong>государственных сервисов</strong> для совмещения семьи и работы</li>
                <li>• совершенствование <strong>информирования</strong> семей о мерах поддержки</li>
                <li>• сопровождение семей в особых жизненных ситуациях</li>
                <li>• поддержка <strong>многодетности</strong> как приоритет</li>
                <li>• профилактика разводов, психологическое сопровождение</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border-l-4 border-emerald-500">
            <p className="font-semibold text-emerald-900 text-sm mb-1 flex items-center gap-2">
              <Icon name="Target" size={16} />
              Национальный проект «Семья» (запущен 1 января 2025 г.)
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Шесть федеральных проектов: «Многодетная семья», «Поддержка семей с детьми», «Охрана материнства и детства», 
              «Старшее поколение», «Семейные ценности и инфраструктура» — прямая стыковка с модулями нашей платформы.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: 'AlertTriangle', text: '70% родителей испытывают стресс от хаоса в семейной организации' },
              { icon: 'Smartphone', text: 'Семьи используют 5–10 разных приложений (задачи, календарь, финансы, здоровье)' },
              { icon: 'FileQuestion', text: 'Семьи не знают о мерах поддержки, которые им положены — критическая проблема в Стратегии' },
              { icon: 'Briefcase', text: 'Совмещение семьи и работы — отдельная задача в Стратегии до 2036 г.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                <Icon name={item.icon} size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 rounded-2xl p-5 border-l-4 border-purple-500">
            <p className="text-purple-900 font-medium text-sm">
              «Наша Семья» — <strong>цифровой слой исполнения семейной политики на уровне конкретной семьи</strong>: 
              мы не дублируем государственные меры, а помогаем семье ими реально воспользоваться, 
              координируем повседневную жизнь и закрываем те задачи, которые Стратегия 615-р явно обозначает приоритетными.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200 mt-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-500">Источники данных:</span>{' '}
              Распоряжение Правительства РФ от 15.03.2025 № 615-р «Об утверждении Стратегии действий по реализации семейной и демографической политики, поддержке многодетности в Российской Федерации до 2036 года» (publication.pravo.gov.ru); 
              Указ Президента РФ от 09.11.2022 № 809 «Об утверждении Основ государственной политики по сохранению и укреплению традиционных российских духовно-нравственных ценностей»; 
              Национальный проект «Семья» (стартовал 01.01.2025) и шесть его федеральных проектов; 
              исследования ВЦИОМ по теме семейного стресса и цифровых привычек домохозяйств (wciom.ru); 
              аналитика data.ai (App Annie) State of Mobile по числу используемых приложений на домохозяйство.
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



      {/* СЛАЙДЫ "13 разделов" и "Связность экосистемы" удалены — теперь они в SlideHubs (12 хабов) и SlideEcosystem ниже по странице */}
      {/* убрано — содержание на слайдах SlideHubs */}

      {/* убрано — связность экосистемы показана в SlideEcosystem */}

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
        <SectionTitle icon="BarChart3" iconColor="bg-indigo-500" title="Текущие показатели" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <StatCard value="146+" label="Экранов" icon="Monitor" />
          <StatCard value="90" label="API-функций" icon="Server" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard value="151" label="Таблиц БД" icon="Database" />
          <StatCard value="30K+" label="Аналитических событий" icon="Activity" />
          <StatCard value="12" label="Хабов" icon="LayoutGrid" />
        </div>
        <div className="mt-5 bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-emerald-800">
            Статус: продукт полностью разработан и работает в production на домене nasha-semiya.ru
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

          <h3 className="font-bold text-gray-800 text-sm mb-3">Тарификация AI-сервисов (краткая выписка)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { service: 'ИИ-диета', price: '17 ₽', icon: 'Brain' },
              { service: 'AI-фото блюда', price: '7 ₽', icon: 'Image' },
              { service: 'Рецепт из продуктов', price: '5 ₽', icon: 'ChefHat' },
              { service: 'Рецепт (короткий)', price: '2 ₽', icon: 'BookOpen' },
              { service: 'AI-ветеринар', price: '12 ₽', icon: 'PawPrint' },
              { service: 'AI-план развития', price: '25 ₽', icon: 'GraduationCap' },
              { service: 'AI-психолог', price: '30 ₽', icon: 'Brain' },
              { service: 'Зеркало родителя (PARI)', price: '22 ₽', icon: 'HeartHandshake' },
              { service: 'Конфликт-AI', price: '20 ₽', icon: 'MessageCircle' },
              { service: 'AI-маршрут', price: '35 ₽', icon: 'MapPin' },
              { service: 'AI-идеи праздника', price: '15 ₽', icon: 'PartyPopper' },
              { service: 'ИИ-открытка', price: '7 ₽', icon: 'Gift' },
              { service: 'Пакинг-лист AI', price: '5 ₽', icon: 'Briefcase' },
              { service: 'AI-анализ бюджета', price: '20 ₽', icon: 'Wallet' },
              { service: 'AI-астрология', price: '8 ₽', icon: 'Sparkles' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2">
                <Icon name={item.icon} size={14} className="text-emerald-600" />
                <span className="text-xs text-gray-700">{item.service}</span>
                <span className="text-xs font-bold text-emerald-700 ml-auto">{item.price}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Полная таблица тарификации — на отдельном слайде «Тарификация AI-сервисов» ниже.</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-3">Юнит-экономика (кошелёк + партнёры)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-purple-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-purple-700">~200 ₽/мес</p>
              <p className="text-[10px] sm:text-xs text-gray-500">ARPU кошелёк</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-amber-700">+~80 ₽/мес</p>
              <p className="text-[10px] sm:text-xs text-gray-500">ARPU партнёры</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-blue-700">500–800 ₽</p>
              <p className="text-[10px] sm:text-xs text-gray-500">CAC</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-emerald-700">10 080 ₽</p>
              <p className="text-[10px] sm:text-xs text-gray-500">LTV (3 года)</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="font-bold text-purple-700">×14–20</p>
              <p className="text-[10px] text-gray-500">LTV/CAC — окупаемость</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="font-bold text-emerald-700">60–70%</p>
              <p className="text-[10px] text-gray-500">маржа на AI-сервисах</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="font-bold text-blue-700">2–3 мес</p>
              <p className="text-[10px] text-gray-500">payback period</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>10 000 семей · кошелёк</span>
              <span className="font-bold">24 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-amber-50 rounded-lg p-2">
              <span>10 000 семей · + партнёры</span>
              <span className="font-bold text-amber-700">~33,6 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-gray-50 rounded-lg p-2">
              <span>100 000 семей · совокупно</span>
              <span className="font-bold">~336 млн ₽/год</span>
            </div>
            <div className="flex justify-between bg-purple-50 rounded-lg p-2">
              <span>1 000 000 семей · совокупно</span>
              <span className="font-bold text-purple-700">~3,36 млрд ₽/год</span>
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



    </>
  );
}