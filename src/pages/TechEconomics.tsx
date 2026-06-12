import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// ─── v1.4 ────────────────────────────────────────────────────────────────────
// Изменения vs v1.3.1:
// 1. Все AI-функции переведены с Pro → Lite (подтверждено живыми логами 12.06.2026)
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
      title="Техническо-экономический разбор v1.4"
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
          <div className="font-bold text-green-900 mb-1">v1.4 — миграция AI на Lite подтверждена живыми вызовами</div>
          <p className="text-sm text-green-800">
            Все 13 AI-функций переведены на YandexGPT Lite (12.06.2026). Логи подтверждают модель и токены.
            Кредитный блок убран — контроль только через кошелёк в рублях.
            Экономия на токенах <strong>~83%</strong> относительно Pro.
            <strong> Для финальной версии ещё нужно:</strong> скриншот PostgreSQL + billing из кабинета Яндекс.Облака,
            квоты YandexGPT из AI Studio, фактический объём S3.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-5 text-xs text-blue-800">
          <div className="font-bold text-blue-900 mb-2">Подтверждено живыми вызовами 12.06.2026</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-blue-700 border-b border-blue-200">
                <th className="pb-1 pr-4">Функция</th><th className="pb-1 pr-4">Модель</th>
                <th className="pb-1 pr-4 text-right">Вход (токенов)</th>
                <th className="pb-1 pr-4 text-right">Выход (токенов)</th>
                <th className="pb-1 text-right">Стоимость Lite</th>
              </tr></thead>
              <tbody className="divide-y divide-blue-100">
                {[
                  { fn: 'health-ai-analysis', m: 'yandexgpt-lite', i: 656, o: 277, t: 933 },
                  { fn: 'generate-diet-plan', m: 'yandexgpt-lite', i: 612, o: 4448, t: 5060 },
                  { fn: 'analyze-development', m: 'yandexgpt-lite', i: 652, o: 619, t: 1271 },
                ].map(r => (
                  <tr key={r.fn}>
                    <td className="py-1 pr-4 font-mono">{r.fn}</td>
                    <td className="py-1 pr-4 text-green-700 font-semibold">{r.m}</td>
                    <td className="py-1 pr-4 text-right">{r.i.toLocaleString()}</td>
                    <td className="py-1 pr-4 text-right">{r.o.toLocaleString()}</td>
                    <td className="py-1 text-right font-semibold">{(r.t * 0.0002).toFixed(2)} ₽</td>
                  </tr>
                ))}
                <tr className="font-bold text-blue-900 border-t border-blue-300">
                  <td className="pt-1 pr-4" colSpan={2}>Итого (было бы на Pro)</td>
                  <td className="pt-1 pr-4 text-right">—</td>
                  <td className="pt-1 pr-4 text-right">—</td>
                  <td className="pt-1 text-right text-red-600 line-through">8,72 ₽</td>
                </tr>
                <tr className="font-bold text-green-800">
                  <td className="pr-4" colSpan={2}>Итого на Lite (−83%)</td>
                  <td className="pr-4 text-right">—</td>
                  <td className="pr-4 text-right">—</td>
                  <td className="text-right">1,45 ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '✅', label: 'AI модели', value: 'Все 13 функций → Lite (−83% токенов)' },
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
                  { item: 'YandexGPT Lite (AI API)', per: '~13,5–30 ₽', tot: '~67 500–150 000 ₽', type: 'per token ✅' },
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
                <tr className="bg-amber-200 font-bold">
                  <td className="px-3 py-2 text-amber-900">Итого Variable (worst-case)</td>
                  <td className="px-3 py-2 text-right text-amber-900">~35,7–33,5 ₽</td>
                  <td className="px-3 py-2 text-right text-amber-900">~240 588 ₽</td>
                  <td className="px-3 py-2 text-amber-700">при AI worst-case</td>
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
          <div className="font-bold text-indigo-300 mb-3">Итоговая себестоимость при 5 000 семей (банк 2 ГБ, 30 кредитов)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Среднее', fix: '8 700 ₽', var_: '142 088 ₽', step: '136 500 ₽', tot: '287 288 ₽', per: '57,5 ₽', gm: '61,4%', mu: '159%' },
              { label: 'Worst-case AI', fix: '8 700 ₽', var_: '240 588 ₽', step: '136 500 ₽', tot: '385 788 ₽', per: '77,2 ₽', gm: '48,2%', mu: '93%' },
              { label: 'Worst-case всё', fix: '12 200 ₽', var_: '240 588 ₽', step: '141 500 ₽', tot: '394 288 ₽', per: '78,9 ₽', gm: '47,1%', mu: '88.7%' },
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">2. AI worst-case — все функции на Lite</h2>
        <p className="text-sm text-gray-500 mb-4">
          Все 13 функций работают на YandexGPT Lite (0,20 ₽/1к токенов). Кредитный блок убран —
          контроль только через баланс кошелька. Worst-case = максимальный реальный токенаж за месяц.
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
                { fn: 'health-ai (OCR+GPT)', model: 'Lite', tokens: '933',     api: '0,19 ₽',   note: '✅ лог' },
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
          <div className="font-bold text-green-800 mb-1">Worst-case на Lite: ~21,3 ₽ API на семью/мес</div>
          <p className="text-xs text-green-700">
            Сценарий C (4 × diet30 + 15 × health-ai + 10 × analyze-dev) — максимально тяжёлый сценарий на Lite.
            Было бы на Pro: ~127,8 ₽. Экономия Pro→Lite: <strong>~83%</strong>.
            Итоговая себестоимость при worst-case Lite: 21,3 + 5,2 (fixed per-family) + 27,3 (support) + 2,8 (S3+other) = <strong>~56,6 ₽/семью</strong> без поддержки,
            <strong> ~83,9 ₽/семью</strong> с полной поддержкой 1 FTE при 5 000 семьях.
            149 ₽ — прибыльно: gross margin 43,7%, markup 77,6%.
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
                { sc: '500 семей (пилот)', fx: '8 700', var: '17 850', sf: '19 500', tot: '46 050', per: '92,1 ₽', gm: '38,2% 🔴' },
                { sc: '1 000 семей', fx: '8 700', var: '35 700', sf: '58 500', tot: '102 900', per: '102,9 ₽', gm: '31,0% 🔴' },
                { sc: '2 500 семей', fx: '8 700', var: '89 250', sf: '97 500', tot: '195 450', per: '78,2 ₽', gm: '47,5% 🟡' },
                { sc: '5 000 семей ✦', fx: '8 700', var: '178 500', sf: '136 500', tot: '323 700', per: '64,7 ₽', gm: '56,6% ✅' },
                { sc: '10 000 семей', fx: '8 700', var: '357 000', sf: '288 000', tot: '653 700', per: '65,4 ₽', gm: '56,1% ✅' },
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <p className="text-xs text-amber-700">
            <strong>Точка рентабельности (gross margin {'>'} 40%):</strong> около 2 000–2 500 семей.
            Пилот убыточен при 149 ₽ без setup fee. Gross margin = (149 − себестоимость) / 149.
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
                { svc: 'YandexGPT Lite', price: '0,20 ₽', unit: 'за 1 000 токенов (вх = вых)', st: '✅', quota: 'Все 13 функций на Lite — подтверждено логами. RPM/TPM не проверены 🔴' },
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

      {/* ═══ 9 — Вывод ═══ */}
      <section id="s9" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Управленческий вывод v1.3.1</h2>

        {/* Точки */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-5">
          <div className="font-bold text-indigo-300 mb-4">Ключевые числа (средний AI, 5 000 семей)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            {[
              { label: 'Себестоимость', val: '64,7 ₽', sub: 'на семью/мес' },
              { label: 'Цена банку', val: '149 ₽', sub: 'предложение' },
              { label: 'Gross margin', val: '56,6%', sub: '(выручка − себест.) / выручку' },
              { label: 'Markup', val: '130,3%', sub: '(выручка − себест.) / себест.' },
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
              { label: 'Worst-case себестоимость', val: '96,5 ₽', sub: 'все кредиты на дорогие AI' },
              { label: 'Worst-case gross margin', val: '35,2%', sub: 'при 149 ₽ всё ещё прибыльно' },
              { label: 'Точка безубыточности', val: '~2 500 семей', sub: 'при 149 ₽ и среднем AI' },
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
              { p: '✅', t: 'Все AI-функции → Lite (−83%)', d: 'Подтверждено логами 12.06.2026. Кредитный блок убран, контроль только через кошелёк.' },
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
              { tier: 'Пилот', price: '350 ₽/мес', ai: '20 кредитов', s3: '500 МБ', note: 'Или setup fee 150 000 ₽ + 149 ₽', ok: true },
              { tier: 'Базовый 1 000+', price: '149 ₽/мес', ai: '≤ 30 кредитов', s3: '2 ГБ', note: 'Gross margin 56,6% при 5 000 семей', ok: true },
              { tier: 'Масштаб 5 000+', price: 'не раньше v1.4', ai: 'после аудита конфига', s3: 'после аудита', note: '99 ₽ — не объявлять', ok: false },
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
        v1.4 · Июнь 2026 · Конфиденциально<br />
        Gross margin = (выручка − себест.) / выручку · Markup = (выручка − себест.) / себест.
      </p>
    </SectionPageFrame>
  );
}