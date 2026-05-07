import Icon from '@/components/ui/icon';

export function SlideMilitaryFocus() {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 md:p-10 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-700">
          <Icon name="Shield" size={22} className="text-white sm:hidden" />
          <Icon name="Shield" size={28} className="text-white hidden sm:block" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Гипотеза первого пилотного сегмента: семьи военнослужащих и участников СВО
        </h2>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-5 border-l-4 border-slate-600 mb-5">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
          <Icon name="Lightbulb" size={12} />
          Рабочая гипотеза · обсуждаемо с партнёром
        </div>
        <p className="text-slate-800 text-sm leading-relaxed">
          Одна из аудиторий, с которой <strong>мы рассматриваем возможность стартовать платформу</strong> —
          <strong> семьи военнослужащих и участников СВО</strong>. Это группа с максимальной концентрацией
          мер государственной поддержки и с критической потребностью в координации семьи, информировании о
          льготах и сопровождении в особых жизненных ситуациях. Финальный сегмент пилота определяется
          совместно со стратегическим партнёром.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
            <Icon name="Target" size={18} className="text-amber-700" />
            Почему начинаем с них
          </h3>
          <ul className="space-y-1.5 text-xs text-amber-900">
            <li>• Государственный приоритет — отдельный фокус в Стратегии 615-р</li>
            <li>• Высокая концентрация мер поддержки в одной аудитории</li>
            <li>• Сплочённое и понятное сообщество — быстрее «сарафан»</li>
            <li>• Острая потребность в информировании и координации</li>
            <li>• Понятная дорожка к региональным пилотам и B2G-взаимодействию</li>
          </ul>
        </div>

        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
          <h3 className="font-bold text-rose-900 text-sm mb-3 flex items-center gap-2">
            <Icon name="AlertCircle" size={18} className="text-rose-700" />
            Их боли сегодня
          </h3>
          <ul className="space-y-1.5 text-xs text-rose-900">
            <li>• Не знают, какие льготы и выплаты им положены</li>
            <li>• Сложности с документами в особых жизненных ситуациях</li>
            <li>• Нужна психологическая поддержка семьи и детей</li>
            <li>• Школьники без второго родителя дома — нагрузка на маму</li>
            <li>• Меры поддержки разрозненны: ведомства, регионы, банки</li>
          </ul>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-5 border-l-4 border-emerald-500 mb-5">
        <h3 className="font-bold text-emerald-900 text-sm mb-3 flex items-center gap-2">
          <Icon name="CheckCircle2" size={18} className="text-emerald-700" />
          Что даёт «Наша Семья» этой группе
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { icon: 'Compass', text: 'Навигатор мер поддержки — что положено именно вам' },
            { icon: 'UserCheck', text: 'Кабинет участника СВО и его семьи' },
            { icon: 'Users', text: 'Единый профиль семьи — все документы в одном месте' },
            { icon: 'HeartHandshake', text: 'Цифровые сценарии психологической поддержки и сопровождения в особых ситуациях' },
            { icon: 'Baby', text: 'Маршрут беременности 0–12 мес и помощь по детям' },
            { icon: 'GraduationCap', text: 'Организация учёбы и кружков для школьников' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/70 rounded-xl p-2.5">
              <Icon name={item.icon} size={16} className="text-emerald-700 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-900">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 mb-5">
        <h3 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
          <Icon name="Building2" size={18} className="text-blue-700" />
          Возможный сценарий партнёрства
          <span className="ml-auto text-[10px] font-semibold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
            к обсуждению
          </span>
        </h3>
        <p className="text-xs text-blue-900 leading-relaxed mb-2">
          Один из рассматриваемых сценариев — партнёрство с <strong>крупным банком, для которого семьи
          военнослужащих и участников СВО являются стратегической аудиторией</strong>. Совмещение архитектуры
          платформы и клиентской базы такого партнёра потенциально даёт быстрый запуск, доверие аудитории
          и прямой канал доставки мер поддержки.
        </p>
        <p className="text-[11px] text-blue-800/80 italic leading-relaxed">
          Это рабочая гипотеза, а не объявленное соглашение. Конкретный партнёр, периметр и условия
          определяются по итогам диалога с заинтересованными игроками рынка.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
          <Icon name="TrendingUp" size={18} className="text-purple-600" />
          План масштабирования
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              num: '1',
              color: 'bg-purple-500',
              title: 'Пилот',
              desc: '1 пилотный регион, семьи участников СВО, 3–6 месяцев',
            },
            {
              num: '2',
              color: 'bg-indigo-500',
              title: 'Регионы',
              desc: 'Масштабирование на регионы — B2G-контракты с соцзащитой',
            },
            {
              num: '3',
              color: 'bg-emerald-500',
              title: 'Все семьи РФ',
              desc: 'Выход на B2C / B2B2C — работодатели, корпоративные семейные программы',
            },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full ${step.color} text-white text-sm font-bold flex items-center justify-center`}>
                  {step.num}
                </div>
                <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SlideMilitaryFocus;