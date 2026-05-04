import Icon from '@/components/ui/icon';

const SECURITY_ITEMS = [
  {
    icon: 'MapPin',
    title: 'Данные хранятся в России',
    desc: 'Вся информация — на российских серверах Yandex Cloud, без передачи за границу.',
  },
  {
    icon: 'Lock',
    title: 'Шифрование на банковском уровне',
    desc: 'Защищённое соединение и шифрование при хранении — как в крупных банках.',
  },
  {
    icon: 'HeartPulse',
    title: 'Медданные — только для своих',
    desc: 'Медицинская карта ребёнка видна только тем, кому вы дали доступ.',
  },
  {
    icon: 'Users',
    title: 'Гибкие роли в семье',
    desc: 'Назначайте, что может видеть и редактировать каждый — родители, дети, бабушки.',
  },
  {
    icon: 'Shield',
    title: 'Защита от взлома',
    desc: 'Автоматическая блокировка подозрительной активности и попыток подбора пароля.',
  },
  {
    icon: 'FileText',
    title: 'История всех действий',
    desc: 'Видно, кто и когда что-то менял — никаких скрытых правок в семейных данных.',
  },
  {
    icon: 'Scale',
    title: 'Соответствие 152-ФЗ',
    desc: 'Полностью соответствуем закону «О персональных данных» РФ.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Зарегистрированный продукт',
    desc: 'Программа депонирована в РЦИС, свидетельство №0607-331-313.',
  },
];

export default function WelcomeSecurity() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="ShieldCheck" size={16} />
            Безопасность семьи — наш приоритет
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Данные вашей семьи
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              под надёжной защитой
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы понимаем: GPS детей, медкарты, финансы — это самое ценное.
            Поэтому защищаем как банк, а храним только в России.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {SECURITY_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-emerald-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 mb-4">
                <Icon name={item.icon} size={22} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Icon name="ShieldCheck" size={32} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Российский продукт, защищённый законом
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                ИП Кузьменко А.В. · ОГРНИП 325774600908955 · Программа депонирована в РЦИС.
                Никаких иностранных серверов и сторонних сервисов с доступом к данным семьи.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <Icon name="Flag" size={12} />
                152-ФЗ
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <Icon name="MapPin" size={12} />
                Yandex Cloud
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <Icon name="BadgeCheck" size={12} />
                РЦИС
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
