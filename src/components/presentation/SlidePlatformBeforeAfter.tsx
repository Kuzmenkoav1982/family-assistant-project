import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

interface Block {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const beforeBlocks: Block[] = [
  { id: 'family-tree', icon: 'TreeDeciduous', title: 'Семейное древо', desc: 'Связи и поколения' },
  { id: 'calendar', icon: 'Calendar', title: 'Календарь', desc: 'События семьи' },
  { id: 'tasks', icon: 'CheckSquare', title: 'Задачи и роли', desc: 'Кто что делает' },
  { id: 'budget', icon: 'Wallet', title: 'Бюджет', desc: 'Финансы семьи' },
  { id: 'chat', icon: 'MessageCircle', title: 'Чат', desc: 'Общение' },
  { id: 'children', icon: 'Baby', title: 'Дети', desc: 'Профили и развитие' },
  { id: 'health', icon: 'HeartPulse', title: 'Здоровье', desc: 'Базовый мониторинг' },
  { id: 'documents', icon: 'FileText', title: 'Документы', desc: 'Хранилище' },
  { id: 'places', icon: 'MapPin', title: 'Места', desc: 'Локации семьи' },
  { id: 'shopping', icon: 'ShoppingCart', title: 'Покупки', desc: 'Списки' },
  { id: 'memories', icon: 'Image', title: 'Воспоминания', desc: 'Фото и события' },
];

const afterAddedBlocks: Block[] = [
  { id: 'support-navigator', icon: 'Compass', title: 'Навигатор льгот', desc: 'Что положено семье' },
  { id: 'large-family', icon: 'Users', title: 'Кабинет многодетной', desc: 'Льготы 3+ детей' },
  { id: 'pregnancy', icon: 'HeartHandshake', title: 'Маршрут беременности', desc: 'Пути 0–12 мес' },
  { id: 'case-manager', icon: 'GitBranch', title: 'Семейный координатор', desc: 'Жизненные сценарии' },
  { id: 'svo-family', icon: 'Shield', title: 'Семья СВО', desc: 'Особый режим' },
  { id: 'student-family', icon: 'GraduationCap', title: 'Студенческая семья', desc: 'Единое окно вуза' },
  { id: 'social-contract', icon: 'FileSignature', title: 'Соцконтракт', desc: 'Преодоление бедности' },
  { id: 'zog', icon: 'Activity', title: 'ЗОЖ-модуль', desc: '4 фактора риска' },
  { id: 'nannies', icon: 'UserCheck', title: 'Каталог нянь', desc: 'Проверенные специалисты' },
  { id: 'after-school', icon: 'BookOpen', title: 'Продлёнка 1–4', desc: 'KPI 17,6% к 2030' },
  { id: 'mediation', icon: 'Handshake', title: 'Медиация', desc: 'Профилактика разводов' },
  { id: 'b2b2c', icon: 'Building2', title: 'B2B2C', desc: 'Family-benefit' },
  { id: 'region-api', icon: 'Network', title: 'API регионам', desc: 'Соцказначейство' },
  { id: 'compatriots', icon: 'Globe', title: 'Соотечественники', desc: 'Адаптация' },
  { id: 'tourism', icon: 'Mountain', title: 'Семейный туризм', desc: 'Маршруты по РФ' },
];

function MiniBlock({
  block,
  variant,
  onClick,
}: {
  block: Block;
  variant: 'live' | 'planned';
  onClick: () => void;
}) {
  const styles =
    variant === 'live'
      ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
      : 'bg-purple-50 border-purple-200 hover:bg-purple-100';
  const iconColor = variant === 'live' ? 'text-emerald-600' : 'text-purple-600';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles} border rounded-lg p-1.5 text-center hover:scale-105 hover:shadow-md transition-all cursor-pointer`}
    >
      <Icon name={block.icon} size={14} className={`${iconColor} mx-auto mb-0.5`} />
      <p className="text-[9px] font-bold text-gray-900 leading-tight">{block.title}</p>
      <p className="text-[8px] text-gray-500 leading-tight mt-0.5">{block.desc}</p>
    </button>
  );
}

export function SlidePlatformBeforeAfter() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    const module = MODULES[id];
    if (module) {
      setSelected(module);
      setOpen(true);
    }
  };

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
        <p className="text-[11px] text-purple-600 mt-2 font-medium flex items-center justify-center gap-1">
          <Icon name="MousePointerClick" size={11} />
          Кликните на модуль — раскроется цитата из Стратегии и привязка к KPI
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
              {beforeBlocks.map((b) => (
                <MiniBlock key={b.id} block={b} variant="live" onClick={() => handleClick(b.id)} />
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
              615-р
              <br />
              до 2036
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
                {beforeBlocks.slice(0, 8).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleClick(b.id)}
                    className="bg-white border border-emerald-200 rounded p-1 flex items-center gap-1 hover:bg-emerald-100 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Icon name={b.icon} size={10} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-[8px] font-medium text-gray-700 truncate">{b.title}</span>
                  </button>
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
              {afterAddedBlocks.map((b) => (
                <MiniBlock key={b.id} block={b} variant="planned" onClick={() => handleClick(b.id)} />
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
            <p className="text-[9px] text-gray-600 leading-tight">
              СКР к 2036
              <br />
              (сейчас 1,41)
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">2,725 млн</p>
            <p className="text-[9px] text-gray-600 leading-tight">
              многодетных семей
              <br />
              (сейчас 2,4 млн)
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">≤ 8%</p>
            <p className="text-[9px] text-gray-600 leading-tight">
              бедность
              <br />
              многодетных
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-base font-bold text-purple-700">81 год</p>
            <p className="text-[9px] text-gray-600 leading-tight">
              ожидаемая
              <br />
              продолжительность жизни
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 3 из 3 · Сравнение «сегодня → после 615-р» · Версия 2.0 от 06.05.2026
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default SlidePlatformBeforeAfter;