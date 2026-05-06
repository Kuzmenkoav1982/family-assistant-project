import Icon from '@/components/ui/icon';

export function SlideGovFramework615() {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 md:p-10 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-600">
          <Icon name="Landmark" size={22} className="text-white sm:hidden" />
          <Icon name="Landmark" size={28} className="text-white hidden sm:block" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Государственная рамка: семья — стратегический приоритет до 2036 года
        </h2>
      </div>

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
            <p className="text-xs text-amber-900 font-semibold mb-1.5">Документ формирует прямой спрос на семейноцентричные цифровые сервисы:</p>
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
            «Старшее поколение», «Семейные ценности и инфраструктура» — содержательная стыковка с ключевыми модулями платформы.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: 'AlertTriangle', text: '70% родителей испытывают стресс от хаоса в семейной организации' },
            { icon: 'Smartphone', text: 'Семьи используют 5–10 разных приложений (задачи, календарь, финансы, здоровье) — по данным аналитики мобильного использования' },
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
            Распоряжение Правительства РФ от 15.03.2025 № 615-р «Об утверждении Стратегии действий по реализации семейной и демографической политики, поддержке многодетности в Российской Федерации до 2036 года»;
            Национальный проект «Семья» (стартовал 01.01.2025) и шесть его федеральных проектов;
            исследования ВЦИОМ по теме семейного стресса и цифровых привычек домохозяйств (wciom.ru);
            аналитика data.ai (App Annie) State of Mobile по числу используемых приложений на домохозяйство.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SlideGovFramework615;