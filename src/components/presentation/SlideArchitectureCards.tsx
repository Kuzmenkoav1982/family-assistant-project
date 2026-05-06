import Icon from '@/components/ui/icon';
import type { ModuleStatus } from './moduleData';

interface CardItem {
  name: string;
  icon: string;
  status: ModuleStatus;
  shortDesc: string;
  fullDesc: string;
  tech?: string;
  note?: string;
}

const FOUNDATION: CardItem[] = [
  {
    name: 'Auth · единый вход',
    icon: 'Lock',
    status: 'live',
    shortDesc: 'JWT, роли, сессии',
    fullDesc:
      'Сквозная авторизация всей семьи и сотрудников регионов. JWT-токены, ролевая модель, разделение прав.',
    tech: 'JWT · OAuth 2.0',
    note: 'Готово к интеграции с ЕСИА',
  },
  {
    name: 'PostgreSQL',
    icon: 'Database',
    status: 'live',
    shortDesc: 'Профили, события, документы',
    fullDesc:
      'Основное хранилище данных семьи: профили, календарь, задачи, бюджет, дети, медицина. Резервные копии.',
    tech: 'PostgreSQL 15',
    note: 'Размещение в РФ · 152-ФЗ-готово',
  },
  {
    name: 'Cloud Functions',
    icon: 'Cloud',
    status: 'live',
    shortDesc: 'Бизнес-логика на Python',
    fullDesc:
      'Серверная логика: расчёты выплат, навигатор льгот, AI-обработка, отчёты регионам. Масштабирование автоматическое.',
    tech: 'Python 3.11',
    note: 'Безсерверно, оплата за вызовы',
  },
  {
    name: 'S3 · файлы',
    icon: 'HardDrive',
    status: 'live',
    shortDesc: 'Документы и фото',
    fullDesc:
      'Хранение справок, фотографий, медицинских документов. Защита доступа, шифрование на уровне бакета.',
    tech: 'S3 · CDN',
    note: 'CDN-раздача на territории РФ',
  },
  {
    name: 'Push-уведомления',
    icon: 'Bell',
    status: 'live',
    shortDesc: 'Web · iOS · Android',
    fullDesc:
      'Напоминания о делах, школе, врачах. Уведомления для соцработников: новые заявки, истечение сроков.',
    tech: 'Web Push · APNS · FCM',
  },
  {
    name: '152-ФЗ соответствие',
    icon: 'ShieldCheck',
    status: 'dev',
    shortDesc: 'Персональные данные',
    fullDesc:
      'Согласия, журнал доступа к данным, право на удаление. Подготовка к включению в РОИВ-периметр.',
    note: 'Уведомление в Роскомнадзор подано',
  },
  {
    name: 'Реестр отеч. ПО',
    icon: 'BadgeCheck',
    status: 'planned',
    shortDesc: 'Минцифры',
    fullDesc:
      'Включение «Нашей Семьи» в Единый реестр российских программ для ЭВМ — обязательно для B2G-контрактов.',
    note: 'Подача в IV квартале 2026',
  },
  {
    name: 'Аналитика',
    icon: 'BarChart3',
    status: 'live',
    shortDesc: 'Метрики и события',
    fullDesc:
      'Сквозная аналитика: воронки, удержание, активные семьи, использование модулей. Отчёты регионам.',
    tech: 'События · когорты',
  },
];

const CHANNELS: CardItem[] = [
  {
    name: 'Госуслуги',
    icon: 'Landmark',
    status: 'planned',
    shortDesc: 'Вход через ЕСИА',
    fullDesc:
      'Авторизация семьи через ЕСИА, прокидывание подтверждённых данных в карточку семьи. Ускорение регистрации.',
    note: 'Интеграция по 615-р до 2030',
  },
  {
    name: 'Соцказначейство',
    icon: 'Database',
    status: 'planned',
    shortDesc: 'Единая платформа',
    fullDesc:
      'Двусторонний обмен с ЕГИССО / ЕЦП: статусы выплат, справки о составе семьи, статусы льгот.',
    note: 'Ключевой канал B2G',
  },
  {
    name: 'Региональные ИС',
    icon: 'Network',
    status: 'planned',
    shortDesc: 'СМЭВ · API',
    fullDesc:
      'Подключение к региональным системам соцзащиты по СМЭВ. Каждый регион — свой контур, единый протокол.',
    tech: 'СМЭВ 3 · REST',
  },
  {
    name: 'Telegram-бот',
    icon: 'Send',
    status: 'dev',
    shortDesc: 'Дублирующий канал',
    fullDesc:
      'Семья получает уведомления и ставит задачи через Telegram. Голосовой ввод задач, передача чек-листов.',
    note: 'MVP запускается в 2026',
  },
  {
    name: 'Веб-приложение',
    icon: 'Globe',
    status: 'live',
    shortDesc: 'Браузер · мобильный веб',
    fullDesc:
      'Основной фронтенд — адаптивное PWA. Работает на любом устройстве без установки.',
    tech: 'React · PWA',
  },
  {
    name: 'API регионам',
    icon: 'Code',
    status: 'planned',
    shortDesc: 'Документированный REST',
    fullDesc:
      'Открытое API для регионов: выгрузка статистики, обмен заявками, события Case Manager.',
    tech: 'REST · OpenAPI',
    note: 'Тариф B2G — соцказначейство',
  },
  {
    name: 'HR-системы',
    icon: 'Briefcase',
    status: 'planned',
    shortDesc: 'B2B2C для работодателей',
    fullDesc:
      'Интеграция в корпоративные HR-порталы: family-benefit для сотрудников, отчётность работодателям.',
    note: 'Канал B2B2C',
  },
  {
    name: 'Туристические сервисы',
    icon: 'Mountain',
    status: 'planned',
    shortDesc: 'Семейный туризм',
    fullDesc:
      'Партнёрства с агрегаторами и кэшбэк-программами для семейных поездок по России.',
    note: 'По 615-р: семейный туризм',
  },
];

const STATUS_BADGE: Record<ModuleStatus, { bg: string; text: string; border: string; label: string; dot: string }> = {
  live: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Уже работает',
    dot: 'bg-emerald-500',
  },
  dev: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'В разработке',
    dot: 'bg-amber-400',
  },
  planned: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'План',
    dot: 'bg-purple-400',
  },
};

interface SectionProps {
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
  iconName: string;
  items: CardItem[];
}

function CardSection({ title, subtitle, accentColor, accentBg, iconName, items }: SectionProps) {
  return (
    <div>
      <div className={`flex items-center gap-3 mb-3 ${accentBg} rounded-xl px-4 py-2.5`}>
        <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border-2`} style={{ borderColor: accentColor }}>
          <Icon name={iconName} size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: accentColor }}>{title}</h3>
          <p className="text-[11px] text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((m, idx) => {
          const badge = STATUS_BADGE[m.status];
          return (
            <div
              key={idx}
              className={`rounded-xl border ${badge.border} ${badge.bg} p-3.5 flex flex-col gap-2`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={m.icon} size={16} className={badge.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-[13px] text-gray-900 leading-tight">{m.name}</h4>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${badge.text} bg-white border ${badge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">{m.shortDesc}</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-700 leading-snug">{m.fullDesc}</p>

              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/70">
                {m.tech && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[9px] font-mono text-gray-700">
                    <Icon name="Code2" size={9} className="text-gray-500" />
                    {m.tech}
                  </span>
                )}
                {m.note && <span className="text-[9px] text-gray-500 italic flex-1 text-right">{m.note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SlideArchitectureCards() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-3">
          <Icon name="Layers" size={14} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Архитектура · печатная версия
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Фундамент платформы и каналы интеграции</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Технические слои, которые не входят в круговую карту 615-р, но обеспечивают её работу.
        </p>
      </div>

      <div className="space-y-6">
        <CardSection
          title="ФУНДАМЕНТ"
          subtitle="Платформа · 152-ФЗ · Реестр ПО"
          accentColor="#475569"
          accentBg="bg-slate-50"
          iconName="Server"
          items={FOUNDATION}
        />

        <CardSection
          title="КАНАЛЫ"
          subtitle="Интеграции · ЕСИА · СМЭВ · B2B2C"
          accentColor="#2563eb"
          accentBg="bg-blue-50"
          iconName="Network"
          items={CHANNELS}
        />
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-6">
        Слайд · Архитектура карточками · {FOUNDATION.length + CHANNELS.length} элементов · Версия 2.6
      </p>
    </section>
  );
}

export default SlideArchitectureCards;
