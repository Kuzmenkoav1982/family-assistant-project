import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// ─── v1.5 ────────────────────────────────────────────────────────────────────
// Изменения vs v1.4:
// 1. Добавлен раздел «Коммерческая модель для банка» — гибридная + фиксированная
// 2. Тарифные карточки переписаны в терминах «активированного подключения»
// 3. Партнёрский баланс вынесен как отдельный механизм
// Изменения vs v1.3.1:
// 1. 12 GPT-функций переведены на Lite, 1 image → YandexART (подтверждено 12.06.2026)
// 2. AI-кредиты убраны как блокирующий механизм — остался только кошелёк в рублях
// 3. Worst-case пересчитан по реальным Lite-ценам (0,20 ₽/1к токенов)
// 4. Добавлен блок «Подтверждено живыми вызовами» с реальными токенами из логов
// 5. Цена токенов скорректирована: вход = выход = 0,20 ₽/1к (не 0,40 ₽ как у Pro)
// Изменения vs v1.3:
// 6. Fixed пересобран: 3 слоя (fixed / variable / step-fixed), сумма теперь сходится
// 7. S3: отдельно смешанная база и полный банковский worst-case (10 ТБ)
// 8. Термины стандартизированы: gross margin = прибыль/выручка, markup = прибыль/себестоимость

const NAV_ITEMS = [
  { id: 's0', label: 'Статус' },
  { id: 's1', label: 'Структура затрат' },
  { id: 's2', label: 'AI worst-case' },
  { id: 's3', label: 'S3 хранилище' },
  { id: 's4', label: 'БД' },
  { id: 's5', label: 'Сводная таблица' },
  { id: 's6', label: 'Безопасность' },
  { id: 's7', label: 'Тарифы / квоты' },
  { id: 's8', label: 'Поддержка' },
  { id: 'sbank', label: '🏦 Модель для банка' },
  { id: 's9', label: 'Вывод' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── ГЛОССАРИЙ ───────────────────────────────────────────────────────────────
// Gross margin   = (Выручка − Себестоимость) / Выручка × 100%
//                  Пример: (149 − 85) / 149 = 42,9%
//
// Markup         = (Выручка − Себестоимость) / Себестоимость × 100%
//                  Пример: (149 − 85) / 85 = 75,3%
//
// Contribution   = Выручка − Переменные затраты
//                  Показывает сколько покрывается fixed после вычета variable
//
// В этом документе используются ОБА термина с явной подписью.

export default function TechEconomics() {
  return (
    <SectionPageFrame
      title="Техническо-экономический разбор v1.5"
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

      {/* ═══ 0 — Статус ═══ */}
      <section id="s0" className="mb-10">
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl px-6 py-5 mb-3">
          <div className="font-bold text-green-900 mb-1">v1.5 — миграция AI на Lite подтверждена живыми вызовами</div>
          <p className="text-sm text-green-800">
            12 GPT-функций переведены на YandexGPT Lite, 1 image-функция работает на YandexART (12.06.2026).
            Логи подтверждают модель и токены. Кредитный блок убран — контроль только через кошелёк в рублях.
            Экономия на токенах <strong>~83%</strong> относительно Pro.
            <strong> Для финальной версии ещё нужно:</strong> скриншот PostgreSQL + billing из кабинета Яндекс.Облака,
            квоты YandexGPT из AI Studio, фактический объём S3.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Уровень 1 — live logs */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-xs">
            <div className="font-bold text-blue-900 mb-2">🟢 Уровень 1 — подтверждено живыми логами (12.06.2026)</div>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-blue-700 border-b border-blue-200">
                <th className="pb-1 pr-3">Функция</th>
                <th className="pb-1 pr-3 text-right">Токены</th>
                <th className="pb-1 text-right">Lite</th>
              </tr></thead>
              <tbody className="divide-y divide-blue-100">
                {[
                  { fn: 'health-ai (GPT-часть)', t: 933 },
                  { fn: 'generate-diet-plan', t: 5060 },
                  { fn: 'analyze-development', t: 1271 },
                ].map(r => (
                  <tr key={r.fn}>
                    <td className="py-1 pr-3 font-mono">{r.fn}</td>
                    <td className="py-1 pr-3 text-right">{r.t.toLocaleString()}</td>
                    <td className="py-1 text-right font-semibold text-green-700">{(r.t * 0.0002).toFixed(2)} ₽</td>
                  </tr>
                ))}
                <tr className="border-t border-blue-300 text-blue-800">
                  <td className="pt-1 pr-3 font-semibold">Итого (Pro)</td>
                  <td className="pt-1 pr-3 text-right">7 264</td>
                  <td className="pt-1 text-right font-semibold text-red-500 line-through">8,72 ₽</td>
                </tr>
                <tr className="font-bold text-green-800">
                  <td className="pr-3">Итого на Lite (−83%)</td>
                  <td className="pr-3 text-right">7 264</td>
                  <td className="text-right text-green-700">1,45 ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Уровень 2 — code confirmed */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xs">
            <div className="font-bold text-gray-800 mb-2">🔵 Уровень 2 — подтверждено кодом (modelUri = yandexgpt-lite)</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600 font-mono">
              {['ai-assistant','child-assessment','event-ai-ideas','leisure-ai','life-road','trips-ai-recommend','generate-itinerary','finance-api','conflict-ai'].map(f => (
                <div key={f} className="py-0.5">✅ {f}</div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500">
              <div>⚡ blog-cover-generator → <strong>YandexART</strong> (image, не GPT)</div>
              <div className="mt-1">⚠️ health-ai OCR → <strong>Vision API</strong> ~1,50 ₽/стр. (отдельный биллинг)</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '✅', label: 'AI модели', value: '12 GPT → Lite, 1 image → Art (−83%)' },
            { icon: '✅', label: 'Лимит файла', value: '10 МБ, токен передаётся' },
            { icon: '🟡', label: 'Лимит S3', value: 'Частично — 3 слабых места' },
            { icon: '✅', label: 'leisure-ai + upload', value: 'Авторизация закрыта' },
            { icon: '🔴', label: 'PostgreSQL', value: 'Конфиг не подтверждён' },
            { icon: '🔴', label: 'Квоты AI', value: 'RPM/TPM не проверены' },
            { icon: '🟡', label: 'Удаление файлов', value: 'Нет декремента S3' },
            { icon: '🟡', label: 'Cloud Functions', value: '169/200 — нужна ревизия' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-xs text-gray-500 mb-0.5">{c.label}</div>
              <div className="text-xs font-semibold text-gray-800 leading-snug">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 1 — Структура затрат ═══ */}
      <section id="s1" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Структура затрат — три слоя</h2>
        <p className="text-sm text-gray-500 mb-4">
          Затраты разделены правильно. Fixed не зависит от активности. Variable растёт с использованием. Step-fixed — скачками при росте.
        </p>

        {/* Слой A — Fixed */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-blue-800 mb-3">Слой A — Fixed (почти не зависит от числа пользователей)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="text-left px-3 py-2">Статья</th>
                  <th className="text-right px-3 py-2">Сумма/мес</th>
                  <th className="text-left px-3 py-2">Источник</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {[
                  { item: 'Managed PostgreSQL (текущий конфиг)', val: '? ₽', src: '🔴 Нужен скрин из кабинета. Предположение: 5 000–12 000 ₽' },
                  { item: 'Домен + SSL (nasha-semiya.ru)', val: '~200 ₽', src: '✅ Годовая стоимость ÷ 12' },
                  { item: 'Базовое окружение / разворачивание', val: '~0 ₽', src: '✅ Входит в тарифы облака' },
                ].map(r => (
                  <tr key={r.item} className="even:bg-blue-50/50">
                    <td className="px-3 py-2 text-gray-700">{r.item}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">{r.val}</td>
                    <td className="px-3 py-2 text-gray-500">{r.src}</td>
                  </tr>
                ))}
                <tr className="bg-blue-200 font-bold">
                  <td className="px-3 py-2 text-blue-900">Итого Fixed</td>
                  <td className="px-3 py-2 text-right text-blue-900">~5 200–12 200 ₽</td>
                  <td className="px-3 py-2 text-blue-700">Диапазон из-за неизвестного PostgreSQL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Слой B — Variable */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-amber-800 mb-3">Слой B — Variable (растёт с каждой семьёй и каждым действием)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-amber-100 text-amber-800">
                  <th className="text-left px-3 py-2">Статья</th>
                  <th className="text-right px-3 py-2">На 1 семью/мес</th>
                  <th className="text-right px-3 py-2">При 5 000 семей</th>
                  <th className="text-left px-3 py-2">Тип</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {[
                  { item: 'Cloud Functions (вызовы + GB·s)', per: '~0,50–1,50 ₽', tot: '~2 500–7 500 ₽', type: 'per request ✅' },
                  { item: 'YandexGPT Lite (AI API) — GPT-часть', per: '~8–21 ₽', tot: '~40 000–106 500 ₽', type: 'per token ✅' },
                  { item: 'Object Storage S3', per: '~2,3 ₽', tot: '~11 288 ₽', type: 'per GB ✅' },
                  { item: 'CDN исходящий трафик', per: '~0,5 ₽', tot: '~2 500 ₽', type: 'per GB ✅' },
                  { item: 'Vision OCR (медицинские документы)', per: '~0,30 ₽', tot: '~1 500 ₽', type: 'per page ✅' },
                  { item: 'Yandex Maps API', per: '~0,40 ₽', tot: '~2 000 ₽', type: 'per request ✅' },
                  { item: 'SMS.ru (резервные уведомления)', per: '~0,26 ₽', tot: '~1 300 ₽', type: 'per SMS ✅' },
                  { item: 'ЮKassa комиссия 3,5%', per: '~0,50 ₽', tot: '~2 500 ₽', type: 'per payment ✅' },
                ].map(r => (
                  <tr key={r.item} className="even:bg-amber-50/50">
                    <td className="px-3 py-2 text-gray-700">{r.item}</td>
                    <td className="px-3 py-2 text-right text-indigo-700">{r.per}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">{r.tot}</td>
                    <td className="px-3 py-2 text-gray-400">{r.type}</td>
                  </tr>
                ))}
                <tr className="bg-amber-100 text-amber-900 text-xs">
                  <td className="px-3 py-1.5">Среднее Variable</td>
                  <td className="px-3 py-1.5 text-right font-semibold">~18,6 ₽</td>
                  <td className="px-3 py-1.5 text-right font-semibold">~93 000 ₽</td>
                  <td className="px-3 py-1.5 text-amber-600">средний AI-профиль</td>
                </tr>
                <tr className="bg-amber-200 font-bold">
                  <td className="px-3 py-2 text-amber-900">Worst-case Variable (Lite)</td>
                  <td className="px-3 py-2 text-right text-amber-900">~26,6 ₽</td>
                  <td className="px-3 py-2 text-right text-amber-900">~132 588 ₽</td>
                  <td className="px-3 py-2 text-amber-700">макс. AI на Lite</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Слой C — Step-fixed */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-green-800 mb-3">Слой C — Step-fixed (скачки при росте)</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="text-left px-3 py-2">Статья</th>
                <th className="text-right px-3 py-2">При 1 000 семей</th>
                <th className="text-right px-3 py-2">При 5 000 семей</th>
                <th className="text-right px-3 py-2">При 10 000 семей</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {[
                { item: 'Поддержка L1+L2+L3', t1: '~58 500 ₽', t5: '~136 500 ₽', t10: '~273 000 ₽' },
                { item: 'Апгрейд PostgreSQL (диск)', t1: '—', t5: '~+5 000 ₽', t10: '~+15 000 ₽' },
                { item: 'Запрос квот YandexGPT', t1: 'бесплатно', t5: 'бесплатно', t10: 'возможно платно' },
              ].map(r => (
                <tr key={r.item} className="even:bg-green-50/50">
                  <td className="px-3 py-2 text-gray-700">{r.item}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{r.t1}</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-900">{r.t5}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{r.t10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Сводка */}
        <div className="bg-slate-900 text-white rounded-xl p-5">
          <div className="font-bold text-indigo-300 mb-3">Итоговая себестоимость при 5 000 семей (банк 2 ГБ) — все AI на Lite</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Среднее', fix: '8 700 ₽', var_: '93 000 ₽', step: '136 500 ₽', tot: '238 200 ₽', per: '47,6 ₽', gm: '68,0%', mu: '213%' },
              { label: 'Worst-case AI (Lite)', fix: '8 700 ₽', var_: '132 588 ₽', step: '136 500 ₽', tot: '277 788 ₽', per: '55,6 ₽', gm: '62,7%', mu: '168%' },
              { label: 'Worst-case всё (Lite)', fix: '12 200 ₽', var_: '132 588 ₽', step: '141 500 ₽', tot: '286 288 ₽', per: '57,3 ₽', gm: '61,5%', mu: '160%' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <div className="font-bold text-indigo-200 mb-2">{s.label}</div>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div className="flex justify-between"><span>Fixed</span><span>{s.fix}</span></div>
                  <div className="flex justify-between"><span>Variable</span><span>{s.var_}</span></div>
                  <div className="flex justify-between"><span>Step-fixed (поддержка)</span><span>{s.step}</span></div>
                  <div className="flex justify-between font-bold text-white border-t border-white/20 pt-1 mt-1"><span>Итого/мес</span><span>{s.tot}</span></div>
                  <div className="flex justify-between font-bold text-amber-300"><span>На семью</span><span>{s.per}</span></div>
                  <div className="flex justify-between text-green-300"><span>Gross margin (149 ₽)</span><span>{s.gm}</span></div>
                  <div className="flex justify-between text-emerald-400"><span>Markup (149 ₽)</span><span>{s.mu}</span></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Gross margin = (149 − себестоимость) / 149 × 100%.  Markup = (149 − себестоимость) / себестоимость × 100%.
            Fixed PostgreSQL = 8 700 ₽ (середина диапазона 5 200–12 200 ₽).
          </p>
        </div>
      </section>

      {/* ═══ 2 — AI worst-case как задача оптимизации ═══ */}
      <section id="s2" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">2. AI worst-case — GPT-часть на Lite</h2>
        <p className="text-sm text-gray-500 mb-4">
          12 GPT-функций работают на YandexGPT Lite (0,20 ₽ / 1к токенов);
          blog-cover-generator использует YandexART, а OCR в health-ai тарифицируется отдельно через Vision API.
          Ниже — worst-case относится только к GPT-части.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Функция</th>
                <th className="text-right px-3 py-3">Модель</th>
                <th className="text-right px-3 py-3">Токенов/вызов</th>
                <th className="text-right px-3 py-3">Стоимость Lite</th>
                <th className="text-right px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { fn: 'ai-assistant',        model: 'Lite', tokens: '~2 000',  api: '~0,40 ₽',  note: '✅ подтв.' },
                { fn: 'child-assessment',    model: 'Lite', tokens: '~2 000',  api: '~0,40 ₽',  note: '✅' },
                { fn: 'event-ai-ideas',      model: 'Lite', tokens: '~1 600',  api: '~0,32 ₽',  note: '✅' },
                { fn: 'leisure-ai',          model: 'Lite', tokens: '~1 900',  api: '~0,38 ₽',  note: '✅' },
                { fn: 'life-road',           model: 'Lite', tokens: '~2 200',  api: '~0,44 ₽',  note: '✅' },
                { fn: 'trips / itinerary',   model: 'Lite', tokens: '~1 500',  api: '~0,30 ₽',  note: '✅' },
                { fn: 'finance-api',         model: 'Lite', tokens: '~2 500',  api: '~0,50 ₽',  note: '✅' },
                { fn: 'conflict-ai',         model: 'Lite', tokens: '~3 100',  api: '~0,62 ₽',  note: '✅' },
                { fn: 'analyze-development', model: 'Lite', tokens: '1 271',   api: '0,25 ₽',   note: '✅ лог' },
                { fn: 'health-ai GPT-часть', model: 'Lite', tokens: '933',     api: '0,19 ₽',   note: '✅ лог' },
                { fn: 'health-ai OCR/Vision', model: 'Vision API', tokens: '~1 стр.', api: '~1,50 ₽', note: '⚠️ отдельно' },
                { fn: 'diet-plan 7д',        model: 'Lite', tokens: '5 060',   api: '1,01 ₽',   note: '✅ лог' },
                { fn: 'diet-plan 14д',       model: 'Lite', tokens: '~10 000', api: '~2,00 ₽',  note: '✅' },
                { fn: 'diet-plan 30д',       model: 'Lite', tokens: '~20 000', api: '~4,00 ₽',  note: '✅' },
              ].map(r => (
                <tr key={r.fn} className="even:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-700">{r.fn}</td>
                  <td className="px-3 py-2 text-right text-green-700 font-semibold">{r.model}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{r.tokens}</td>
                  <td className="px-3 py-2 text-right font-semibold">{r.api}</td>
                  <td className="px-4 py-2 text-right text-green-600">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Три сценария дорогого микса */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            {
              title: 'Сценарий A: активный AI-ассистент',
              desc: '30 × ai-assistant + 10 × conflict-ai + 5 × health-ai',
              api: '30×0,40 + 10×0,62 + 5×0,19 = ~19,2 ₽',
              color: 'border-green-200 bg-green-50',
            },
            {
              title: 'Сценарий B: diet-plan 30д × 4 + health-ai',
              desc: '4 диетплана на 30 дней + 5 анализов здоровья',
              api: '4×4,00 + 5×0,19 = ~17,0 ₽',
              color: 'border-amber-200 bg-amber-50',
            },
            {
              title: 'Сценарий C: максимальный (все тяжёлые)',
              desc: '4 × diet30 + 15 × health-ai + 10 × analyze-dev',
              api: '4×4,00 + 15×0,19 + 10×0,25 = ~21,3 ₽',
              color: 'border-red-200 bg-red-50',
            },
          ].map(s => (
            <div key={s.title} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="font-bold text-sm text-gray-900 mb-1">{s.title}</div>
              <div className="text-xs text-gray-500 mb-2">{s.desc}</div>
              <div className="text-sm font-bold text-gray-900">{s.api}</div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-green-300 rounded-xl px-5 py-4">
          <div className="font-bold text-green-800 mb-1">Worst-case GPT-часть на Lite: ~21,3 ₽/семью/мес</div>
          <p className="text-xs text-green-700 mb-2">
            Сценарий C — максимально тяжёлый сценарий. На Pro было бы ~127,8 ₽. Экономия Pro→Lite: <strong>~83%</strong>.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Worst-case GPT-часть', val: '21,3 ₽', sub: 'сценарий C на Lite' },
              { label: 'Полный worst-case', val: '57,3 ₽', sub: 'по модели раздела 1/11' },
              { label: 'Gross margin (149 ₽)', val: '61,5%', sub: 'при worst-case всё' },
            ].map(c => (
              <div key={c.label} className="bg-white border border-green-200 rounded-lg p-2 text-center">
                <div className="text-[10px] text-gray-500 mb-0.5">{c.label}</div>
                <div className="font-bold text-green-800">{c.val}</div>
                <div className="text-[10px] text-gray-400">{c.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ OCR/Vision для health-ai тарифицируется отдельно (~1,50 ₽/стр.) и в GPT-часть не входит.
            Полный worst-case 57,3 ₽ взят из раздела 1 (включает fixed + variable + support).
          </p>
        </div>
      </section>

      {/* ═══ 3 — S3 ═══ */}
      <section id="s3" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">3. Хранилище S3 — два сценария</h2>

        {/* Честный статус лимита */}
        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl px-5 py-4 mb-5">
          <div className="font-bold text-orange-800 mb-2">Статус S3-лимита: частично работает</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              { num: '1', label: 'Fail-open при недоступности БД', desc: 'Если БД упала — лимит не проверяется, файл грузится. Сознательный выбор: не блокировать UX при сбое.' },
              { num: '2', label: 'Нет учёта удаления файлов', desc: 'file_storage_used_mb только растёт. При удалении записи из БД — счётчик не уменьшается. Требует реализации.' },
              { num: '3', label: 'Нет backfill старых файлов', desc: 'Файлы, загруженные до внедрения лимита, не учтены в счётчике. Нужна разовая миграция.' },
            ].map(c => (
              <div key={c.num} className="bg-white rounded-lg p-3 border border-orange-200">
                <div className="font-bold text-orange-700 mb-1">Слабое место {c.num}: {c.label}</div>
                <div className="text-gray-600">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {[
            {
              title: 'Смешанная база (70% Free 500МБ / 30% Банк 2ГБ)',
              note: 'Реалистичный сценарий: не все семьи активны и платят',
              color: 'border-indigo-200 bg-indigo-50', hdr: 'text-indigo-800',
              rows: [
                { s: '1 000 семей', gb: '~950 ГБ', store: '1 758 ₽', cdn: '500 ₽', tot: '2 258 ₽' },
                { s: '5 000 семей', gb: '~4 750 ГБ', store: '8 788 ₽', cdn: '2 500 ₽', tot: '11 288 ₽' },
                { s: '10 000 семей', gb: '~9 500 ГБ', store: '17 575 ₽', cdn: '4 500 ₽', tot: '22 075 ₽' },
              ],
            },
            {
              title: 'Worst-case банк (все 5 000 семей по 2 ГБ)',
              note: 'Если банк активирует все 5 000 семей и они заполняют лимит',
              color: 'border-red-200 bg-red-50', hdr: 'text-red-800',
              rows: [
                { s: '1 000 семей × 2 ГБ', gb: '2 000 ГБ', store: '3 700 ₽', cdn: '1 000 ₽', tot: '4 700 ₽' },
                { s: '5 000 семей × 2 ГБ', gb: '10 000 ГБ', store: '18 500 ₽', cdn: '5 000 ₽', tot: '23 500 ₽' },
                { s: '10 000 семей × 2 ГБ', gb: '20 000 ГБ', store: '37 000 ₽', cdn: '9 000 ₽', tot: '46 000 ₽' },
              ],
            },
          ].map(m => (
            <div key={m.title} className={`rounded-xl border p-4 ${m.color}`}>
              <div className={`font-bold text-sm mb-1 ${m.hdr}`}>{m.title}</div>
              <div className="text-xs text-gray-500 mb-3">{m.note}</div>
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
                  {m.rows.map(r => (
                    <tr key={r.s} className="border-t border-gray-200">
                      <td className="py-1.5 text-gray-800">{r.s}</td>
                      <td className="py-1.5 text-right text-gray-600">{r.gb}</td>
                      <td className="py-1.5 text-right">{r.store}</td>
                      <td className="py-1.5 text-right">{r.cdn}</td>
                      <td className="py-1.5 text-right font-bold">{r.tot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Разница между сценариями: ~11 288 ₽ (смешанная) vs ~23 500 ₽ (банк worst-case) при 5 000 семьях.
          В сводной таблице используется смешанный сценарий как более реалистичный.
        </p>
      </section>

      {/* ═══ 4 — БД ═══ */}
      <section id="s4" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">4. База данных</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3 text-sm">Прирост на 1 активную семью/год</div>
            <table className="w-full text-xs divide-y divide-gray-100">
              {[
                ['Профиль + члены', '~50–100 КБ'],
                ['События и задачи', '~1–2 МБ'],
                ['Здоровье — записи', '~2–4 МБ'],
                ['Финансы', '~1–2 МБ'],
                ['Питание и рецепты', '~1–3 МБ'],
                ['Чат и AI-история', '~2–4 МБ'],
                ['Уведомления, логи', '~1–2 МБ'],
              ].map(([item, size]) => (
                <tr key={item}>
                  <td className="py-1.5 text-gray-600">{item}</td>
                  <td className="py-1.5 text-right font-mono text-indigo-700">{size}</td>
                </tr>
              ))}
              <tr className="font-bold border-t border-gray-300">
                <td className="pt-2">Итого за год</td>
                <td className="pt-2 text-right">~8–17 МБ</td>
              </tr>
            </table>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3 text-sm">Прогноз роста БД</div>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500"><th className="text-left py-1">Масштаб</th><th className="text-right py-1">Год 1</th><th className="text-right py-1">Год 3</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {[['1 000 семей','10–17 ГБ','30–50 ГБ'],['5 000 семей','50–85 ГБ','150–250 ГБ'],['10 000 семей','100–170 ГБ','300–500 ГБ']].map(r => (
                  <tr key={r[0]}><td className="py-1.5 text-gray-800">{r[0]}</td><td className="py-1.5 text-right">{r[1]}</td><td className="py-1.5 text-right">{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-xs text-gray-500 border-t pt-2">
              Сейчас: 3,6 ГБ / 108 семей. Пользовательских данных ~1 ГБ (~9 МБ/семью).
            </div>
            <div className="mt-1 text-xs text-red-600 font-medium">
              🔴 При 5 000 семей через 3 года нужно ~250 ГБ → апгрейд PostgreSQL неизбежен.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5 — Сводная таблица масштабирования ═══ */}
      <section id="s5" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Сводная таблица масштабирования</h2>
        <p className="text-xs text-gray-400 mb-3">
          Средний AI. S3 — смешанный сценарий. Fixed PostgreSQL = 8 700 ₽. Все суммы в ₽/мес.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">Fixed</th>
                <th className="text-right px-3 py-3">Variable</th>
                <th className="text-right px-3 py-3">Step-fixed</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-right px-3 py-3">На семью</th>
                <th className="text-right px-4 py-3">Gross margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { sc: '500 семей (пилот)', fx: '8 700', var: '9 300', sf: '19 500', tot: '37 500', per: '75,0 ₽', gm: '49,7% 🟡' },
                { sc: '1 000 семей', fx: '8 700', var: '18 600', sf: '58 500', tot: '85 800', per: '85,8 ₽', gm: '42,4% 🟡' },
                { sc: '2 500 семей', fx: '8 700', var: '46 500', sf: '97 500', tot: '152 700', per: '61,1 ₽', gm: '59,0% ✅' },
                { sc: '5 000 семей ✦', fx: '8 700', var: '93 000', sf: '136 500', tot: '238 200', per: '47,6 ₽', gm: '68,0% ✅' },
                { sc: '10 000 семей', fx: '8 700', var: '186 000', sf: '288 000', tot: '482 700', per: '48,3 ₽', gm: '67,6% ✅' },
              ].map((r, i) => (
                <tr key={i} className={i === 3 ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.sc}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.fx}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.var}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.sf}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900">{r.tot}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{r.per}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{r.gm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <p className="text-xs text-green-700">
            <strong>Точка рентабельности (gross margin {'>'} 40%):</strong> около 800–1 000 семей (было 2 000–2 500 до перехода на Lite).
            Пилот уже рентабелен при 149 ₽. Variable рассчитан по среднему AI-профилю на Lite.
            Gross margin = (149 − себестоимость) / 149.
          </p>
        </div>
      </section>

      {/* ═══ 6 — Безопасность ═══ */}
      <section id="s6" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Безопасность</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'leisure-ai — авторизация', st: '✅ Закрыто', color: 'border-green-200 bg-green-50',
              items: ['Обязательный X-Auth-Token для всех POST','Без токена → 401','Кредиты и кошелёк только для авторизованных'] },
            { title: 'upload-file — семья из токена', st: '✅ Улучшено', color: 'border-green-200 bg-green-50',
              items: ['Токен теперь передаётся из useFileUpload (authToken)', 'Семья определяется автоматически если X-Family-Id не передан','Явный X-Family-Id валидируется через sessions+family_members → 403'] },
            { title: 'S3-лимит — три слабых места', st: '🟡 Частично', color: 'border-orange-200 bg-orange-50',
              items: ['Fail-open при недоступности БД (сознательный выбор)','Нет учёта удаления — счётчик только растёт','Нет backfill файлов до внедрения лимита'] },
            { title: 'Учёт удаления файлов', st: '🟡 Открытый пробел', color: 'border-orange-200 bg-orange-50',
              items: ['Функций удаления из S3 в проекте нет','file_storage_used_mb не уменьшается никогда','Нужно: функция удаления + декремент + backfill'] },
          ].map(c => (
            <div key={c.title} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-sm text-gray-900">{c.title}</div>
                <div className="text-xs font-bold shrink-0 ml-2">{c.st}</div>
              </div>
              <ul className="text-xs text-gray-700 space-y-0.5">{c.items.map(i => <li key={i}>• {i}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 7 — Тарифы / квоты ═══ */}
      <section id="s7" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">7. Тарифы и квоты аккаунта</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left px-4 py-3">Сервис</th>
                <th className="text-right px-3 py-3">Цена</th>
                <th className="text-left px-3 py-3">Единица</th>
                <th className="text-center px-3 py-3">Статус</th>
                <th className="text-left px-4 py-3">Квота / риск</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { svc: 'Cloud Functions', price: '13,20 ₽ + GB·s', unit: 'за 1 млн вызовов', st: '✅', quota: '169/200 функций (84%). Concurrency 10/функцию. Нужна ревизия 🟡' },
                { svc: 'Managed PostgreSQL', price: '? ₽/мес', unit: 'зависит от конфига', st: '🔴', quota: 'Конфиг неизвестен. Нужен скрин CPU/RAM/SSD из кабинета.' },
                { svc: 'Object Storage S3', price: '~1,85 ₽/ГБ', unit: 'хранение/мес', st: '✅', quota: 'Текущий объём неизвестен — нет мониторинга 🟡' },
                { svc: 'YandexGPT Lite', price: '0,20 ₽', unit: 'за 1 000 токенов (вх = вых)', st: '✅', quota: '12 GPT-функций на Lite (3 подтв. логами, 9 — кодом); 1 image → YandexART. RPM/TPM не проверены 🔴' },
                { svc: 'CDN', price: '~0,85–2 ₽/ГБ', unit: 'исходящий трафик', st: '✅', quota: '—' },
                { svc: 'Vision OCR', price: '~1,50 ₽', unit: 'за страницу', st: '✅', quota: 'RPS ~1–5 по умолчанию' },
                { svc: 'Yandex Maps API', price: '~0,48–4,80 ₽', unit: 'за 1 000 запросов', st: '✅', quota: '—' },
                { svc: 'ЮKassa', price: '3,5%', unit: 'от суммы платежа', st: '✅', quota: '—' },
              ].map(r => (
                <tr key={r.svc} className="even:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{r.svc}</td>
                  <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">{r.price}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.unit}</td>
                  <td className="px-3 py-2.5 text-center">{r.st}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ 8 — Поддержка ═══ */}
      <section id="s8" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">8. Поддержка (step-fixed)</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">L1 (оператор)</th>
                <th className="text-right px-3 py-3">L2 (продукт)</th>
                <th className="text-right px-3 py-3">L3 (разработчик)</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-right px-4 py-3">На семью</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { s: '100–499 (пилот)', l1: '0,25 FTE · 19 500 ₽', l2: 'собственник', l3: 'разработчик', tot: '19 500 ₽', per: '39–195 ₽' },
                { s: '1 000–4 999', l1: '0,5 FTE · 39 000 ₽', l2: '0,25 FTE · 19 500 ₽', l3: 'разработчик', tot: '58 500 ₽', per: '12–58 ₽' },
                { s: '5 000–9 999 ✦', l1: '1,0 FTE · 78 000 ₽', l2: '0,5 FTE · 39 000 ₽', l3: '0,25 FTE · 19 500 ₽', tot: '136 500 ₽', per: '27,3 ₽' },
                { s: '10 000+', l1: '2,0 FTE · 156 000 ₽', l2: '1,0 FTE · 78 000 ₽', l3: '0,5 FTE · 39 000 ₽', tot: '273 000 ₽', per: '27,3 ₽' },
              ].map((r, i) => (
                <tr key={i} className={i === 2 ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.s}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l1}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l2}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.l3}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{r.tot}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{r.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ BANK — Коммерческая модель для банка ═══ */}
      <section id="sbank" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">10. Коммерческая модель для банка</h2>
        <p className="text-sm text-gray-500 mb-5">
          Не разовая оплата «за подключение навсегда», а оплата за <strong>активированное подключение в расчёте на месяц</strong>.
          Банк платит только за реально работающие аккаунты.
        </p>

        {/* Две модели */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* Модель A — гибридная */}
          <div className="bg-indigo-50 border-2 border-indigo-400 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Рекомендуется</span>
              <span className="font-bold text-indigo-900">Модель A — гибридная</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-indigo-200">
                <div className="text-xs text-indigo-500 mb-1">Пилот (до 500)</div>
                <div className="text-2xl font-bold text-indigo-800">350 ₽</div>
                <div className="text-xs text-gray-500">/ подключение / мес</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-indigo-200">
                <div className="text-xs text-indigo-500 mb-1">Масштаб (1 000+)</div>
                <div className="text-2xl font-bold text-indigo-800">149 ₽</div>
                <div className="text-xs text-gray-500">/ подключение / мес</div>
              </div>
            </div>

            <div className="text-xs text-gray-700 space-y-1.5 mb-4">
              <div className="font-semibold text-gray-800 mb-1">Что входит в базовую стоимость:</div>
              {[
                'Доступ к основному функционалу сервиса',
                'Стандартные AI-сценарии',
                'Хранение данных в рамках тарифа',
                'Базовая поддержка',
              ].map(i => <div key={i} className="flex gap-2"><span className="text-green-500">✓</span>{i}</div>)}
            </div>

            <div className="bg-indigo-100 rounded-xl p-3 text-xs">
              <div className="font-semibold text-indigo-800 mb-1.5">Партнёрский баланс (опционально)</div>
              <p className="text-indigo-700 mb-2">
                Банк задаёт ежемесячный баланс на пользователя — например, 50 / 100 / 150 ₽.
                После исчерпания пользователь продолжает пользоваться базовыми функциями
                или <strong>сам пополняет кошелёк</strong>.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[['50 ₽', 'минимальный'], ['100 ₽', 'стандартный'], ['150 ₽', 'расширенный']].map(([val, lbl]) => (
                  <div key={val} className="bg-white rounded-lg p-2 text-center border border-indigo-200">
                    <div className="font-bold text-indigo-800">{val}</div>
                    <div className="text-gray-400 text-[10px]">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
              <strong>Плюс модели:</strong> у банка фиксируемый бюджет, у пользователя нет жёсткой блокировки,
              дополнительное потребление банк не оплачивает автоматически.
            </div>
          </div>

          {/* Модель B — фиксированная */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Альтернатива</span>
              <span className="font-bold text-gray-900">Модель B — фиксированная</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Пилот (до 500)</div>
                <div className="text-2xl font-bold text-gray-700">490 ₽</div>
                <div className="text-xs text-gray-400">/ подключение / мес</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Масштаб (1 000+)</div>
                <div className="text-2xl font-bold text-gray-700">199 ₽</div>
                <div className="text-xs text-gray-400">/ подключение / мес</div>
              </div>
            </div>

            <div className="text-xs text-gray-700 space-y-1.5 mb-4">
              <div className="font-semibold text-gray-800 mb-1">Всё включено в рамках fair use:</div>
              {[
                'Все AI-сценарии без дополнительной оплаты',
                'Расширенный лимит хранения',
                'Приоритетная поддержка',
                'При превышении — отдельное согласование',
              ].map(i => <div key={i} className="flex gap-2"><span className="text-gray-400">✓</span>{i}</div>)}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>Важно:</strong> «безлимитный AI» не обещать. Фиксированная модель работает только
              при fair use policy — тяжёлые сценарии (diet-plan 30д ежедневно) требуют отдельного согласования.
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Цена выше из-за страхования риска пикового потребления.
              При крупных объёмах 5 000+ — индивидуальные условия.
            </div>
          </div>
        </div>

        {/* Экономика по моделям при 5 000 семей */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Сценарий</th>
                <th className="text-right px-3 py-3">Цена/мес</th>
                <th className="text-right px-3 py-3">Выручка</th>
                <th className="text-right px-3 py-3">Себестоимость</th>
                <th className="text-right px-3 py-3">Прибыль</th>
                <th className="text-right px-4 py-3">Gross margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { sc: 'Модель A, пилот 500 × 350 ₽', price: '350 ₽', rev: '175 000 ₽', cost: '37 500 ₽', profit: '137 500 ₽', gm: '78,6% ✅', hl: false },
                { sc: 'Модель A, масштаб 1 000 × 149 ₽', price: '149 ₽', rev: '149 000 ₽', cost: '85 800 ₽', profit: '63 200 ₽', gm: '42,4% 🟡', hl: false },
                { sc: 'Модель A, масштаб 5 000 × 149 ₽ ✦', price: '149 ₽', rev: '745 000 ₽', cost: '238 200 ₽', profit: '506 800 ₽', gm: '68,0% ✅', hl: true },
                { sc: 'Модель B, масштаб 5 000 × 199 ₽', price: '199 ₽', rev: '995 000 ₽', cost: '277 788 ₽', profit: '717 212 ₽', gm: '72,1% ✅', hl: false },
              ].map((r, i) => (
                <tr key={i} className={r.hl ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.sc}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{r.price}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{r.rev}</td>
                  <td className="px-3 py-2.5 text-right text-gray-500">{r.cost}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-green-700">{r.profit}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{r.gm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Что НЕ обещать */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-indigo-800 text-sm">Готовый шаблон письма банку</div>
              <div className="text-xs text-indigo-600 mt-0.5">3 варианта: рекомендованное · короткое · два варианта на выбор</div>
            </div>
            <a href="/bank-letter" className="shrink-0 ml-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Открыть →
            </a>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <div className="font-bold text-red-800 mb-2">🚫 Не обещать первым</div>
            <div className="text-xs text-red-700 space-y-1">
              {[
                'Безлимитный AI за фиксированную цену',
                'Цену 99 ₽ — не доказана экономически',
                '«Подключение навсегда» — только помесячно',
                'SLA 99,9% — нет мониторинга',
                'Безопасность мед. данных — нет юр. аудита',
              ].map(i => <div key={i}>— {i}</div>)}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <div className="font-bold text-green-800 mb-2">✅ Сильные аргументы для банка</div>
            <div className="text-xs text-green-800 space-y-1">
              {[
                'Предсказуемый бюджет: фикс на подключение',
                'Дополнительное потребление — за счёт пользователя',
                'Пользователь не блокируется, лояльность выше',
                'Масштабная скидка от 1 000 подключений',
                'При 5 000 семей gross margin 68% — устойчивая модель',
              ].map(i => <div key={i}>— {i}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9 — Вывод ═══ */}
      <section id="s9" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">11. Управленческий вывод v1.5</h2>

        {/* Точки */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-5">
          <div className="font-bold text-indigo-300 mb-4">Ключевые числа (средний AI, 5 000 семей)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            {[
              { label: 'Себестоимость (среднее)', val: '47,6 ₽', sub: 'на семью/мес, 5 000 семей' },
              { label: 'Цена банку', val: '149 ₽', sub: 'предложение' },
              { label: 'Gross margin', val: '68,0%', sub: '(выручка − себест.) / выручку' },
              { label: 'Markup', val: '213%', sub: '(выручка − себест.) / себест.' },
            ].map(c => (
              <div key={c.label} className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">{c.label}</div>
                <div className="text-2xl font-bold text-white">{c.val}</div>
                <div className="text-xs text-slate-400 mt-1">{c.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-center text-sm">
            {[
              { label: 'Worst-case себестоимость', val: '57,3 ₽', sub: 'максимальный AI на Lite + всё прочее' },
              { label: 'Worst-case gross margin', val: '61,5%', sub: 'при 149 ₽ — уверенно прибыльно' },
              { label: 'Точка рентабельности', val: '~1 000 семей', sub: 'было 2 500 до перехода на Lite' },
            ].map(c => (
              <div key={c.label} className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">{c.label}</div>
                <div className="text-xl font-bold text-amber-300">{c.val}</div>
                <div className="text-xs text-slate-400 mt-1">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Условия */}
        <div className="bg-gray-900 text-white rounded-xl px-6 py-5 mb-5">
          <div className="font-bold text-white mb-4">Условия безопасного запуска</div>
          <div className="space-y-3">
            {[
              { p: '✅', t: '12 GPT → Lite, 1 image → Art (−83%)', d: '3 GPT-функции подтверждены живыми логами, 9 — проверкой кода. blog-cover-generator → YandexART.' },
              { p: '🟢', t: 'Лимит файла 10 МБ', d: 'Три upload-функции. Токен передаётся, семья определяется автоматически.' },
              { p: '🟡', t: 'Лимит S3 — частично', d: 'Работает в штатном режиме. Три слабых места: fail-open, нет декремента, нет backfill.' },
              { p: '🔴', t: 'Подтвердить PostgreSQL конфиг', d: 'Кабинет → PostgreSQL → CPU/RAM/SSD. Без этого fixed ±40% неизвестен.' },
              { p: '🔴', t: 'Проверить квоты YandexGPT', d: 'AI Studio → Квоты → RPM. При 5 000 семей пиковый RPM может превысить дефолт.' },
              { p: '🟡', t: 'Ревизия Cloud Functions (169/200)', d: 'Удалить устаревшие/тестовые. Остаток всего 31 функция.' },
              { p: '🟢', t: 'L1-поддержка до 5 000 семей', d: '0,5–1,0 FTE аутсорс ~39–78 000 ₽/мес. Без этого собственник тонет в обращениях.' },
            ].map((c, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 text-sm">{c.p}</span>
                <div>
                  <div className="font-semibold text-sm text-white">{c.t}</div>
                  <div className="text-xs text-slate-400">{c.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Тарифы */}
        <div className="bg-indigo-900 text-white rounded-xl px-6 py-5 mb-4">
          <div className="font-bold text-indigo-200 mb-4">Безопасные тарифы при выполнении условий</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tier: 'Пилот (до 500)', price: '350 ₽/мес', ai: 'партнёрский баланс опционально', s3: '500 МБ', note: 'Модель A. GM 78,6% на 500 подкл.', ok: true },
              { tier: 'Масштаб (1 000+)', price: '149 ₽/мес', ai: 'партнёрский баланс опционально', s3: '2 ГБ', note: 'Модель A. GM 68,0% при 5 000 подкл.', ok: true },
              { tier: 'Масштаб 5 000+', price: 'инд. условия', ai: 'после аудита квот RPM', s3: 'после аудита', note: '99 ₽ — не объявлять', ok: false },
            ].map(t => (
              <div key={t.tier} className={`rounded-xl p-4 ${t.ok ? 'bg-white/10' : 'bg-red-900/30 border border-red-700/40'}`}>
                <div className="text-xs font-bold text-indigo-300 mb-1">{t.tier}</div>
                <div className={`text-2xl font-bold mb-2 ${t.ok ? 'text-white' : 'text-red-400'}`}>{t.price}</div>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div>AI: <strong className="text-white">{t.ai}</strong></div>
                  <div>S3: <strong className="text-white">{t.s3}</strong></div>
                  <div className="text-slate-400 mt-1">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="font-bold text-amber-800 mb-2">Что нельзя обещать банку до финального аудита</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-amber-700">
            {['Цену 99 ₽ — не доказана','SLA 99,9% — нет мониторинга','Безлимитный AI за фиксированную цену','24/7 поддержку — нет L1','Безопасность мед. данных — нет юр. аудита','«Точно потянем 5 000» — нет нагрузочных тестов'].map(i => (
              <div key={i}>🚫 {i}</div>
            ))}
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-4">
        v1.5 · Июнь 2026 · Конфиденциально<br />
        Gross margin = (выручка − себест.) / выручку · Markup = (выручка − себест.) / себест.
      </p>
    </SectionPageFrame>
  );
}