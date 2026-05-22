import Icon from '@/components/ui/icon';
import { ExpandableDetails } from './ExpandableDetails';

/**
 * SlideDomovoyMemoryKeeper — позиционный сдвиг Домового.
 *
 * Домовой подаётся не как "ещё один AI-ассистент", а как
 * интерфейс к семейному контексту, памяти и координации внутри
 * платформы. Снизу — встроенный блок про RAG и Библиотеку знаний,
 * как следующий технологический слой.
 */

const FOUR_PILLARS = [
  {
    icon: 'Brain',
    title: 'Помнит',
    desc: 'События, людей, традиции, важные решения семьи. Сохраняет то, что иначе ушло бы с поколением.',
    accent: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
  },
  {
    icon: 'MessagesSquare',
    title: 'Передаёт',
    desc: 'Рассказывает детям и внукам о предках, объясняет «откуда мы», связывает поколения.',
    accent: 'from-blue-50 to-sky-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
  },
  {
    icon: 'Heart',
    title: 'Поддерживает',
    desc: 'Напоминает о ритуалах, годовщинах, традициях и ценностях. Удерживает идентичность семьи.',
    accent: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
  {
    icon: 'TrendingUp',
    title: 'Растёт с семьёй',
    desc: 'Чем дольше семья пользуется, тем глубже его контекст. LTV растёт со временем экспоненциально.',
    accent: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
];

const BUSINESS_MOATS = [
  { icon: 'Infinity', text: 'Switching cost ≈ ∞ — нельзя «уйти к конкуренту» с памятью трёх поколений' },
  { icon: 'Sparkles', text: 'Эмоциональный moat — не копируется фичами, только временем' },
  { icon: 'Layers', text: 'Категорийная позиция — единственное место хранения family memory' },
];

export function SlideDomovoyMemoryKeeper() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-violet-100"
    >
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0">
          <Icon name="ScrollText" size={26} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Icon name="Sparkles" size={11} />
            Стратегическая позиция Домового
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
            Домовой — хранитель памяти рода
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Не «ещё один AI-чат». Интерфейс к семейному контексту, памяти и координации.
          </p>
        </div>
      </div>

      {/* Главный тезис */}
      <div className="mb-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl p-5 border border-violet-200">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Каждая семья — это уникальная история, традиции, ценности, ошибки и победы. Сегодня всё это
          уходит вместе с поколением: бабушка не успела рассказать, родители забыли передать, дети не спросили.
          <br />
          <br />
          <strong className="text-violet-900">Домовой решает эту проблему.</strong> Он — живой носитель памяти рода.
        </p>
      </div>

      {/* 4 столпа */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Pillar" fallback="Columns" size={14} className="text-violet-700" />
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
            Четыре столпа Домового
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FOUR_PILLARS.map((p) => (
            <div
              key={p.title}
              className={`bg-gradient-to-br ${p.accent} rounded-2xl p-4 border ${p.border}`}
            >
              <div className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center mb-3`}>
                <Icon name={p.icon} size={20} className={p.iconColor} />
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight mb-1.5">{p.title}</p>
              <p className="text-xs text-gray-600 leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Бизнес-эффект */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="TrendingUp" size={14} className="text-emerald-700" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Почему это сильно для бизнеса
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BUSINESS_MOATS.map((m) => (
            <div
              key={m.text}
              className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 border border-emerald-200"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name={m.icon} size={16} className="text-emerald-700" />
              </div>
              <p className="text-xs text-gray-700 leading-snug">{m.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Архитектурная пирамида: ID → RAG → Домовой */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-5 border border-indigo-200 mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Layers3" size={16} className="text-indigo-700" />
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-700">
            Следующий слой: RAG + Библиотека знаний
          </p>
        </div>

        <div className="space-y-3">
          {/* Уровень 3 — Домовой */}
          <div className="bg-white rounded-xl p-4 border border-violet-300 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" size={18} className="text-violet-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Уровень 3</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">Работает</span>
                </div>
                <p className="text-sm font-bold text-gray-900">Домовой · Family copilot</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Интерфейс к семейному контексту. 11 AI-сценариев работают, 15 ролей агента в roadmap.
                </p>
              </div>
            </div>
          </div>

          {/* Стрелка */}
          <div className="flex justify-center">
            <Icon name="ChevronUp" size={18} className="text-indigo-400" />
          </div>

          {/* Уровень 2 — RAG + Библиотека */}
          <div className="bg-white rounded-xl p-4 border border-blue-300 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon name="Database" size={18} className="text-blue-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Уровень 2</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">NEXT · 6–12 мес</span>
                </div>
                <p className="text-sm font-bold text-gray-900">RAG-движок + Библиотека знаний семьи</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Единый контекстный слой: память семьи, документы, события, история, цели, переписка.
                  Подложка для Домового, AI-инсайтов, поиска и умных напоминаний — чтобы ИИ отвечал
                  не «вообще», а в контексте именно этой семьи.
                </p>
              </div>
            </div>
          </div>

          {/* Стрелка */}
          <div className="flex justify-center">
            <Icon name="ChevronUp" size={18} className="text-indigo-400" />
          </div>

          {/* Уровень 1 — Семейный ID */}
          <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon name="KeyRound" size={18} className="text-slate-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Уровень 1 · Foundation</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">Работает</span>
                </div>
                <p className="text-sm font-bold text-gray-900">Семейный ID · наследуемый ключ семьи</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Ключ передаётся поколениям. Под ним хранится всё: данные, документы, дерево,
                  ценности, события, память. Как банковский счёт — но для всей семейной истории.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-indigo-800 mt-4 italic leading-relaxed border-t border-indigo-200 pt-3">
          <strong>В одну строку:</strong> Семейный ID — это ключ. RAG — библиотека знаний под этим ключом.
          Домовой — интерфейс к ней. Сегодня работают ключ и каркас библиотеки. Следующий слой —
          превратить её в context-aware систему через RAG.
        </p>
      </div>

      {/* Аккордеон с техническими деталями */}
      <ExpandableDetails
        label="Развернуть техническую архитектуру RAG"
        labelOpen="Свернуть техническую архитектуру RAG"
        tone="indigo"
      >
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">Источники контекста</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['События календаря', 'Семейное древо', 'Документы и архив', 'Цели и планы', 'Переписка и заметки', 'Альбом поколений', 'Финансовые цели', 'Здоровье', 'Развитие детей'].map((s) => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">Что даёт пользователю</p>
            <ul className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
              <li>• Ответы Домового с учётом реальной истории и контекста семьи, а не generic LLM</li>
              <li>• Семейный поиск: «когда мы последний раз ездили к бабушке?», «что Маша любила в 5 лет?»</li>
              <li>• Умные напоминания и подсказки на основе паттернов семьи</li>
              <li>• Сохранение и оркестрация знаний между поколениями</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">Что мы НЕ обещаем на ближайший релиз</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Полноценный автономный AI-агент рода, fine-tuning на семье, мультимодальный голосовой
              ассистент с долговременной памятью. Это горизонт 12+ месяцев — подаём как vision.
            </p>
          </div>
        </div>
      </ExpandableDetails>
    </section>
  );
}

export default SlideDomovoyMemoryKeeper;
