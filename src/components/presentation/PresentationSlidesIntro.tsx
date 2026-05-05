import Icon from '@/components/ui/icon';
import { SectionCard, SectionTitle } from './PresentationSharedComponents';

export function PresentationSlidesIntro() {
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
              «Наша Семья» — <strong>цифровой семейноцентричный сервис</strong>, который закрывает часть задач,
              прямо обозначенных в Стратегии: координация повседневной жизни семьи, информирование о мерах поддержки,
              сопровождение по жизненным сценариям, поддержка многодетности, здоровье, родительство и совмещение
              семейных обязанностей с работой и учёбой.
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
    </>
  );
}