import { calculateDestiny, calculateSoul, calculatePersonality, calculateLifePath, reduceToSingleDigit, getNumberInfo, calculateNumerologyCompatibility } from '@/lib/numerology';

export interface NameAnalysis {
  name: string;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  destinyInfo: ReturnType<typeof getNumberInfo>;
  soulInfo: ReturnType<typeof getNumberInfo>;
  personalityInfo: ReturnType<typeof getNumberInfo>;
  compatWithParent1: number;
  compatWithParent2: number;
  avgCompat: number;
  familyHarmony: number;
}

export function analyzeName(
  childName: string,
  parent1Name: string,
  parent1BirthDate: string,
  parent2Name: string,
  parent2BirthDate: string,
  expectedBirthDate?: string
): NameAnalysis {
  const destinyNumber = calculateDestiny(childName);
  const soulNumber = calculateSoul(childName);
  const personalityNumber = calculatePersonality(childName);

  const p1LifePath = calculateLifePath(parent1BirthDate);
  const p2LifePath = calculateLifePath(parent2BirthDate);

  const p1Destiny = calculateDestiny(parent1Name);
  const p2Destiny = calculateDestiny(parent2Name);

  const compatDest1 = calculateNumerologyCompatibility(destinyNumber, p1Destiny);
  const compatDest2 = calculateNumerologyCompatibility(destinyNumber, p2Destiny);
  const compatPath1 = calculateNumerologyCompatibility(destinyNumber, p1LifePath);
  const compatPath2 = calculateNumerologyCompatibility(destinyNumber, p2LifePath);

  const compatWithParent1 = Math.round((compatDest1 + compatPath1) / 2);
  const compatWithParent2 = Math.round((compatDest2 + compatPath2) / 2);
  const avgCompat = Math.round((compatWithParent1 + compatWithParent2) / 2);

  let familyHarmony = avgCompat;
  if (expectedBirthDate) {
    const childLifePath = calculateLifePath(expectedBirthDate);
    const extraCompat1 = calculateNumerologyCompatibility(childLifePath, p1LifePath);
    const extraCompat2 = calculateNumerologyCompatibility(childLifePath, p2LifePath);
    familyHarmony = Math.round((avgCompat + extraCompat1 + extraCompat2) / 3);
  }

  return {
    name: childName,
    destinyNumber,
    soulNumber,
    personalityNumber,
    destinyInfo: getNumberInfo(destinyNumber),
    soulInfo: getNumberInfo(soulNumber),
    personalityInfo: getNumberInfo(personalityNumber),
    compatWithParent1,
    compatWithParent2,
    avgCompat,
    familyHarmony,
  };
}

const POPULAR_NAMES = {
  male: ['Александр', 'Михаил', 'Максим', 'Артём', 'Дмитрий', 'Иван', 'Кирилл', 'Даниил', 'Андрей', 'Егор', 'Никита', 'Илья', 'Матвей', 'Тимофей', 'Роман', 'Владимир', 'Фёдор', 'Лев', 'Марк', 'Сергей'],
  female: ['Анна', 'Мария', 'София', 'Алиса', 'Виктория', 'Полина', 'Елизавета', 'Екатерина', 'Дарья', 'Варвара', 'Ксения', 'Ева', 'Вероника', 'Милана', 'Арина', 'Валерия', 'Ульяна', 'Кира', 'Маргарита', 'Таисия'],
};

export function getTopNames(
  gender: 'male' | 'female',
  parent1Name: string,
  parent1BirthDate: string,
  parent2Name: string,
  parent2BirthDate: string,
  expectedBirthDate?: string,
  count: number = 10
): NameAnalysis[] {
  const names = POPULAR_NAMES[gender];
  const results = names.map(name =>
    analyzeName(name, parent1Name, parent1BirthDate, parent2Name, parent2BirthDate, expectedBirthDate)
  );
  results.sort((a, b) => b.familyHarmony - a.familyHarmony);
  return results.slice(0, count);
}
