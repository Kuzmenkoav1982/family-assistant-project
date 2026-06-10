import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

const NAV_ITEMS = [
  { id: 'section-1', label: 'Простым языком' },
  { id: 'section-2', label: 'Тарифы' },
  { id: 'section-3', label: 'Хранение данных' },
  { id: 'section-4', label: 'Лимиты' },
  { id: 'section-5', label: 'Сценарии' },
  { id: 'section-6', label: '5 000 пользователей' },
  { id: 'section-7', label: 'Вывод' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TechEconomics() {
  const handlePrint = () => window.print();

  return (
    <SectionPageFrame
      title="Техническо-экономический разбор"
      subtitle="Конфиденциально — только для собственника"
      backPath="/"
      variant="light"
      width="wide"
      accentColor="text-gray-800"
      rightAction={
        <Button
          variant="default"
          size="sm"
          className="bg-gray-800 hover:bg-gray-900 text-white print:hidden"
          onClick={handlePrint}
        >
          <Icon name="Printer" className="w-4 h-4 mr-1" />
          Распечатать
        </Button>
      }
    >
      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-sm px-3 py-2 print:hidden">
        <div className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 1 — Для собственника, простым языком
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-1" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">

          {/* Конфиденциальный баннер */}
          <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-5 py-3 mb-6">
            <span className="text-xl">🔒</span>
            <p className="text-sm font-semibold">
              Конфиденциально — только для собственника и доверенных партнёров
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            1. Для собственника — простым языком
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Этот документ объясняет, как устроена платформа «Наша Семья» изнутри, сколько реально стоит её обслуживание,
            где находятся риски и что нужно сделать, чтобы безопасно принять 5 000 и более пользователей.
          </p>

          <h3 className="text-base font-bold text-gray-800 mb-4">Главное о системе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: '🗄️',
                title: 'Где хранятся данные',
                text: 'В России. База данных — Яндекс.Облако (Москва). Файлы и фото — объектное хранилище bucket.poehali.dev. Резервные копии — автоматически каждые 24 часа.',
                color: 'bg-blue-50 border-blue-200',
                titleColor: 'text-blue-800',
              },
              {
                icon: '⚡',
                title: 'Как работает сервер',
                text: '128 облачных функций (serverless). Каждый запрос пользователя → запускает нужную функцию → возвращает ответ. Нет постоянно работающих серверов — платим только за фактические вызовы.',
                color: 'bg-purple-50 border-purple-200',
                titleColor: 'text-purple-800',
              },
              {
                icon: '🤖',
                title: 'Как работает ИИ',
                text: 'YandexGPT Lite — для всех AI-функций. Оплата за токены (примерно 3–5 ₽ за один AI-диалог). Кошелёк семьи — защита от перерасхода.',
                color: 'bg-green-50 border-green-200',
                titleColor: 'text-green-800',
              },
              {
                icon: '📊',
                title: 'Текущее состояние',
                text: '96 пользователей, 108 семей. БД: 3,6 ГБ (из которых ~2,6 ГБ — технические данные dev-агента, не пользовательские). Пользовательских данных: ~1 ГБ.',
                color: 'bg-amber-50 border-amber-200',
                titleColor: 'text-amber-800',
              },
            ].map((card) => (
              <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{card.icon}</span>
                  <h4 className={`font-bold text-sm ${card.titleColor}`}>{card.title}</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 2 — Карта тарифов и цен
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-2" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            2. Карта всех тарифов и цен
          </h2>
          <p className="text-gray-500 text-sm mb-5">Из чего состоят наши расходы — тарифы и источники</p>

          {/* Amber-предупреждение */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              Сайты Яндекс.Облака блокируют автоматический парсинг. Тарифы ниже основаны на официальных прайс-листах
              Яндекс.Облака 2025–2026 года и публичных данных. Для получения актуальных цифр рекомендую открыть
              личный кабинет и сверить с текущим счётом.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Сервис</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Для чего</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Цена</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Единица</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Статус</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    service: 'Yandex Cloud Functions',
                    usage: '128 serverless-функций, каждый запрос пользователя',
                    price: '13,20 ₽',
                    unit: 'за 1 млн вызовов + ~0,023 ₽/ГБ·с',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Managed PostgreSQL',
                    usage: 'Основная БД, 270+ таблиц, 3,6 ГБ',
                    price: '~3 500–7 000 ₽/мес',
                    unit: 'зависит от конфигурации CPU/RAM/SSD',
                    status: '⚠️ Предположение',
                    statusClass: 'text-amber-700',
                  },
                  {
                    service: 'Object Storage (S3)',
                    usage: 'Фото, файлы, PDF, резервные копии',
                    price: '~1,85 ₽/ГБ/мес + трафик',
                    unit: 'за ГБ хранения',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'CDN (bucket.poehali.dev)',
                    usage: 'Раздача статики и файлов пользователям',
                    price: '~0,85–2 ₽/ГБ',
                    unit: 'за ГБ исходящего трафика',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'YandexGPT Lite',
                    usage: 'Все AI-функции (7 вызовов)',
                    price: '~0,20–0,40 ₽',
                    unit: 'за 1 000 токенов',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Yandex Vision OCR',
                    usage: 'Распознавание медицинских документов',
                    price: '~1,50 ₽',
                    unit: 'за 1 страницу/изображение',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Yandex Maps API',
                    usage: 'Геозоны, трекер, поиск мест',
                    price: '~0,48–4,80 ₽',
                    unit: 'за 1 000 запросов',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Yandex SMTP',
                    usage: 'Email-уведомления (support@nasha-semiya.ru)',
                    price: 'бесплатно',
                    unit: 'входит в Яндекс 360',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'SMS.ru',
                    usage: 'SMS-уведомления (резервные)',
                    price: '~2–5 ₽',
                    unit: 'за 1 SMS',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Web Push (pywebpush)',
                    usage: 'Push-уведомления в браузер',
                    price: 'бесплатно',
                    unit: 'открытый стандарт W3C',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'ЮKassa',
                    usage: 'Приём платежей (карты, СБП)',
                    price: '3,5%',
                    unit: 'от суммы платежа',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'Unsplash API',
                    usage: 'Подбор изображений для контента',
                    price: 'бесплатно',
                    unit: 'до 50 запросов/час',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                  {
                    service: 'MAX Bot API',
                    usage: 'Рассылки и уведомления в MAX',
                    price: 'бесплатно',
                    unit: 'публичный API',
                    status: '✅ Официальный',
                    statusClass: 'text-green-700',
                  },
                ].map((row, idx) => (
                  <tr key={row.service} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-gray-800 whitespace-nowrap">{row.service}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{row.usage}</td>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 whitespace-nowrap">{row.price}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-600 text-xs">{row.unit}</td>
                    <td className={`border border-gray-300 px-4 py-2 text-xs font-medium ${row.statusClass}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Красный критический блок */}
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
            <span className="text-xl flex-shrink-0 mt-0.5">🚨</span>
            <p className="text-red-800 text-sm leading-relaxed">
              <span className="font-bold">Критически важно:</span> тарифы на Managed PostgreSQL зависят от выбранной
              конфигурации в консоли Яндекс.Облака. Рекомендую зайти в кабинет и уточнить текущую конфигурацию
              (CPU, RAM, SSD) — от этого зависит <span className="font-bold">40–60% всех расходов на инфраструктуру</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 3 — Карта хранения данных
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-3" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">3. Карта хранения данных</h2>
          <p className="text-gray-500 text-sm mb-6">Где и как хранятся данные</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* PostgreSQL */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🗄️</span>
                <h3 className="font-bold text-blue-900">PostgreSQL — основная БД</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Регион:</span> Россия, Москва (Яндекс.Облако)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Текущий объём:</span> <span className="font-bold text-blue-800">3,6 ГБ</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Реально пользовательских:</span> <span className="font-bold">~1 ГБ</span> (остальное — технические таблицы dev-агента)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Быстрорастущие таблицы:</span> page_views (14 МБ), analytics_metrics (6,3 МБ), health_records (2,9 МБ), family_members (2 МБ)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Рост при масштабировании:</span> ~10–15 МБ на семью в год при нормальной активности</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">При 5 000 семьях:</span> +50–75 ГБ пользовательских данных за год</span>
                </li>
              </ul>
            </div>

            {/* S3 */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📦</span>
                <h3 className="font-bold text-amber-900">S3 Object Storage — файлы и фото</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Два хранилища:</span> bucket.poehali.dev (основное) и storage.yandexcloud.net (медицинские файлы)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Текущий объём:</span> неизвестен точно <span className="text-red-600 font-semibold">(нет глобального мониторинга — это риск)</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Что хранится:</span> фото досуга, медицинские документы, PDF-отчёты, обложки блога, рецепты</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Лимит free-аккаунта (рецепты):</span> 500 МБ, 100 фото</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">!</span>
                  <span><span className="font-semibold">Для остальных файлов:</span> <span className="text-red-700 font-bold">лимита нет — это критический риск</span></span>
                </li>
              </ul>
            </div>

            {/* Логи и бэкапы */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💾</span>
                <h3 className="font-bold text-gray-800">Логи и резервные копии</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-gray-500 font-bold flex-shrink-0">—</span>
                  <span><span className="font-semibold">Логи:</span> Yandex Cloud Logging (хранятся 3 дня по умолчанию)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  <span><span className="font-semibold">Бэкапы БД:</span> автоматические (Managed PostgreSQL), 7 дней хранения</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">!</span>
                  <span><span className="font-semibold">Бэкапы S3:</span> <span className="text-red-700 font-bold">не настроены (риск!)</span></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 4 — Лимиты и уязвимости
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-4" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">4. Лимиты и критические уязвимости</h2>
          <p className="text-gray-500 text-sm mb-6">Что защищено, что открыто — честный разбор</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Что есть */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <span>✅</span> Что есть
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  'AI-запросы Free: 5/день (сброс каждый день)',
                  'AI-запросы Premium: безлимитно (но оплата из кошелька)',
                  'Проверка баланса кошелька ДО списания',
                  'Rate limit: вход 5 попыток/15 мин, API 100 запросов/мин',
                  'Лимит рецептов: 500 МБ / 100 фото (Free)',
                  'Максимум пополнения кошелька: 100 000 ₽',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-gray-700">
                    <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Что отсутствует */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <span>❌</span> Что отсутствует (критично!)
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  'Лимит размера одного файла (можно загрузить файл любого размера)',
                  'Лимит количества файлов на семью (неограниченно)',
                  'Лимит суммарного объёма S3 на семью',
                  'Глобальный мониторинг S3 (неизвестно сколько занято)',
                  'AI токен-лимит (только лимит по рублям через кошелёк)',
                  'Бэкапы S3 (только БД)',
                  'Лимит AI для Premium-пользователей (безлимитно = риск)',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-gray-700">
                    <span className="text-red-600 font-bold flex-shrink-0 mt-0.5">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <span className="text-xl flex-shrink-0 mt-0.5">🚨</span>
            <p className="text-red-800 text-sm leading-relaxed">
              <span className="font-bold">Самый опасный сценарий:</span> Premium-пользователь без ограничений
              делает 1 000 AI-запросов в день × 3 ₽ = 3 000 ₽/день = 90 000 ₽/месяц. При тарифе 299–2 699 ₽/месяц
              это гарантированный убыток. <span className="font-bold">Это нужно исправить до масштабирования.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 5 — Три сценария
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-5" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">5. Три сценария — Worst / Safe / Realistic</h2>
          <p className="text-gray-500 text-sm mb-2">Сколько стоит один активный пользователь — честный расчёт</p>
          <p className="text-gray-400 text-xs mb-6 italic">
            Расчёт от максимально допустимого потребления, не от текущей тестовой базы
          </p>

          <div className="space-y-6">
            {/* Сценарий A — WORST */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">WORST CASE</span>
                <h3 className="font-bold text-red-900">Сценарий A — самый дорогой пользователь</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4 italic">
                Допущения: Premium, ежедневно, 30+ AI-запросов/день, загружает по 10 фото/день, 5 членов семьи
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-red-200 text-sm">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="border border-red-200 px-3 py-2 text-left font-semibold text-red-800">Статья</th>
                      <th className="border border-red-200 px-3 py-2 text-right font-semibold text-red-800">В день</th>
                      <th className="border border-red-200 px-3 py-2 text-right font-semibold text-red-800">В месяц</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['AI-запросы (30 × 3 ₽)', '90 ₽', '2 700 ₽'],
                      ['S3 хранение (10 фото × 3 МБ = 30 МБ)', '—', '15 ₽ (накопительно)'],
                      ['CDN трафик (активный)', '—', '8 ₽'],
                      ['БД (запись данных)', '—', '1 ₽'],
                    ].map(([stat, day, month]) => (
                      <tr key={stat} className="bg-white even:bg-red-50/30">
                        <td className="border border-red-200 px-3 py-2 text-gray-700">{stat}</td>
                        <td className="border border-red-200 px-3 py-2 text-right font-mono text-gray-800">{day}</td>
                        <td className="border border-red-200 px-3 py-2 text-right font-mono text-gray-800">{month}</td>
                      </tr>
                    ))}
                    <tr className="bg-red-100">
                      <td className="border border-red-200 px-3 py-2 font-bold text-red-900">Итого</td>
                      <td className="border border-red-200 px-3 py-2 text-right font-bold text-red-900">90 ₽</td>
                      <td className="border border-red-200 px-3 py-2 text-right font-bold text-red-900">~2 724 ₽/мес</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-red-100 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  При тарифе Premium 12м = 2 699 ₽/год = 225 ₽/мес —{' '}
                  <span className="font-bold">убыток 2 499 ₽/мес с одного пользователя!</span>
                </p>
                <p className="text-red-900 font-bold text-sm mt-1">
                  Вывод: без лимита на AI для Premium — бизнес-модель не работает.
                </p>
              </div>
            </div>

            {/* Сценарий B — SAFE */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">SAFE CASE</span>
                <h3 className="font-bold text-green-900">Сценарий B — с рекомендуемыми лимитами</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4 italic">
                Допущения: Premium, активно пользуется, AI ≤ 30 запросов/месяц, фото ≤ 50/месяц, 3 члена семьи
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-green-200 text-sm">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border border-green-200 px-3 py-2 text-left font-semibold text-green-800">Статья</th>
                      <th className="border border-green-200 px-3 py-2 text-right font-semibold text-green-800">В месяц</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['AI (30 × 3,5 ₽)', '105 ₽'],
                      ['S3 хранение', '3 ₽'],
                      ['CDN трафик', '2 ₽'],
                      ['БД', '0,5 ₽'],
                    ].map(([stat, month]) => (
                      <tr key={stat} className="bg-white even:bg-green-50/30">
                        <td className="border border-green-200 px-3 py-2 text-gray-700">{stat}</td>
                        <td className="border border-green-200 px-3 py-2 text-right font-mono text-gray-800">{month}</td>
                      </tr>
                    ))}
                    <tr className="bg-green-100">
                      <td className="border border-green-200 px-3 py-2 font-bold text-green-900">Итого переменных</td>
                      <td className="border border-green-200 px-3 py-2 text-right font-bold text-green-900">~110 ₽/мес</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-green-100 rounded-lg p-3 space-y-1">
                <p className="text-green-800 text-sm">
                  Инфраструктура фикс на 5 000 семей: ~225 500 ₽/мес ÷ 5 000 = <span className="font-bold">45 ₽/семью</span>
                </p>
                <p className="text-green-900 font-bold text-sm">
                  Полная себестоимость: ~155 ₽/мес. Безопасная цена продажи: от 250 ₽/мес.
                </p>
              </div>
            </div>

            {/* Сценарий C — REALISTIC */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">REALISTIC</span>
                <h3 className="font-bold text-blue-900">Сценарий C — массовая аудитория</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4 italic">
                Допущения: 70% бесплатных (5 AI/день ≈ 15/мес), 30% платных (20 AI/мес), средняя активность
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-blue-200 text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-200 px-3 py-2 text-left font-semibold text-blue-800">Статья</th>
                      <th className="border border-blue-200 px-3 py-2 text-right font-semibold text-blue-800">На семью/мес</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['AI (смешанный)', '3,5 ₽'],
                      ['S3 хранение', '1,5 ₽'],
                      ['CDN трафик', '1,5 ₽'],
                      ['БД', '0,3 ₽'],
                    ].map(([stat, month]) => (
                      <tr key={stat} className="bg-white even:bg-blue-50/30">
                        <td className="border border-blue-200 px-3 py-2 text-gray-700">{stat}</td>
                        <td className="border border-blue-200 px-3 py-2 text-right font-mono text-gray-800">{month}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-100">
                      <td className="border border-blue-200 px-3 py-2 font-bold text-blue-900">Итого переменных</td>
                      <td className="border border-blue-200 px-3 py-2 text-right font-bold text-blue-900">~6,8 ₽/мес</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 space-y-1">
                <p className="text-blue-800 text-sm">
                  Фикс 5 000 семей ÷ 5 000 = <span className="font-bold">45 ₽/семью</span>
                </p>
                <p className="text-blue-900 font-bold text-sm">
                  Полная себестоимость: ~52 ₽/мес. Бесплатный план субсидируется платными.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 6 — 5 000 пользователей
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-6" className="scroll-mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">6. Потянем ли 5 000 пользователей?</h2>
          <p className="text-gray-500 text-sm mb-6">Архитектурный разбор: 5 000 пользователей / семей</p>

          <h3 className="font-bold text-gray-800 mb-3">Что первым сломается</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">Компонент</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">Текущий лимит</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">При 5 000 семьях</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-800">Риск</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">Решение</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    component: 'Cloud Functions',
                    limit: 'авто-масштабирование',
                    at5k: 'норм',
                    risk: '🟢 низкий',
                    solution: 'не нужно',
                    rowClass: 'bg-white',
                  },
                  {
                    component: 'PostgreSQL',
                    limit: 'текущая конфигурация',
                    at5k: 'нужен апгрейд CPU/RAM',
                    risk: '🟡 средний',
                    solution: '+7 000–15 000 ₽/мес',
                    rowClass: 'bg-amber-50/40',
                  },
                  {
                    component: 'S3 хранилище',
                    limit: 'безлимитно',
                    at5k: 'норм, но стоимость растёт',
                    risk: '🟡 средний',
                    solution: 'ввести лимиты',
                    rowClass: 'bg-white',
                  },
                  {
                    component: 'AI (YandexGPT)',
                    limit: 'квоты по умолчанию',
                    at5k: 'возможен rate limit',
                    risk: '🔴 высокий',
                    solution: 'запросить увеличение квоты',
                    rowClass: 'bg-red-50/40',
                  },
                  {
                    component: 'Соединения БД',
                    limit: '~50–100',
                    at5k: 'при пике 300+ — риск',
                    risk: '🟡 средний',
                    solution: 'PgBouncer или увеличение пула',
                    rowClass: 'bg-white',
                  },
                  {
                    component: 'AI без лимита',
                    limit: 'нет лимита',
                    at5k: 'потенциальный убыток',
                    risk: '🔴 критический',
                    solution: 'ввести hard limit срочно',
                    rowClass: 'bg-red-50/60',
                  },
                ].map((row) => (
                  <tr key={row.component} className={row.rowClass}>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-800">{row.component}</td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-600 text-xs">{row.limit}</td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700 text-xs">{row.at5k}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">{row.risk}</td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700 text-xs">{row.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-gray-800 mb-3">Пиковая нагрузка</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {[
              { count: '50', label: 'одновременных', status: 'норм', color: 'bg-green-50 border-green-200 text-green-800' },
              { count: '100', label: 'одновременных', status: 'норм', color: 'bg-green-50 border-green-200 text-green-800' },
              { count: '300', label: 'одновременных', status: 'риск по БД', color: 'bg-amber-50 border-amber-200 text-amber-800' },
              { count: '500', label: 'одновременных', status: 'апгрейд PostgreSQL', color: 'bg-red-50 border-red-200 text-red-800' },
              { count: '1 000', label: 'одновременных', status: 'PgBouncer + апгрейд', color: 'bg-red-50 border-red-200 text-red-800' },
            ].map((item) => (
              <div key={item.count} className={`rounded-xl border p-3 text-center ${item.color}`}>
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-xs mt-0.5 opacity-70">{item.label}</div>
                <div className="text-xs font-semibold mt-1">{item.status}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 italic">
            Нагрузочных тестов не проводилось. Оценки инженерные, основаны на архитектуре.
            Рекомендуется нагрузочный тест перед запуском на 1 000+ семей.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РАЗДЕЛ 7 — Финальный вывод
      ═══════════════════════════════════════════════════════════════ */}
      <section id="section-7" className="scroll-mt-4">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
          <h2 className="text-2xl font-bold text-white mb-1">7. Вывод для собственника</h2>
          <p className="text-gray-400 text-sm mb-8">7 шагов до безопасного запуска</p>

          <div className="space-y-3 mb-8">
            {/* Срочно */}
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white mb-3">
                🔴 СРОЧНО — до любого пилота
              </span>
              <div className="space-y-2">
                {[
                  {
                    num: '1',
                    title: 'Ввести hard limit на AI для Premium',
                    desc: 'максимум 100–200 запросов/месяц (сейчас безлимитно — это прямой убыток)',
                  },
                  {
                    num: '2',
                    title: 'Ввести лимит размера файла',
                    desc: 'максимум 10 МБ на файл (сейчас не ограничено)',
                  },
                  {
                    num: '3',
                    title: 'Ввести лимит объёма S3 на семью',
                    desc: '500 МБ Free, 5 ГБ Premium',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3 bg-red-950/40 border border-red-800/50 rounded-xl p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                    <div>
                      <span className="font-semibold text-white">{step.title}</span>
                      <span className="text-red-300 text-sm"> — {step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* До пилота */}
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white mb-3">
                🟡 ДО ПИЛОТА — 1 000 семей
              </span>
              <div className="space-y-2">
                {[
                  {
                    num: '4',
                    title: 'Уточнить конфигурацию PostgreSQL',
                    desc: 'в кабинете Яндекс.Облака и при необходимости апгрейднуть',
                  },
                  {
                    num: '5',
                    title: 'Запросить увеличение квот YandexGPT',
                    desc: 'у Яндекс.Облака для поддержки 5 000+ запросов/час',
                  },
                  {
                    num: '6',
                    title: 'Настроить бэкапы S3',
                    desc: 'сейчас только БД бэкапируется',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3 bg-amber-950/30 border border-amber-700/50 rounded-xl p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                    <div>
                      <span className="font-semibold text-white">{step.title}</span>
                      <span className="text-amber-300 text-sm"> — {step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* До 5 000 */}
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white mb-3">
                🟢 ДО 5 000 СЕМЕЙ
              </span>
              <div className="space-y-2">
                {[
                  {
                    num: '7',
                    title: 'Настроить глобальный мониторинг S3',
                    desc: 'сейчас неизвестно сколько занято хранилище',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3 bg-green-950/30 border border-green-700/50 rounded-xl p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                    <div>
                      <span className="font-semibold text-white">{step.title}</span>
                      <span className="text-green-300 text-sm"> — {step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3 ключевых вопроса */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="font-bold text-white mb-4 text-lg">Ответы на 3 ключевых вопроса</h3>
            <div className="space-y-3">
              <div className="bg-green-950/40 border border-green-700/50 rounded-xl p-4">
                <p className="text-green-300 font-bold text-sm mb-1">✅ Потянем ли 5 000?</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Да, но с условиями: апгрейд PostgreSQL (~+7 000 ₽/мес) + лимиты на AI и файлы + увеличение квот YandexGPT.
                </p>
              </div>
              <div className="bg-blue-950/40 border border-blue-700/50 rounded-xl p-4">
                <p className="text-blue-300 font-bold text-sm mb-1">💰 Безопасная цена продажи</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  от <span className="font-bold text-white">149 ₽/мес</span> при 5 000+ семей (с лимитами) &nbsp;|&nbsp;
                  от <span className="font-bold text-white">250 ₽/мес</span> при 1 000 семей &nbsp;|&nbsp;
                  пилот от <span className="font-bold text-white">350 ₽/мес</span>
                </p>
              </div>
              <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-4">
                <p className="text-red-300 font-bold text-sm mb-1">⚠️ Главный риск</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Отсутствие лимита AI для Premium-пользователей. Один очень активный пользователь может стоить{' '}
                  <span className="font-bold text-white">2 700 ₽/мес</span> при тарифе{' '}
                  <span className="font-bold text-white">225 ₽/мес</span>.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-6 text-right">
            Документ подготовлен: 11 июня 2026 г. &nbsp;|&nbsp; «Наша Семья» — техническо-экономический разбор v1.0
          </p>
        </div>
      </section>
    </SectionPageFrame>
  );
}
