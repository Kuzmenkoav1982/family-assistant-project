import Icon from '@/components/ui/icon';
import { SectionCard, SectionTitle, StatCard } from './PresentationSharedPrimitives';

export function SlideImportance() {
  return (
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
  );
}

export function SlideMission() {
  return (
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
  );
}

export function SlideAudience() {
  return (
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
  );
}

export function SlideMetrics() {
  return (
    <SectionCard>
      <SectionTitle icon="BarChart3" iconColor="bg-indigo-500" title="Текущие показатели (MVP)" />
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
          Статус: MVP полностью разработан, работает в production на домене nasha-semiya.ru
        </p>
      </div>
    </SectionCard>
  );
}
