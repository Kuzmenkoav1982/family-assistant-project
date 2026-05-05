import Icon from '@/components/ui/icon';

interface Block {
  icon: string;
  title: string;
  desc: string;
}

const beforeBlocks: Block[] = [
  { icon: 'TreeDeciduous', title: 'Семейное древо', desc: 'Связи и поколения' },
  { icon: 'Calendar', title: 'Календарь', desc: 'События семьи' },
  { icon: 'CheckSquare', title: 'Задачи и роли', desc: 'Кто что делает' },
  { icon: 'Wallet', title: 'Бюджет', desc: 'Финансы семьи' },
  { icon: 'MessageCircle', title: 'Чат', desc: 'Общение' },
  { icon: 'Baby', title: 'Дети', desc: 'Профили и развитие' },
  { icon: 'HeartPulse', title: 'Здоровье', desc: 'Базовый мониторинг' },
  { icon: 'FileText', title: 'Документы', desc: 'Хранилище' },
  { icon: 'MapPin', title: 'Места', desc: 'Локации семьи' },
  { icon: 'ShoppingCart', title: 'Покупки', desc: 'Списки' },
  { icon: 'Image', title: 'Воспоминания', desc: 'Фото и события' },
];

const afterAddedBlocks: Block[] = [
  { icon: 'Compass', title: 'Навигатор льгот', desc: 'Что положено семье' },
  { icon: 'Users', title: 'Кабинет многодетной', desc: 'Льготы 3+ детей' },
  { icon: 'HeartHandshake', title: 'Маршрут беременности', desc: 'Пути 0–12 мес' },
  { icon: 'GitBranch', title: 'Family Case Manager', desc: 'Жизненные сценарии' },
  { icon: 'Shield', title: 'Семья СВО', desc: 'Особый режим' },
  { icon: 'GraduationCap', title: 'Студенческая семья', desc: 'Единое окно вуза' },
  { icon: 'FileSignature', title: 'Соцконтракт', desc: 'Преодоление бедности' },
  { icon: 'Activity', title: 'ЗОЖ-модуль', desc: '4 фактора риска' },
  { icon: 'UserCheck', title: 'Каталог нянь', desc: 'Проверенные специалисты' },
  { icon: 'BookOpen', title: 'Продлёнка 1–4', desc: 'KPI 17,6% к 2030' },
  { icon: 'Handshake', title: 'Медиация', desc: 'Профилактика разводов' },
  { icon: 'Building2', title: 'B2B2C', desc: 'Family-benefit' },
  { icon: 'Network', title: 'API регионам', desc: 'Соцказначейство' },
  { icon: 'Globe', title: 'Соотечественники', desc: 'Адаптация' },
  { icon: 'Mountain', title: 'Семейный туризм', desc: 'Маршруты по РФ' },
];

function MiniBlock({ block, variant }: { block: Block; variant: 'live' | 'planned' }) {
  const styles =
    variant === 'live'
      ? 'bg-emerald-50 border-emerald-200'
      : 'bg-purple-50 border-purple-200';
  const iconColor = variant === 'live' ? 'text-emerald-600' : 'text-purple-600';
  return (
    <div className={`${styles} border rounded-lg p-1.5 text-center hover:scale-105 transition-transform`}>
      <Icon name={block.icon} size={14} className={`${iconColor} mx-auto mb-0.5`} />
      <p className="text-[9px] font-bold text-gray-900 leading-tight">{block.title}</p>
      <p className="text-[8px] text-gray-500 leading-tight mt-0.5">{block.desc}</p>
    </div>
  );
}

export function SlidePlatformBeforeAfter() {
  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-3">
          <Icon name="GitCompare" size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Эволюция платформы</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Сегодня и после реализации Стратегии 615-р
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Family OS как ядро уже работает. Стратегия 615-р до 2036 года задаёт чёткое направление расширения.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.5fr] gap-3 items-stretch">
        {/* ДО */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Icon name="Layers" size={16} className="text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">Сегодня · Family OS</h3>
                <p className="text-[10px] text-white/80">Q2 2026 · ядро повседневной жизни</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-1.5">
              {beforeBlocks.map((b, i) => (
                <MiniBlock key={i} block={b} variant="live" />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">11</p>
                <p className="text-[8px] text-gray-500 leading-tight">модулей</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">B2C</p>
                <p className="text-[8px] text-gray-500 leading-tight">канал</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">RU</p>
                <p className="text-[8px] text-gray-500 leading-tight">фокус</p>
              </div>
            </div>
          </div>
        </div>

        {/* Стрелка */}
        <div className="flex flex-col items-center justify-center gap-2 lg:px-2">
          <div className="hidden lg:flex flex-col items-center">
            <div className="bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full p-2 shadow-lg">
              <Icon name="ArrowRight" size={20} className="text-white" />
            </div>
            <p className="text-[10px] font-bold text-purple-600 mt-1.5 text-center leading-tight">
              615-р<br />до 2036
            </p>
          </div>
          <div className="lg:hidden flex items-center gap-2 my-2">
            <div className="h-px bg-purple-300 flex-1" />
            <Icon name="ArrowDown" size={20} className="text-purple-500" />
            <div className="h-px bg-purple-300 flex-1" />
          </div>
        </div>

        {/* ПОСЛЕ */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={16} className="text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">После · Цифровая семейная инфраструктура</h3>
                <p className="text-[10px] text-white/80">Этапы Стратегии 2025–2030 → 2031–2036</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            {/* Внутренний слой — то, что было */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2 mb-2">
              <p className="text-[9px] font-bold text-emerald-800 mb-1.5 uppercase tracking-wide">
                Ядро Family OS (как было)
              </p>
              <div className="grid grid-cols-4 gap-1">
                {beforeBlocks.slice(0, 8).map((b, i) => (
                  <div key={i} className="bg-white border border-emerald-200 rounded p-1 flex items-center gap-1">
                    <Icon name={b.icon} size={10} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-[8px] font-medium text-gray-700 truncate">{b.title}</span>
                  </div>
                ))}
                <div className="bg-white border border-emerald-200 rounded p-1 flex items-center gap-1 col-span-3">
                  <span className="text-[8px] font-medium text-gray-500 italic">+ ещё 3 модуля ядра</span>
                </div>
              </div>
            </div>

            {/* Новый слой — что добавится */}
            <p className="text-[9px] font-bold text-purple-800 mb-1.5 uppercase tracking-wide">
              + 15 новых модулей по 615-р
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {afterAddedBlocks.map((b, i) => (
                <MiniBlock key={i} block={b} variant="planned" />
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">26+</p>
                <p className="text-[8px] text-gray-500 leading-tight">модулей</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">B2C·B2G·B2B2C</p>
                <p className="text-[8px] text-gray-500 leading-tight">3 канала</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">13 KPI</p>
                <p className="text-[8px] text-gray-500 leading-tight">Стратегии 615-р</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ключевые KPI Стратегии */}
      <div className="mt-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
        <p className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-1.5">
          <Icon name="Target" size={14} />
          Что приближаем — целевые показатели Стратегии до 2036:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">1,8</p>
            <p className="text-[9px] text-gray-600 leading-tight">СКР к 2036<br/>(сейчас 1,41)</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">2,725 млн</p>
            <p className="text-[9px] text-gray-600 leading-tight">многодетных семей<br/>(сейчас 2,4 млн)</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">≤ 8%</p>
            <p className="text-[9px] text-gray-600 leading-tight">бедность<br/>многодетных</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">81 год</p>
            <p className="text-[9px] text-gray-600 leading-tight">ожидаемая<br/>продолжительность жизни</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 3 из 3 · Сравнение «сегодня → после 615-р» · Версия 2.0 от 06.05.2026
      </p>
    </section>
  );
}

export default SlidePlatformBeforeAfter;
