import type { NumerologyNumber, NumerologyProfile } from '@/types/family-code.types';

const MASTER_NUMBERS = [11, 22, 33];

const LETTER_VALUES: Record<string, number> = {
  'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5, 'е': 6, 'ё': 7, 'ж': 8, 'з': 9,
  'и': 1, 'й': 2, 'к': 3, 'л': 4, 'м': 5, 'н': 6, 'о': 7, 'п': 8, 'р': 9,
  'с': 1, 'т': 2, 'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7, 'ш': 8, 'щ': 9,
  'ъ': 1, 'ы': 2, 'ь': 3, 'э': 4, 'ю': 5, 'я': 6,
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
  'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
  's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
};

const RUSSIAN_VOWELS = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
const ENGLISH_VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];

export function reduceToSingleDigit(num: number, keepMasterNumbers = true): number {
  while (num > 9) {
    if (keepMasterNumbers && MASTER_NUMBERS.includes(num)) {
      return num;
    }
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

export function calculateLifePath(birthDate: string): number {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return 0;

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);

  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

export function calculateBirthDay(birthDate: string): number {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return 0;
  return reduceToSingleDigit(date.getDate());
}

function sumLetters(text: string, filter?: (char: string) => boolean): number {
  const normalized = text.toLowerCase().replace(/[^а-яёa-z]/g, '');
  let sum = 0;
  for (const char of normalized) {
    if (filter && !filter(char)) continue;
    sum += LETTER_VALUES[char] || 0;
  }
  return sum;
}

export function calculateDestiny(fullName: string): number {
  if (!fullName) return 0;
  return reduceToSingleDigit(sumLetters(fullName));
}

export function calculateSoul(fullName: string): number {
  if (!fullName) return 0;
  const isVowel = (char: string) =>
    RUSSIAN_VOWELS.includes(char) || ENGLISH_VOWELS.includes(char);
  return reduceToSingleDigit(sumLetters(fullName, isVowel));
}

export function calculatePersonality(fullName: string): number {
  if (!fullName) return 0;
  const isConsonant = (char: string) =>
    !RUSSIAN_VOWELS.includes(char) && !ENGLISH_VOWELS.includes(char);
  return reduceToSingleDigit(sumLetters(fullName, isConsonant));
}

export function calculateExpression(fullName: string, birthDate: string): number {
  const destiny = calculateDestiny(fullName);
  const lifePath = calculateLifePath(birthDate);
  return reduceToSingleDigit(destiny + lifePath);
}

const NUMBER_MEANINGS: Record<number, Omit<NumerologyNumber, 'value' | 'title'>> = {
  1: {
    shortMeaning: 'Лидер, первопроходец',
    fullDescription: 'Единица — число лидера, инициативы и независимости. Люди с этим числом рождены вести за собой, быть первыми и прокладывать новые пути. Они обладают сильной волей, целеустремлённостью и способностью действовать решительно.',
    strengths: ['Лидерские качества', 'Независимость', 'Целеустремлённость', 'Смелость', 'Инициативность', 'Оригинальность'],
    weaknesses: ['Упрямство', 'Эгоизм', 'Нетерпимость к критике', 'Склонность к диктаторству', 'Одиночество'],
    advice: 'Учитесь слушать других и принимать помощь. Ваша сила в умении вести, но иногда нужно уметь следовать. Развивайте эмпатию.',
    compatibleNumbers: [1, 5, 7],
    color: 'from-red-500 to-orange-500'
  },
  2: {
    shortMeaning: 'Дипломат, миротворец',
    fullDescription: 'Двойка — число партнёрства, баланса и гармонии. Люди этого числа обладают тонкой интуицией, дипломатичностью и способностью находить компромиссы. Они прекрасные посредники и миротворцы.',
    strengths: ['Дипломатичность', 'Интуиция', 'Чуткость', 'Терпение', 'Сотрудничество', 'Гармония'],
    weaknesses: ['Нерешительность', 'Излишняя чувствительность', 'Зависимость от мнения других', 'Пассивность'],
    advice: 'Развивайте уверенность в себе. Ваша мягкость — сила, но учитесь отстаивать свои интересы. Доверяйте интуиции.',
    compatibleNumbers: [2, 4, 8],
    color: 'from-blue-400 to-cyan-500'
  },
  3: {
    shortMeaning: 'Творец, оптимист',
    fullDescription: 'Тройка — число творчества, самовыражения и радости. Эти люди талантливы, харизматичны и обладают даром слова. Они дарят окружающим вдохновение и позитивную энергию.',
    strengths: ['Креативность', 'Коммуникабельность', 'Оптимизм', 'Артистизм', 'Чувство юмора', 'Обаяние'],
    weaknesses: ['Поверхностность', 'Разбросанность', 'Непостоянство', 'Склонность к преувеличениям'],
    advice: 'Учитесь доводить начатое до конца. Ваш талант — в общении и творчестве, но дисциплина поможет достичь большего.',
    compatibleNumbers: [3, 6, 9],
    color: 'from-yellow-400 to-orange-400'
  },
  4: {
    shortMeaning: 'Строитель, практик',
    fullDescription: 'Четвёрка — число стабильности, порядка и труда. Люди с этим числом — надёжные, практичные и трудолюбивые. Они строят крепкий фундамент для себя и своей семьи.',
    strengths: ['Надёжность', 'Трудолюбие', 'Практичность', 'Дисциплина', 'Честность', 'Упорство'],
    weaknesses: ['Консерватизм', 'Упрямство', 'Негибкость', 'Склонность к рутине', 'Педантизм'],
    advice: 'Позволяйте себе быть спонтанным. Жизнь — не только работа. Найдите время для отдыха, игры и творчества.',
    compatibleNumbers: [2, 4, 8],
    color: 'from-green-600 to-emerald-700'
  },
  5: {
    shortMeaning: 'Искатель приключений',
    fullDescription: 'Пятёрка — число свободы, перемен и приключений. Эти люди любознательны, общительны и не терпят рутины. Им нужна свобода и разнообразие во всём.',
    strengths: ['Адаптивность', 'Любознательность', 'Энергичность', 'Харизма', 'Умение общаться', 'Смелость'],
    weaknesses: ['Непостоянство', 'Импульсивность', 'Непоседливость', 'Склонность к излишествам'],
    advice: 'Учитесь концентрироваться на главном. Ваша свобода не должна превращаться в бегство от ответственности.',
    compatibleNumbers: [1, 5, 7],
    color: 'from-teal-400 to-cyan-500'
  },
  6: {
    shortMeaning: 'Хранитель очага',
    fullDescription: 'Шестёрка — число любви, семьи и ответственности. Это прирождённые хранители очага, заботливые родители и верные партнёры. Для них семья — высшая ценность.',
    strengths: ['Заботливость', 'Ответственность', 'Любовь к семье', 'Гармоничность', 'Щедрость', 'Надёжность'],
    weaknesses: ['Чрезмерная опека', 'Жертвенность', 'Склонность к переживаниям', 'Ревность'],
    advice: 'Заботьтесь о себе так же, как о других. Отпускайте близких, давайте им свободу. Ваша любовь не должна превращаться в контроль.',
    compatibleNumbers: [3, 6, 9],
    color: 'from-pink-400 to-rose-500'
  },
  7: {
    shortMeaning: 'Мудрец, мыслитель',
    fullDescription: 'Семёрка — число мудрости, духовности и анализа. Эти люди обладают глубоким умом, склонны к самопознанию и поиску истины. Они — философы по натуре.',
    strengths: ['Интеллект', 'Интуиция', 'Духовность', 'Аналитический ум', 'Мудрость', 'Проницательность'],
    weaknesses: ['Замкнутость', 'Скептицизм', 'Отчуждённость', 'Пессимизм', 'Одиночество'],
    advice: 'Делитесь своей мудростью с миром. Не замыкайтесь в себе — люди нуждаются в вашей проницательности.',
    compatibleNumbers: [1, 5, 7],
    color: 'from-indigo-500 to-purple-600'
  },
  8: {
    shortMeaning: 'Магнат, стратег',
    fullDescription: 'Восьмёрка — число власти, успеха и материального благополучия. Эти люди — прирождённые лидеры бизнеса, стратеги и реалисты. Они умеют превращать идеи в деньги.',
    strengths: ['Амбициозность', 'Деловая хватка', 'Решительность', 'Организованность', 'Справедливость', 'Эффективность'],
    weaknesses: ['Материализм', 'Жёсткость', 'Властность', 'Эмоциональная закрытость'],
    advice: 'Не забывайте о духовной стороне жизни. Деньги — инструмент, а не цель. Учитесь быть уязвимым с близкими.',
    compatibleNumbers: [2, 4, 8],
    color: 'from-gray-700 to-slate-900'
  },
  9: {
    shortMeaning: 'Гуманист, философ',
    fullDescription: 'Девятка — число мудрости, сострадания и универсальной любви. Эти люди — гуманисты по натуре, они стремятся помогать миру и обладают широким кругозором.',
    strengths: ['Великодушие', 'Мудрость', 'Творческий потенциал', 'Сострадание', 'Идеализм', 'Альтруизм'],
    weaknesses: ['Излишний идеализм', 'Эмоциональность', 'Склонность к жертвенности', 'Рассеянность'],
    advice: 'Помогая миру, не забывайте о себе. Учитесь говорить «нет» и устанавливать границы. Ваша миссия — вдохновлять.',
    compatibleNumbers: [3, 6, 9],
    color: 'from-purple-500 to-pink-500'
  },
  11: {
    shortMeaning: 'Мастер-число: Визионер',
    fullDescription: 'Одиннадцать — мастер-число интуиции, духовного озарения и вдохновения. Эти люди обладают повышенной чувствительностью и даром предвидения. Они пришли в мир, чтобы вдохновлять других.',
    strengths: ['Высокая интуиция', 'Вдохновение', 'Духовность', 'Эмпатия', 'Харизма', 'Творческий потенциал'],
    weaknesses: ['Тревожность', 'Эмоциональная нестабильность', 'Сверхчувствительность', 'Нервозность'],
    advice: 'Ваша миссия — служить высшей цели. Развивайте интуицию, но заземляйтесь в практике. Медитация поможет найти баланс.',
    compatibleNumbers: [2, 11, 22],
    color: 'from-violet-500 via-purple-500 to-fuchsia-500'
  },
  22: {
    shortMeaning: 'Мастер-число: Архитектор',
    fullDescription: 'Двадцать два — мастер-число мастера-строителя. Эти люди способны превращать самые смелые мечты в реальность. Они — архитекторы больших проектов и великих свершений.',
    strengths: ['Визионерство', 'Практичность', 'Организаторский талант', 'Лидерство', 'Масштабное мышление'],
    weaknesses: ['Перфекционизм', 'Давление ответственности', 'Трудоголизм', 'Высокие требования'],
    advice: 'Вы способны на великое, но не забывайте о себе и близких. Делегируйте. Большая сила требует большой ответственности.',
    compatibleNumbers: [4, 11, 22],
    color: 'from-amber-500 via-orange-500 to-red-500'
  },
  33: {
    shortMeaning: 'Мастер-число: Учитель',
    fullDescription: 'Тридцать три — мастер-число учителя, число безусловной любви и духовного служения. Это самое редкое и мощное число в нумерологии.',
    strengths: ['Безусловная любовь', 'Целительство', 'Мудрость', 'Служение', 'Вдохновение', 'Духовность'],
    weaknesses: ['Бремя ответственности', 'Самопожертвование', 'Эмоциональное выгорание'],
    advice: 'Ваша миссия — служение человечеству через любовь. Но помните: чтобы дарить, нужно самому быть наполненным.',
    compatibleNumbers: [6, 9, 33],
    color: 'from-rose-500 via-pink-500 to-purple-500'
  }
};

function getNumberTitle(value: number): string {
  const titles: Record<number, string> = {
    1: 'Лидер',
    2: 'Дипломат',
    3: 'Творец',
    4: 'Строитель',
    5: 'Искатель',
    6: 'Хранитель',
    7: 'Мудрец',
    8: 'Магнат',
    9: 'Гуманист',
    11: 'Визионер',
    22: 'Архитектор',
    33: 'Учитель'
  };
  return titles[value] || 'Неизвестно';
}

export function getNumberInfo(value: number): NumerologyNumber {
  const meaning = NUMBER_MEANINGS[value] || NUMBER_MEANINGS[1];
  return {
    value,
    title: getNumberTitle(value),
    ...meaning
  };
}

export function calculateNumerologyProfile(
  fullName: string,
  birthDate: string
): NumerologyProfile {
  const lifePathValue = calculateLifePath(birthDate);
  const destinyValue = calculateDestiny(fullName);
  const soulValue = calculateSoul(fullName);
  const personalityValue = calculatePersonality(fullName);
  const birthDayValue = calculateBirthDay(birthDate);
  const expressionValue = calculateExpression(fullName, birthDate);

  return {
    lifePath: getNumberInfo(lifePathValue),
    destiny: getNumberInfo(destinyValue),
    soul: getNumberInfo(soulValue),
    personality: getNumberInfo(personalityValue),
    birthDay: getNumberInfo(birthDayValue),
    expression: getNumberInfo(expressionValue),
    calculatedAt: new Date().toISOString()
  };
}

export function calculateNumerologyCompatibility(num1: number, num2: number): number {
  if (num1 === num2) return 90;

  const info1 = getNumberInfo(num1);
  if (info1.compatibleNumbers.includes(num2)) return 85;

  const diff = Math.abs(num1 - num2);
  if (diff === 0) return 90;
  if (diff <= 2) return 70;
  if (diff <= 4) return 55;
  return 40;
}
