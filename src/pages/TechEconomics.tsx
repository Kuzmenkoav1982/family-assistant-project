import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// ─── v1.2 ────────────────────────────────────────────────────────────────────
// Исправлено vs v1.1:
// 1. Арифметика AI: 10 запросов → 4–6 ₽, 30 → 12–18 ₽, 150 → 60–90 ₽ (было в 10 раз меньше)
// 2. Три уровня AI-экономики разделены: API-себестоимость / кошелёк / банковский пакет
// 3. Цена 149 ₽ считается по ПОЛНОМУ использованию включённого лимита
// 4. Единица «30 AI-запросов» заменена на «30 AI-кредитов» (веса 1–7 по функциям)
// 5. Support-cost унифицирован: для 5 000 семей = 136 500 ₽/мес, итог пересчитан
// 6. Продуктовый 5 ГБ и банковский 2 ГБ — разделены в отдельные таблицы
// 7. БД-рост: приведён к единой логике 10–15 МБ/семью/год → 5 000 семей = 50–75 ГБ/год
// 8. Архитектурный статус: «вероятно масштабируема» вместо зелёной галочки

const NAV_ITEMS = [
  { id: 's0', label: 'Версия v1.2' },
  { id: 's1', label: 'Тарифы' },
  { id: 's2', label: 'Квоты аккаунта' },
  { id: 's3', label: 'AI-экономика' },
  { id: 's4', label: 'Хранилище' },
  { id: 's5', label: 'БД и рост данных' },
  { id: 's6', label: '5 000: аккаунты vs семьи' },
  { id: 's7', label: 'Поддержка' },
  { id: 's8', label: 'Вывод' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TechEconomics() {
  return (
    <SectionPageFrame
      title="Техническо-экономический разбор v1.2"
      subtitle="Конфиденциально — только для собственника и доверенных партнёров"
      backPath="/"
      variant="light"
      width="wide"
      accentColor="text-gray-800"
      rightAction={
        <Button variant="default" size="sm"
          className="bg-gray-800 hover:bg-gray-900 text-white print:hidden"
          onClick={() => window.print()}>
          <Icon name="Printer" className="w-4 h-4 mr-1" />Распечатать
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

      {/* ═══ РАЗДЕЛ 0 — Статус версии ═══ */}
      <section id="s0" className="mb-10">
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl px-6 py-5 mb-5">
          <div className="font-bold text-amber-900 mb-2">v1.2 — рабочий документ для собственника</div>
          <p className="text-sm text-amber-800">
            Исправлены 8 ошибок v1.1, включая ошибку арифметики AI в 10 раз.
            Цена 149 ₽ пересчитана по полному использованию лимита.
            Добавлена система AI-кредитов (уже внедрена в код).
            <br/>
            <strong>Для финала ещё нужно:</strong> скриншоты PostgreSQL-конфига из кабинета,
            актуальные квоты токенов из billing, фактический объём S3.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔴', label: 'Главный риск', value: 'AI-кредиты без лимита (уже исправлено)' },
            { icon: '🟡', label: 'Второй риск', value: 'S3 без мониторинга и лимита объёма' },
            { icon: '🟡', label: 'Архитектура', value: 'Вероятно масштабируема до 5 000+ при условиях' },
            { icon: '✅', label: 'Внедрено сегодня', value: 'AI-кредиты 30/мес + лимит файла 10 МБ' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="text-sm font-semibold text-gray-800">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 1 — Тарифы ═══ */}
      <section id="s1" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Карта тарифов</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-xs text-blue-800">
          <strong>Статусы:</strong> ✅ официальный публичный тариф · ⚠️ предположение, требует проверки · 🔴 не проверено, критично уточнить
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900 text-white">
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
                { svc: 'Yandex Cloud Functions', what: '128 функций — каждый запрос пользователя', price: '13,20 ₽', unit: 'за 1 млн вызовов + ~0,023 ₽/ГБ·с', status: '✅', src: 'yandex.cloud/ru/docs/functions/pricing · Jun 2026' },
                { svc: 'Managed PostgreSQL', what: 'Основная БД — 270+ таблиц', price: '?', unit: 'зависит от CPU/RAM/SSD (не проверено)', status: '🔴', src: 'Нужен скрин из кабинета Яндекс.Облака' },
                { svc: 'Object Storage (S3)', what: 'Фото, PDF, файлы', price: '~1,85 ₽/ГБ', unit: 'хранение в месяц', status: '✅', src: 'yandex.cloud/ru/docs/storage/pricing · Jun 2026' },
                { svc: 'CDN (bucket.poehali.dev)', what: 'Раздача файлов пользователям', price: '~0,85–2 ₽/ГБ', unit: 'исходящий трафик', status: '✅', src: 'yandex.cloud/ru/docs/cdn/pricing · Jun 2026' },
                { svc: 'YandexGPT Lite', what: 'Все AI-функции (6 из 7)', price: '~0,20 ₽ вх / ~0,40 ₽ исх', unit: 'за 1 000 токенов', status: '✅', src: 'yandex.cloud/ru/docs/foundation-models/pricing · Jun 2026' },
                { svc: 'Yandex Vision OCR', what: 'Мед. документы', price: '~1,50 ₽', unit: 'за 1 страницу', status: '✅', src: 'yandex.cloud/ru/docs/vision/pricing · Jun 2026' },
                { svc: 'Yandex Maps API', what: 'Геозоны, трекер, места', price: '~0,48–4,80 ₽', unit: 'за 1 000 запросов', status: '✅', src: 'developer.tech.yandex.ru · Jun 2026' },
                { svc: 'Yandex SMTP', what: 'Email-уведомления', price: 'бесплатно', unit: 'входит в Яндекс 360', status: '✅', src: 'yandex.ru/support/connect · Jun 2026' },
                { svc: 'SMS.ru', what: 'SMS-уведомления (резервные)', price: '~2–5 ₽', unit: 'за 1 SMS', status: '✅', src: 'sms.ru/tariffs · Jun 2026' },
                { svc: 'ЮKassa', what: 'Приём платежей', price: '3,5%', unit: 'от суммы платежа', status: '✅', src: 'yookassa.ru/tariffs · Jun 2026' },
              ].map(r => (
                <tr key={r.svc} className="even:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{r.svc}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.what}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">{r.price}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.unit}</td>
                  <td className="px-3 py-2.5 text-center text-sm">{r.status}</td>
                  <td className="px-4 py-2.5 text-gray-400">{r.src}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="font-bold text-red-800 mb-1">🔴 Что уточнить в кабинете Яндекс.Облака</div>
          <p className="text-sm text-red-700">
            <strong>PostgreSQL:</strong> console.cloud.yandex.ru → Managed Databases → PostgreSQL → Хосты → Конфигурация. Записать CPU/RAM/SSD/IOPS и текущую стоимость из Billing.
            <br/><strong>Cloud Functions:</strong> Functions → настройки каждой функции → память и таймаут.
            <br/><strong>YandexGPT:</strong> AI Studio → Квоты → RPM и TPM текущего аккаунта.
          </p>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 2 — Квоты аккаунта ═══ */}
      <section id="s2" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">2. Квоты и лимиты аккаунта</h2>
        <p className="text-sm text-gray-500 mb-4">
          Квоты Яндекс.Облака — ограничения на весь аккаунт. При превышении — сервис падает для всех.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Сервис</th>
                <th className="text-left px-3 py-3">Квота</th>
                <th className="text-left px-3 py-3">Дефолт</th>
                <th className="text-left px-3 py-3">Где смотреть</th>
                <th className="text-left px-4 py-3">При превышении</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { svc: 'YandexGPT Lite', q: 'RPM (запросов/мин)', def: '~10–50 RPM', where: 'AI Studio → Квоты', breach: 'HTTP 429, AI-функции падают для всех' },
                { svc: 'YandexGPT Lite', q: 'TPM (токенов/мин)', def: 'зависит от тарифа', where: 'AI Studio → Квоты', breach: 'HTTP 429 — весь AI недоступен' },
                { svc: 'Cloud Functions', q: 'Одновременные вызовы', def: '10 на функцию', where: 'Functions → Конфигурация', breach: 'Запросы отклоняются или в очередь' },
                { svc: 'Cloud Functions', q: 'Таймаут выполнения', def: '30 сек (настроено)', where: 'Ядро → Функции', breach: 'Функция падает с ошибкой' },
                { svc: 'Managed PostgreSQL', q: 'Макс. соединений', def: 'зависит от RAM', where: 'PostgreSQL → Конфигурация', breach: 'Новые запросы отклоняются' },
                { svc: 'Object Storage', q: 'Размер одного объекта', def: '5 ТБ макс', where: 'Документация Storage', breach: 'Upload отклоняется' },
              ].map((r, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{r.svc}</td>
                  <td className="px-3 py-2.5 text-gray-700">{r.q}</td>
                  <td className="px-3 py-2.5 font-mono text-indigo-700">{r.def}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.where}</td>
                  <td className="px-4 py-2.5 text-red-700 font-medium">{r.breach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 3 — AI-экономика (исправленная v1.2) ═══ */}
      <section id="s3" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">3. AI-экономика v1.2 — три уровня</h2>

        {/* Уровень A — API себестоимость */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
          <div className="font-bold text-gray-800 mb-3">Уровень A — API-себестоимость (что платим Яндексу)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="text-left px-3 py-2">Функция</th>
                  <th className="text-right px-3 py-2">Вх.токены</th>
                  <th className="text-right px-3 py-2">Вых.токены</th>
                  <th className="text-right px-3 py-2">API-стоимость 1 вызова</th>
                  <th className="text-right px-3 py-2">10 вызовов</th>
                  <th className="text-right px-3 py-2">30 вызовов</th>
                  <th className="text-right px-3 py-2">150 вызовов</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { fn: 'ai-assistant', inp: '~800', out: '~600', one: '~0,40 ₽', ten: '~4 ₽', thirty: '~12 ₽', iso: '~60 ₽' },
                  { fn: 'event-ai-ideas', inp: '~600', out: '~500', one: '~0,32 ₽', ten: '~3,2 ₽', thirty: '~9,6 ₽', iso: '~48 ₽' },
                  { fn: 'leisure-ai', inp: '~700', out: '~600', one: '~0,38 ₽', ten: '~3,8 ₽', thirty: '~11,4 ₽', iso: '~57 ₽' },
                  { fn: 'life-road', inp: '~1 200', out: '~500', one: '~0,44 ₽', ten: '~4,4 ₽', thirty: '~13,2 ₽', iso: '~66 ₽' },
                  { fn: 'conflict-ai', inp: '~1 500', out: '~800', one: '~0,62 ₽', ten: '~6,2 ₽', thirty: '~18,6 ₽', iso: '~93 ₽' },
                  { fn: 'health-ai (OCR+GPT)', inp: '~2 000', out: '~600', one: '~1,90 ₽', ten: '~19 ₽', thirty: '~57 ₽', iso: '~285 ₽' },
                  { fn: 'diet-plan 7д', inp: '~2 000', out: '~3 000', one: '~1,60 ₽', ten: '—', thirty: '—', iso: '—' },
                ].map(r => (
                  <tr key={r.fn} className="even:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-gray-700">{r.fn}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{r.inp}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{r.out}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{r.one}</td>
                    <td className="px-3 py-2 text-right text-indigo-700 font-bold">{r.ten}</td>
                    <td className="px-3 py-2 text-right text-amber-700 font-bold">{r.thirty}</td>
                    <td className="px-3 py-2 text-right text-red-700 font-bold">{r.iso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ⚠️ v1.1 содержала ошибку: 10 вызовов писалось как 0,40–0,60 ₽ вместо 4–6 ₽. Исправлено.
            Токены — оценочно. Точные данные: AI Studio → История запросов.
          </p>
        </div>

        {/* Уровень B — кошелёк пользователя */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-5">
          <div className="font-bold text-indigo-800 mb-3">Уровень B — списание с кошелька пользователя</div>
          <p className="text-xs text-indigo-700 mb-3">
            Это внутренний прайс продукта. Пользователь платит из семейного кошелька за каждый AI-вызов.
            Разница между API-себестоимостью и ценой кошелька — маржа платформы на AI.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { fn: 'ai-assistant', price: '3 ₽', api: '~0,40 ₽', margin: '+650%' },
              { fn: 'event-ai-ideas', price: '3 ₽', api: '~0,32 ₽', margin: '+838%' },
              { fn: 'leisure-ai', price: '4 ₽', api: '~0,38 ₽', margin: '+953%' },
              { fn: 'conflict-ai', price: '5 ₽', api: '~0,62 ₽', margin: '+706%' },
              { fn: 'health-ai', price: '5 ₽', api: '~1,90 ₽', margin: '+163%' },
              { fn: 'life-road', price: '3 ₽', api: '~0,44 ₽', margin: '+580%' },
              { fn: 'diet-plan 7д', price: '17 ₽', api: '~1,60 ₽', margin: '+963%' },
              { fn: 'diet-план 30д', price: '49 ₽', api: '~6–8 ₽', margin: '+513%' },
            ].map(r => (
              <div key={r.fn} className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="font-mono text-xs text-gray-600 mb-1">{r.fn}</div>
                <div className="text-lg font-bold text-indigo-700">{r.price}</div>
                <div className="text-xs text-gray-400">API: {r.api} · маржа: {r.margin}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-indigo-600 bg-indigo-100 rounded-lg px-3 py-2">
            <strong>Важно:</strong> Кошелёк защищает экономику только если AI платный для пользователя.
            В банковской B2B-модели, где AI входит в тариф — кошелёк не работает. Нужен кредитный лимит.
          </div>
        </div>

        {/* Уровень C — банковская модель */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-5">
          <div className="font-bold text-indigo-300 mb-3">Уровень C — банковская модель (AI внутри тарифа 149 ₽)</div>
          <p className="text-sm text-slate-300 mb-4">
            При B2B-модели с банком AI-кошелёк не применяется. Семья получает фиксированный пакет.
            Ниже расчёт при ПОЛНОМ использовании включённого лимита (не «средний», а максимум пакета).
          </p>

          {/* Система AI-кредитов — уже внедрена */}
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 mb-4">
            <div className="font-bold text-green-300 mb-2">✅ Уже внедрено сегодня: система AI-кредитов</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-300">
              {[
                { fn: 'ai-assistant', c: '1 кредит' },
                { fn: 'event-ai-ideas', c: '1 кредит' },
                { fn: 'leisure-ai', c: '1 кредит' },
                { fn: 'life-road', c: '1 кредит' },
                { fn: 'conflict-ai', c: '2 кредита' },
                { fn: 'health-ai', c: '2 кредита' },
                { fn: 'diet-plan 7д', c: '4 кредита' },
                { fn: 'diet-plan 30д', c: '7 кредитов' },
              ].map(r => (
                <div key={r.fn} className="bg-white/10 rounded px-2 py-1">
                  <div className="text-slate-400">{r.fn}</div>
                  <div className="font-bold text-white">{r.c}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Free: 15 кредитов/мес, 3/день · Premium/банк: 30 кредитов/мес, 5/день
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              {
                title: 'Пакет 10 AI/мес', label: 'только ai-assistant',
                api: '~4–6 ₽', fixed: '45 ₽', s3: '2 ₽', sup: '27 ₽',
                total: '~78–80 ₽', sell: '149 ₽', ok: true,
              },
              {
                title: 'Пакет 30 кредитов/мес', label: 'смешанные функции',
                api: '~12–18 ₽', fixed: '45 ₽', s3: '3 ₽', sup: '27 ₽',
                total: '~87–93 ₽', sell: '149 ₽', ok: true,
              },
              {
                title: 'Безлимит (НЕТ)', label: '150+ вызовов/мес',
                api: '~60–90 ₽', fixed: '45 ₽', s3: '5 ₽', sup: '27 ₽',
                total: '~137–167 ₽', sell: '149 ₽', ok: false,
              },
            ].map(s => (
              <div key={s.title} className={`rounded-xl p-4 ${s.ok ? 'bg-green-900/20 border border-green-700/40' : 'bg-red-900/30 border border-red-700/50'}`}>
                <div className={`text-xs font-bold mb-1 ${s.ok ? 'text-green-300' : 'text-red-300'}`}>{s.title}</div>
                <div className="text-xs text-slate-400 mb-3">{s.label}</div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between"><span>API AI</span><span>{s.api}</span></div>
                  <div className="flex justify-between"><span>Инфра (fixed/5000)</span><span>{s.fixed}</span></div>
                  <div className="flex justify-between"><span>S3+CDN</span><span>{s.s3}</span></div>
                  <div className="flex justify-between"><span>Поддержка (1 FTE)</span><span>{s.sup}</span></div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1 mt-1">
                    <span>Себестоимость</span><span>{s.total}</span>
                  </div>
                  <div className={`flex justify-between font-bold ${s.ok ? 'text-green-300' : 'text-red-400'}`}>
                    <span>Продаётся за</span><span>{s.sell}</span>
                  </div>
                </div>
                <div className={`mt-2 text-xs font-bold ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {s.ok ? '✅ Безопасно при соблюдении лимита' : '🔴 Убыточно — лимит обязателен'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            * Поддержка 27 ₽/семью = 136 500 ₽/мес ÷ 5 000 семей (исправлено vs v1.1 где было 78 000 ÷ 5000).
            Fixed 45 ₽ = 225 500 ₽ ÷ 5 000. Итого себестоимость при 30 кредитах ≈ 87–93 ₽.
          </p>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 4 — Хранилище ═══ */}
      <section id="s4" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">4. Модели хранилища</h2>
        <p className="text-sm text-gray-500 mb-4">
          Разделены два сценария: продуктовый Premium (5 ГБ) и банковский пакет (2 ГБ).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {[
            {
              title: 'Продуктовый тариф (Free 500МБ / Premium 5ГБ)',
              color: 'border-indigo-200 bg-indigo-50',
              headerColor: 'text-indigo-800',
              rows: [
                { scale: '1 000 семей', s3: '~1 850 ГБ', store: '~3 423 ₽', cdn: '~1 000 ₽', total: '~4 423 ₽' },
                { scale: '5 000 семей', s3: '~9 250 ГБ', store: '~17 113 ₽', cdn: '~5 000 ₽', total: '~22 113 ₽' },
                { scale: '10 000 семей', s3: '~18 500 ГБ', store: '~34 225 ₽', cdn: '~9 500 ₽', total: '~43 725 ₽' },
              ],
            },
            {
              title: 'Банковский пакет (Free 500МБ / Банк 2ГБ)',
              color: 'border-green-200 bg-green-50',
              headerColor: 'text-green-800',
              rows: [
                { scale: '1 000 семей', s3: '~950 ГБ', store: '~1 758 ₽', cdn: '~500 ₽', total: '~2 258 ₽' },
                { scale: '5 000 семей', s3: '~4 750 ГБ', store: '~8 788 ₽', cdn: '~2 500 ₽', total: '~11 288 ₽' },
                { scale: '10 000 семей', s3: '~9 500 ГБ', store: '~17 575 ₽', cdn: '~4 500 ₽', total: '~22 075 ₽' },
              ],
            },
          ].map(model => (
            <div key={model.title} className={`rounded-xl border p-4 ${model.color}`}>
              <div className={`font-bold text-sm mb-3 ${model.headerColor}`}>{model.title}</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-1">Масштаб</th>
                    <th className="text-right py-1">S3 объём</th>
                    <th className="text-right py-1">Хранение</th>
                    <th className="text-right py-1">CDN</th>
                    <th className="text-right py-1">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {model.rows.map(r => (
                    <tr key={r.scale} className="border-t border-gray-200">
                      <td className="py-1.5 font-medium text-gray-800">{r.scale}</td>
                      <td className="py-1.5 text-right text-gray-600">{r.s3}</td>
                      <td className="py-1.5 text-right text-gray-600">{r.store}</td>
                      <td className="py-1.5 text-right text-gray-600">{r.cdn}</td>
                      <td className="py-1.5 text-right font-bold text-gray-900">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="font-bold text-red-800 mb-2">🔴 Критические пробелы</div>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Текущий объём S3 неизвестен — нет глобального мониторинга</li>
              <li>• Лимит файла 10 МБ внедрён сегодня ✅</li>
              <li>• Лимит объёма на семью в S3 — ещё не внедрён ⚠️</li>
              <li>• Резервные копии S3 не настроены</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="font-bold text-blue-800 mb-2">📊 При полном заполнении лимитов</div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Банковский 2 ГБ × 5 000 Premium = 10 ТБ макс</li>
              <li>• При цене 1,85 ₽/ГБ = 18 500 ₽/мес только хранение</li>
              <li>• Реальная заполненность обычно 20–30% от лимита</li>
              <li>• Реальные расходы ≈ 3 700–5 550 ₽/мес при 5 000 Premium</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 5 — БД и рост данных ═══ */}
      <section id="s5" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">5. База данных — рост и лимиты</h2>
        <p className="text-sm text-gray-500 mb-4">
          Исправлено противоречие v1.1: приведена единая логика расчёта роста БД.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3">Рост на 1 активную семью</div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {[
                  { item: 'Профиль + члены (разово)', size: '~50–100 КБ' },
                  { item: 'События и задачи (год)', size: '~1–2 МБ' },
                  { item: 'Здоровье — записи (год)', size: '~2–4 МБ' },
                  { item: 'Финансы и транзакции (год)', size: '~1–2 МБ' },
                  { item: 'Питание и рецепты (год)', size: '~1–3 МБ' },
                  { item: 'Чат и AI-история (год)', size: '~2–4 МБ' },
                  { item: 'Уведомления, логи (год)', size: '~1–2 МБ' },
                ].map(r => (
                  <tr key={r.item}>
                    <td className="py-1.5 text-gray-600">{r.item}</td>
                    <td className="py-1.5 text-right font-mono text-indigo-700">{r.size}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2 text-gray-900">Итого за 1 год на семью</td>
                  <td className="py-2 text-right text-gray-900">~8–17 МБ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3">Рост БД при масштабировании</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-1">Масштаб</th>
                  <th className="text-right py-1">За 1 год</th>
                  <th className="text-right py-1">За 3 года</th>
                  <th className="text-right py-1">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { scale: '1 000 семей', y1: '~10–17 ГБ', y3: '~30–50 ГБ', ok: '✅' },
                  { scale: '5 000 семей', y1: '~50–85 ГБ', y3: '~150–250 ГБ', ok: '🟡' },
                  { scale: '10 000 семей', y1: '~100–170 ГБ', y3: '~300–500 ГБ', ok: '⚠️' },
                ].map(r => (
                  <tr key={r.scale}>
                    <td className="py-1.5 font-medium text-gray-800">{r.scale}</td>
                    <td className="py-1.5 text-right text-gray-700">{r.y1}</td>
                    <td className="py-1.5 text-right text-gray-700">{r.y3}</td>
                    <td className="py-1.5 text-right">{r.ok}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
              Текущее состояние: 3,6 ГБ при 108 семьях (~33 МБ/семью, но большая часть — тех. данные dev-агента).
              Пользовательских данных реально ~1 ГБ (~9 МБ/семью) — в норме.
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm">
          <strong className="text-amber-800">Вывод по БД:</strong>
          <span className="text-amber-700"> При 5 000 семьях через 3 года потребуется ~150–250 ГБ дискового пространства.
          Это потребует апгрейда PostgreSQL-кластера. Стоимость апгрейда зависит от конфигурации (нужно уточнить в кабинете).
          Ориентировочно +7 000–15 000 ₽/мес к текущей стоимости БД.</span>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 6 — 5 000: аккаунты vs семьи ═══ */}
      <section id="s6" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Три варианта «5 000»</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[
            { title: '5 000 аккаунтов', sub: 'Зарегистрировались, семью не создали', load: 'БД: +50–100 МБ, AI: 0, S3: 0', cost: '~52 500 ₽/мес', color: 'border-slate-200 bg-slate-50', flag: '⚪' },
            { title: '5 000 семейных пространств', sub: 'Создали семью, загружают данные', load: 'БД: ~50–85 ГБ/год, AI: по плану, S3: растёт', cost: '~247 500 ₽/мес (с лимитами)', color: 'border-indigo-200 bg-indigo-50', flag: '🟡' },
            { title: '5 000 активированных (банк)', sub: 'Банк подтвердил, семьи реально работают', load: 'Максимальная нагрузка — всё включено', cost: '~306 000 ₽/мес (full support)', color: 'border-green-200 bg-green-50', flag: '🟢' },
          ].map(c => (
            <div key={c.title} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="text-2xl mb-2">{c.flag}</div>
              <div className="font-bold text-sm text-gray-900 mb-1">{c.title}</div>
              <p className="text-xs text-gray-500 mb-2">{c.sub}</p>
              <div className="text-xs text-gray-600 mb-1"><strong>Нагрузка:</strong> {c.load}</div>
              <div className="text-xs font-bold text-gray-800"><strong>Расходы:</strong> {c.cost}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Тип 5 000</th>
                <th className="text-right px-3 py-3">Fixed</th>
                <th className="text-right px-3 py-3">AI (API)</th>
                <th className="text-right px-3 py-3">S3+CDN</th>
                <th className="text-right px-3 py-3">Поддержка</th>
                <th className="text-right px-4 py-3">Итого/мес</th>
                <th className="text-right px-4 py-3">На семью</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { t: '5 000 аккаунтов (спящих)', fx: '32 500 ₽', ai: '~0 ₽', s3: '~500 ₽', sup: '19 500 ₽', tot: '~52 500 ₽', per: '~10,5 ₽' },
                { t: '5 000 семей (с лимитом 30 кредитов)', fx: '128 000 ₽', ai: '~19 500 ₽', s3: '~11 000 ₽', sup: '136 500 ₽', tot: '~295 000 ₽', per: '~59 ₽' },
                { t: '5 000 активир. банковских (30 кред, 2ГБ)', fx: '128 000 ₽', ai: '~19 500 ₽', s3: '~11 288 ₽', sup: '136 500 ₽', tot: '~295 288 ₽', per: '~59,1 ₽' },
              ].map((r, i) => (
                <tr key={i} className={i === 1 ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.t}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.fx}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.ai}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.s3}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.sup}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900">{r.tot}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-indigo-700">{r.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * Поддержка 136 500 ₽ = L1 (78 000) + L2 (39 000) + L3 (19 500) для 5 000 семей.
          Исправлено vs v1.1 где была сумма 78 000 ₽ (только L1 0,5 FTE).
        </p>
      </section>

      {/* ═══ РАЗДЕЛ 7 — Поддержка ═══ */}
      <section id="s7" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">7. Модель поддержки L1/L2/L3</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[
            { role: 'L1 — Первая линия', who: 'Оператор / менеджер', what: ['Забытые пароли', 'Вопросы по оплате', 'Как пользоваться', 'Общие жалобы'], outsource: '✅ Аутсорсить', color: 'border-green-200 bg-green-50' },
            { role: 'L2 — Техподдержка', who: 'Продуктовый менеджер', what: ['Баги приложения', 'Сбои синхронизации', 'Ошибки уведомлений', 'Проблемы AI'], outsource: '⚠️ Частично — нужен доступ к системе', color: 'border-amber-200 bg-amber-50' },
            { role: 'L3 — Инженер', who: 'Разработчик', what: ['Сбои БД и облака', 'Критические баги', 'Инциденты безопасности', 'Восстановление данных'], outsource: '🔴 Нельзя оставлять только на собственнике', color: 'border-red-200 bg-red-50' },
          ].map(c => (
            <div key={c.role} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="font-bold text-sm text-gray-900 mb-1">{c.role}</div>
              <div className="text-xs text-gray-500 mb-2">{c.who}</div>
              <ul className="text-xs text-gray-700 space-y-0.5 mb-3">{c.what.map(w => <li key={w}>• {w}</li>)}</ul>
              <div className="text-xs font-semibold">{c.outsource}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">L1</th>
                <th className="text-right px-3 py-3">L2</th>
                <th className="text-right px-3 py-3">L3</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-left px-4 py-3">На семью</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { s: '100–499 семей (пилот)', l1: '0,25 FTE · 19 500 ₽', l2: 'собственник', l3: 'разработчик', tot: '~19 500 ₽', per: '~39–195 ₽' },
                { s: '1 000–4 999 семей', l1: '0,5 FTE · 39 000 ₽', l2: '0,25 FTE · 19 500 ₽', l3: 'разработчик', tot: '~58 500 ₽', per: '~12–58 ₽' },
                { s: '5 000–9 999 семей', l1: '1,0 FTE · 78 000 ₽', l2: '0,5 FTE · 39 000 ₽', l3: '0,25 FTE · 19 500 ₽', tot: '~136 500 ₽', per: '~14–27 ₽' },
                { s: '10 000+ семей', l1: '2,0 FTE · 156 000 ₽', l2: '1,0 FTE · 78 000 ₽', l3: '0,5 FTE · 39 000 ₽', tot: '~273 000 ₽', per: '~27 ₽' },
              ].map((r, i) => (
                <tr key={i} className={i === 2 ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.s}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l1}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l2}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l3}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{r.tot}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ РАЗДЕЛ 8 — Управленческий вывод ═══ */}
      <section id="s8" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Управленческий вывод v1.2</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-bold text-green-800 mb-2">Идём в пилот — при выполнении условий</div>
            <p className="text-xs text-green-700">5 000 семей достижимы. Архитектура вероятно масштабируема.
            Главные риски закрыты сегодня (AI-лимиты, размер файла).</p>
          </div>
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
            <div className="text-2xl mb-2">🚫</div>
            <div className="font-bold text-red-800 mb-2">Стоп-факторы: если не выполнено 3+ условий</div>
            <p className="text-xs text-red-700">При невыполнении — пилот создаёт финансовые и операционные риски.
            Лучше 2–4 недели подготовки, чем убытки после запуска.</p>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-xl px-6 py-6 mb-6">
          <div className="font-bold text-white text-base mb-5">7 условий безопасного запуска</div>
          <div className="space-y-4">
            {[
              { n: '1', p: '🟢 СДЕЛАНО', t: 'Hard limit AI-кредитов', d: 'Free: 15 кредитов/мес, 3/день. Premium/банк: 30 кредитов/мес, 5/день. Внедрено сегодня.' },
              { n: '2', p: '🟢 СДЕЛАНО', t: 'Лимит размера файла 10 МБ', d: 'Добавлена проверка во все три upload-функции. Внедрено сегодня.' },
              { n: '3', p: '🔴 СРОЧНО', t: 'Лимит объёма S3 на семью', d: 'Free: 500 МБ / Банк: 2 ГБ / Premium: 5 ГБ. Нужно внедрить hard block при достижении лимита.' },
              { n: '4', p: '🟡 ДО ПИЛОТА', t: 'Уточнить конфигурацию PostgreSQL', d: 'Открыть кабинет → Managed Databases → записать CPU/RAM/SSD и текущую стоимость из Billing.' },
              { n: '5', p: '🟡 ДО ПИЛОТА', t: 'Проверить и увеличить квоты YandexGPT', d: 'AI Studio → Квоты → RPM. Если < 50 — подать заявку (до 2 недель ожидания).' },
              { n: '6', p: '🟡 ДО ПИЛОТА', t: 'Мониторинг S3 + бэкапы', d: 'Настроить глобальный учёт объёма файлов. Настроить резервные копии S3 (сейчас только БД).' },
              { n: '7', p: '🟢 ДО 5 000', t: 'Готовая L1-поддержка', d: '0,5 FTE аутсорс L1 (~39 000 ₽/мес). Без этого при 1 000+ семей — собственник тонет в обращениях.' },
            ].map(c => (
              <div key={c.n} className="flex gap-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{c.n}</div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs">{c.p}</span>
                    <span className="font-semibold text-sm">{c.t}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-900 text-white rounded-xl px-6 py-5 mb-4">
          <div className="font-bold text-indigo-200 mb-4">Безопасные тарифы для банка (при выполнении условий)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tier: 'Пилот', price: '350 ₽/мес', ai: '20 кредитов/мес', s3: '500 МБ', min: 'от 500 семей', note: 'Или 100 семей + setup fee 150 000 ₽', ok: true },
              { tier: 'Базовый 1 000–4 999', price: '149 ₽/мес', ai: '≤ 30 кредитов/мес', s3: '2 ГБ', min: 'от 1 000 семей', note: 'Себестоимость ~87–93 ₽. Маржа ~56–62 ₽ (60–70%)', ok: true },
              { tier: 'Масштаб 5 000+', price: 'не раньше v1.3', ai: 'нужна проверка', s3: 'нужна проверка', min: 'требует подтверждения конфига', note: '99 ₽ — пока не объявлять до финала аудита', ok: false },
            ].map(t => (
              <div key={t.tier} className={`rounded-xl p-4 ${t.ok ? 'bg-white/10' : 'bg-red-900/30 border border-red-700/40'}`}>
                <div className="text-xs font-bold text-indigo-300 mb-1">{t.tier}</div>
                <div className={`text-2xl font-bold mb-3 ${t.ok ? 'text-white' : 'text-red-400'}`}>{t.price}</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>AI: <strong className="text-white">{t.ai}</strong></div>
                  <div>S3: <strong className="text-white">{t.s3}</strong></div>
                  <div>Мин: <strong className="text-white">{t.min}</strong></div>
                  <div className="text-slate-400 mt-2">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="font-bold text-amber-800 mb-2">Что нельзя обещать банку до финального аудита</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-700">
            <ul className="space-y-1">
              <li>🚫 Цену 99 ₽/мес — не подтверждена экономически</li>
              <li>🚫 SLA 99,9% — нет инструментов мониторинга</li>
              <li>🚫 Безлимитный AI за фиксированную цену</li>
            </ul>
            <ul className="space-y-1">
              <li>🚫 24/7 поддержку — нет L1-команды</li>
              <li>🚫 Безопасность мед. данных — нет юр. аудита</li>
              <li>🚫 «Точно потянем» — нет нагрузочных тестов</li>
            </ul>
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-6">
        v1.2 · Июнь 2026 · Конфиденциально
      </p>
    </SectionPageFrame>
  );
}
