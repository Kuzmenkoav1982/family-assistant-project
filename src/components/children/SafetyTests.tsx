import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Star } from "lucide-react";
import { track } from "@/lib/analytics";

// ─── Константы ────────────────────────────────────────────────────────────────

export type AgeGroup = "7_10" | "11_15";
export type AgeGroupSource = "manual" | "profile" | "fallback";

const LS_RESULTS_KEY = "safety_tests_results_v2"; // v2 — раздельный прогресс
const LS_AGE_KEY = "safety_tests_age_group";
const LS_AGE_SOURCE_KEY = "safety_tests_age_source";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface AgedQuestion {
  text_7_10: string;
  text_11_15: string;
  options: string[];
  correct: number;
  explanation_7_10: string;
  explanation_11_15: string;
}

interface SafetyTest {
  id: string;
  emoji: string;
  title: string;
  subtitle_7_10: string;
  subtitle_11_15: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  questions: AgedQuestion[];
}

type SavedResults = Record<AgeGroup, Record<string, number>>;

// ─── Данные тестов ────────────────────────────────────────────────────────────

const SAFETY_TESTS: SafetyTest[] = [
  {
    id: "fire",
    emoji: "🔥",
    title: "Пожар и ЧС",
    subtitle_7_10: "Что делать — коротко и понятно",
    subtitle_11_15: "Правила поведения в чрезвычайных ситуациях",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badge: "Защита дома",
    questions: [
      {
        text_7_10: "Ты почувствовал запах дыма дома. Что делаешь сразу?",
        text_11_15: "Ты дома один и почувствовал запах дыма. Первое действие?",
        options: [
          "Ищу откуда дым и пробую потушить сам",
          "Зову взрослых или сразу звоню 112",
          "Открываю окно и жду",
          "Прячусь под кровать",
        ],
        correct: 1,
        explanation_7_10: "Зови взрослых или звони 112. Сам не туши — это опасно!",
        explanation_11_15: "Не пытайся тушить самостоятельно — это главная ошибка. Немедленно звони 112 и выходи из здания.",
      },
      {
        text_7_10: "В школе зазвенел сигнал тревоги. Как правильно выходить?",
        text_11_15: "Сигнал пожарной тревоги в школе. Твои действия?",
        options: [
          "Бегу быстрее всех, чтобы выйти первым",
          "Беру все вещи и спокойно иду",
          "Спокойно иду к ближайшему выходу вместе с классом",
          "Прячусь в туалете, там безопаснее",
        ],
        correct: 2,
        explanation_7_10: "Иди спокойно с классом к выходу. Не толкайся и не убегай!",
        explanation_11_15: "При эвакуации важно сохранять спокойствие. Паника и давка опаснее огня. Двигайся организованно.",
      },
      {
        text_7_10: "Дверь в комнату горячая на ощупь. Что это значит?",
        text_11_15: "Ты хочешь выйти, но дверь горячая. Правильное действие?",
        options: [
          "Кто-то готовит еду на кухне",
          "За дверью огонь — открывать нельзя",
          "Это нормально зимой",
          "Нужно открыть и проверить",
        ],
        correct: 1,
        explanation_7_10: "Горячая дверь — за ней огонь! Не открывай, ищи другой выход.",
        explanation_11_15: "Горячая дверь сигнализирует о пожаре за ней. Открыв её, ты дашь огню кислород. Ищи другой выход или зови на помощь через окно.",
      },
      {
        text_7_10: "Ты потерялся в незнакомом месте. Что делать?",
        text_11_15: "Ты потерялся в незнакомом месте, телефон разряжен. Что делать?",
        options: [
          "Идти в любую сторону пока не найду знакомое место",
          "Стоять на месте и плакать",
          "Обратиться к полицейскому или охраннику",
          "Попросить помощи у первого встречного",
        ],
        correct: 2,
        explanation_7_10: "Стой на месте! Обратись к полицейскому или охраннику — они специально обучены помогать.",
        explanation_11_15: "При потере ориентира лучшая стратегия — оставаться на месте. Обратись к сотруднику безопасности, полицейскому или в точку информации.",
      },
    ],
  },
  {
    id: "scam",
    emoji: "📵",
    title: "Звонки и мошенники",
    subtitle_7_10: "Правила если кто-то просит деньги",
    subtitle_11_15: "Цифровое мошенничество: звонки, коды, переводы",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    badge: "Финансовая защита",
    questions: [
      {
        text_7_10: "Позвонил незнакомец и сказал, что мама в беде и нужны деньги. Что делаешь?",
        text_11_15: "Незнакомый звонит: «Мама в аварии, срочно нужны деньги — переведи». Твои действия?",
        options: [
          "Сразу ищу деньги, ведь мама в опасности",
          "Кладу трубку и сразу звоню маме на её номер",
          "Спрашиваю сколько нужно денег",
          "Иду к соседям за деньгами",
        ],
        correct: 1,
        explanation_7_10: "Это обман! Всегда позвони маме сам — по её обычному номеру.",
        explanation_11_15: "Это классический социальный инжиниринг. Мошенники создают панику, чтобы ты не думал. Сразу позвони родителям напрямую.",
      },
      {
        text_7_10: "Незнакомый в интернете просит назвать код из SMS. Что делать?",
        text_11_15: "Звонящий представляется сотрудником банка и просит код из SMS для «защиты счёта». Что делать?",
        options: [
          "Назову, если говорит что он из банка",
          "Никому и никогда не называть коды из SMS",
          "Назову только цифры без слова «код»",
          "Назову если попросит вежливо",
        ],
        correct: 1,
        explanation_7_10: "Код из SMS — это ключ от денег. Никому не говори!",
        explanation_11_15: "Код из SMS — одноразовый ключ авторизации. Настоящий банк никогда его не просит. Это 100% мошенничество — клади трубку.",
      },
      {
        text_7_10: "Написали: «Ты выиграл iPhone! Заплати 100 рублей». Это…",
        text_11_15: "Сообщение: «Ваш аккаунт выиграл 50 000 руб! Для получения переведи 500 руб. комиссии». Это…",
        options: [
          "Настоящий выигрыш, надо платить",
          "Обман — настоящие призы не просят платить",
          "Можно проверить, заплатив немного",
          "Зависит от суммы комиссии",
        ],
        correct: 1,
        explanation_7_10: "Если за «приз» просят деньги — это обман. Настоящие призы бесплатны!",
        explanation_11_15: "Схема «заплати небольшую комиссию за большой приз» — один из самых распространённых видов мошенничества. После оплаты ничего не получишь.",
      },
      {
        text_7_10: "Знакомый в соцсети просит срочно дать денег. Что делаешь?",
        text_11_15: "Друг в мессенджере пишет: «Дай взаймы 1000 руб., верну завтра, срочно!». Ты знаешь его в реальной жизни. Что делать?",
        options: [
          "Сразу перевожу, ведь это знакомый",
          "Перевожу если попросит настойчиво",
          "Звоню ему лично чтобы убедиться что это он",
          "Прошу прислать голосовое",
        ],
        correct: 2,
        explanation_7_10: "Аккаунт мог взломать мошенник. Позвони другу сам!",
        explanation_11_15: "Взлом аккаунтов для рассылки просьб о деньгах — распространённая схема. Позвони другу по телефону. Голос не подделаешь.",
      },
    ],
  },
  {
    id: "internet",
    emoji: "🌐",
    title: "Интернет и безопасность",
    subtitle_7_10: "Простые правила в интернете",
    subtitle_11_15: "Цифровая безопасность: ссылки, данные, пароли",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    badge: "Цифровая грамота",
    questions: [
      {
        text_7_10: "Незнакомый прислал ссылку: «Посмотри, это про тебя!». Что делаешь?",
        text_11_15: "В чате незнакомый прислал ссылку: «Тут твои фото, посмотри». Твои действия?",
        options: [
          "Открываю — интересно же!",
          "Открываю только если ссылка красивая",
          "Не открываю, спрошу у взрослого",
          "Открываю на всякий случай",
        ],
        correct: 2,
        explanation_7_10: "Такие ссылки — ловушка. Не нажимай, спроси взрослого!",
        explanation_11_15: "Фишинговые ссылки маскируются под интересный контент. При переходе могут украсть данные аккаунта или заразить устройство вирусом.",
      },
      {
        text_7_10: "Что нельзя говорить незнакомым в интернете?",
        text_11_15: "Новый «друг» в игре спрашивает твой адрес, школу и когда родители дома. Что делать?",
        options: [
          "Название своей любимой игры",
          "Свой адрес, школу и расписание родителей",
          "Что любишь смотреть в YouTube",
          "Свою любимую еду",
        ],
        correct: 1,
        explanation_7_10: "Адрес и расписание — секрет! Незнакомцам в интернете это знать не нужно.",
        explanation_11_15: "Это классический сбор личных данных. Даже если человек кажется хорошим онлайн-другом — адрес, школа и расписание — это информация, которая может навредить.",
      },
      {
        text_7_10: "Кто-то в игре обзывает тебя и пишет злые слова. Что делать?",
        text_11_15: "Человек в сети систематически присылает оскорбления и угрозы. Твои действия?",
        options: [
          "Обзываться в ответ",
          "Заблокировать, сохранить скриншот и рассказать взрослому",
          "Продолжать играть, не обращая внимания",
          "Дать ему свой номер телефона",
        ],
        correct: 1,
        explanation_7_10: "Заблокируй и расскажи маме или папе. Ты ни в чём не виноват!",
        explanation_11_15: "Кибербуллинг — это правонарушение. Сохрани доказательства (скриншоты), заблокируй пользователя и сообщи взрослым или в администрацию платформы.",
      },
      {
        text_7_10: "Хороший пароль — это:",
        text_11_15: "Какой подход к паролям правильный?",
        options: [
          "Дата рождения: 12052015",
          "Имя и год: Masha2015",
          "Набор букв, цифр и знаков: Kv!8mR#2",
          "Одинаковый пароль везде — легче запомнить",
        ],
        correct: 2,
        explanation_7_10: "Пароль должен быть сложным — с буквами, цифрами и значками. Дату рождения легко угадать!",
        explanation_11_15: "Сложный уникальный пароль для каждого сервиса — основа цифровой безопасности. Один взломанный пароль не должен открывать все твои аккаунты.",
      },
    ],
  },
  {
    id: "lost",
    emoji: "🗺️",
    title: "Если потерялся",
    subtitle_7_10: "Что делать — просто и понятно",
    subtitle_11_15: "Безопасное поведение в незнакомой ситуации",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    badge: "Важные ситуации",
    questions: [
      {
        text_7_10: "Ты потерялся в торговом центре. Что делать сразу?",
        text_11_15: "Ты потерялся в большом торговом центре, телефон на 5%. Первое действие?",
        options: [
          "Выйти на улицу и искать дорогу домой",
          "Подойти к охраннику или на стойку информации",
          "Попросить помощи у первого незнакомого человека",
          "Ждать пока родители сами найдут",
        ],
        correct: 1,
        explanation_7_10: "Охранник или стойка информации — самое безопасное место. Они помогут найти маму или папу.",
        explanation_11_15: "Охранник и стойка информации — официальные сотрудники с протоколом действий при потере ребёнка. Это безопаснее, чем обращаться к случайным людям.",
      },
      {
        text_7_10: "Ты дома один, кто-то незнакомый звонит в дверь. Что делаешь?",
        text_11_15: "Ты дома один. Незнакомый настойчиво звонит в дверь и говорит что он из газовой службы. Твои действия?",
        options: [
          "Открываю — вдруг это важно",
          "Открываю посмотреть кто это",
          "Не открываю, говорю через дверь что родители рядом",
          "Молчу и прячусь",
        ],
        correct: 2,
        explanation_7_10: "Незнакомым дверь не открывай. Скажи что родители дома и позвони им.",
        explanation_11_15: "Настоящие коммунальные службы приходят по записи. Незнакомцу через дверь скажи, что взрослые дома, и немедленно позвони родителям. Не открывай.",
      },
      {
        text_7_10: "Незнакомый взрослый предлагает конфеты и зовёт «помочь найти щенка». Твои действия?",
        text_11_15: "Незнакомый взрослый на улице настойчиво предлагает подвезти тебя «до дома» и знает твоё имя. Что делать?",
        options: [
          "Иду помогать — щенок же потерялся",
          "Беру конфеты, но никуда не иду",
          "Говорю «нет» и быстро ухожу к людям",
          "Спрашиваю как выглядит щенок",
        ],
        correct: 2,
        explanation_7_10: "Это ловушка! Говори «нет», уходи к людям и расскажи взрослым.",
        explanation_11_15: "Знание имени — не доказательство знакомства. Это манипуляция для снижения бдительности. Твёрдо откажись, уйди в людное место и позвони родителям.",
      },
      {
        text_7_10: "Что важнее всего знать наизусть на случай если потеряешься?",
        text_11_15: "Ты потерялся, телефон разряжен. Что должно быть у тебя в памяти?",
        options: [
          "Логин от любимой игры",
          "Номер телефона мамы или папы",
          "Адрес школы",
          "Номер автобуса до дома",
        ],
        correct: 1,
        explanation_7_10: "Выучи наизусть номер мамы или папы. Это самое важное!",
        explanation_11_15: "Номер телефона родителей наизусть — критически важный навык. Любой телефон, стационарный или чужой, позволит позвонить, если знаешь номер.",
      },
    ],
  },
];

// ─── Хелперы ──────────────────────────────────────────────────────────────────

const LEVEL_CONFIG = [
  { min: 0,  max: 49,  label: "Начинающий",     emoji: "🌱", color: "text-slate-600",   bg: "bg-slate-100" },
  { min: 50, max: 74,  label: "Знает основы",   emoji: "📘", color: "text-blue-600",    bg: "bg-blue-50" },
  { min: 75, max: 99,  label: "Уверенно знает", emoji: "⭐", color: "text-amber-600",   bg: "bg-amber-50" },
  { min: 100, max: 100, label: "Эксперт!",      emoji: "🏆", color: "text-emerald-600", bg: "bg-emerald-50" },
];

function getLevel(pct: number) {
  return LEVEL_CONFIG.find(l => pct >= l.min && pct <= l.max) ?? LEVEL_CONFIG[0];
}

function loadResults(): SavedResults {
  try {
    const raw = localStorage.getItem(LS_RESULTS_KEY);
    return raw ? JSON.parse(raw) : { "7_10": {}, "11_15": {} };
  } catch {
    return { "7_10": {}, "11_15": {} };
  }
}

function loadAgeGroup(): AgeGroup | null {
  try {
    const raw = localStorage.getItem(LS_AGE_KEY);
    return (raw === "7_10" || raw === "11_15") ? raw : null;
  } catch {
    return null;
  }
}

function loadAgeSource(): AgeGroupSource | null {
  try {
    const raw = localStorage.getItem(LS_AGE_SOURCE_KEY);
    return (raw === "manual" || raw === "profile" || raw === "fallback") ? raw as AgeGroupSource : null;
  } catch {
    return null;
  }
}

function saveAgeGroup(ag: AgeGroup, source: AgeGroupSource) {
  try {
    localStorage.setItem(LS_AGE_KEY, ag);
    localStorage.setItem(LS_AGE_SOURCE_KEY, source);
  } catch { /* ignore */ }
}

// Маппинг: возраст → группа (null если вне диапазона)
function ageToGroup(age: number | undefined): AgeGroup | null {
  if (!age) return null;
  if (age >= 7 && age <= 10) return "7_10";
  if (age >= 11 && age <= 15) return "11_15";
  return null;
}

// ─── Выбор возраста ───────────────────────────────────────────────────────────

interface AgeSelectorProps {
  onSelect: (ag: AgeGroup) => void;
  onBack?: () => void;
}

function AgeSelector({ onSelect, onBack }: AgeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
        )}
        <div>
          <p className="font-bold text-slate-800 text-base leading-none">Тесты по безопасности</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Выбери свою возрастную группу</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-snug">
        Вопросы и примеры подберутся под твой возраст — так будет понятнее и полезнее.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => { saveAgeGroup("7_10", "manual"); track("kids_safety_age_group_selected", { props: { age_group: "7_10", age_group_source: "manual" } }); onSelect("7_10"); }}
          className="w-full text-left rounded-2xl border-2 border-violet-200 bg-violet-50 hover:border-violet-400 hover:shadow-sm transition px-4 py-4 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div className="flex-1">
              <p className="font-bold text-violet-800 text-base">7–10 лет</p>
              <p className="text-[12px] text-violet-600 mt-0.5">Короткие правила для важных ситуаций</p>
            </div>
            <ArrowRight size={16} className="text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => { saveAgeGroup("11_15", "manual"); track("kids_safety_age_group_selected", { props: { age_group: "11_15", age_group_source: "manual" } }); onSelect("11_15"); }}
          className="w-full text-left rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:shadow-sm transition px-4 py-4 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div className="flex-1">
              <p className="font-bold text-indigo-800 text-base">11–15 лет</p>
              <p className="text-[12px] text-indigo-600 mt-0.5">Реальные ситуации: звонки, ссылки, коды</p>
            </div>
            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Выбор запомнится — можно поменять в любой момент
      </p>
    </div>
  );
}

// ─── Экран теста ──────────────────────────────────────────────────────────────

interface TestScreenProps {
  test: SafetyTest;
  ageGroup: AgeGroup;
  onBack: () => void;
  onComplete: (testId: string, pct: number) => void;
}

function TestScreen({ test, ageGroup, onBack, onComplete }: TestScreenProps) {
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const q = test.questions[current];
  const qText = ageGroup === "7_10" ? q.text_7_10 : q.text_11_15;
  const qExplain = ageGroup === "7_10" ? q.explanation_7_10 : q.explanation_11_15;
  const selected = answers[current];
  const isAnswered = selected !== undefined;
  const isLast = current === test.questions.length - 1;

  const ageLabel = ageGroup === "7_10" ? "7–10" : "11–15";

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [current]: idx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLast) {
      const correct = Object.entries(answers).filter(([qi, ai]) => test.questions[Number(qi)].correct === Number(ai)).length;
      const pct = Math.round((correct / test.questions.length) * 100);
      const lvl = getLevel(pct);
      track("kids_safety_test_finish", { props: { test_id: test.id, score: pct, age_group: ageGroup } });
      track("kids_safety_level_reached", { props: { test_id: test.id, level: lvl.label, age_group: ageGroup } });
      setStep("result");
      onComplete(test.id, pct);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const correct = Object.entries(answers).filter(([qi, ai]) => test.questions[Number(qi)].correct === Number(ai)).length;
  const pct = Math.round((correct / test.questions.length) * 100);
  const level = getLevel(pct);

  if (step === "result") {
    return (
      <div className="flex flex-col gap-4">
        <div className={`rounded-2xl p-5 text-center ${level.bg} border border-white/60`}>
          <div className="text-5xl mb-2">{level.emoji}</div>
          <p className={`font-bold text-base ${level.color}`}>{level.label}</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{pct}%</p>
          <p className="text-sm text-slate-500 mt-0.5">{correct} из {test.questions.length} правильно</p>
        </div>

        <div className="flex flex-col gap-2">
          {test.questions.map((question, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === question.correct;
            const qT = ageGroup === "7_10" ? question.text_7_10 : question.text_11_15;
            return (
              <div key={i} className={`rounded-xl p-3 border text-sm ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">{isCorrect ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-medium text-slate-700 leading-snug text-[12px]">{qT}</p>
                    {!isCorrect && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Правильно: <span className="font-semibold text-emerald-700">{question.options[question.correct]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setCurrent(0); setAnswers({}); setShowExplanation(false); setStep("quiz"); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} /> Пройти снова
          </button>
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
          >
            К тестам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft size={16} className="text-slate-500" />
        </button>
        <div className="flex-1 flex gap-1">
          {test.questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < current ? "bg-emerald-400" : i === current ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{ageLabel}</span>
        <span className="text-xs text-slate-400 font-medium shrink-0">{current + 1}/{test.questions.length}</span>
      </div>

      <div className={`rounded-2xl p-4 ${test.bgColor} border ${test.borderColor}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{test.emoji}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${test.color}`}>{test.title}</span>
        </div>
        <p className="font-semibold text-slate-800 text-sm leading-snug">{qText}</p>
      </div>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let style = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
          if (isAnswered) {
            if (i === q.correct) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (i === selected) style = "border-rose-400 bg-rose-50 text-rose-700";
            else style = "border-slate-100 bg-white opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style}`}
              disabled={isAnswered}
            >
              <span className="font-medium text-slate-400 mr-2">{["А", "Б", "В", "Г"][i]}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={`rounded-xl px-3 py-2.5 text-[12px] leading-snug ${
          selected === q.correct
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          <span className="font-bold mr-1">{selected === q.correct ? "Верно! " : "Не совсем. "}</span>
          {qExplain}
        </div>
      )}

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition"
        >
          {isLast ? <><Trophy size={14} /> Узнать результат</> : <>Следующий вопрос <ArrowRight size={14} /></>}
        </button>
      )}
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

interface SafetyTestsProps {
  onBack?: () => void;
  childAge?: number;
}

export default function SafetyTests({ onBack, childAge }: SafetyTestsProps) {
  // Приоритет: 1) ручной выбор → 2) из профиля → 3) null (показать выбор)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(() => {
    const manualChoice = loadAgeGroup();
    const manualSource = loadAgeSource();
    // Если есть ручной выбор — уважаем его
    if (manualChoice && manualSource === "manual") return manualChoice;
    // Иначе пробуем из профиля
    const fromProfile = ageToGroup(childAge);
    if (fromProfile) {
      saveAgeGroup(fromProfile, "profile");
      return fromProfile;
    }
    // Если был авто-выбор ранее (profile/fallback) — используем
    if (manualChoice) return manualChoice;
    return null;
  });

  const [ageSource] = useState<AgeGroupSource>(() => loadAgeSource() ?? "fallback");
  const [activeTest, setActiveTest] = useState<SafetyTest | null>(null);
  const [allResults, setAllResults] = useState<SavedResults>(loadResults);

  useEffect(() => {
    try {
      localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(allResults));
    } catch { /* ignore */ }
  }, [allResults]);

  const handleComplete = (testId: string, pct: number) => {
    if (!ageGroup) return;
    setAllResults(prev => ({
      ...prev,
      [ageGroup]: { ...prev[ageGroup], [testId]: pct },
    }));
  };

  // ── Экран теста ──
  if (activeTest && ageGroup) {
    return (
      <div className="flex flex-col gap-4">
        <TestScreen
          test={activeTest}
          ageGroup={ageGroup}
          onBack={() => setActiveTest(null)}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // ── Выбор возраста ──
  if (!ageGroup) {
    return <AgeSelector onSelect={(ag) => { saveAgeGroup(ag, "manual"); setAgeGroup(ag); }} onBack={onBack} />;
  }

  // ── Список тестов ──
  const results = allResults[ageGroup] ?? {};
  const doneTests = Object.values(results);
  const overallPct = doneTests.length > 0
    ? Math.round(doneTests.reduce((a, b) => a + b, 0) / doneTests.length)
    : null;
  const overallLevel = overallPct !== null ? getLevel(overallPct) : null;
  const ageLabel = ageGroup === "7_10" ? "7–10 лет" : "11–15 лет";
  const ageSubtitle = ageGroup === "7_10"
    ? "Короткие правила для важных ситуаций"
    : "Реальные ситуации: звонки, ссылки, коды";
  const isAutoDetected = ageSource === "profile";

  return (
    <div className="flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
        )}
        <div className="flex-1">
          <p className="font-bold text-slate-800 text-base leading-none">Тесты по безопасности</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{ageSubtitle}</p>
        </div>
        <button
          onClick={() => { setAgeGroup(null); setActiveTest(null); }}
          className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
            isAutoDetected
              ? "bg-violet-100 text-violet-600 hover:bg-violet-200"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
          title={isAutoDetected ? "Определено из профиля — нажми чтобы сменить" : "Нажми чтобы сменить группу"}
        >
          {isAutoDetected ? "👤 " : ""}{ageLabel} ↩
        </button>
      </div>

      {/* Уровень знаний */}
      {overallLevel && overallPct !== null && (
        <div className={`rounded-2xl p-4 ${overallLevel.bg} border border-white/60 flex items-center gap-3`}>
          <span className="text-3xl">{overallLevel.emoji}</span>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Твой уровень безопасности</p>
            <p className={`font-bold text-sm ${overallLevel.color}`}>{overallLevel.label}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-2xl font-black ${overallLevel.color}`}>{overallPct}%</p>
            <p className="text-[10px] text-slate-400">{doneTests.length} из {SAFETY_TESTS.length} тестов</p>
          </div>
        </div>
      )}

      {/* Карточки тестов */}
      <div className="flex flex-col gap-2.5">
        {SAFETY_TESTS.map(test => {
          const done = results[test.id] !== undefined;
          const pct = results[test.id];
          const lvl = done ? getLevel(pct) : null;
          const subtitle = ageGroup === "7_10" ? test.subtitle_7_10 : test.subtitle_11_15;

          return (
            <button
              key={test.id}
              onClick={() => { setActiveTest(test); track("kids_safety_test_start", { props: { test_id: test.id, age_group: ageGroup } }); }}
              className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 hover:shadow-sm transition group ${test.bgColor} ${test.borderColor}`}
            >
              <span className="text-2xl shrink-0">{test.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${test.color}`}>{test.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] bg-white/70 text-slate-500 px-2 py-0.5 rounded-full border border-white/80">
                    {test.questions.length} вопроса
                  </span>
                  {done && lvl && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.color}`}>
                      {lvl.emoji} {pct}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {done ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Star size={12} className="text-emerald-500 fill-emerald-400" />
                  </span>
                ) : (
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}