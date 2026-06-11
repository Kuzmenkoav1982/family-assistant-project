import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// ─── v1.1 — обновлено по замечаниям ────────────────────────────────────────
// Изменения v1.1:
// 1. Исправлена AI-экономика: 5 AI/день = ~150/мес (было ошибочно 15/мес)
// 2. Все тарифы помечены статусом: ✅ официальный / ⚠️ предположение
// 3. Добавлена таблица квот и лимитов аккаунта
// 4. Полная модель хранения 500МБ/5ГБ при 1k/5k/10k семей
// 5. Разделён расчёт: аккаунты vs семьи vs активированные
// 6. Добавлена модель поддержки L1/L2/L3
// 7. Управленческий вывод: идём/не идём + 7 условий
// 8. Декомпозиция цены 149 ₽ — что входит и при каких лимитах

const NAV_ITEMS = [
  { id: 's0', label: 'Версия и статус' },
  { id: 's1', label: 'Тарифы' },
  { id: 's2', label: 'Квоты аккаунта' },
  { id: 's3', label: 'AI-экономика' },
  { id: 's4', label: 'Хранилище' },
  { id: 's5', label: '5 000: аккаунты vs семьи' },
  { id: 's6', label: 'Поддержка' },
  { id: 's7', label: 'Вывод v1.1' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TechEconomics() {
  return (
    <SectionPageFrame
      title="Техническо-экономический разбор v1.1"
      subtitle="Конфиденциально — только для собственника и доверенных партнёров"
      backPath="/"
      variant="light"
      width="wide"
      accentColor="text-gray-800"
      rightAction={
        <Button
          variant="default" size="sm"
          className="bg-gray-800 hover:bg-gray-900 text-white print:hidden"
          onClick={() => window.print()}
        >
          <Icon name="Printer" className="w-4 h-4 mr-1" />
          Распечатать
        </Button>
      }
    >
      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-sm px-3 py-2 mb-6 print:hidden">
        <div className="flex flex-wrap gap-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap">
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 0 — Версия и статус */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s0" className="mb-10">
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl px-6 py-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-amber-900 mb-1">v1.1 — рабочий документ, не финальный</div>
              <p className="text-sm text-amber-800 leading-relaxed">
                Документ обновлён по критике v1. Исправлены ошибки в AI-расчётах.
                Тарифы помечены статусом подтверждения. Добавлены недостающие блоки.
                <br />
                <strong>Что ещё нужно для финальной версии:</strong> скриншоты из личного кабинета Яндекс.Облака по PostgreSQL и Cloud Functions,
                актуальные квоты токенов из billing-раздела, данные по текущему объёму S3.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔴', label: 'Главный риск', value: 'Безлимитный AI для Premium' },
            { icon: '⚠️', label: 'Второй риск', value: 'S3 без лимита и мониторинга' },
            { icon: '🗄️', label: 'БД сейчас', value: '3,6 ГБ / 108 семей / 96 юзеров' },
            { icon: '✅', label: 'Архитектура', value: 'Масштабируема до 5 000+' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="text-sm font-semibold text-gray-800">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 1 — Тарифы */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s1" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Карта тарифов</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-5 text-sm text-blue-800">
          <strong>Легенда:</strong> ✅ — официальный публичный тариф с ссылкой |
          ⚠️ — предположение, требует проверки в кабинете |
          🔴 — критически важно уточнить
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white text-xs">
                <th className="text-left px-4 py-3">Сервис</th>
                <th className="text-left px-3 py-3">Для чего</th>
                <th className="text-right px-3 py-3">Цена</th>
                <th className="text-left px-3 py-3">Единица</th>
                <th className="text-center px-3 py-3">Статус</th>
                <th className="text-left px-4 py-3">Источник / Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  svc: 'Yandex Cloud Functions', what: '128 функций — каждый запрос пользователя',
                  price: '13,20 ₽', unit: 'за 1 млн вызовов + ~0,023 ₽/ГБ·с памяти',
                  status: '✅', src: 'yandex.cloud/ru/docs/functions/pricing', date: 'Jun 2026',
                },
                {
                  svc: 'Managed PostgreSQL', what: 'Основная БД — 270+ таблиц',
                  price: '?', unit: 'зависит от CPU/RAM/SSD конфигурации',
                  status: '🔴', src: 'Требует проверки в кабинете Яндекс.Облака', date: 'не проверено',
                },
                {
                  svc: 'Object Storage (S3)', what: 'Фото, PDF, файлы пользователей',
                  price: '~1,85 ₽/ГБ', unit: 'хранение в месяц',
                  status: '✅', src: 'yandex.cloud/ru/docs/storage/pricing', date: 'Jun 2026',
                },
                {
                  svc: 'CDN (bucket.poehali.dev)', what: 'Раздача файлов пользователям',
                  price: '~0,85–2 ₽/ГБ', unit: 'исходящий трафик',
                  status: '✅', src: 'yandex.cloud/ru/docs/cdn/pricing', date: 'Jun 2026',
                },
                {
                  svc: 'YandexGPT Lite', what: 'Все AI-функции (6 из 7 используют эту модель)',
                  price: '~0,20 ₽', unit: 'за 1 000 входных токенов; ~0,40 ₽ за 1 000 выходных',
                  status: '✅', src: 'yandex.cloud/ru/docs/foundation-models/pricing', date: 'Jun 2026',
                },
                {
                  svc: 'Yandex Vision OCR', what: 'Распознавание медицинских документов',
                  price: '~1,50 ₽', unit: 'за 1 страницу',
                  status: '✅', src: 'yandex.cloud/ru/docs/vision/pricing', date: 'Jun 2026',
                },
                {
                  svc: 'Yandex Maps API', what: 'Геозоны, трекер, поиск мест',
                  price: '~0,48–4,80 ₽', unit: 'за 1 000 запросов (тип зависит от API)',
                  status: '✅', src: 'developer.tech.yandex.ru/services/maps-api/prices', date: 'Jun 2026',
                },
                {
                  svc: 'Yandex SMTP', what: 'Email-уведомления',
                  price: 'бесплатно', unit: 'входит в Яндекс 360',
                  status: '✅', src: 'yandex.ru/support/connect/mail/limits.html', date: 'Jun 2026',
                },
                {
                  svc: 'SMS.ru', what: 'SMS-уведомления (резервные)',
                  price: '~2–5 ₽', unit: 'за 1 SMS (зависит от оператора)',
                  status: '✅', src: 'sms.ru/tariffs', date: 'Jun 2026',
                },
                {
                  svc: 'Web Push (pywebpush)', what: 'Push-уведомления в браузер',
                  price: 'бесплатно', unit: 'открытый стандарт W3C',
                  status: '✅', src: 'Публичный стандарт', date: 'Jun 2026',
                },
                {
                  svc: 'ЮKassa', what: 'Приём платежей (карты, СБП)',
                  price: '3,5%', unit: 'от суммы каждого платежа',
                  status: '✅', src: 'yookassa.ru/tariffs', date: 'Jun 2026',
                },
                {
                  svc: 'Unsplash API', what: 'Изображения для контента',
                  price: 'бесплатно', unit: 'до 50 запросов/час',
                  status: '✅', src: 'unsplash.com/developers', date: 'Jun 2026',
                },
              ].map(r => (
                <tr key={r.svc} className="even:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{r.svc}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{r.what}</td>
                  <td className="px-3 py-3 text-right font-bold text-gray-900 text-xs whitespace-nowrap">{r.price}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{r.unit}</td>
                  <td className="px-3 py-3 text-center text-base">{r.status}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.src}<br/><span className="text-gray-300">{r.date}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="font-bold text-red-800 mb-2">🔴 Обязательно уточнить в кабинете Яндекс.Облака</div>
          <p className="text-sm text-red-700">
            <strong>Managed PostgreSQL</strong> — текущая конфигурация (CPU, RAM, SSD) неизвестна.
            Это одна из крупнейших статей расходов — от 3 500 до 15 000+ ₽/мес в зависимости от конфига.
            Без этой цифры реальная базовая стоимость платформы не известна.
            <br />
            <strong>Что сделать:</strong> открыть console.cloud.yandex.ru → Managed Databases → PostgreSQL →
            выбрать кластер → вкладка «Хосты» и «Конфигурация» → записать CPU/RAM/SSD/IOPS.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 2 — Квоты аккаунта */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s2" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">2. Квоты и лимиты аккаунта</h2>
        <p className="text-sm text-gray-500 mb-5">
          Квоты — это ограничения, которые Яндекс.Облако ставит на ваш аккаунт. Они существуют независимо от лимитов продукта.
          Если квота превышена — сервис перестаёт работать для всех пользователей, не только для одного.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="text-left px-4 py-3">Сервис</th>
                <th className="text-left px-3 py-3">Квота / лимит</th>
                <th className="text-left px-3 py-3">Дефолт</th>
                <th className="text-left px-3 py-3">Где смотреть</th>
                <th className="text-left px-4 py-3">Что при превышении</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  svc: 'YandexGPT Lite',
                  quota: 'RPM (запросов/мин)',
                  def: '~10–50 RPM по умолчанию',
                  where: 'AI Studio → Квоты',
                  breach: 'HTTP 429, запрос не выполняется',
                },
                {
                  svc: 'YandexGPT Lite',
                  quota: 'TPM (токенов/мин)',
                  def: 'зависит от тарифа аккаунта',
                  where: 'AI Studio → Квоты',
                  breach: 'HTTP 429 — весь AI сервис недоступен',
                },
                {
                  svc: 'Cloud Functions',
                  quota: 'Одновременные вызовы (concurrency)',
                  def: '10 на функцию по умолчанию',
                  where: 'console.cloud → Functions → Конфигурация',
                  breach: 'Запросы ставятся в очередь или отклоняются',
                },
                {
                  svc: 'Cloud Functions',
                  quota: 'Таймаут выполнения',
                  def: '30 сек (настроено в коде)',
                  where: 'Ядро платформы → Функции',
                  breach: 'Функция завершается с ошибкой',
                },
                {
                  svc: 'Cloud Functions',
                  quota: 'Память на функцию',
                  def: '128–256 МБ',
                  where: 'console.cloud → Functions',
                  breach: 'OOM-ошибка, функция падает',
                },
                {
                  svc: 'Managed PostgreSQL',
                  quota: 'Макс. соединений',
                  def: 'зависит от RAM конфига',
                  where: 'console.cloud → PostgreSQL → Конфигурация',
                  breach: 'Новые запросы отклоняются',
                },
                {
                  svc: 'Object Storage',
                  quota: 'Размер одного объекта',
                  def: '5 ТБ максимум',
                  where: 'yandex.cloud/ru/docs/storage/concepts/limits',
                  breach: 'Upload отклоняется',
                },
                {
                  svc: 'Yandex Vision OCR',
                  quota: 'Запросов/сек',
                  def: '~1–5 RPS по умолчанию',
                  where: 'console.cloud → Vision → Квоты',
                  breach: 'HTTP 429',
                },
              ].map((r, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{r.svc}</td>
                  <td className="px-3 py-3 text-gray-700 text-xs">{r.quota}</td>
                  <td className="px-3 py-3 text-xs font-mono text-indigo-700">{r.def}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{r.where}</td>
                  <td className="px-4 py-3 text-red-700 text-xs font-medium">{r.breach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="font-bold text-amber-900 mb-2">⚠️ Что нужно сделать до запуска пилота</div>
          <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
            <li>Открыть AI Studio → Квоты → зафиксировать текущий RPM и TPM лимит YandexGPT</li>
            <li>Если RPM {'<'} 50 — запросить увеличение через поддержку Яндекс.Облака (до 2 недель)</li>
            <li>Проверить concurrency у Cloud Functions — при пике 500 одновременных запросов нужно {'>'} 50</li>
            <li>Уточнить max_connections у PostgreSQL — зависит от конфигурации RAM</li>
          </ol>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 3 — AI-экономика (исправленная) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s3" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">3. AI-экономика (исправленная версия)</h2>

        {/* Исправление ошибки v1 */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-xl px-5 py-4 mb-6">
          <div className="font-bold text-red-800 mb-2">🚨 Исправление ошибки v1</div>
          <p className="text-sm text-red-700">
            В v1 было написано: <em>«5 AI/день = ~15 запросов/мес»</em> — это неверно.<br />
            <strong>Правильно: 5 AI/день × 30 дней = ~150 запросов/месяц для Free-пользователя.</strong><br />
            Это меняет всю AI-экономику. Free-пользователь при лимите 5/день может делать
            до 150 AI-запросов в месяц — при стоимости ~3 ₽/запрос это <strong>до 450 ₽/мес</strong> расходов на одну семью.
            Именно поэтому лимит для Free нужно считать именно в месяц, а не только в день.
          </p>
        </div>

        {/* Как работает тарификация в коде */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
          <div className="font-bold text-gray-800 mb-3">Как реально работает AI в системе</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <div className="font-semibold text-gray-900 mb-2">Модель</div>
              <ul className="space-y-1 text-xs">
                <li>• Используется <strong>YandexGPT Lite</strong> (не Pro) — все 6 AI-функций</li>
                <li>• Фактурная API стоимость: ~0,20 ₽/1 000 вх.токенов, ~0,40 ₽/1 000 вых.токенов</li>
                <li>• Но в коде стоимость фиксирована: 3–5 ₽ за вызов (через кошелёк)</li>
                <li>• Разница — это маржа платформы на AI</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-2">Что считается «один запрос»</div>
              <ul className="space-y-1 text-xs">
                <li>• Один вызов ai-assistant / life-coach / conflict-ai / leisure-ai</li>
                <li>• maxTokens: 1 500–3 000 на вызов</li>
                <li>• История контекста: до 10 предыдущих сообщений (ai-assistant)</li>
                <li>• Итого вх.токены на 1 вызов: ~500–2 000 токенов</li>
                <li>• Итого вых.токены: ~300–1 500 токенов</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Расчёт реальной стоимости одного AI-запроса */}
        <h3 className="text-base font-bold text-gray-800 mb-3">Стоимость одного AI-запроса (токенная методика)</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="text-left px-4 py-3">Функция</th>
                <th className="text-right px-3 py-3">Вх.токены</th>
                <th className="text-right px-3 py-3">Вых.токены</th>
                <th className="text-right px-3 py-3">API-стоимость</th>
                <th className="text-right px-3 py-3">Цена в коде</th>
                <th className="text-right px-4 py-3">Маржа AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { fn: 'ai-assistant', inp: '~800', out: '~600', api: '~0,40 ₽', code: '3 ₽', margin: '+650%' },
                { fn: 'life-road (coach)', inp: '~1 200', out: '~500', api: '~0,44 ₽', code: '3 ₽', margin: '+580%' },
                { fn: 'conflict-ai', inp: '~1 500', out: '~800', api: '~0,62 ₽', code: '5 ₽', margin: '+706%' },
                { fn: 'event-ai-ideas', inp: '~600', out: '~500', api: '~0,32 ₽', code: '3 ₽', margin: '+838%' },
                { fn: 'leisure-ai', inp: '~700', out: '~600', api: '~0,38 ₽', code: '4 ₽', margin: '+953%' },
                { fn: 'diet-plan (7д)', inp: '~2 000', out: '~3 000', api: '~1,60 ₽', code: '17 ₽', margin: '+963%' },
              ].map(r => (
                <tr key={r.fn} className="even:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.fn}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.inp}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.out}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-500">{r.api}</td>
                  <td className="px-3 py-3 text-right font-bold text-indigo-700 text-xs">{r.code}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 text-xs">{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          * Токены оценочно. Точные данные: открыть console.cloud.yandex.ru → AI Studio → История запросов → посмотреть реальный токен-лог.
          Цена в коде — это списание с кошелька пользователя, не себестоимость.
        </p>

        {/* 3 сценария AI-нагрузки — ИСПРАВЛЕННЫЕ */}
        <h3 className="text-base font-bold text-gray-800 mb-3">Три сценария AI-нагрузки на 1 семью/мес</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            {
              name: '10 запросов/мес', label: 'Консервативный',
              color: 'border-green-200 bg-green-50',
              labelColor: 'text-green-700',
              items: [
                '10 AI-запросов (30 мин использования)',
                'API-себестоимость: ~0,40–0,60 ₽',
                'Списание с кошелька: ~30 ₽',
                '✅ Можно включить в базовый тариф',
              ],
              verdict: 'Безопасно включать в 149 ₽',
              verdictColor: 'text-green-700',
            },
            {
              name: '30 запросов/мес', label: 'Умеренный',
              color: 'border-indigo-200 bg-indigo-50',
              labelColor: 'text-indigo-700',
              items: [
                '30 AI-запросов (~1/день)',
                'API-себестоимость: ~1,2–1,8 ₽',
                'Списание с кошелька: ~90 ₽',
                '⚠️ Требует расчёта — зависит от тарифа',
              ],
              verdict: 'Безопасно только при тарифе 199+ ₽',
              verdictColor: 'text-amber-700',
            },
            {
              name: '150 запросов/мес', label: 'Free-пользователь (5/день)',
              color: 'border-red-200 bg-red-50',
              labelColor: 'text-red-700',
              items: [
                '5/день × 30 = 150 запросов',
                'API-себестоимость: ~6–9 ₽',
                'Free-план не предполагает дохода',
                '🔴 Субсидируется платными планами',
              ],
              verdict: 'Бесплатные субсидируют платные',
              verdictColor: 'text-red-700',
            },
          ].map(s => (
            <div key={s.name} className={`rounded-xl border p-4 ${s.color}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.labelColor}`}>{s.label}</div>
              <div className="text-lg font-bold text-gray-900 mb-3">{s.name}</div>
              <ul className="space-y-1 mb-3">
                {s.items.map(item => (
                  <li key={item} className="text-xs text-gray-700">{item}</li>
                ))}
              </ul>
              <div className={`text-xs font-bold ${s.verdictColor}`}>{s.verdict}</div>
            </div>
          ))}
        </div>

        {/* Главный вопрос: что входит в 149 ₽ */}
        <div className="bg-slate-900 text-white rounded-xl px-6 py-5">
          <div className="font-bold text-indigo-300 mb-3">Что входит в цену 149 ₽/мес — декомпозиция</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-semibold mb-2">При лимите AI = 10 запросов/мес:</div>
              <div className="space-y-1 text-slate-300 text-xs">
                <div className="flex justify-between"><span>Переменные (AI + S3 + CDN)</span><span>~5–8 ₽</span></div>
                <div className="flex justify-between"><span>Фикс. инфра (доля при 5 000 семей)</span><span>~45 ₽</span></div>
                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1 font-semibold text-white"><span>Себестоимость</span><span>~50–53 ₽</span></div>
                <div className="flex justify-between text-emerald-400 font-bold"><span>Продаётся за</span><span>149 ₽</span></div>
                <div className="flex justify-between text-emerald-300"><span>Маржа</span><span>~96–99 ₽ (181%)</span></div>
              </div>
              <div className="text-xs text-green-400 mt-2">✅ Безопасная модель</div>
            </div>
            <div>
              <div className="font-semibold mb-2">При лимите AI = 30 запросов/мес:</div>
              <div className="space-y-1 text-slate-300 text-xs">
                <div className="flex justify-between"><span>Переменные (AI + S3 + CDN)</span><span>~15–20 ₽</span></div>
                <div className="flex justify-between"><span>Фикс. инфра (доля при 5 000 семей)</span><span>~45 ₽</span></div>
                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1 font-semibold text-white"><span>Себестоимость</span><span>~60–65 ₽</span></div>
                <div className="flex justify-between text-emerald-400 font-bold"><span>Продаётся за</span><span>149 ₽</span></div>
                <div className="flex justify-between text-emerald-300"><span>Маржа</span><span>~84–89 ₽ (137%)</span></div>
              </div>
              <div className="text-xs text-green-400 mt-2">✅ Допустимо при соблюдении лимита</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-red-400 border-t border-slate-700 pt-3">
            🔴 При лимите AI = БЕЗЛИМИТ (текущий Premium) → AI-стоимость непредсказуема → 149 ₽ не покрывает.
            <strong className="text-white"> Вывод: цена 149 ₽ безопасна только при hard limit AI ≤ 30 запросов/мес.</strong>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 4 — Хранилище */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s4" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">4. Полная модель хранилища</h2>
        <p className="text-sm text-gray-500 mb-5">
          Расчёт при двух лимитах: Free = 500 МБ, Premium = 5 ГБ. Показаны масштабы 1 000 / 5 000 / 10 000 семей.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">Free-семей (70%)</th>
                <th className="text-right px-3 py-3">Premium-семей (30%)</th>
                <th className="text-right px-3 py-3">Макс. S3 объём</th>
                <th className="text-right px-3 py-3">Хранение/мес</th>
                <th className="text-right px-3 py-3">CDN трафик/мес</th>
                <th className="text-right px-4 py-3">Итого S3+CDN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { scale: '1 000 семей', free: 700, prem: 300, s3gb: '~1 850 ГБ', store: '~3 423 ₽', cdn: '~1 000 ₽', total: '~4 423 ₽' },
                { scale: '5 000 семей', free: 3500, prem: 1500, s3gb: '~9 250 ГБ', store: '~17 113 ₽', cdn: '~5 000 ₽', total: '~22 113 ₽' },
                { scale: '10 000 семей', free: 7000, prem: 3000, s3gb: '~18 500 ГБ', store: '~34 225 ₽', cdn: '~9 500 ₽', total: '~43 725 ₽' },
              ].map(r => (
                <tr key={r.scale} className="even:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{r.scale}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.free} × 500 МБ</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.prem} × 5 ГБ</td>
                  <td className="px-3 py-3 text-right font-mono text-xs text-indigo-700">{r.s3gb}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-700">{r.store}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-700">{r.cdn}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 text-xs">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="font-bold text-amber-800 mb-2">⚠️ Текущая проблема</div>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Глобального мониторинга S3 нет — текущий объём <strong>неизвестен</strong></li>
              <li>• Лимит на загрузку файлов в коде отсутствует (нет проверки размера)</li>
              <li>• Медицинские файлы и фото досуга хранятся в разных бакетах без учёта</li>
              <li>• Превью/копии не создаются — это плюс (нет дублей)</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="font-bold text-blue-800 mb-2">ℹ️ Расчёт по максимуму лимитов</div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• При 5 000 семей и ПОЛНОМ заполнении Premium (5 ГБ): ~7,5 ТБ</li>
              <li>• Только хранение: ~13 875 ₽/мес</li>
              <li>• На практике: средняя заполненность 20–30% от лимита</li>
              <li>• Реальные расходы скорее всего в 3–5 раз ниже максимума</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-xl px-5 py-4 text-sm">
          <strong className="text-indigo-300">Вывод по хранилищу:</strong> При лимите Premium = 5 ГБ и 5 000 семей
          максимальные расходы на хранение ~22 000 ₽/мес. Это 10% от общих расходов при 5 000 семей — управляемо.
          <br />
          <strong className="text-red-400">Критично:</strong> Настроить мониторинг S3 и hard limit на размер файла ДО масштабирования.
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 5 — 5 000: аккаунты vs семьи */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s5" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Разница: 5 000 аккаунтов vs 5 000 семей</h2>
        <p className="text-sm text-gray-500 mb-5">
          Это критически важное разграничение. Разная нагрузка и разная экономика.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              title: '5 000 зарегистрированных аккаунтов',
              desc: 'Просто создали учётку. Семья не создана.',
              load: 'БД: ~200 МБ, AI: 0, S3: минимум',
              cost: '~35 000–45 000 ₽/мес (только инфра)',
              color: 'border-slate-200 bg-slate-50',
              flag: '⚪',
            },
            {
              title: '5 000 семей (активные пространства)',
              desc: 'Создали семью, добавили членов, загружают данные.',
              load: 'БД: ~1–5 ГБ, AI: зависит от плана, S3: растёт',
              cost: '~225 000 ₽/мес (без AI лимитов ~350 000+)',
              color: 'border-indigo-200 bg-indigo-50',
              flag: '🟡',
            },
            {
              title: '5 000 активированных семей (банковская модель)',
              desc: 'Банк подтвердил подключение. Реально активны, пользуются.',
              load: 'Максимальная нагрузка. AI, S3, уведомления — всё.',
              cost: '~225 000–280 000 ₽/мес (с лимитами)',
              color: 'border-green-200 bg-green-50',
              flag: '🟢',
            },
          ].map(c => (
            <div key={c.title} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="text-2xl mb-2">{c.flag}</div>
              <div className="font-bold text-gray-900 text-sm mb-2">{c.title}</div>
              <p className="text-xs text-gray-600 mb-3">{c.desc}</p>
              <div className="text-xs text-gray-500 mb-1"><strong>Нагрузка:</strong> {c.load}</div>
              <div className="text-xs font-bold text-gray-800"><strong>Расходы:</strong> {c.cost}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="text-left px-4 py-3">Тип 5 000</th>
                <th className="text-right px-3 py-3">Fixed</th>
                <th className="text-right px-3 py-3">Variable (AI)</th>
                <th className="text-right px-3 py-3">S3+CDN</th>
                <th className="text-right px-3 py-3">Поддержка</th>
                <th className="text-right px-4 py-3">Итого/мес</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { type: '5 000 аккаунтов (спящих)', fixed: '32 500 ₽', ai: '~0 ₽', s3: '~500 ₽', sup: '19 500 ₽', total: '~52 500 ₽' },
                { type: '5 000 семей (смешанных)', fixed: '128 000 ₽', ai: '~20 000 ₽', s3: '~15 000 ₽', sup: '78 000 ₽', total: '~241 000 ₽' },
                { type: '5 000 активир. семей (с лимит)', fixed: '128 000 ₽', ai: '~19 500 ₽', s3: '~22 000 ₽', sup: '78 000 ₽', total: '~247 500 ₽' },
                { type: '5 000 активир. семей (без лимит AI)', fixed: '128 000 ₽', ai: '?? ₽', s3: '~22 000 ₽', sup: '78 000 ₽', total: '?? — риск' },
              ].map((r, i) => (
                <tr key={i} className={i === 3 ? 'bg-red-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-3 text-xs text-gray-800">{r.type}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.fixed}</td>
                  <td className={`px-3 py-3 text-right text-xs ${i === 3 ? 'text-red-700 font-bold' : 'text-gray-600'}`}>{r.ai}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.s3}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.sup}</td>
                  <td className={`px-4 py-3 text-right font-bold text-xs ${i === 3 ? 'text-red-700' : 'text-gray-900'}`}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 6 — Модель поддержки */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s6" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Модель поддержки пользователей</h2>
        <p className="text-sm text-gray-500 mb-5">
          5 000 пользователей — это не только облако и AI. Это обращения, жалобы, забытые пароли, ошибки оплаты.
          Нужна готовая модель поддержки ДО запуска.
        </p>

        {/* Роли */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              role: 'L1 — Первая линия',
              who: 'Оператор / менеджер',
              what: ['Забыли пароль', 'Вопросы по оплате', 'Как пользоваться', 'Общие жалобы'],
              outsource: '✅ Можно аутсорсить',
              color: 'border-green-200 bg-green-50',
            },
            {
              role: 'L2 — Техподдержка продукта',
              who: 'Продуктовый менеджер / разработчик',
              what: ['Баги в приложении', 'Проблемы с синхронизацией', 'Сбои уведомлений', 'Ошибки AI'],
              outsource: '⚠️ Частично — нужен кто-то с доступом к системе',
              color: 'border-amber-200 bg-amber-50',
            },
            {
              role: 'L3 — Инженер / разработчик',
              who: 'Разработчик (Юра)',
              what: ['Сбои БД', 'Проблемы с облаком', 'Критические баги', 'Инциденты безопасности'],
              outsource: '🔴 Нельзя оставлять только на собственнике',
              color: 'border-red-200 bg-red-50',
            },
          ].map(c => (
            <div key={c.role} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="font-bold text-gray-900 text-sm mb-1">{c.role}</div>
              <div className="text-xs text-gray-500 mb-3">{c.who}</div>
              <ul className="text-xs text-gray-700 space-y-1 mb-3">
                {c.what.map(w => <li key={w}>• {w}</li>)}
              </ul>
              <div className="text-xs font-semibold">{c.outsource}</div>
            </div>
          ))}
        </div>

        {/* Стоимость по масштабу */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">L1 (FTE)</th>
                <th className="text-right px-3 py-3">L2 (FTE)</th>
                <th className="text-right px-3 py-3">L3 (FTE)</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-left px-4 py-3">Формат</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { scale: 'Пилот (100–500 семей)', l1: '0,25 FTE', l2: 'собственник', l3: 'разработчик', total: '~19 500 ₽', fmt: 'Аутсорс L1, остальное — команда' },
                { scale: '1 000–4 999 семей', l1: '0,5 FTE', l2: '0,25 FTE', l3: 'разработчик', total: '~59 000 ₽', fmt: 'Фриланс L1+L2, L3 — команда' },
                { scale: '5 000–9 999 семей', l1: '1,0 FTE', l2: '0,5 FTE', l3: '0,25 FTE', total: '~136 500 ₽', fmt: 'Штатная L1, аутсорс L2' },
                { scale: '10 000+ семей', l1: '2,0 FTE', l2: '1,0 FTE', l3: '0,5 FTE', total: '~273 000 ₽', fmt: 'Отдел поддержки + выделенный инженер' },
              ].map((r, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-xs text-gray-800">{r.scale}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.l1}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.l2}</td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600">{r.l3}</td>
                  <td className="px-3 py-3 text-right font-bold text-xs text-indigo-700">{r.total}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.fmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm">
          <div className="font-bold text-amber-800 mb-2">Что нельзя оставлять на собственнике</div>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>🔴 Обработка инцидентов безопасности (утечки, доступ к БД)</li>
            <li>🔴 Восстановление после сбоев облака/БД</li>
            <li>🔴 Круглосуточный мониторинг при объёме 5 000+ семей</li>
            <li>⚠️ Ежедневная обработка обращений при объёме 1 000+ семей</li>
            <li>⚠️ Проверка платежей и разбор спорных транзакций ЮКассы</li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* РАЗДЕЛ 7 — Управленческий вывод v1.1 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="s7" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">7. Управленческий вывод v1.1</h2>

        {/* Идём / не идём */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-bold text-green-800 text-base mb-2">Идём в пилот — при 7 условиях</div>
            <p className="text-xs text-green-700">
              Технически платформа масштабируема. 5 000 семей возможны.
              Но <strong>финансово безопасно</strong> только при всех 7 условиях ниже.
            </p>
          </div>
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
            <div className="text-2xl mb-2">🚫</div>
            <div className="font-bold text-red-800 text-base mb-2">Не идём — если не выполнены ≥ 3 условий</div>
            <p className="text-xs text-red-700">
              Если хотя бы 3 из 7 условий не выполнены на момент запуска —
              пилот создаёт неконтролируемые финансовые риски.
              Лучше отложить на 2–4 недели и внедрить защиту.
            </p>
          </div>
        </div>

        {/* 7 обязательных условий */}
        <div className="bg-gray-900 text-white rounded-xl px-6 py-6 mb-6">
          <div className="font-bold text-white text-base mb-5">7 обязательных условий для безопасного запуска</div>
          <div className="space-y-4">
            {[
              {
                num: '1', priority: '🔴 СРОЧНО', title: 'Hard limit AI для Premium',
                detail: 'Установить максимум 30 AI-запросов/мес (или токен-бюджет). Сейчас — безлимит. Один активный Premium-пользователь без лимита может стоить 450+ ₽/мес при тарифе 149 ₽.',
                done: false,
              },
              {
                num: '2', priority: '🔴 СРОЧНО', title: 'Лимит размера файла в коде',
                detail: 'Добавить проверку max 10 МБ на файл в upload-функциях. Сейчас можно загрузить файл любого размера.',
                done: false,
              },
              {
                num: '3', priority: '🔴 СРОЧНО', title: 'Лимит объёма S3 на семью',
                detail: 'Free: 500 МБ / Premium: 5 ГБ. Сейчас лимита нет (кроме рецептов). Настроить мониторинг и soft/hard block.',
                done: false,
              },
              {
                num: '4', priority: '🟡 ДО ПИЛОТА', title: 'Уточнить конфигурацию PostgreSQL',
                detail: 'Открыть кабинет Яндекс.Облака, записать CPU/RAM/SSD. Убедиться что max_connections ≥ 100 и есть запас при пике 300+ одновременных.',
                done: false,
              },
              {
                num: '5', priority: '🟡 ДО ПИЛОТА', title: 'Запросить увеличение квот YandexGPT',
                detail: 'Узнать текущий RPM в AI Studio. Если < 50 — подать заявку на увеличение. Время ожидания до 2 недель.',
                done: false,
              },
              {
                num: '6', priority: '🟡 ДО ПИЛОТА', title: 'Настроить мониторинг S3',
                detail: 'Добавить отслеживание общего объёма файлов. Сейчас текущий объём S3 неизвестен — это слепое пятно.',
                done: false,
              },
              {
                num: '7', priority: '🟢 ДО 5 000', title: 'Готовая модель поддержки',
                detail: 'L1: аутсорс 0,5 FTE (~39 000 ₽/мес). L2: продуктовый менеджер или разработчик. L3: Юра. Без L1 при 5 000 семей — собственник тонет в обращениях.',
                done: false,
              },
            ].map(c => (
              <div key={c.num} className="flex gap-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">{c.num}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{c.priority}</span>
                    <span className="font-semibold text-white text-sm">{c.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Что нельзя обещать банку сейчас */}
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-5 mb-6">
          <div className="font-bold text-red-800 mb-3">Что нельзя обещать банку до выполнения условий</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-red-700">
            <ul className="space-y-1">
              <li>🚫 Безлимитный AI за фиксированную цену</li>
              <li>🚫 SLA 99.9%, если нет мониторинга и алертов</li>
              <li>🚫 Цена 149 ₽ без указания лимита AI</li>
            </ul>
            <ul className="space-y-1">
              <li>🚫 24/7 поддержку, если нет L1-оператора</li>
              <li>🚫 Моментальное масштабирование без проверки квот</li>
              <li>🚫 Безопасность медданных без юридического аудита</li>
            </ul>
          </div>
        </div>

        {/* Безопасный тариф */}
        <div className="bg-indigo-900 text-white rounded-xl px-6 py-5">
          <div className="font-bold text-indigo-200 mb-4">Безопасный тариф для банка — при соблюдении условий</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              {
                tier: 'Пилот', price: '350 ₽/мес', ai: '20 AI/мес', s3: '500 МБ', min: 'от 500 семей',
                note: 'Или от 100 семей + setup fee 150 000 ₽',
              },
              {
                tier: 'Базовый (1 000–4 999)', price: '149 ₽/мес', ai: '≤ 30 AI/мес', s3: '2 ГБ', min: 'от 1 000 семей',
                note: 'Годовой контракт обязателен',
              },
              {
                tier: 'Масштаб (5 000+)', price: '99 ₽/мес', ai: '≤ 30 AI/мес', s3: '2 ГБ', min: 'от 5 000 семей',
                note: 'Только при выполнении всех 7 условий',
              },
            ].map(t => (
              <div key={t.tier} className="bg-white/10 rounded-xl p-4">
                <div className="font-bold text-indigo-200 text-xs mb-1">{t.tier}</div>
                <div className="text-2xl font-bold text-white mb-3">{t.price}</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>AI: <strong className="text-white">{t.ai}</strong></div>
                  <div>Хранилище: <strong className="text-white">{t.s3}</strong></div>
                  <div>Мин. объём: <strong className="text-white">{t.min}</strong></div>
                  <div className="text-slate-400 mt-2">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t border-white/10 pt-3">
            * Все тарифы действительны только при введённых лимитах AI ≤ 30/мес и S3 по плану.
            Без лимитов — цена не безопасна.
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">
        v1.1 · Обновлено: июнь 2026 · Конфиденциально — для собственника и доверенных партнёров
      </p>
    </SectionPageFrame>
  );
}
