import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

// Варианты письма банку
type LetterVariant = 'answer' | 'recommended' | 'short' | 'two-options';

const VARIANTS: { id: LetterVariant; label: string; desc: string }[] = [
  { id: 'answer',      label: 'Ответ на вопрос', desc: 'Прямой ответ: цена, период, зависимость от объёма' },
  { id: 'recommended', label: 'Рекомендованное', desc: 'Полное письмо с гибридной моделью' },
  { id: 'short',       label: 'Короткое',        desc: 'На 1 экран — если уже общались' },
  { id: 'two-options', label: 'Два варианта',     desc: 'Гибрид + фикс, банк выбирает' },
];

const LETTERS: Record<LetterVariant, { subject: string; body: string }> = {
  answer: {
    subject: 'Re: стоимость подключения — «Наша Семья»',
    body: `Алексей, добрый день!

Спасибо за вопрос.

Для корректности сразу уточню единицу тарификации:

1 активированное подключение = 1 Family ID = 1 семья.

То есть речь идёт не о стоимости за одного человека, а о стоимости за один семейный аккаунт. Если в рамках одного Family ID подключены, например, 2 взрослых и 2 ребёнка — для банка это всё равно одно подключение.

1. Период оплаты
Стоимость считается за одно активированное подключение в расчёте на месяц — то есть это ежемесячная оплата только за реально подключённые и используемые семейные аккаунты, а не разовая оплата «навсегда».

2. Зависит ли цена от числа подключений
Да, цена зависит от объёма:
— до 500 семейных подключений — 350 ₽ / подключение / месяц
— от 1 000 семейных подключений — 149 ₽ / подключение / месяц
— от 5 000 семейных подключений — индивидуальные условия под плановый объём.

3. Что входит в стоимость
— доступ к основному функционалу сервиса,
— AI-сценарии в рамках базовой модели,
— хранение данных в рамках тарифа,
— базовая поддержка.

4. Лимит расходов банка на одно подключение
Дополнительно по каждому подключению можем установить ежемесячный лимит партнёрского кошелька на один Family ID — например:
— 50 ₽ / месяц,
— 100 ₽ / месяц,
— 150 ₽ / месяц.

То есть максимальная стоимость для банка на одно семейное подключение в месяц составит:
— на пилоте: 350 ₽ + выбранный лимит,
— на масштабе: 149 ₽ + выбранный лимит.

5. Что происходит после исчерпания лимита (принципиально важно)
После исчерпания установленного лимита партнёрского кошелька дополнительные списания на банк не производятся.

Семья продолжает пользоваться базовыми функциями, а дальнейшие платные сценарии оплачивает из собственного кошелька в сервисе. Таким образом, у банка заранее фиксируется верхняя граница расходов на одно семейное подключение в месяц.

6. Пример
При тарифе 149 ₽ / месяц и лимите партнёрского кошелька 100 ₽ максимальный расход банка составит:
249 ₽ / месяц за 1 Family ID (1 семью).

Если подскажете ориентир по числу подключений на старте — 500 / 1 000 / 5 000 семейных ID — мы подготовим точный расчёт месячного бюджета под ваш сценарий.

С уважением,
Алексей`,
  },

  recommended: {
    subject: 'Партнёрская модель — «Наша Семья»',
    body: `Алексей, добрый день!

Спасибо за вопрос и интерес к партнёрскому формату.

Сразу уточню единицу тарификации: 1 активированное подключение = 1 Family ID = 1 семья. Оплата идёт за семейный аккаунт целиком, а не за каждого человека: если в одном Family ID 2 взрослых и 2 ребёнка — для банка это одно подключение.

Мы видим оптимальную модель не как разовую оплату «за подключение навсегда», а как оплату за активированное подключение в расчёте на месяц — то есть банк оплачивает только реально подключённые и используемые семейные аккаунты.

На текущий момент можем предложить следующий формат:

1. Пилотный запуск
   до 500 семейных подключений — 350 ₽ / подключение / месяц

2. Масштабный запуск
   от 1 000 семейных подключений — 149 ₽ / подключение / месяц

В базовую стоимость входят:
— доступ к основному функционалу сервиса,
— стандартные AI-сценарии,
— хранение данных в рамках тарифа,
— базовая поддержка.

Дополнительно по каждому подключению можем установить ежемесячный лимит партнёрского кошелька на один Family ID — например, 50 / 100 / 150 ₽ в месяц.

После исчерпания установленного лимита дополнительные списания на банк не производятся. Семья продолжает пользоваться базовыми функциями, а дальнейшие платные сценарии оплачивает из собственного кошелька в сервисе.

Таким образом, у банка заранее фиксируется верхняя граница расходов на одно семейное подключение. Например: 149 ₽ + лимит 100 ₽ = максимум 249 ₽ / месяц за 1 Family ID.

На наш взгляд, это самая прозрачная модель:
— у банка предсказуемый бюджет с фиксированным потолком,
— семья не упирается в жёсткую блокировку,
— дополнительное потребление не ложится автоматически на банк.

Если вам удобно, мы можем подготовить отдельный расчёт месячного бюджета для сценариев на 500 / 1 000 / 5 000 семейных подключений.

С уважением,
Алексей`,
  },

  short: {
    subject: 'Стоимость подключения — «Наша Семья»',
    body: `Алексей, добрый день!

Уточню сразу: 1 подключение = 1 Family ID = 1 семья (оплата за семейный аккаунт, а не за человека).

По стоимости работаем по модели оплаты за активированное подключение в месяц:
— Пилот (до 500 семей) — 350 ₽ / подключение / месяц
— Масштаб (от 1 000 семей) — 149 ₽ / подключение / месяц

В стоимость входит базовый функционал, AI-сценарии, хранилище и поддержка.

Дополнительно по каждому подключению можем установить ежемесячный лимит партнёрского кошелька (50 / 100 / 150 ₽). После исчерпания лимита списания на банк не производятся — дальнейшие платные сценарии семья оплачивает из собственного кошелька. Так у банка фиксируется верхний потолок: например, 149 ₽ + 100 ₽ = максимум 249 ₽ / месяц за 1 семью.

Если нужен расчёт на конкретное число подключений — подготовим.

С уважением,
Алексей`,
  },

  'two-options': {
    subject: 'Два варианта партнёрской модели — «Наша Семья»',
    body: `Алексей, добрый день!

Единица тарификации: 1 подключение = 1 Family ID = 1 семья (оплата за семейный аккаунт, не за человека).

Мы подготовили два варианта — на ваш выбор.

───────────────────────────────
Вариант A — Гибридная модель (рекомендуем)
───────────────────────────────
Банк оплачивает фиксированную сумму за семейное подключение:
— Пилот (до 500 семей): 350 ₽ / подключение / месяц
— Масштаб (от 1 000 семей): 149 ₽ / подключение / месяц

Дополнительно банк задаёт ежемесячный лимит партнёрского кошелька на один Family ID (50 / 100 / 150 ₽). После исчерпания лимита списания на банк не производятся — дальнейшие платные сценарии семья оплачивает из собственного кошелька.

Потолок расходов банка: например, 149 ₽ + 100 ₽ = максимум 249 ₽ / месяц за 1 семью.
Плюс: у банка прогнозируемый бюджет с верхней границей, семья не блокируется.

───────────────────────────────
Вариант B — Фиксированная модель
───────────────────────────────
Всё включено в рамках fair use:
— Пилот (до 500 семей): 490 ₽ / подключение / месяц
— Масштаб (от 1 000 семей): 199 ₽ / подключение / месяц

При крупных объёмах (5 000+) — индивидуальные условия.

───────────────────────────────

Если подскажете ориентир по числу подключений на старте (500 / 1 000 / 5 000 семей), сразу направим конкретный расчёт месячного бюджета по удобному варианту.

С уважением,
Алексей`,
  },
};

// Калькулятор бюджета банка
const TIERS = [
  { count: 500,  base: 350, label: 'Пилот · 500 семей' },
  { count: 1000, base: 149, label: 'Масштаб · 1 000 семей' },
  { count: 5000, base: 149, label: 'Масштаб · 5 000 семей' },
];
const LIMITS = [0, 50, 100, 150];
const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export default function BankLetter() {
  const [variant, setVariant] = useState<LetterVariant>('answer');
  const [copied, setCopied] = useState(false);
  const [limit, setLimit] = useState<number>(100);
  const letter = LETTERS[variant];

  const handleCopy = () => {
    navigator.clipboard.writeText(`Тема: ${letter.subject}\n\n${letter.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionPageFrame
      title="Шаблон письма банку"
      subtitle="Конфиденциально — только для собственника"
      backPath="/tech-economics"
      variant="light"
      width="normal"
      accentColor="text-gray-800"
      rightAction={
        <Button
          variant="default" size="sm"
          className="bg-gray-800 hover:bg-gray-900 text-white print:hidden"
          onClick={() => window.print()}
        >
          <Icon name="Printer" className="w-4 h-4 mr-1" />Распечатать
        </Button>
      }
    >
      {/* Зачем отдельное письмо */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl px-5 py-4 mb-6">
        <div className="font-bold text-blue-900 mb-1">Почему письмо — отдельно от owner-документа</div>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Банку в первом касании не нужно видеть внутренние риски, FTE, 169/200 функций и слабые места.</p>
          <p>Письмо — короткое, коммерчески понятное. Owner-doc — только если попросят детальный разбор.</p>
        </div>
      </div>

      {/* Единица тарификации — ключевой акцент */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl px-6 py-5 mb-6 shadow-md">
        <div className="flex items-start gap-3">
          <Icon name="Users" className="w-7 h-7 shrink-0 mt-0.5 text-indigo-100" />
          <div>
            <div className="text-lg font-bold mb-1">1 подключение = 1 Family ID = 1 семья</div>
            <p className="text-sm text-indigo-100">
              Оплата идёт за семейный аккаунт целиком, а не за каждого человека.
              Если в одном Family ID — 2 взрослых и 2 ребёнка, для банка это всё равно <strong className="text-white">одно подключение</strong>.
              Это нужно прописать банку первым абзацем, иначе экономику посчитают в разы дороже.
            </p>
          </div>
        </div>
      </div>

      {/* Калькулятор бюджета банка с потолком */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div className="bg-gray-800 text-white px-5 py-3 flex items-center gap-2">
          <Icon name="Calculator" className="w-4 h-4" />
          <span className="font-bold text-sm">Калькулятор бюджета банка (потолок расходов)</span>
        </div>
        <div className="p-5">
          {/* Выбор лимита */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-600 mb-2">Лимит партнёрского кошелька на 1 Family ID / месяц:</div>
            <div className="flex flex-wrap gap-2">
              {LIMITS.map(l => (
                <button
                  key={l}
                  onClick={() => setLimit(l)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                    limit === l
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {l === 0 ? 'Без лимита' : `+${l} ₽`}
                </button>
              ))}
            </div>
          </div>

          {/* Таблица бюджета */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="text-left px-3 py-2 font-medium">Сценарий</th>
                  <th className="text-right px-3 py-2 font-medium">База / семью</th>
                  <th className="text-right px-3 py-2 font-medium">Потолок / семью</th>
                  <th className="text-right px-3 py-2 font-medium">Бюджет банка / мес</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIERS.map(t => {
                  const perFamily = t.base + limit;
                  const total = perFamily * t.count;
                  return (
                    <tr key={t.label} className="even:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-700">{t.label}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{fmt(t.base)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{fmt(perFamily)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-gray-500 mt-3">
            «Потолок / семью» — максимум, который банк платит за один Family ID в месяц.
            После исчерпания лимита {limit === 0 ? '' : `(${limit} ₽) `}списания на банк <strong>прекращаются</strong> — дальше платит семья из своего кошелька.
          </p>
        </div>
      </div>

      {/* Выбор варианта */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-gray-700 mb-2">Выберите вариант письма:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VARIANTS.map(v => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                variant === v.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`font-semibold text-sm mb-0.5 ${variant === v.id ? 'text-indigo-800' : 'text-gray-800'}`}>
                {v.label}
              </div>
              <div className="text-xs text-gray-500">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Тема */}
      <div className="bg-gray-100 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
        <span className="text-xs text-gray-500 shrink-0">Тема письма:</span>
        <span className="text-sm font-semibold text-gray-800">{letter.subject}</span>
      </div>

      {/* Тело письма */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Текст письма</span>
          <Button
            size="sm" variant="outline"
            className="text-xs h-7 print:hidden"
            onClick={handleCopy}
          >
            <Icon name={copied ? 'Check' : 'Copy'} className="w-3.5 h-3.5 mr-1" />
            {copied ? 'Скопировано' : 'Скопировать'}
          </Button>
        </div>
        <pre className="px-5 py-4 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {letter.body}
        </pre>
      </div>

      {/* Усиливающая фраза */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-6">
        <div className="text-xs font-bold text-indigo-700 mb-2">💡 Защитные фразы — вставить, чтобы не уйти в минус:</div>
        <div className="space-y-2 text-sm text-indigo-800 italic">
          <p>«После исчерпания установленного лимита партнёрского кошелька новые автоматические списания на банк не производятся.»</p>
          <p>«Это позволяет заранее зафиксировать максимальный месячный бюджет банка на одно семейное подключение (1 Family ID).»</p>
        </div>
      </div>

      {/* Что НЕ обещать */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
        <div className="font-bold text-amber-800 mb-2">🚫 Не обещать банку до финального аудита</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-amber-700">
          {[
            'Цену 99 ₽ — не доказана экономически',
            'SLA 99,9% — нет мониторинга',
            'Безлимитный AI за фиксированную цену',
            '24/7 поддержку — нет L1',
            'Безопасность мед. данных — нет юр. аудита',
            '«Точно потянем 5 000» — нет нагрузочных тестов',
          ].map(i => <div key={i}>— {i}</div>)}
        </div>
      </div>

      {/* Ссылка на owner-doc */}
      <div className="text-center">
        <a
          href="/tech-economics"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          <Icon name="FileText" className="w-4 h-4" />
          Перейти к полному owner-документу (TechEconomics v1.5)
        </a>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        v1.0 · Июнь 2026 · Конфиденциально
      </p>
    </SectionPageFrame>
  );
}