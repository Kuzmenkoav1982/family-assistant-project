import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Section = 'overview' | 'buyers' | 'teasers' | 'valuation' | 'dealstructure' | 'preparation' | 'negotiation' | 'roadmap';

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Обзор', icon: 'LayoutDashboard' },
  { id: 'buyers', label: 'Покупатели', icon: 'Building2' },
  { id: 'teasers', label: 'Тизеры', icon: 'FileText' },
  { id: 'valuation', label: 'Оценка', icon: 'TrendingUp' },
  { id: 'dealstructure', label: 'Структура сделки', icon: 'GitMerge' },
  { id: 'preparation', label: 'Подготовка', icon: 'ClipboardList' },
  { id: 'negotiation', label: 'Переговоры', icon: 'Handshake' },
  { id: 'roadmap', label: 'Роадмап', icon: 'Map' },
];

function exportSalePptx() {
  const slides = [
    { heading: 'Стратегия продажи «Наша Семья»', body: 'M&A стратегия · Версия 1.0 · Март 2026\nСтрого конфиденциально — только для собственника\nЦелевой диапазон сделки: 80–250 млн ₽' },
    { heading: 'Три сценария выхода', body: 'A. Продажа технологии: 40–60 млн ₽ / 2–4 месяца\n   Продажа кода + ИС IT-интегратору или банку\n\nB. Продажа бизнеса: 80–130 млн ₽ / 4–7 месяцев\n   Действующий бизнес с пользователями + earn-out\n\nC. Стратегическое партнёрство: 150–250 млн ₽ / 6–9 месяцев\n   Контрольный пакет крупному стратегу (ПСБ, Сбер)' },
    { heading: 'Целевые покупатели — Банки', body: '#1 Банк ПСБ: 150–250 млн ₽ — 2+ млн семей военных, идеальная аудитория\n#2 Сбербанк: 100–200 млн ₽ — дополняет СберПрайм Семья\n#3 Т-Банк: 80–150 млн ₽ — lifestyle-экосистема, аудитория 25–40 лет\n   Ozon Банк: 60–100 млн ₽ — 40M покупателей с семьями\n   Ozon/WB как дистрибуция подписки: нативная интеграция' },
    { heading: 'Целевые покупатели — Маркетплейсы и Экосистемы', body: 'Ozon + Ozon Банк: 60–100 млн ₽\n   40M пользователей, WB Pay / Ozon Pay → семейный кошелёк\n\nWildberries: 50–90 млн ₽\n   60M покупателей, женская аудитория 80% совпадает\n\nЯндекс (Маркет + Алиса): 80–150 млн ₽\n   Уже есть интеграция с Алисой, список покупок → Маркет\n\nVK: 60–120 млн ₽ · МТС: 70–130 млн ₽' },
    { heading: 'Оценка платформы', body: 'Стоимость воспроизведения: 28 млн ₽ (нижняя граница)\nОценка по Беркусу + ИС n\'RIS: 42 млн ₽\nСправедливая рыночная: 80–130 млн ₽\nСтратегическая премия (банк): 150–250 млн ₽\n\nЧто входит: 86 API, 151 таблица БД, 385+ компонентов,\nИС n\'RIS №518-830-027, бренд, домен, интеграции' },
    { heading: 'Структура сделки и налоги', body: 'А. Договор отчуждения ИС: 40–60 млн / НДФЛ 13% / быстро\nБ. Asset Deal: 80–130 млн / НДФЛ 15% / средний DD\nВ. Share Deal (ООО): 150–250 млн / НДФЛ 15% / полный DD\n\nEarn-out: +35–50 млн при достижении 5K/15K семей\n\nЧистыми: 80 млн → ~68 млн | 200 млн → ~170 млн ₽' },
    { heading: 'Роадмап продажи', body: 'Март–Апрель 2026: Подготовка (ООО, ТМ, тизер, финансы)\nМай–Июнь 2026: Первые контакты, 5+ NDA\nИюль–Август 2026: LOI и Due Diligence\nСентябрь–Октябрь 2026: Финальные переговоры\nНоябрь 2026: Закрытие сделки 💰' },
  ];
  const content = slides.map((s, i) =>
    `Слайд ${i + 1}\n${'═'.repeat(60)}\n${s.heading}\n${'-'.repeat(60)}\n${s.body}\n`
  ).join('\n\n');
  const blob = new Blob([`СТРАТЕГИЯ ПРОДАЖИ «НАША СЕМЬЯ» — СТРОГО КОНФИДЕНЦИАЛЬНО\nСгенерировано: ${new Date().toLocaleDateString('ru-RU')}\n${'═'.repeat(60)}\n\n${content}`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sale-strategy-slides.txt'; a.click();
  URL.revokeObjectURL(url);
}

export default function MarketingSale() {
  const [active, setActive] = useState<Section>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-0.5">⛔ Строго конфиденциально</div>
            <h1 className="text-xl font-bold text-slate-900">Стратегия продажи платформы «Наша Семья»</h1>
            <p className="text-sm text-slate-500">По состоянию на 05.03.2026 · M&A стратегия · Версия 1.0</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportSalePptx} className="gap-1.5">
              <Icon name="Presentation" size={14} />
              PowerPoint
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Icon name="Download" size={14} />
              Скачать PDF
            </Button>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Icon name="Shield" size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Только для собственника</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-3 flex gap-1 overflow-x-auto">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active === n.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ══════════ ОБЗОР ══════════ */}
        {active === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-10">
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">M&A стратегия · 05.03.2026</div>
              <h2 className="text-4xl font-black mb-4">Продажа платформы «Наша Семья»</h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mb-8">
                Документ описывает полную стратегию выхода из проекта через продажу стратегическому покупателю. 
                Целевой диапазон сделки — <strong className="text-white">80–250 млн ₽</strong> в зависимости от типа покупателя и структуры сделки.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Минимальная цена', value: '80 млн ₽', sub: 'продажа кода + ИС', color: 'bg-slate-700' },
                  { label: 'Справедливая цена', value: '120 млн ₽', sub: 'бизнес целиком', color: 'bg-blue-800' },
                  { label: 'Стратегическая', value: '250 млн ₽', sub: 'банк или экосистема', color: 'bg-indigo-800' },
                  { label: 'Срок закрытия', value: '4–9 мес', sub: 'от первого контакта', color: 'bg-slate-700' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-xl p-4`}>
                    <div className="text-2xl font-black mb-1">{s.value}</div>
                    <div className="text-sm font-semibold text-slate-200">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Почему сейчас */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
                <div className="text-xs font-semibold text-green-600 uppercase mb-3">Почему сейчас — правильный момент</div>
                <ul className="space-y-3">
                  {[
                    { icon: '📅', text: '«Десятилетие семьи» 2024–2034 — пик государственного интереса к семейной теме' },
                    { icon: '🏆', text: 'ИС защищена свидетельством n\'RIS №518-830-027 — актив юридически оформлен' },
                    { icon: '💻', text: 'Production-ready MVP: 86 API, 151 таблица, 90+ экранов — покупатель получает готовый продукт' },
                    { icon: '📈', text: 'Оценка растёт с каждым месяцем и новым пользователем — выгодно продать до масштаба' },
                    { icon: '🏦', text: 'Банки активно ищут семейные экосистемные продукты — высокий спрос' },
                    { icon: '⚡', text: 'Конкуренты пока не появились — монопольное положение даёт переговорную силу' },
                  ].map((it, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="text-lg flex-shrink-0">{it.icon}</span>{it.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                <div className="text-xs font-semibold text-red-600 uppercase mb-3">Риски ожидания</div>
                <ul className="space-y-3">
                  {[
                    { icon: '⚠️', text: 'Сбер, VK или Яндекс могут выйти в нишу — конкурент снизит оценку' },
                    { icon: '⚠️', text: 'Без инвестиций масштаб ограничен — оценка по traction не растёт' },
                    { icon: '⚠️', text: 'Соло-основатель = риск выгорания и потери темпа разработки' },
                    { icon: '⚠️', text: 'Технический долг накапливается — чем позже продажа, тем дороже due diligence' },
                    { icon: '⚠️', text: 'Государственная повестка может измениться после 2027 г.' },
                  ].map((it, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="text-lg flex-shrink-0">{it.icon}</span>{it.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Три сценария выхода */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Три сценария выхода</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    scenario: 'A', name: 'Продажа технологии', price: '40–60 млн ₽', timeline: '2–4 месяца',
                    color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-600',
                    desc: 'Продажа исходного кода, базы данных и ИС без обязательств по сопровождению',
                    pros: ['Быстро закрыть', 'Минимум due diligence', 'Подходит IT-компаниям'],
                    cons: ['Минимальная цена', 'Нет earn-out потенциала'],
                    buyers: 'IT-интеграторы, стартапы, инхаус-разработка банков',
                  },
                  {
                    scenario: 'B', name: 'Продажа бизнеса', price: '80–130 млн ₽', timeline: '4–7 месяцев',
                    color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-600',
                    desc: 'Продажа платформы как действующего бизнеса с пользователями, командой и операционкой',
                    pros: ['Справедливая оценка', 'Earn-out +20–30%', 'Поддержка 6–12 мес'],
                    cons: ['Нужен переходный период', 'Потребуется нанять команду'],
                    buyers: 'Банки, страховые, HR-платформы, телеком',
                  },
                  {
                    scenario: 'C', name: 'Стратегическое партнёрство', price: '150–250 млн ₽', timeline: '6–9 месяцев',
                    color: 'border-amber-300 bg-amber-50', badge: 'bg-amber-600',
                    desc: 'Продажа контрольного пакета крупному стратегу с сохранением роли CEO/CTO и участием в прибыли',
                    pros: ['Максимальная оценка', 'Ресурсы стратега', 'Доля в росте'],
                    cons: ['Долгие переговоры', 'Сложный due diligence', 'Потеря контроля'],
                    buyers: 'Банк ПСБ, Сбер, Т-Банк, VK, крупный телеком',
                  },
                ].map((sc, i) => (
                  <div key={i} className={`rounded-xl border-2 p-5 ${sc.color}`}>
                    <div className={`inline-block text-white text-xs font-black px-2 py-1 rounded mb-2 ${sc.badge}`}>Сценарий {sc.scenario}</div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{sc.name}</h4>
                    <div className="text-2xl font-black text-slate-800 mb-1">{sc.price}</div>
                    <div className="text-xs text-slate-500 mb-3">срок: {sc.timeline}</div>
                    <p className="text-xs text-slate-600 mb-3">{sc.desc}</p>
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-green-700 mb-1">Плюсы</div>
                      {sc.pros.map((p, j) => <div key={j} className="text-xs text-slate-700">✓ {p}</div>)}
                    </div>
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-red-600 mb-1">Минусы</div>
                      {sc.cons.map((c, j) => <div key={j} className="text-xs text-slate-700">— {c}</div>)}
                    </div>
                    <div className="bg-white/60 rounded-lg p-2 text-xs text-slate-600"><strong>Кто купит:</strong> {sc.buyers}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ПОКУПАТЕЛИ ══════════ */}
        {active === 'buyers' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Целевые покупатели</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Кто купит платформу</h2>
              <p className="text-slate-500">Приоритизированный список с обоснованием стратегической ценности для каждого</p>
            </div>

            <div className="space-y-5">
              {[
                {
                  priority: '🥇 Приоритет #1', name: 'Банк ПСБ (ПАО «Банк ПСБ»)', price: '150–250 млн ₽',
                  color: 'border-amber-300 bg-amber-50', badge: 'bg-amber-600',
                  why: 'Опорный банк Министерства обороны РФ. 2+ млн семей военнослужащих — идеальная целевая аудитория платформы. Семейный маячок, льготы, ипотека, здоровье — всё попадает в потребности аудитории ПСБ.',
                  value: ['Готовый цифровой продукт для 2+ млн семей военных', 'Раздел льгот и господдержки — критичен для аудитории', 'Семейный маячок — безопасность детей пока папа в командировке', 'Интеграция с банковскими продуктами (ипотека, вклады)', 'ESG-актив в период «Десятилетия семьи»'],
                  contact: 'psbank.ru → Для бизнеса / partnership@psbank.ru / M&A отдел',
                  approach: 'Тёплое письмо через LinkedIn/контакт в М&A → Демо → NDA → ТКП',
                },
                {
                  priority: '🥈 Приоритет #2', name: 'Сбербанк / СберСемья', price: '100–200 млн ₽',
                  color: 'border-green-300 bg-green-50', badge: 'bg-green-700',
                  why: 'Сбер активно строит экосистему и уже запустил «СберПрайм Семья». Платформа «Наша Семья» — готовый семейный органайзер, который дополняет финансовые продукты Сбера нефинансовым слоем: здоровье, питание, дети, маячок.',
                  value: ['Дополняет СберПрайм нефинансовым семейным функционалом', 'База данных семей — ценный актив для таргетинга', 'ИИ-функции совместимы с GigaChat-экосистемой', 'Раздел финансов — прямая интеграция с продуктами Сбера', '50M семей TAM — стратегически важный рынок'],
                  contact: 'sber.ru → Партнёрство / venturelabs@sberbank.ru / SberX (корпоративные инновации)',
                  approach: 'Через Sber Ventures или прямой контакт в Corporate Development',
                },
                {
                  priority: '🥉 Приоритет #3', name: 'Т-Банк (Тинькофф)', price: '80–150 млн ₽',
                  color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-600',
                  why: 'Т-Банк строит lifestyle-экосистему вокруг клиента. Молодая аудитория с детьми — ядро клиентской базы. Платформа дополняет Т-Банк семейным органайзером и создаёт глубокую привязанность клиента.',
                  value: ['Целевая аудитория 25–40 лет совпадает с ядром Т-Банка', 'Семейный кошелёк → интеграция со счётом Т-Банка', 'Подписочная модель совместима с Т-Про/Т-Премиум', 'Данные о семейном потреблении — ценность для скоринга', 'Быстрая интеграция через API'],
                  contact: 'tbank.ru → Партнёрства / venture@tinkoff.ru / Tinkoff Invest',
                  approach: 'Прямой контакт в бизнес-девелопмент через LinkedIn или конференции',
                },
                {
                  priority: '⭐ Доп. покупатель', name: 'VK / ВКонтакте', price: '60–120 млн ₽',
                  color: 'border-purple-300 bg-purple-50', badge: 'bg-purple-600',
                  why: 'VK — крупнейшая социальная платформа России. Аудитория мам и семей — ядро ВКонтакте. Платформа усиливает удержание и монетизацию через семейный функционал внутри экосистемы VK.',
                  value: ['Мамы 25–40 — главная аудитория ВКонтакте', 'Контент платформы → группы и паблики ВК', 'ИИ-ассистент → VK Маруся интеграция', 'Семейные события → VK Афиша', 'Готовая аудитория для монетизации через VK Pay'],
                  contact: 'vk.company → Партнёрства / partnerships@vk.team',
                  approach: 'Через VK Tech или прямой контакт в Corporate Development VK',
                },
                {
                  priority: '⭐ Доп. покупатель', name: 'МТС / МТС Экосистема', price: '70–130 млн ₽',
                  color: 'border-red-300 bg-red-50', badge: 'bg-red-600',
                  why: 'МТС строит суперапп для семейной аудитории. Семейные тарифы — ключевой продукт оператора. Платформа дополняет МТС нецифровым семейным слоем и усиливает retention.',
                  value: ['Семейные тарифы МТС → органичная интеграция', 'МТС Маячок — синергия с семейным трекером', 'МТС Банк — финансовый модуль', 'МТС Premium → семейная подписка', '79М абонентов — готовая дистрибуция'],
                  contact: 'mts.ru → Корпоративные инновации / innovation@mts.ru',
                  approach: 'Через МТС Startup Hub или прямой контакт в Strategy & M&A',
                },
                {
                  priority: '🛒 Маркетплейс', name: 'Ozon + Ozon Банк', price: '60–100 млн ₽',
                  color: 'border-sky-300 bg-sky-50', badge: 'bg-sky-600',
                  why: 'Ozon — крупнейший маркетплейс России с 40M активных покупателей. Ozon Банк активно расширяет продуктовую линейку для семей. Платформа «Наша Семья» — идеальный нефинансовый семейный продукт внутри экосистемы Ozon.',
                  value: ['40M покупателей, 60% — женщины 25–44 (ядро аудитории)', 'Ozon Pay → интеграция семейного кошелька в экосистему', 'Список покупок платформы → автозаказ на Ozon', 'Программа лояльности Ozon — баллы за семейную активность', 'Ozon Банк — финансовый модуль (кредиты, вклады для семей)', 'Цифровая подписка как товар на маркетплейсе Ozon'],
                  contact: 'ozon.ru → Партнёрства / corp@ozon.ru / Ozon Ventures',
                  approach: 'Через Ozon Ventures (venture.ozon.ru) или прямой контакт в B2B-партнёрства',
                },
                {
                  priority: '🛒 Маркетплейс', name: 'Wildberries + WB Pay', price: '50–90 млн ₽',
                  color: 'border-fuchsia-300 bg-fuchsia-50', badge: 'bg-fuchsia-600',
                  why: 'Wildberries — №1 маркетплейс РФ с 60M+ зарегистрированных пользователей. Аудитория: 80% женщины, активные мамы-покупатели. WB Pay развивает финансовые сервисы. Семейная платформа = удержание и монетизация аудитории.',
                  value: ['60M+ пользователей, 80% — женщины, главная аудитория платформы', 'WB Pay → интеграция семейного бюджета и трекинга покупок', 'Список покупок платформы → автозаказ через WB', 'WB подписка + «Наша Семья» — premium-связка', 'Данные о семейных покупках = ценная аналитика', 'WB Банк — стратегический выход в финансы для семей'],
                  contact: 'wildberries.ru → Для партнёров / partner@wb.ru',
                  approach: 'Прямой контакт в WB Tech или через корпоративный M&A-отдел',
                },
                {
                  priority: '🛒 Экосистема', name: 'Яндекс (Маркет + Алиса + Еда)', price: '80–150 млн ₽',
                  color: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-600',
                  why: 'Яндекс — крупнейшая технологическая экосистема РФ. Платформа «Наша Семья» уже интегрирована с Яндекс.Алисой (навык). Список покупок → Яндекс.Маркет, меню → Яндекс.Еда, маячок → Яндекс.Карты. Готовая синергия из 4+ продуктов.',
                  value: ['Уже есть навык для Яндекс.Алисы — минимальная интеграция', 'Яндекс.Маркет: список покупок платформы → прямые заказы', 'Яндекс.Еда: меню недели → готовые блюда на доставку', 'Яндекс.Карты: семейный маячок уже интегрирован', 'Яндекс Пэй → семейный кошелёк и оплата подписки', 'GigaChat-аналог — интеграция с Алисой ИИ-ассистента'],
                  contact: 'yandex.ru/adv/partner / yandex-start.ru (акселератор) / corp@yandex-team.ru',
                  approach: 'Через Яндекс.Старт (акселератор) или прямой контакт в Business Development',
                },
              ].map((b, i) => (
                <div key={i} className={`rounded-2xl border-2 p-7 ${b.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{b.priority}</div>
                      <h3 className="text-2xl font-black text-slate-900">{b.name}</h3>
                    </div>
                    <div className={`text-white font-black text-xl px-4 py-2 rounded-xl ${b.badge}`}>{b.price}</div>
                  </div>
                  <p className="text-slate-700 mb-4 text-sm leading-relaxed">{b.why}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Стратегическая ценность для покупателя</div>
                      <ul className="space-y-1">{b.value.map((v, j) => <li key={j} className="text-sm text-slate-700 flex gap-2"><span className="text-green-600 flex-shrink-0">→</span>{v}</li>)}</ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Контакт</div>
                        <div className="text-xs text-slate-700 bg-white/70 rounded-lg p-2">{b.contact}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Подход</div>
                        <div className="text-xs text-slate-700 bg-white/70 rounded-lg p-2">{b.approach}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ТИЗЕРЫ ══════════ */}
        {active === 'teasers' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Персонализированные тизеры</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Тизеры для потенциальных покупателей</h2>
              <p className="text-slate-500">Готовые тексты первого письма — без NDA, адаптированы под боль и стратегию каждого покупателя</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  buyer: 'Банк ПСБ', badge: 'bg-amber-600', color: 'border-amber-300 bg-amber-50',
                  to: 'Директор по цифровым продуктам / M&A / Руководитель инноваций ПСБ',
                  subject: 'Готовый цифровой продукт для семей военнослужащих — предложение для ПСБ',
                  hook: '2+ млн семей военнослужащих без единого цифрового семейного сервиса',
                  body: `Добрый день,

Меня зовут [Имя], я основатель платформы «Наша Семья» — единственного в России комплексного цифрового сервиса для всех аспектов семейной жизни.

Почему пишу именно в ПСБ:
Ваша аудитория — семьи военнослужащих — остро нуждается в инструментах организации жизни: маячок (безопасность детей пока папа в командировке), здоровье, льготы и господдержка, семейный бюджет. Мы решаем ровно эти задачи.

О продукте за 30 секунд:
• Production-ready платформа (86 API, 151 таблица БД, 90+ экранов)
• ИС защищена свидетельством n'RIS №518-830-027
• Интеграция с Яндекс.Алисой, ЮКасса, геолокацией
• «Десятилетие семьи» 2024–2034 — в тренде государственной повестки

Рассматриваю предложения о стратегическом партнёрстве или приобретении. Несколько компаний уже ведут переговоры.

Готов выслать краткое описание продукта и обсудить синергию с продуктовой линейкой ПСБ.`,
                  ps: 'Тема маячка и безопасности — ключевой эмоциональный крючок для ПСБ-аудитории',
                },
                {
                  buyer: 'Сбербанк', badge: 'bg-green-700', color: 'border-green-300 bg-green-50',
                  to: 'SberX / Sber Ventures / Corporate Development Сбера',
                  subject: 'Семейный суперапп в дополнение к СберПрайм — готовый продукт для переговоров',
                  hook: 'СберПрайм Семья получает нефинансовый слой: здоровье, меню, дети, маячок',
                  body: `Добрый день,

«Наша Семья» — production-ready платформа для организации семейной жизни, которая органично дополняет продуктовую экосистему Сбера.

Как видим синергию:
• Раздел финансов → интеграция со Сбер.Счётом и Сбер.Ипотекой
• ИИ-ассистент «Домовой» (9 ролей) → совместимость с GigaChat
• База данных семей → ценный актив для персонализации и таргетинга
• Подписочная модель → включение в СберПрайм Семья

Продукт:
• 86 облачных функций, 151 таблица, 90+ экранов
• ИС защищена n'RIS №518-830-027
• TAM 50M семей в России — стратегически важный рынок

Рассматриваю форматы от партнёрства до приобретения. Параллельно ведём переговоры с рядом других экосистем.

Если есть интерес — готов к короткому онлайн-звонку на этой неделе.`,
                  ps: 'Упомяните GigaChat и СберПрайм — это сигнал, что вы изучили экосистему Сбера',
                },
                {
                  buyer: 'Т-Банк (Тинькофф)', badge: 'bg-blue-600', color: 'border-blue-300 bg-blue-50',
                  to: 'Business Development / Venture / Партнёрства Т-Банка',
                  subject: 'Семейный органайзер для аудитории Т-Банка — готовый продукт, предложение об интеграции',
                  hook: 'Глубокая привязанность клиента через семейный органайзер внутри Т-экосистемы',
                  body: `Добрый день,

«Наша Семья» — цифровая платформа для управления семейной жизнью, которая идеально попадает в аудиторию Т-Банка: 25–40 лет, дети, активное потребление digital-сервисов.

Как это работает для Т-Банка:
• Семейный кошелёк → прямая интеграция со счётом Т-Банка
• Подписочная модель → включение в Т-Про / Т-Премиум
• Данные о семейном потреблении → улучшение кредитного скоринга
• Трекинг покупок → аналитика потребительских паттернов семей

Продукт:
• Production-ready MVP, 86 API, 151 таблица
• ИС защищена n'RIS №518-830-027
• Интеграции: ЮКасса, Яндекс.Алиса, геолокация

Рассматриваю несколько форматов. Готов обсудить быстро — продукт уже в рабочем состоянии.`,
                  ps: 'Т-Банк любит скорость — делайте упор на "готово к интеграции сейчас"',
                },
                {
                  buyer: 'Ozon + Ozon Банк', badge: 'bg-sky-600', color: 'border-sky-300 bg-sky-50',
                  to: 'Ozon Ventures / Партнёрства Ozon / Corporate Development',
                  subject: 'Семейная платформа для 40M покупателей Ozon — предложение о партнёрстве',
                  hook: 'Список покупок платформы → автозаказ на Ozon. Семейный кошелёк → Ozon Pay',
                  body: `Добрый день,

«Наша Семья» — платформа для организации семейной жизни с 40M потенциальных пользователей именно в вашей аудитории.

Синергия с Ozon:
• Список покупок → автозаказ товаров на Ozon одним нажатием
• Меню на неделю → ингредиенты из Ozon Fresh / Супермаркет
• Ozon Pay → семейный кошелёк и совместные расходы
• Ozon Банк → финансовый модуль (кредиты, накопления для семьи)
• Программа лояльности → баллы за семейную активность

О продукте:
• Production-ready, 86 API, 151 таблица, ИС n'RIS №518-830-027
• 90+ экранов, 385+ компонентов

Готов обсудить форматы: от интеграции до приобретения.`,
                  ps: 'Акцент на "список покупок → Ozon" — это конкретная, измеримая синергия',
                },
                {
                  buyer: 'Wildberries', badge: 'bg-fuchsia-600', color: 'border-fuchsia-300 bg-fuchsia-50',
                  to: 'WB Tech / Партнёрства WB / Corporate M&A',
                  subject: '«Наша Семья» — нефинансовый семейный сервис для 60M покупателей WB',
                  hook: '80% аудитории WB — женщины, мамы-покупатели. Это и есть наш ключевой пользователь.',
                  body: `Добрый день,

Хочу предложить вашему вниманию «Наша Семья» — платформу для организации семейной жизни, аудитория которой на 80% совпадает с ядром Wildberries.

Что это даёт WB:
• Удержание аудитории: мамы возвращаются в WB через список покупок нашей платформы
• WB Pay → семейный кошелёк и трекинг расходов
• Данные о семейных покупках → таргетинг и персонализация рекомендаций
• «Наша Семья Premium» как цифровой товар на WB — новый продукт в каталоге

Продукт:
• Готовый MVP: 86 API, 151 таблица БД, 385+ компонентов
• Защищённая ИС (n'RIS №518-830-027)
• Работающие платёжные интеграции

Рассматриваю несколько покупателей. Готов обсудить детали при взаимном интересе.`,
                  ps: 'Wildberries ценит масштаб аудитории — покажите, что ваши пользователи = их покупатели',
                },
                {
                  buyer: 'Яндекс', badge: 'bg-yellow-600', color: 'border-yellow-300 bg-yellow-50',
                  to: 'Яндекс.Старт / Business Development Яндекс / corp@yandex-team.ru',
                  subject: 'Семейная платформа с интеграцией Алисы — готовый продукт для экосистемы Яндекса',
                  hook: 'Уже работает с Яндекс.Алисой, Яндекс.Картами — интеграция займёт дни, не месяцы',
                  body: `Добрый день,

«Наша Семья» — семейная платформа, которая уже интегрирована в экосистему Яндекса: навык для Алисы и маячок через Яндекс.Карты.

Готовая синергия из 4+ продуктов Яндекса:
• Алиса → голосовое управление домом и семейными задачами (навык уже есть)
• Яндекс.Маркет → список покупок платформы → прямые заказы
• Яндекс.Еда → меню недели → готовые блюда с доставкой
• Яндекс.Карты → семейный маячок (уже интегрировано)

О продукте:
• Production-ready: 86 API, 151 таблица, 90+ экранов
• ИС защищена n'RIS №518-830-027
• TAM 50M российских семей

Рассматриваю форматы от партнёрства до приобретения. Ряд переговоров уже ведётся.`,
                  ps: 'Главный крючок для Яндекса — что интеграция уже есть. Это снижает риски и ускоряет сделку',
                },
                {
                  buyer: 'VK / ВКонтакте', badge: 'bg-purple-600', color: 'border-purple-300 bg-purple-50',
                  to: 'VK Tech / Партнёрства VK / partnerships@vk.team',
                  subject: 'Семейный суперапп для аудитории ВКонтакте — готовый продукт',
                  hook: 'Мамы 25–40 — ядро ВКонтакте. Платформа «Наша Семья» создана именно для них.',
                  body: `Добрый день,

«Наша Семья» — комплексная платформа для семей с аудиторией, которая является ключевым сегментом ВКонтакте: мамы 25–40 лет с детьми.

Синергия с VK-экосистемой:
• Контент платформы → группы и паблики ВКонтакте (органический трафик)
• ИИ-ассистент «Домовой» → интеграция с VK Марусей
• Семейные события → VK Афиша
• VK Pay → семейный кошелёк

О продукте:
• Production-ready MVP с рабочими функциями
• 86 API, 151 таблица БД, 385+ компонентов
• ИС защищена n'RIS №518-830-027

Рассматриваю предложения от нескольких игроков рынка. Готов к короткому звонку.`,
                  ps: 'VK любит работать с контентными форматами — покажите потенциал UGC и вирусности',
                },
                {
                  buyer: 'МТС', badge: 'bg-red-600', color: 'border-red-300 bg-red-50',
                  to: 'МТС Startup Hub / Strategy & M&A МТС / innovation@mts.ru',
                  subject: 'Семейная платформа для 79M абонентов МТС — предложение о партнёрстве',
                  hook: 'МТС Маячок + «Наша Семья» = полная экосистема безопасности и организации семьи',
                  body: `Добрый день,

«Наша Семья» — цифровая платформа для управления семейной жизнью, которая органично расширяет семейные продукты МТС.

Как это сочетается с МТС:
• МТС Маячок → синергия с семейным геотрекером нашей платформы
• Семейные тарифы МТС → нативная интеграция как «семейный органайзер»
• МТС Банк → финансовый модуль (семейный бюджет, сбережения)
• МТС Premium → включение семейной подписки в пакет

О продукте:
• Production-ready: 86 API, 151 таблица БД, 90+ экранов
• ИС: n'RIS №518-830-027
• 79M абонентов МТС — готовая дистрибуция

Веду параллельные переговоры с несколькими компаниями. Готов обсудить форматы сотрудничества.`,
                  ps: 'МТС ценит конкретные цифры — упомяните 79M абонентов как их же актив для вашего продукта',
                },
              ].map((t, i) => (
                <div key={i} className={`rounded-2xl border-2 p-7 ${t.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <div className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-lg mb-2 ${t.badge}`}>{t.buyer}</div>
                      <div className="text-sm text-slate-500"><strong>Кому:</strong> {t.to}</div>
                      <div className="text-sm text-slate-500"><strong>Тема письма:</strong> {t.subject}</div>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-xs text-slate-600 max-w-xs">
                      <div className="font-semibold text-slate-800 mb-1">Ключевой крючок</div>
                      {t.hook}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-5 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-3">
                    {t.body}
                    {'\n\nС уважением,\n[Ваше имя]\nnasha-semiya.ru'}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 bg-white/50 rounded-lg p-3">
                    <span className="text-amber-500 flex-shrink-0 font-bold">💡</span>
                    <span><strong>Тактический совет:</strong> {t.ps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ОЦЕНКА ══════════ */}
        {active === 'valuation' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Финансы сделки</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Оценка и обоснование цены</h2>
              <p className="text-slate-500">Расчёт справедливой цены для переговоров с каждым типом покупателя</p>
            </div>

            {/* Главная таблица */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-6">Диапазон цен по сценариям</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Стоимость воспроизведения', value: '28 млн ₽', sub: 'нижняя граница — пол цены', color: 'bg-slate-700' },
                  { label: 'Оценка по Беркусу + ИС n\'RIS', value: '42 млн ₽', sub: 'базовая стоимость актива', color: 'bg-blue-900' },
                  { label: 'Справедливая рыночная', value: '80–130 млн ₽', sub: 'рекомендуемый диапазон', color: 'bg-indigo-800' },
                  { label: 'Стратегическая премия', value: '150–250 млн ₽', sub: 'для банка-стратега', color: 'bg-purple-900' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-xl p-5`}>
                    <div className="text-2xl font-black mb-2">{s.value}</div>
                    <div className="text-sm font-semibold text-slate-200 mb-1">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Мультипликаторы */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Обоснование цены через мультипликаторы</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Метод</th>
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">База</th>
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Мультипликатор</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">Оценка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { method: 'Стоимость воспроизведения', base: '28 млн ₽ (разработка)', mult: '1×', value: '28 млн ₽', bg: 'bg-white' },
                      { method: 'Метод Беркуса (6 факторов)', base: '42 баллов из 60', mult: '1 млн/балл', value: '42 млн ₽', bg: 'bg-slate-50' },
                      { method: 'Кратное к потенц. выручке (ARR)', base: 'ARR при 10K семьях = 39,6 млн', mult: '3–5× SaaS', value: '119–198 млн ₽', bg: 'bg-white' },
                      { method: 'Стратегическая премия (Беркус + 145–225%)', base: '42 млн ₽ базовая', mult: '+145–225%', value: '98–136 млн ₽', bg: 'bg-blue-50' },
                      { method: 'VC-метод (FV год 3 / (1+r)³)', base: 'FV = 1 188–1 980 млн, r=50%', mult: 'дисконт 50%/3г', value: '352–587 млн ₽', bg: 'bg-white' },
                      { method: 'Рекомендуемая цена переговоров', base: 'Средневзвешенная по методам', mult: '—', value: '80–130 млн ₽', bg: 'bg-green-50' },
                    ].map((row, i) => (
                      <tr key={i} className={row.bg}>
                        <td className="px-5 py-3 font-medium text-slate-900">{row.method}</td>
                        <td className="px-5 py-3 text-slate-600 text-xs">{row.base}</td>
                        <td className="px-5 py-3 text-slate-600">{row.mult}</td>
                        <td className="px-5 py-3 text-right font-black text-slate-800">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Что входит в сделку */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Что входит в сделку — состав актива</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    cat: '💻 Технология и код', color: 'bg-blue-50',
                    items: ['Исходный код фронтенда (React + TypeScript, 385+ компонентов)', 'Backend (86 облачных функций на Python)', 'База данных PostgreSQL (151 таблица, структура)', 'Вся документация и архитектура системы', 'PWA-конфигурация (работает как мобильное приложение)']
                  },
                  {
                    cat: '⚖️ Интеллектуальная собственность', color: 'bg-purple-50',
                    items: ['Свидетельство n\'RIS №518-830-027 (РЦИС.РФ)', 'Алгоритм оценки развития детей (Выготский + Эльконин)', 'Методология ИИ-ассистента «Домовой» (9 ролей)', 'UX/UI дизайн-система (90+ экранов)', 'Бренд «Наша Семья» (логотип, фирмстиль)']
                  },
                  {
                    cat: '👥 Пользователи и данные', color: 'bg-green-50',
                    items: ['40+ зарегистрированных пользователей', '51 семья в системе', '30 000+ аналитических событий', 'Работающие платёжные интеграции (ЮКасса)', 'История поведения и предпочтений']
                  },
                  {
                    cat: '🤝 Контракты и партнёрства', color: 'bg-amber-50',
                    items: ['Интеграция с Яндекс.Алиса (навык)', 'Интеграция с Яндекс.Картами (маячок)', 'Подключённые платёжные системы (СБП, Сбер Pay, Т-Банк)', 'Домен nasha-semiya.ru', 'Аккаунты в соцсетях и CDN-инфраструктура']
                  },
                ].map((block, i) => (
                  <div key={i} className={`rounded-xl p-5 ${block.color}`}>
                    <div className="font-bold text-slate-900 mb-3">{block.cat}</div>
                    <ul className="space-y-1">{block.items.map((it, j) => <li key={j} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 flex-shrink-0">·</span>{it}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ СТРУКТУРА СДЕЛКИ ══════════ */}
        {active === 'dealstructure' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Юридика и финансы</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Структура сделки</h2>
              <p className="text-slate-500">Варианты оформления, налоги и earn-out механизмы</p>
            </div>

            {/* Форматы сделки */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Форматы оформления сделки</h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'Договор отчуждения ИС + Лицензионный договор',
                    when: 'Продажа кода и прав (Сценарий A)',
                    price: '40–60 млн ₽', tax: 'НДФЛ 13–15%',
                    pros: 'Простой, быстрый, минимум юристов',
                    cons: 'Нет earn-out, покупатель получает всё сразу',
                    color: 'bg-slate-50 border-slate-200',
                  },
                  {
                    type: 'Asset Deal (купля-продажа активов)',
                    when: 'Продажа бизнеса как набора активов (Сценарий B)',
                    price: '80–130 млн ₽', tax: 'НДФЛ / УСН 6%',
                    pros: 'Покупатель выбирает нужные активы, гибкость структуры',
                    cons: 'Нужна оценка каждого актива, средний due diligence',
                    color: 'bg-blue-50 border-blue-200',
                  },
                  {
                    type: 'Share Deal (продажа доли в ООО)',
                    when: 'Продажа контрольного пакета (Сценарий C)',
                    price: '150–250 млн ₽', tax: 'НДФЛ 13–15% с дохода',
                    pros: 'Максимальная оценка, earn-out, партнёрство',
                    cons: 'Нужно ООО с историей, долгий due diligence, M&A юристы',
                    color: 'bg-amber-50 border-amber-200',
                  },
                ].map((deal, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${deal.color}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-black text-slate-900">{deal.type}</div>
                        <div className="text-sm text-slate-500">{deal.when}</div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-white rounded-lg px-3 py-1 text-center shadow-sm">
                          <div className="text-xs text-slate-500">Цена</div>
                          <div className="font-black text-slate-900 text-sm">{deal.price}</div>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-1 text-center shadow-sm">
                          <div className="text-xs text-slate-500">Налог</div>
                          <div className="font-bold text-slate-700 text-sm">{deal.tax}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-green-700">✓ {deal.pros}</div>
                      <div className="text-red-600">— {deal.cons}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earn-out */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Earn-out механизм</h3>
              <p className="text-slate-500 mb-6">Earn-out позволяет получить больше денег после сделки при достижении KPI платформы</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Базовый платёж', value: '60–80 млн ₽', desc: 'При подписании договора', color: 'bg-slate-50' },
                  { label: 'Earn-out при 5K семьях', value: '+15–20 млн ₽', desc: 'Через 12 мес после сделки', color: 'bg-blue-50' },
                  { label: 'Earn-out при 15K семьях', value: '+20–30 млн ₽', desc: 'Через 24 мес после сделки', color: 'bg-green-50' },
                ].map((e, i) => (
                  <div key={i} className={`rounded-xl p-5 ${e.color}`}>
                    <div className="text-2xl font-black text-slate-900 mb-1">{e.value}</div>
                    <div className="font-bold text-slate-700 mb-1">{e.label}</div>
                    <div className="text-xs text-slate-500">{e.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
                <strong>Итого с earn-out:</strong> базовый платёж 60–80 млн + earn-out до 50 млн = <strong>до 130 млн ₽ за 24 месяца</strong> при достижении KPI
              </div>
            </div>

            {/* Налоги */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Налоговый расчёт «на руки»</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Сумма сделки</th>
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Налог</th>
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Ставка</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">Чистыми «на руки»</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { sum: '40 млн ₽ (Сценарий A)', tax: 'НДФЛ', rate: '13%', net: '~34,8 млн ₽' },
                      { sum: '80 млн ₽ (Сценарий B)', tax: 'НДФЛ 15% (>5 млн)', rate: '15%', net: '~68 млн ₽' },
                      { sum: '120 млн ₽ (Сценарий B+)', tax: 'НДФЛ 15%', rate: '15%', net: '~102 млн ₽' },
                      { sum: '200 млн ₽ (Сценарий C)', tax: 'НДФЛ 15%', rate: '15%', net: '~170 млн ₽' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-5 py-3 font-medium text-slate-900">{row.sum}</td>
                        <td className="px-5 py-3 text-slate-600">{row.tax}</td>
                        <td className="px-5 py-3 text-slate-600">{row.rate}</td>
                        <td className="px-5 py-3 text-right font-black text-green-700">{row.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-slate-400">* Расчёт приблизительный. Рекомендуется консультация налогового юриста перед подписанием.</div>
            </div>
          </div>
        )}

        {/* ══════════ ПОДГОТОВКА ══════════ */}
        {active === 'preparation' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Diligence Ready</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Подготовка к продаже</h2>
              <p className="text-slate-500">Что нужно сделать до первых переговоров</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  phase: 'Фаза 1 · Юридическая подготовка', icon: '⚖️', color: 'bg-blue-50 border-blue-200', timeline: '1–2 месяца',
                  tasks: [
                    { done: true, task: 'Свидетельство n\'RIS №518-830-027 — получено 04.03.2026' },
                    { done: false, task: 'Регистрация товарного знака «Наша Семья» в Роспатенте (3–18 мес, ₽33 000)' },
                    { done: false, task: 'Зарегистрировать ООО (для Share Deal и чистого юр. лица сделки)' },
                    { done: false, task: 'Оформить все права на код через договор авторского заказа (если привлекались фрилансеры)' },
                    { done: false, task: 'Политика конфиденциальности и соответствие 152-ФЗ (персданные)' },
                    { done: false, task: 'Договоры с текущими пользователями (оферта, акцепт)' },
                  ]
                },
                {
                  phase: 'Фаза 2 · Финансовая документация', icon: '📊', color: 'bg-green-50 border-green-200', timeline: '2–4 недели',
                  tasks: [
                    { done: true, task: 'Оценка стоимости (4 метода) — готова в AdminValuation' },
                    { done: false, task: 'P&L (отчёт о прибылях и убытках) за период существования' },
                    { done: false, task: 'Расчёт себестоимости разработки (уже есть в оценке: ~28 млн ₽)' },
                    { done: false, task: 'Финансовая модель на 3 года (выручка, расходы, EBITDA)' },
                    { done: false, task: 'Список всех расходов (хостинг, API, домен, инструменты)' },
                    { done: false, task: 'Данные по текущим платящим пользователям и выручке' },
                  ]
                },
                {
                  phase: 'Фаза 3 · Технический Due Diligence', icon: '💻', color: 'bg-purple-50 border-purple-200', timeline: '1–2 недели',
                  tasks: [
                    { done: true, task: '86 облачных функций задокументированы (func2url.json)' },
                    { done: true, task: '151 таблица БД с миграциями (db_migrations/)' },
                    { done: false, task: 'Архитектурная документация (диаграмма системы)' },
                    { done: false, task: 'README по развёртыванию (как запустить с нуля)' },
                    { done: false, task: 'Нагрузочное тестирование (сколько пользователей выдержит)' },
                    { done: false, task: 'Security audit (базовый — без критичных уязвимостей)' },
                  ]
                },
                {
                  phase: 'Фаза 4 · Продающие материалы', icon: '📋', color: 'bg-amber-50 border-amber-200', timeline: '2–3 недели',
                  tasks: [
                    { done: true, task: 'Инвестиционная презентация (10 слайдов) — /investor-deck' },
                    { done: true, task: 'Оценка стоимости (PDF/PPTX) — /admin/valuation' },
                    { done: true, task: 'Маркетинговая стратегия развития — /admin/marketing' },
                    { done: true, task: 'Стратегия продажи — /admin/marketing-sale (этот документ)' },
                    { done: false, task: 'Тизер (1 страница для холодного контакта) — без NDA' },
                    { done: false, task: 'Information Memorandum (IM) — полный пакет после NDA' },
                  ]
                },
              ].map((block, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${block.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-black text-slate-900 flex items-center gap-2"><span>{block.icon}</span>{block.phase}</div>
                    </div>
                    <div className="text-xs bg-white rounded-lg px-2 py-1 text-slate-600 shadow-sm">{block.timeline}</div>
                  </div>
                  <ul className="space-y-2">
                    {block.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className={`flex-shrink-0 mt-0.5 font-bold ${t.done ? 'text-green-600' : 'text-slate-300'}`}>{t.done ? '✓' : '○'}</span>
                        <span className={t.done ? 'text-slate-700' : 'text-slate-600'}>{t.task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ПЕРЕГОВОРЫ ══════════ */}
        {active === 'negotiation' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Тактика</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Стратегия переговоров</h2>
              <p className="text-slate-500">Как вести переговоры, чтобы получить максимальную цену</p>
            </div>

            {/* Переговорные принципы */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Ключевые переговорные принципы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Ведите несколько переговоров параллельно', desc: 'Никогда не ведите переговоры с одним покупателем. Конкуренция между потенциальными покупателями — главный рычаг для повышения цены. Минимум 3 параллельных диалога.' },
                  { title: 'Начните с завышенной цены', desc: 'Первое предложение всегда выше целевой цены на 30–40%. Вы можете снизить цену, но повысить — почти невозможно. Старт: 180–200 млн ₽ для банка.' },
                  { title: 'Продавайте стратегическую ценность, не стоимость кода', desc: 'Покупатель платит не за код, а за монопольную позицию, аудиторию и возможность кросс-продаж. Фокус на бизнес-результате для покупателя.' },
                  { title: 'Никогда не раскрывайте срочность', desc: 'Если покупатель узнает, что вы «хотите побыстрее» — цена упадёт на 20–30%. Всегда транслируйте: «У нас есть несколько предложений, выбираем партнёра».' },
                  { title: 'Используйте NDA как точку отсчёта', desc: 'До NDA — только тизер (1 страница). После NDA — полный IM. Код и данные — только при LOI (Letter of Intent) с задатком.' },
                  { title: 'Earn-out как инструмент повышения цены', desc: 'Если покупатель «не верит» в потенциал — предложите earn-out: «Мы уверены в росте, давайте зафиксируем базовую цену и бонус за KPI».' },
                ].map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5">
                    <div className="font-bold text-slate-900 mb-2">{p.title}</div>
                    <div className="text-sm text-slate-600">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Скрипт первого контакта */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-4">Скрипт первого письма (тизер)</h3>
              <div className="bg-slate-50 rounded-xl p-6 font-mono text-sm text-slate-700 leading-relaxed">
                <p className="mb-3"><strong>Кому:</strong> M&A / Стратегический директор / Руководитель инноваций</p>
                <p className="mb-3"><strong>Тема:</strong> Готовый семейный суперапп — эксклюзивное предложение для [Название банка/компании]</p>
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <p>Добрый день,</p>
                  <p>Представляю вашему вниманию <strong>«Наша Семья»</strong> — единственную в России комплексную цифровую платформу для семей.</p>
                  <p>Кратко о продукте: production-ready, 86 API, 151 таблица БД, 40+ пользователей, защищённая ИС (n'RIS №518-830-027), интеграция с Яндекс.Алиса, ЮКасса, Яндекс.Картами.</p>
                  <p>Рассматриваю предложения о стратегическом партнёрстве или приобретении. Несколько компаний уже проявили интерес.</p>
                  <p>Готов выслать тизер (1 страница) и обсудить форматы сотрудничества при взаимном интересе.</p>
                  <p className="mt-3"><strong>С уважением,</strong><br />[Ваше имя]<br />Основатель, «Наша Семья»<br />nasha-semiya.ru</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">* Не раскрывайте цену и финансовые детали до подписания NDA</div>
            </div>

            {/* Этапы сделки */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Этапы сделки</h3>
              <div className="space-y-3">
                {[
                  { step: '1', name: 'Первый контакт', duration: '1–2 нед', desc: 'Тизер без NDA. Цель: выявить интерес и назначить встречу.', color: 'bg-slate-100' },
                  { step: '2', name: 'NDA', duration: '1 нед', desc: 'Подписание соглашения о конфиденциальности. После — полный IM.', color: 'bg-blue-100' },
                  { step: '3', name: 'Презентация / Демо', duration: '1–2 нед', desc: 'Живая демонстрация платформы, ответы на вопросы. Цель: «влюбить» команду покупателя.', color: 'bg-indigo-100' },
                  { step: '4', name: 'LOI (Letter of Intent)', duration: '2–4 нед', desc: 'Покупатель фиксирует намерение и вилку цены. Часто — задаток 5–10% от суммы.', color: 'bg-violet-100' },
                  { step: '5', name: 'Due Diligence', duration: '4–8 нед', desc: 'Технический, юридический, финансовый DD. Ваша задача — максимально открыться и снять риски.', color: 'bg-purple-100' },
                  { step: '6', name: 'Финальные переговоры', duration: '2–4 нед', desc: 'Согласование финальной цены, earn-out, условий переходного периода.', color: 'bg-amber-100' },
                  { step: '7', name: 'Закрытие сделки', duration: '2–4 нед', desc: 'Подписание договора, передача активов, получение денег.', color: 'bg-green-100' },
                ].map((s, i) => (
                  <div key={i} className={`flex items-start gap-4 rounded-xl p-4 ${s.color}`}>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-black text-slate-700 flex-shrink-0 shadow-sm">{s.step}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">{s.duration}</div>
                      </div>
                      <div className="text-sm text-slate-600">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ РОАДМАП ══════════ */}
        {active === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дорожная карта</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Роадмап продажи</h2>
              <p className="text-slate-500">Поэтапный план действий от 05.03.2026</p>
            </div>

            <div className="space-y-5">
              {[
                {
                  period: 'Март – Апрель 2026 · Месяц 1–2', name: 'Подготовка',
                  goal: 'Полная готовность к продаже', color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-700',
                  actions: [
                    'Зарегистрировать ООО или ИП (если ещё не сделано)',
                    'Подать заявку на регистрацию ТМ «Наша Семья» в Роспатент',
                    'Подготовить тизер (1 страница) и NDA',
                    'Собрать финансовую документацию (P&L, расходы)',
                    'Написать README по развёртыванию для технического DD',
                    'Подготовить список из 10–15 потенциальных покупателей с контактами M&A',
                  ]
                },
                {
                  period: 'Май – Июнь 2026 · Месяц 3–4', name: 'Первые контакты',
                  goal: '5+ NDA подписано, 2–3 активных диалога', color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-600',
                  actions: [
                    'Отправить тизеры в M&A отделы банков (ПСБ, Сбер, Т-Банк)',
                    'Параллельно: телеком (МТС) и экосистемы (VK, Яндекс)',
                    'Участие в конференции Fintech или Digital Banking',
                    'LinkedIn: прямые сообщения M&A директорам',
                    'Подписать первые NDA и выслать полный IM',
                    'Провести первые демо-сессии (онлайн/офлайн)',
                  ]
                },
                {
                  period: 'Июль – Август 2026 · Месяц 5–6', name: 'LOI и Due Diligence',
                  goal: '1–2 LOI получено, DD начат', color: 'border-indigo-300 bg-indigo-50', badge: 'bg-indigo-600',
                  actions: [
                    'Получить LOI от 1–2 покупателей с обозначенной вилкой цены',
                    'Открыть виртуальную комнату данных (VDR) для DD',
                    'Пройти технический due diligence с командой покупателя',
                    'Юридический DD: чистота ИС, договоры, соответствие 152-ФЗ',
                    'Финансовый DD: всё по запросу покупателя',
                    'Поддерживать конкуренцию между покупателями',
                  ]
                },
                {
                  period: 'Сентябрь – Октябрь 2026 · Месяц 7–8', name: 'Финальные переговоры',
                  goal: 'Согласована финальная цена', color: 'border-amber-300 bg-amber-50', badge: 'bg-amber-600',
                  actions: [
                    'Выбрать приоритетного покупателя (лучшая цена + условия)',
                    'Согласовать earn-out условия и переходный период',
                    'Юристы: финальный договор купли-продажи',
                    'Согласовать условия поддержки после сделки (3–12 мес)',
                    'Уведомить остальных покупателей об отказе',
                    'Подготовить передачу активов (репозиторий, БД, домены, аккаунты)',
                  ]
                },
                {
                  period: 'Ноябрь 2026 · Месяц 9', name: 'Закрытие сделки',
                  goal: '💰 Получены деньги', color: 'border-green-300 bg-green-50', badge: 'bg-green-600',
                  actions: [
                    'Подписание договора',
                    'Передача всех активов (код, БД, домены, ИС, аккаунты)',
                    'Получение оплаты (base payment)',
                    'Начало переходного периода (3–6 месяцев поддержки)',
                    'Постановка задач на earn-out период',
                    '🎉 Закрытие сделки',
                  ]
                },
              ].map((q, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${q.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-lg mb-2 ${q.badge}`}>{q.period}</div>
                      <h3 className="text-xl font-black text-slate-900">{q.name}</h3>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm font-bold text-slate-800">Цель: {q.goal}</div>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-slate-400 flex-shrink-0 mt-0.5">→</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-700 to-emerald-700 text-white p-8 text-center">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-black mb-2">80–250 млн ₽ «на руки»</div>
              <div className="text-green-200 mb-4">при закрытии сделки до марта 2027 года</div>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { label: 'Сценарий A (код)', value: '~35 млн ₽' },
                  { label: 'Сценарий B (бизнес)', value: '~102 млн ₽' },
                  { label: 'Сценарий C (стратег)', value: '~170 млн ₽' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3">
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-xs text-green-200">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-green-300">После НДФЛ 15%. С earn-out — до +50 млн ₽ дополнительно.</div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 pb-8">
          «Наша Семья» · Стратегия продажи платформы v1.0 · 05.03.2026 · Строго конфиденциально
        </div>
      </div>
    </div>
  );
}