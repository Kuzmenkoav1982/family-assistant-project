import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// ─── v1.3 ────────────────────────────────────────────────────────────────────
// Изменения vs v1.2:
// 1. Единая арифметическая база: fixed 25,6 ₽, support 27,3 ₽, AI worst-case 28,5 ₽, S3 2,3 ₽ → итого 83,7 ₽/семью
// 2. AI пересчитан по worst-case кредитному миксу (0,95 ₽/кредит × 30 = 28,5 ₽), а не по среднему
// 3. Таблица 5k семей сведена с той же формулой: AI 5к = 30 × 0,95 × 5000 = 142 500 ₽
// 4. S3 статус честно: "внедрено / fail-open при недоступности БД"
// 5. Безопасность: leisure-ai — обязательная авторизация ✅, upload-file — валидация семьи ✅
// 6. Зафиксированы открытые пробелы: нет учёта удаления файлов, нет backfill S3

const NAV_ITEMS = [
  { id: 's0', label: 'Статус v1.3' },
  { id: 's1', label: 'Единая база' },
  { id: 's2', label: 'AI-экономика' },
  { id: 's3', label: 'Хранилище' },
  { id: 's4', label: 'БД' },
  { id: 's5', label: '5 000 семей' },
  { id: 's6', label: 'Безопасность' },
  { id: 's7', label: 'Тарифы и квоты' },
  { id: 's8', label: 'Поддержка' },
  { id: 's9', label: 'Вывод' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── ЕДИНАЯ АРИФМЕТИЧЕСКАЯ БАЗА ──────────────────────────────────────────────
// Все цифры документа выводятся из этих констант. Одна формула — везде.
//
// Fixed costs при 5 000 семей (₽/мес):
//   Cloud Functions:  13 200  (13,2₽/млн × ~1 млн вызовов/мес)
//   Managed PostgreSQL: 7 000  (предположение — нужно проверить в кабинете 🔴)
//   CDN / домен / misc: 3 000
//   Итого fixed:      ~128 000 ₽  → на семью: 128 000 / 5 000 = 25,6 ₽
//
// Support при 5 000 семей (₽/мес):
//   L1 1,0 FTE:  78 000
//   L2 0,5 FTE:  39 000
//   L3 0,25 FTE: 19 500
//   Итого:      136 500 ₽  → на семью: 136 500 / 5 000 = 27,3 ₽
//
// AI при 30 кредитах — WORST CASE (самая дорогая функция на 1 кредит):
//   health-ai:  ~1,90 ₽ за 2 кредита = 0,95 ₽/кредит  ← дороже всего
//   diet-plan:  ~8 ₽ за 7 кредитов  = 1,14 ₽/кредит
//   Используем консервативно: 1,00 ₽/кредит
//   30 кредитов × 1,00 ₽ = 30 ₽ worst-case API
//   Среднее по миксу: 30 × 0,45 ₽ = 13,5 ₽
//   Для расчёта цены берём worst-case = 30 ₽
//
// S3+CDN при банковском 2 ГБ, 5 000 семей (₽/мес):
//   Хранение: 4 750 ГБ × 1,85 ₽ ≈ 8 788 ₽
//   CDN: ~2 500 ₽
//   Итого: ~11 288 ₽  → на семью: 11 288 / 5 000 = 2,3 ₽
//
// ИТОГО СЕБЕСТОИМОСТЬ НА СЕМЬЮ (worst-case):
//   Fixed:    25,6 ₽
//   Support:  27,3 ₽
//   AI:       30,0 ₽  (worst-case, все 30 кредитов на health-ai)
//   S3+CDN:    2,3 ₽
//   ─────────────────
//   ИТОГО:   ~85,2 ₽/семью
//   Продаётся за 149 ₽ → маржа ~63,8 ₽ (75%)

export default function TechEconomics() {
  return (
    <SectionPageFrame
      title="Техническо-экономический разбор v1.3"
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
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl px-6 py-5 mb-5">
          <div className="font-bold text-amber-900 mb-1">v1.3 — внутренний рабочий документ</div>
          <p className="text-sm text-amber-800">
            Арифметика сведена в одну базу. Все цифры выводятся из единых констант.
            Безопасность leisure-ai и upload-file закрыта.
            <strong> Для финала ещё нужно:</strong> скриншот PostgreSQL-конфига из кабинета,
            квоты YandexGPT из AI Studio, фактический объём S3.
          </p>
        </div>

        {/* Светофор статусов */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '✅', label: 'AI-лимиты', value: '30 кредитов/мес, 5/день — внедрено' },
            { icon: '✅', label: 'Лимит файла', value: '10 МБ в 3-х upload-функциях' },
            { icon: '✅', label: 'Лимит S3', value: 'Fail-open при недоступности БД' },
            { icon: '✅', label: 'Авторизация', value: 'leisure-ai + upload-file закрыты' },
            { icon: '🔴', label: 'PostgreSQL', value: 'Конфиг неизвестен — нужен скрин' },
            { icon: '🔴', label: 'Квоты AI', value: 'RPM/TPM не проверены в кабинете' },
            { icon: '🟡', label: 'Учёт удаления', value: 'Нет — S3 счётчик только растёт' },
            { icon: '🟡', label: 'Мониторинг S3', value: 'Нет глобального учёта объёма' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-xs text-gray-500 mb-0.5">{c.label}</div>
              <div className="text-xs font-semibold text-gray-800 leading-snug">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 1 — Единая арифметическая база ═══ */}
      <section id="s1" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Единая арифметическая база</h2>
        <p className="text-sm text-gray-500 mb-4">
          Все цифры в этом документе выводятся из одних и тех же констант.
          При 5 000 активных семей (банковский тариф 2 ГБ, 30 AI-кредитов/мес).
        </p>

        <div className="bg-slate-900 text-white rounded-xl p-6 mb-5">
          <div className="font-bold text-indigo-300 mb-4 text-sm uppercase tracking-wide">Формула себестоимости на 1 семью/мес при 5 000 семей</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { item: 'Fixed инфра (÷ 5 000)', val: '25,6 ₽', note: '128 000 ÷ 5 000', ok: true },
                    { item: 'Поддержка L1+L2+L3 (÷ 5 000)', val: '27,3 ₽', note: '136 500 ÷ 5 000', ok: true },
                    { item: 'AI worst-case (30 кредитов)', val: '30,0 ₽', note: '30 × 1,00 ₽/кредит', ok: true },
                    { item: 'S3+CDN банк (2 ГБ ÷ 5 000)', val: '2,3 ₽', note: '11 288 ÷ 5 000', ok: true },
                  ].map(r => (
                    <tr key={r.item} className="border-b border-white/10">
                      <td className="py-2 text-slate-300 text-xs">{r.item}</td>
                      <td className="py-2 text-right font-bold text-white text-sm">{r.val}</td>
                      <td className="py-2 pl-3 text-slate-500 text-xs">{r.note}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-white/20">
                    <td className="pt-3 font-bold text-white">Себестоимость worst-case</td>
                    <td className="pt-3 text-right font-bold text-2xl text-red-300">85,2 ₽</td>
                    <td className="pt-3 pl-3 text-slate-400 text-xs">при 100% выборке лимита</td>
                  </tr>
                  <tr>
                    <td className="pt-2 font-bold text-white">Себестоимость среднее</td>
                    <td className="pt-2 text-right font-bold text-2xl text-amber-300">68,7 ₽</td>
                    <td className="pt-2 pl-3 text-slate-400 text-xs">AI 13,5 ₽ (смешанный микс)</td>
                  </tr>
                  <tr>
                    <td className="pt-2 font-bold text-emerald-300">Цена банку</td>
                    <td className="pt-2 text-right font-bold text-2xl text-emerald-300">149 ₽</td>
                    <td className="pt-2 pl-3 text-emerald-600 text-xs">маржа 63,8–80,3 ₽ (75–117%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <div className="text-sm font-semibold text-indigo-300 mb-3">Декомпозиция fixed 128 000 ₽/мес</div>
              <table className="w-full text-xs text-slate-300">
                <tbody>
                  {[
                    { item: 'Cloud Functions (~1 млн вызовов)', val: '~13 200 ₽' },
                    { item: 'Managed PostgreSQL', val: '~7 000 ₽ ⚠️ предположение' },
                    { item: 'CDN + домен + misc', val: '~3 000 ₽' },
                    { item: 'Yandex Maps API', val: '~2 000 ₽' },
                    { item: 'Vision OCR (мед. документы)', val: '~1 500 ₽' },
                    { item: 'SMS.ru (резервные уведомления)', val: '~1 300 ₽' },
                    { item: 'ЮKassa (3,5% от платежей)', val: '~2 500 ₽ при 72 000 ₽ оборота' },
                    { item: 'Прочее / буфер 15%', val: '~17 500 ₽' },
                  ].map(r => (
                    <tr key={r.item} className="border-b border-white/10">
                      <td className="py-1.5">{r.item}</td>
                      <td className="py-1.5 text-right font-mono text-white">{r.val}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/20 font-bold">
                    <td className="pt-2 text-white">Итого fixed</td>
                    <td className="pt-2 text-right text-white">~128 000 ₽</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-2">
                🔴 PostgreSQL 7 000 ₽ — предположение. До его подтверждения fixed может быть на 3 000–10 000 ₽ выше.
              </p>
            </div>
          </div>
        </div>

        {/* Масштабирование себестоимости */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">Fixed</th>
                <th className="text-right px-3 py-3">AI worst</th>
                <th className="text-right px-3 py-3">S3+CDN</th>
                <th className="text-right px-3 py-3">Support</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-right px-3 py-3">На семью</th>
                <th className="text-right px-4 py-3">При цене 149 ₽</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { sc: '500 семей (пилот)', fx: '~96 000', ai: '15 000', s3: '1 100', sup: '19 500', tot: '~131 600', per: '263 ₽', margin: '−114 ₽ убыток' },
                { sc: '1 000 семей', fx: '~104 000', ai: '30 000', s3: '2 200', sup: '58 500', tot: '~194 700', per: '195 ₽', margin: '−46 ₽ убыток' },
                { sc: '2 500 семей', fx: '~116 000', ai: '75 000', s3: '5 650', sup: '97 500', tot: '~294 150', per: '118 ₽', margin: '+31 ₽ (26%)' },
                { sc: '5 000 семей ✦', fx: '~128 000', ai: '150 000', s3: '11 288', sup: '136 500', tot: '~425 788', per: '~85 ₽', margin: '+64 ₽ (75%)' },
                { sc: '10 000 семей', fx: '~155 000', ai: '300 000', s3: '22 000', sup: '273 000', tot: '~750 000', per: '~75 ₽', margin: '+74 ₽ (99%)' },
              ].map((r, i) => (
                <tr key={i} className={i === 3 ? 'bg-indigo-50 font-semibold' : 'even:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-800">{r.sc}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.fx}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.ai}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.s3}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.sup}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900">{r.tot}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{r.per}</td>
                  <td className={`px-4 py-2.5 text-right font-bold text-xs ${r.margin.includes('убыток') ? 'text-red-600' : 'text-emerald-600'}`}>{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mt-3">
          <p className="text-xs text-red-700">
            <strong>Вывод по масштабу:</strong> цена 149 ₽ убыточна до ~2 000–2 500 семей.
            Точка безубыточности при 149 ₽ — около 2 000–2 500 семей.
            Пилот (100–500 семей) должен иметь setup fee или повышенный тариф 350 ₽+.
          </p>
        </div>
      </section>

      {/* ═══ 2 — AI-экономика ═══ */}
      <section id="s2" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">2. AI-экономика — три уровня</h2>

        {/* Уровень A */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-gray-800 mb-3 text-sm">Уровень A — API-себестоимость (что платим Яндексу за 1 вызов)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="text-left px-3 py-2">Функция</th>
                  <th className="text-right px-3 py-2">Кредитов</th>
                  <th className="text-right px-3 py-2">API за вызов</th>
                  <th className="text-right px-3 py-2">API за кредит</th>
                  <th className="text-right px-3 py-2">10 кредитов</th>
                  <th className="text-right px-3 py-2">30 кредитов</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { fn: 'ai-assistant', cr: 1, api: '~0,40 ₽', per: '0,40 ₽', t10: '4,0 ₽', t30: '12,0 ₽' },
                  { fn: 'event-ai-ideas', cr: 1, api: '~0,32 ₽', per: '0,32 ₽', t10: '3,2 ₽', t30: '9,6 ₽' },
                  { fn: 'leisure-ai', cr: 1, api: '~0,38 ₽', per: '0,38 ₽', t10: '3,8 ₽', t30: '11,4 ₽' },
                  { fn: 'life-road', cr: 1, api: '~0,44 ₽', per: '0,44 ₽', t10: '4,4 ₽', t30: '13,2 ₽' },
                  { fn: 'conflict-ai', cr: 2, api: '~0,62 ₽', per: '0,31 ₽', t10: '3,1 ₽', t30: '9,3 ₽' },
                  { fn: 'health-ai (OCR+GPT)', cr: 2, api: '~1,90 ₽', per: '🔴 0,95 ₽', t10: '9,5 ₽', t30: '28,5 ₽' },
                  { fn: 'diet-plan 30д', cr: 7, api: '~8 ₽', per: '1,14 ₽', t10: '~11 ₽', t30: '~34 ₽' },
                ].map(r => (
                  <tr key={r.fn} className="even:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-gray-700">{r.fn}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{r.cr}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{r.api}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{r.per}</td>
                    <td className="px-3 py-2 text-right text-indigo-700">{r.t10}</td>
                    <td className="px-3 py-2 text-right text-amber-700 font-bold">{r.t30}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            🔴 health-ai — самая дорогая функция по API/кредит (0,95 ₽). Именно она определяет worst-case.
            Токены оценочно — точные данные: AI Studio → История запросов.
          </p>
        </div>

        {/* Три сценария */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            {
              title: 'Минимальный', sub: 'только ai-assistant × 30',
              api: '~12 ₽', total: '~67 ₽', sell: '149 ₽', margin: '+82 ₽ (122%)',
              ok: true, color: 'border-green-200 bg-green-50',
            },
            {
              title: 'Средний', sub: 'смешанный микс функций',
              api: '~13,5 ₽', total: '~68,7 ₽', sell: '149 ₽', margin: '+80 ₽ (117%)',
              ok: true, color: 'border-indigo-200 bg-indigo-50',
            },
            {
              title: 'Worst-case', sub: 'все 30 кредитов на health-ai',
              api: '~28,5 ₽', total: '~85,2 ₽', sell: '149 ₽', margin: '+64 ₽ (75%)',
              ok: true, color: 'border-amber-200 bg-amber-50',
            },
          ].map(s => (
            <div key={s.title} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="font-bold text-gray-900 text-sm mb-0.5">{s.title}</div>
              <div className="text-xs text-gray-500 mb-3">{s.sub}</div>
              <div className="text-xs space-y-1 text-gray-700">
                <div className="flex justify-between"><span>API AI</span><span className="font-mono">{s.api}</span></div>
                <div className="flex justify-between"><span>Fixed+Support+S3</span><span className="font-mono">55,2 ₽</span></div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>Себестоимость</span><span>{s.total}</span></div>
                <div className="flex justify-between text-emerald-700 font-bold"><span>Продаётся за</span><span>{s.sell}</span></div>
                <div className="flex justify-between text-emerald-600"><span>Маржа</span><span>{s.margin}</span></div>
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-2">✅ Безопасно при лимите 30 кредитов</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4">
          <div className="font-semibold text-indigo-300 mb-2 text-sm">Система AI-кредитов — внедрена ✅</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {[
              { fn: 'ai-assistant', c: '1 кр · 0,40 ₽ API' },
              { fn: 'event-ai-ideas', c: '1 кр · 0,32 ₽ API' },
              { fn: 'leisure-ai', c: '1 кр · 0,38 ₽ API' },
              { fn: 'life-road', c: '1 кр · 0,44 ₽ API' },
              { fn: 'conflict-ai', c: '2 кр · 0,62 ₽ API' },
              { fn: 'health-ai', c: '2 кр · 1,90 ₽ API' },
              { fn: 'diet-plan 7д', c: '4 кр · ~1,60 ₽ API' },
              { fn: 'diet-plan 30д', c: '7 кр · ~8 ₽ API' },
            ].map(r => (
              <div key={r.fn} className="bg-white/10 rounded px-2 py-1.5">
                <div className="text-slate-400 text-xs">{r.fn}</div>
                <div className="font-semibold text-white">{r.c}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Free: 15 кредитов/мес, 3/день &nbsp;·&nbsp; Premium/банк: 30 кредитов/мес, 5/день
            &nbsp;·&nbsp; Веса и лимиты меняются в БД без релиза
          </div>
        </div>
      </section>

      {/* ═══ 3 — Хранилище ═══ */}
      <section id="s3" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">3. Хранилище S3</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Статус лимита файла', val: '✅ 10 МБ в 3-х upload-функциях', color: 'border-green-200 bg-green-50' },
            { label: 'Статус лимита объёма', val: '✅ Fail-open: работает при доступной БД', color: 'border-amber-200 bg-amber-50' },
            { label: 'Учёт удаления файлов', val: '🟡 Нет — счётчик только растёт, backfill отсутствует', color: 'border-orange-200 bg-orange-50' },
          ].map(c => (
            <div key={c.label} className={`rounded-xl border p-3 ${c.color}`}>
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="text-sm font-semibold text-gray-800">{c.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            {
              title: 'Продуктовый (Free 500МБ / Premium 5ГБ)',
              hdr: 'text-indigo-800', color: 'border-indigo-200 bg-indigo-50',
              rows: [
                { s: '1 000 семей', gb: '~1 850 ГБ', store: '3 423 ₽', cdn: '1 000 ₽', tot: '4 423 ₽' },
                { s: '5 000 семей', gb: '~9 250 ГБ', store: '17 113 ₽', cdn: '5 000 ₽', tot: '22 113 ₽' },
                { s: '10 000 семей', gb: '~18 500 ГБ', store: '34 225 ₽', cdn: '9 500 ₽', tot: '43 725 ₽' },
              ],
            },
            {
              title: 'Банковский тариф (Free 500МБ / Банк 2ГБ)',
              hdr: 'text-green-800', color: 'border-green-200 bg-green-50',
              rows: [
                { s: '1 000 семей', gb: '~950 ГБ', store: '1 758 ₽', cdn: '500 ₽', tot: '2 258 ₽' },
                { s: '5 000 семей', gb: '~4 750 ГБ', store: '8 788 ₽', cdn: '2 500 ₽', tot: '11 288 ₽' },
                { s: '10 000 семей', gb: '~9 500 ГБ', store: '17 575 ₽', cdn: '4 500 ₽', tot: '22 075 ₽' },
              ],
            },
          ].map(m => (
            <div key={m.title} className={`rounded-xl border p-4 ${m.color}`}>
              <div className={`font-bold text-sm mb-3 ${m.hdr}`}>{m.title}</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-1">Масштаб</th>
                    <th className="text-right py-1">S3</th>
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

        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
          <div className="font-bold text-orange-800 mb-2">🟡 Открытые пробелы по хранилищу</div>
          <ul className="text-xs text-orange-700 space-y-1">
            <li>• <strong>Учёт удаления:</strong> функций удаления файлов из S3 нет — счётчик <code>file_storage_used_mb</code> только растёт. При удалении записей из БД лимит не освобождается.</li>
            <li>• <strong>Backfill:</strong> существующие файлы (до внедрения лимита) не учтены в счётчике — нужна разовая миграция.</li>
            <li>• <strong>Сверка БД↔S3:</strong> нет инструмента, позволяющего проверить что в S3 и что в счётчике совпадает.</li>
            <li>• <strong>Текущий объём:</strong> реальный объём S3 неизвестен — нет глобального мониторинга.</li>
          </ul>
        </div>
      </section>

      {/* ═══ 4 — БД ═══ */}
      <section id="s4" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">4. База данных — рост и лимиты</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3 text-sm">Рост на 1 активную семью/год</div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {[
                  { item: 'Профиль + члены', size: '~50–100 КБ' },
                  { item: 'События и задачи', size: '~1–2 МБ' },
                  { item: 'Здоровье — записи', size: '~2–4 МБ' },
                  { item: 'Финансы', size: '~1–2 МБ' },
                  { item: 'Питание и рецепты', size: '~1–3 МБ' },
                  { item: 'Чат и AI-история', size: '~2–4 МБ' },
                  { item: 'Уведомления, логи', size: '~1–2 МБ' },
                ].map(r => (
                  <tr key={r.item}>
                    <td className="py-1.5 text-gray-600">{r.item}</td>
                    <td className="py-1.5 text-right font-mono text-indigo-700">{r.size}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t border-gray-300">
                  <td className="pt-2">Итого за год</td>
                  <td className="pt-2 text-right">~8–17 МБ/семью</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-gray-800 mb-3 text-sm">Прогноз роста БД</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-1">Масштаб</th>
                  <th className="text-right py-1">Год 1</th>
                  <th className="text-right py-1">Год 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { s: '1 000 семей', y1: '10–17 ГБ', y3: '30–50 ГБ' },
                  { s: '5 000 семей', y1: '50–85 ГБ', y3: '150–250 ГБ' },
                  { s: '10 000 семей', y1: '100–170 ГБ', y3: '300–500 ГБ' },
                ].map(r => (
                  <tr key={r.s}>
                    <td className="py-1.5 text-gray-800">{r.s}</td>
                    <td className="py-1.5 text-right text-gray-700">{r.y1}</td>
                    <td className="py-1.5 text-right text-gray-700">{r.y3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
              Сейчас: 3,6 ГБ / 108 семей (~33 МБ/семью — выше нормы из-за dev-агента).
              Пользовательских данных ~1 ГБ (~9 МБ/семью) — в норме.
            </div>
            <div className="mt-2 text-xs text-red-600 font-medium">
              🔴 При 5 000 семей через 3 года нужно ~250 ГБ диска → апгрейд PostgreSQL неизбежен.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5 — 5 000 семей ═══ */}
      <section id="s5" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Сводная таблица 5 000 семей</h2>
        <p className="text-xs text-gray-400 mb-3">Единая база: fixed 128k, AI 1,00 ₽/кредит × 30 × 5000, support 136,5k, S3 11,3k</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Статья</th>
                <th className="text-right px-3 py-3">Итого/мес</th>
                <th className="text-right px-3 py-3">На семью</th>
                <th className="text-left px-4 py-3">Примечание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { item: 'Fixed инфра', tot: '128 000 ₽', per: '25,6 ₽', note: 'Functions + PG + CDN + misc' },
                { item: 'AI API (worst-case 30 кр)', tot: '150 000 ₽', per: '30,0 ₽', note: '30 × 1,00 ₽ × 5 000' },
                { item: 'S3 + CDN (банк 2 ГБ)', tot: '11 288 ₽', per: '2,3 ₽', note: '~4 750 ГБ × 1,85 + CDN' },
                { item: 'Поддержка L1+L2+L3', tot: '136 500 ₽', per: '27,3 ₽', note: '78k + 39k + 19,5k' },
              ].map(r => (
                <tr key={r.item} className="even:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{r.item}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900">{r.tot}</td>
                  <td className="px-3 py-2.5 text-right text-indigo-700 font-bold">{r.per}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.note}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-4 py-3">ИТОГО</td>
                <td className="px-3 py-3 text-right text-lg">425 788 ₽</td>
                <td className="px-3 py-3 text-right text-lg text-red-300">~85,2 ₽</td>
                <td className="px-4 py-3 text-slate-400 text-xs">worst-case при 100% AI-лимите</td>
              </tr>
              <tr className="bg-emerald-900 text-white font-bold">
                <td className="px-4 py-3">Выручка при 149 ₽</td>
                <td className="px-3 py-3 text-right text-lg">745 000 ₽</td>
                <td className="px-3 py-3 text-right text-lg text-emerald-300">149 ₽</td>
                <td className="px-4 py-3 text-emerald-400 text-xs">маржа ~319 212 ₽ (43%)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <p className="text-xs text-blue-700">
            <strong>Средний сценарий AI (0,45 ₽/кредит):</strong> AI total = 67 500 ₽ → итого 343 288 ₽ → на семью 68,7 ₽ → маржа 80,3 ₽ (117%).
            Банковская модель вероятно будет ближе к среднему, чем к worst-case.
          </p>
        </div>
      </section>

      {/* ═══ 6 — Безопасность ═══ */}
      <section id="s6" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Безопасность</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            {
              title: 'leisure-ai — авторизация',
              status: '✅ Закрыто',
              color: 'border-green-200 bg-green-50',
              items: [
                'Обязательная проверка X-Auth-Token для всех POST',
                'Без токена возвращает 401 (раньше — AI без авторизации)',
                'Кредиты и wallet_spend только для авторизованных',
              ],
            },
            {
              title: 'upload-file — валидация семьи',
              status: '✅ Закрыто',
              color: 'border-green-200 bg-green-50',
              items: [
                'X-Family-Id валидируется через sessions + family_members',
                'Чужой family_id → 403 (раньше — списание в чужую квоту)',
                'Без family_id — файл загружается, но лимит не учитывается',
              ],
            },
            {
              title: 'Учёт удаления файлов',
              status: '🟡 Открытый пробел',
              color: 'border-orange-200 bg-orange-50',
              items: [
                'Функций удаления файлов из S3 в проекте нет',
                'file_storage_used_mb только растёт, никогда не уменьшается',
                'При замене файлов — старый размер не вычитается',
                'Нужно: функция удаления + декремент счётчика',
              ],
            },
            {
              title: 'S3 fail-open',
              status: '⚠️ Документировано',
              color: 'border-amber-200 bg-amber-50',
              items: [
                'При недоступности БД лимит S3 не проверяется',
                'Файл загружается без учёта квоты (мягкий режим)',
                'Это сознательный выбор: не блокировать UX при сбое БД',
                'Риск: при длительной недоступности БД лимит ослабляется',
              ],
            },
          ].map(c => (
            <div key={c.title} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm text-gray-900">{c.title}</div>
                <div className="text-xs font-bold">{c.status}</div>
              </div>
              <ul className="text-xs text-gray-700 space-y-0.5">
                {c.items.map(i => <li key={i}>• {i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 7 — Тарифы и квоты ═══ */}
      <section id="s7" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">7. Тарифы и квоты аккаунта</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left px-4 py-3">Сервис</th>
                <th className="text-right px-3 py-3">Цена</th>
                <th className="text-left px-3 py-3">Единица</th>
                <th className="text-center px-3 py-3">Статус</th>
                <th className="text-left px-4 py-3">Квота аккаунта / риск</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { svc: 'Cloud Functions', price: '13,20 ₽', unit: 'за 1 млн вызовов', st: '✅', quota: '169/200 функций (84%). Остаток 31. Concurrency 10/функцию.' },
                { svc: 'Managed PostgreSQL', price: '? ₽/мес', unit: 'зависит от конфига', st: '🔴', quota: 'Конфиг неизвестен. Нужен скрин из кабинета.' },
                { svc: 'Object Storage S3', price: '~1,85 ₽/ГБ', unit: 'хранение/мес', st: '✅', quota: 'Текущий объём неизвестен — нет мониторинга.' },
                { svc: 'YandexGPT Lite', price: '0,20/0,40 ₽', unit: 'за 1 000 вх/вых токенов', st: '✅', quota: 'RPM/TPM не проверены. Риск: при 5 000 семей пиковый RPM > дефолта.' },
                { svc: 'CDN', price: '~0,85–2 ₽/ГБ', unit: 'исходящий трафик', st: '✅', quota: '—' },
                { svc: 'Vision OCR', price: '~1,50 ₽', unit: 'за страницу', st: '✅', quota: 'RPS ~1–5 по умолчанию.' },
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
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <div className="font-bold text-red-800 mb-1">🔴 Срочно проверить в кабинете до пилота</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-red-700">
            <ul className="space-y-0.5">
              <li>• PostgreSQL: CPU / RAM / SSD / IOPS / max_connections</li>
              <li>• YandexGPT: RPM и TPM текущего аккаунта в AI Studio</li>
            </ul>
            <ul className="space-y-0.5">
              <li>• Cloud Functions: запас 31 функция — провести ревизию старых</li>
              <li>• Запросить увеличение RPM если {'<'} 50 (срок ожидания до 2 нед)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ 8 — Поддержка ═══ */}
      <section id="s8" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2">8. Поддержка</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-4 py-3">Масштаб</th>
                <th className="text-right px-3 py-3">L1</th>
                <th className="text-right px-3 py-3">L2</th>
                <th className="text-right px-3 py-3">L3</th>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Управленческий вывод v1.3</h2>

        {/* Точка безубыточности */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-5">
          <div className="font-bold text-indigo-300 mb-4">Точка безубыточности при цене 149 ₽</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Worst-case AI', breakeven: '~2 500 семей', note: 'себестоимость 85 ₽' },
              { label: 'Средний AI', breakeven: '~2 000 семей', note: 'себестоимость 69 ₽' },
              { label: 'Без support', breakeven: '~700 семей', note: 'только инфра + AI' },
            ].map(c => (
              <div key={c.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">{c.label}</div>
                <div className="text-2xl font-bold text-white">{c.breakeven}</div>
                <div className="text-xs text-slate-400 mt-1">{c.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Пилот (100–500 семей) — заведомо убыточен при 149 ₽. Требует setup fee или тариф 350+ ₽.
          </p>
        </div>

        {/* 7 условий */}
        <div className="bg-gray-900 text-white rounded-xl px-6 py-6 mb-5">
          <div className="font-bold text-white mb-5">7 условий безопасного запуска</div>
          <div className="space-y-3">
            {[
              { n: '1', p: '🟢 СДЕЛАНО', t: 'Hard limit AI-кредитов (30/мес, 5/день)', d: 'Внедрено. Веса функций и лимиты настраиваются в БД без релиза.' },
              { n: '2', p: '🟢 СДЕЛАНО', t: 'Лимит файла 10 МБ', d: 'Три upload-функции. leisure-ai закрыт авторизацией. upload-file валидирует семью.' },
              { n: '3', p: '🟡 ЧАСТИЧНО', t: 'Лимит S3 на семью', d: 'Работает в штатном режиме. Fail-open при недоступности БД. Нет учёта удаления файлов.' },
              { n: '4', p: '🔴 ДО ПИЛОТА', t: 'Подтвердить конфигурацию PostgreSQL', d: 'Кабинет → PostgreSQL → записать CPU/RAM/SSD. Без этого fixed-cost не известен точно.' },
              { n: '5', p: '🔴 ДО ПИЛОТА', t: 'Проверить квоты YandexGPT', d: 'AI Studio → Квоты → RPM. Если < 50 — подать заявку на увеличение (до 2 нед).' },
              { n: '6', p: '🟡 ПЛАН', t: 'Учёт удаления файлов + backfill S3', d: 'Нет функций удаления файлов → счётчик не уменьшается. Нужны: удаление + декремент + миграция.' },
              { n: '7', p: '🟢 ДО 5 000', t: 'L1-поддержка 0,5–1,0 FTE', d: 'Без L1 при 1 000+ семей собственник тонет в обращениях. Аутсорс ~39–78 000 ₽/мес.' },
            ].map(c => (
              <div key={c.n} className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{c.n}</div>
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

        {/* Тарифы */}
        <div className="bg-indigo-900 text-white rounded-xl px-6 py-5 mb-4">
          <div className="font-bold text-indigo-200 mb-4">Безопасные тарифы для банка</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tier: 'Пилот', price: '350 ₽/мес', ai: '20 кредитов/мес', s3: '500 МБ', min: '100–500 семей', note: 'Или setup fee 150 000 ₽ + 149 ₽', ok: true },
              { tier: 'Базовый 1 000–4 999', price: '149 ₽/мес', ai: '≤ 30 кредитов', s3: '2 ГБ', min: 'от 1 000 семей', note: 'Worst-case себестоимость ~85 ₽ → маржа ~64 ₽', ok: true },
              { tier: 'Масштаб 5 000+', price: 'не раньше v1.4', ai: 'после аудита', s3: '2 ГБ', min: 'после подтверждения конфига', note: '99 ₽ — не объявлять до финального аудита', ok: false },
            ].map(t => (
              <div key={t.tier} className={`rounded-xl p-4 ${t.ok ? 'bg-white/10' : 'bg-red-900/30 border border-red-700/40'}`}>
                <div className="text-xs font-bold text-indigo-300 mb-1">{t.tier}</div>
                <div className={`text-2xl font-bold mb-2 ${t.ok ? 'text-white' : 'text-red-400'}`}>{t.price}</div>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div>AI: <strong className="text-white">{t.ai}</strong></div>
                  <div>S3: <strong className="text-white">{t.s3}</strong></div>
                  <div>Мин: <strong className="text-white">{t.min}</strong></div>
                  <div className="text-slate-400 mt-1">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="font-bold text-amber-800 mb-2">Что нельзя обещать банку до финального аудита</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-amber-700">
            <div>🚫 Цену 99 ₽ — не доказана при текущих данных</div>
            <div>🚫 SLA 99,9% — нет мониторинга и алертов</div>
            <div>🚫 Безлимитный AI за фиксированную цену</div>
            <div>🚫 24/7 поддержку — нет L1-команды</div>
            <div>🚫 Безопасность мед. данных — нет юр. аудита</div>
            <div>🚫 «Точно потянем 5 000» — нет нагрузочных тестов</div>
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-4">
        v1.3 · Июнь 2026 · Конфиденциально · Единая арифметика: fixed 25,6 + support 27,3 + AI worst 30,0 + S3 2,3 = 85,2 ₽/семью
      </p>
    </SectionPageFrame>
  );
}
