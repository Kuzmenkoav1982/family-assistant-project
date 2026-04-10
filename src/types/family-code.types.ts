export interface NumerologyNumber {
  value: number;
  title: string;
  shortMeaning: string;
  fullDescription: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
  compatibleNumbers: number[];
  color: string;
}

export interface NumerologyProfile {
  lifePath: NumerologyNumber;
  destiny: NumerologyNumber;
  soul: NumerologyNumber;
  personality: NumerologyNumber;
  birthDay: NumerologyNumber;
  expression: NumerologyNumber;
  calculatedAt: string;
}

export interface PythagorasCell {
  number: number;
  count: number;
  digits: string;
  title: string;
  category: 'character' | 'energy' | 'interest' | 'health' | 'logic' | 'work' | 'luck' | 'duty' | 'memory';
  level: 'none' | 'weak' | 'normal' | 'strong' | 'excessive';
  meaning: string;
  advice: string;
}

export interface PythagorasLine {
  name: string;
  type: 'row' | 'column' | 'diagonal';
  strength: number;
  meaning: string;
  isActive: boolean;
}

export interface PythagorasSquare {
  cells: PythagorasCell[];
  rows: PythagorasLine[];
  columns: PythagorasLine[];
  diagonals: PythagorasLine[];
  workingNumbers: number[];
  additionalNumbers: number[];
  summary: string;
  dominantTraits: string[];
  weakTraits: string[];
}

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type ChineseAnimal =
  | 'rat' | 'ox' | 'tiger' | 'rabbit'
  | 'dragon' | 'snake' | 'horse' | 'goat'
  | 'monkey' | 'rooster' | 'dog' | 'pig';

export type Element = 'fire' | 'earth' | 'air' | 'water' | 'wood' | 'metal';

export interface AstrologyProfile {
  zodiacSign: ZodiacSign;
  zodiacSignLabel: string;
  zodiacEmoji: string;
  zodiacElement: Element;
  zodiacPlanet: string;
  zodiacDescription: string;
  chineseAnimal: ChineseAnimal;
  chineseAnimalLabel: string;
  chineseAnimalEmoji: string;
  chineseElement: Element;
  chineseYinYang: 'yin' | 'yang';
  chineseDescription: string;
  calculatedAt: string;
}

export type TarotArcana =
  | 'fool' | 'magician' | 'highPriestess' | 'empress' | 'emperor'
  | 'hierophant' | 'lovers' | 'chariot' | 'strength' | 'hermit'
  | 'wheelOfFortune' | 'justice' | 'hangedMan' | 'death' | 'temperance'
  | 'devil' | 'tower' | 'star' | 'moon' | 'sun'
  | 'judgement' | 'world';

export interface TarotCard {
  id: TarotArcana;
  number: number;
  name: string;
  emoji: string;
  keywords: string[];
  meaning: string;
  advice: string;
}

export interface DestinyMatrix {
  personalityCard: TarotCard;
  soulCard: TarotCard;
  karmaCard: TarotCard;
  destinyCard: TarotCard;
  mission: string;
}

export interface CompatibilityScore {
  overall: number;
  numerology: number;
  astrology: number;
  psychology: number;
  elements: number;
}

export interface CompatibilityResult {
  member1Id: string;
  member2Id: string;
  member1Name: string;
  member2Name: string;
  score: CompatibilityScore;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
  loveLanguageMatch: number;
  conflictZones: string[];
  growthAreas: string[];
  rituals: string[];
  calculatedAt: string;
}

export interface FamilyCodeAnalysis {
  memberId: string;
  memberName: string;
  birthDate: string;
  numerology?: NumerologyProfile;
  pythagoras?: PythagorasSquare;
  astrology?: AstrologyProfile;
  destinyMatrix?: DestinyMatrix;
  summary?: string;
  calculatedAt: string;
}

export interface BioRhythm {
  date: string;
  physical: number;
  emotional: number;
  intellectual: number;
  isPhysicalCritical: boolean;
  isEmotionalCritical: boolean;
  isIntellectualCritical: boolean;
}

export interface PowerDay {
  date: string;
  score: number;
  reason: string;
  recommendations: string[];
}
