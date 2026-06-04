import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Star } from "lucide-react";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface SafetyTest {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  questions: Question[];
}

// ─── Данные тестов ────────────────────────────────────────────────────────────

const SAFETY_TESTS: SafetyTest[] = [
  {
    id: "fire",
    emoji: "🔥",
    title: "Пожар и ЧС",
    subtitle: "Что делать при опасных ситуациях",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badge: "Защита дома",
    questions: [
      {
        text: "Ты чувствуешь запах дыма дома. Что делаешь первым делом?",
        options: [
          "Ищу откуда дым и пробую потушить сам",
          "Зову взрослых или сразу звоню 112",
          "Открываю окно и жду",
          "Прячусь под кровать",
        ],
        correct: 1,
        explanation: "Всегда зови взрослых или звони 112. Не пытайся тушить самостоятельно — это опасно.",
      },
      {
        text: "В школе раздался сигнал пожарной тревоги. Как правильно выходить?",
        options: [
          "Бегу быстрее всех, чтобы успеть первым",
          "Беру все вещи и спокойно иду",
          "Спокойно иду к ближайшему выходу вместе с классом",
          "Прячусь в туалете, там безопаснее",
        ],
        correct: 2,
        explanation: "При эвакуации двигайся организованно с классом, без паники, к ближайшему выходу.",
      },
      {
        text: "Если дверь в комнату горячая на ощупь — что это значит?",
        options: [
          "Кто-то готовит еду на кухне",
          "За дверью огонь, открывать нельзя",
          "Это нормально, зимой всегда так",
          "Нужно открыть дверь и проверить",
        ],
        correct: 1,
        explanation: "Горячая дверь — сигнал что за ней огонь. Не открывай, ищи другой выход или зови о помощи через окно.",
      },
      {
        text: "Ты потерялся в незнакомом месте. Что делать?",
        options: [
          "Идти в любую сторону, пока не найду знакомое место",
          "Стоять на месте и плакать",
          "Обратиться к полицейскому, охраннику или остаться на месте и позвонить родителям",
          "Попросить помощи у первого встречного незнакомца",
        ],
        correct: 2,
        explanation: "Лучше всего — остаться на месте и позвонить родителям. Если нет телефона — обратись к полицейскому или охраннику в магазине.",
      },
    ],
  },
  {
    id: "scam",
    emoji: "📵",
    title: "Звонки и мошенники",
    subtitle: "Как не попасться на уловки",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    badge: "Финансовая защита",
    questions: [
      {
        text: "Тебе звонит незнакомый человек и говорит, что мама попала в беду и нужны деньги. Что делаешь?",
        options: [
          "Сразу отдаю деньги, ведь мама в опасности",
          "Кладу трубку и сразу звоню маме на её номер",
          "Спрашиваю сколько нужно денег",
          "Иду к соседям за деньгами",
        ],
        correct: 1,
        explanation: "Это классический обман! Всегда перезвони маме напрямую на её номер, чтобы убедиться что всё в порядке.",
      },
      {
        text: "Незнакомый человек в интернете просит назвать номер карты и код из SMS. Что делать?",
        options: [
          "Назову, если человек говорит что он из банка",
          "Никому и никогда не называть коды из SMS",
          "Назову только номер карты, но не код",
          "Назову если попросят вежливо",
        ],
        correct: 1,
        explanation: "Код из SMS — это ключ от твоих денег. Настоящий банк никогда не попросит его назвать!",
      },
      {
        text: "Тебе написали: «Ты выиграл iPhone! Заплати 100 рублей для получения». Это…",
        options: [
          "Настоящий выигрыш, надо платить",
          "Обман — настоящие призы не просят платить",
          "Могу проверить, заплатив небольшую сумму",
          "Зависит от суммы",
        ],
        correct: 1,
        explanation: "Если для получения «приза» просят деньги — это мошенничество. Настоящие выигрыши не требуют оплаты.",
      },
      {
        text: "Знакомый в соцсети просит срочно одолжить деньги. Что делаешь?",
        options: [
          "Сразу перевожу, ведь это знакомый",
          "Перевожу если попросит настойчиво",
          "Звоню ему на телефон чтобы убедиться что это точно он",
          "Прошу прислать фото с паспортом",
        ],
        correct: 2,
        explanation: "Аккаунт мог взломать мошенник. Всегда позвони человеку лично — настоящий друг поймёт.",
      },
    ],
  },
  {
    id: "internet",
    emoji: "🌐",
    title: "Интернет и безопасность",
    subtitle: "Правила в цифровом мире",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    badge: "Цифровая грамота",
    questions: [
      {
        text: "Ты получил ссылку от незнакомца: «Посмотри, это про тебя!». Что делаешь?",
        options: [
          "Открываю — интересно же!",
          "Открываю только если ссылка красивая",
          "Не открываю, спрошу у взрослого",
          "Открываю на всякий случай",
        ],
        correct: 2,
        explanation: "Подозрительные ссылки от незнакомцев могут украсть данные или заразить устройство. Спроси взрослого!",
      },
      {
        text: "Что нельзя рассказывать незнакомым людям в интернете?",
        options: [
          "Название своей любимой игры",
          "Свой адрес, школу и когда дома никого нет",
          "Что любишь смотреть в YouTube",
          "Какая у тебя любимая еда",
        ],
        correct: 1,
        explanation: "Адрес, расписание и личные данные — это то, что незнакомцам знать не нужно. Это может быть опасно.",
      },
      {
        text: "Кто-то в игре обзывает тебя и пишет злые слова. Что делать?",
        options: [
          "Обзываться в ответ",
          "Скрыть, заблокировать и рассказать взрослому",
          "Продолжать играть, не обращая внимания",
          "Дать ему свой номер телефона",
        ],
        correct: 1,
        explanation: "Кибербуллинг — это серьёзно. Блокируй, скрывай переписку и обязательно расскажи родителям или учителю.",
      },
      {
        text: "Хороший пароль — это:",
        options: [
          "Дата рождения: 12052015",
          "Твоё имя: Masha2015",
          "Набор букв, цифр и знаков: Kv!8mR#2",
          "Слово «пароль»",
        ],
        correct: 2,
        explanation: "Сложный пароль трудно угадать. Никогда не используй дату рождения или имя — их легко подобрать.",
      },
    ],
  },
  {
    id: "lost",
    emoji: "🗺️",
    title: "Если потерялся",
    subtitle: "Действия в опасной ситуации",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    badge: "Важные ситуации",
    questions: [
      {
        text: "Ты потерялся в торговом центре. Что делать прежде всего?",
        options: [
          "Выйти на улицу и искать дорогу домой",
          "Подойти к охраннику или на стойку информации",
          "Попросить помощи у первого незнакомого человека",
          "Ждать пока родители сами найдут",
        ],
        correct: 1,
        explanation: "Охранник или сотрудник информации — безопасный выбор. Они помогут объявить о тебе и связаться с родителями.",
      },
      {
        text: "Ты один дома и кто-то незнакомый звонит в дверь. Что делаешь?",
        options: [
          "Открываю — вдруг это важно",
          "Открываю посмотреть кто это",
          "Не открываю, говорю через дверь что родители заняты",
          "Молчу и прячусь",
        ],
        correct: 2,
        explanation: "Незнакомым дверь не открывай. Можно сказать через дверь что родители рядом — и позвонить им.",
      },
      {
        text: "Незнакомый взрослый предлагает тебе конфеты и зовёт «помочь найти щенка». Твои действия?",
        options: [
          "Иду помогать — щенок же потерялся",
          "Беру конфеты, но никуда не иду",
          "Говорю «нет» и быстро ухожу к людям или в безопасное место",
          "Спрашиваю как выглядит щенок",
        ],
        correct: 2,
        explanation: "Это классический способ заманить ребёнка. Говори твёрдо «нет», уходи и расскажи взрослым.",
      },
      {
        text: "Какую информацию важно знать наизусть на случай если потеряешься?",
        options: [
          "Логин от игры",
          "Номер телефона мамы или папы",
          "Адрес школы",
          "Номер автобуса до дома",
        ],
        correct: 1,
        explanation: "Выучи наизусть номер телефона хотя бы одного из родителей. Это самая важная информация в чрезвычайной ситуации.",
      },
    ],
  },
];

// ─── Компонент результата ─────────────────────────────────────────────────────

const LEVEL_CONFIG = [
  { min: 0,  max: 49,  label: "Начинающий",   emoji: "🌱", color: "text-slate-600",  bg: "bg-slate-100" },
  { min: 50, max: 74,  label: "Знает основы", emoji: "📘", color: "text-blue-600",   bg: "bg-blue-50" },
  { min: 75, max: 99,  label: "Уверенно знает", emoji: "⭐", color: "text-amber-600", bg: "bg-amber-50" },
  { min: 100, max: 100, label: "Эксперт!",     emoji: "🏆", color: "text-emerald-600", bg: "bg-emerald-50" },
];

function getLevel(pct: number) {
  return LEVEL_CONFIG.find(l => pct >= l.min && pct <= l.max) ?? LEVEL_CONFIG[0];
}

// ─── Экран теста ──────────────────────────────────────────────────────────────

interface TestScreenProps {
  test: SafetyTest;
  onBack: () => void;
  onComplete: (testId: string, pct: number) => void;
}

function TestScreen({ test, onBack, onComplete }: TestScreenProps) {
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const q = test.questions[current];
  const selected = answers[current];
  const isAnswered = selected !== undefined;
  const isLast = current === test.questions.length - 1;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [current]: idx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLast) {
      const correct = Object.entries(answers).filter(([qi, ai]) => test.questions[Number(qi)].correct === ai).length;
      const pct = Math.round((correct / test.questions.length) * 100);
      setStep("result");
      onComplete(test.id, pct);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const correct = Object.entries(answers).filter(([qi, ai]) => test.questions[Number(qi)].correct === ai).length;
  const pct = Math.round((correct / test.questions.length) * 100);
  const level = getLevel(pct);

  if (step === "result") {
    return (
      <div className="flex flex-col gap-4">
        {/* Результат */}
        <div className={`rounded-2xl p-5 text-center ${level.bg} border border-white/60`}>
          <div className="text-5xl mb-2">{level.emoji}</div>
          <p className={`font-bold text-base ${level.color}`}>{level.label}</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{pct}%</p>
          <p className="text-sm text-slate-500 mt-0.5">{correct} из {test.questions.length} правильно</p>
        </div>

        {/* Разбор ответов */}
        <div className="flex flex-col gap-2">
          {test.questions.map((question, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === question.correct;
            return (
              <div key={i} className={`rounded-xl p-3 border text-sm ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">{isCorrect ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-medium text-slate-700 leading-snug text-[12px]">{question.text}</p>
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

        {/* Кнопки */}
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
      {/* Прогресс */}
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
        <span className="text-xs text-slate-400 font-medium shrink-0">{current + 1}/{test.questions.length}</span>
      </div>

      {/* Вопрос */}
      <div className={`rounded-2xl p-4 ${test.bgColor} border ${test.borderColor}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{test.emoji}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${test.color}`}>{test.title}</span>
        </div>
        <p className="font-semibold text-slate-800 text-sm leading-snug">{q.text}</p>
      </div>

      {/* Варианты */}
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

      {/* Объяснение */}
      {showExplanation && (
        <div className={`rounded-xl px-3 py-2.5 text-[12px] leading-snug ${
          selected === q.correct
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          <span className="font-bold mr-1">{selected === q.correct ? "Верно! " : "Не совсем. "}</span>
          {q.explanation}
        </div>
      )}

      {/* Кнопка далее */}
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
}

export default function SafetyTests({ onBack }: SafetyTestsProps) {
  const [activeTest, setActiveTest] = useState<SafetyTest | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});

  const handleComplete = (testId: string, pct: number) => {
    setResults(prev => ({ ...prev, [testId]: pct }));
  };

  // Общий уровень — среднее по пройденным
  const doneTests = Object.values(results);
  const overallPct = doneTests.length > 0 ? Math.round(doneTests.reduce((a, b) => a + b, 0) / doneTests.length) : null;
  const overallLevel = overallPct !== null ? getLevel(overallPct) : null;

  if (activeTest) {
    return (
      <div className="flex flex-col gap-4">
        <TestScreen
          test={activeTest}
          onBack={() => setActiveTest(null)}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
        )}
        <div>
          <p className="font-bold text-slate-800 text-base leading-none">Тесты по безопасности</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Проверь что ты знаешь в важных ситуациях</p>
        </div>
      </div>

      {/* Уровень знаний (если хотя бы один тест пройден) */}
      {overallLevel && (
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

          return (
            <button
              key={test.id}
              onClick={() => setActiveTest(test)}
              className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 hover:shadow-sm transition group ${test.bgColor} ${test.borderColor}`}
            >
              <span className="text-2xl shrink-0">{test.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${test.color}`}>{test.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{test.subtitle}</p>
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
                <span className={`text-[10px] font-medium ${done ? "text-emerald-600" : "text-slate-400"}`}>
                  {done ? "Пройдено" : "Пройти"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      {doneTests.length < SAFETY_TESTS.length && (
        <p className="text-center text-[11px] text-slate-400">
          Пройди все тесты чтобы увидеть свой общий уровень знаний
        </p>
      )}
    </div>
  );
}
