import type { FamilyMember, MemberProfile } from '@/types/family.types';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { calculateNumerologyProfile } from '@/lib/numerology';

export interface ReconciliationScenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
  timing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  basedOn: string;
}

const LOVE_LANG_LABELS: Record<string, string> = {
  words_of_affirmation: 'Слова поддержки',
  quality_time: 'Время вместе',
  receiving_gifts: 'Подарки',
  acts_of_service: 'Помощь делом',
  physical_touch: 'Прикосновения',
};

function getRitualsForLoveLanguage(lang: string, partnerName: string): ReconciliationScenario {
  const scenarios: Record<string, ReconciliationScenario> = {
    words_of_affirmation: {
      id: 'words', title: 'Письмо примирения', icon: '💌',
      description: `${partnerName} ценит слова. Напишите искреннее сообщение — оно подействует сильнее любого подарка.`,
      steps: [
        'Напишите от руки (не в мессенджере) короткое письмо',
        'Начните с «Я ценю тебя за...» — конкретные качества',
        'Признайте свою часть вины без оправданий',
        'Завершите словами о том, что для вас значат эти отношения',
        'Положите письмо на видное место и уйдите — дайте прочитать наедине'
      ],
      timing: 'Лучше утром, когда эмоции улеглись', difficulty: 'easy',
      basedOn: 'Язык любви: Слова поддержки'
    },
    quality_time: {
      id: 'time', title: 'Свидание-перезагрузка', icon: '🌅',
      description: `${partnerName} ценит время вместе. После ссоры предложите провести вечер только вдвоём.`,
      steps: [
        'Предложите: «Давай сегодня вечером будем только мы — без телефонов»',
        'Приготовьте ужин вместе или закажите любимую еду',
        'Во время ужина поговорите — но не о ссоре, а о приятных воспоминаниях',
        'Прогуляйтесь вместе перед сном',
        'Только после этого можно аккуратно обсудить ситуацию'
      ],
      timing: 'Вечер того же дня или следующего', difficulty: 'medium',
      basedOn: 'Язык любви: Время вместе'
    },
    receiving_gifts: {
      id: 'gifts', title: 'Символический сюрприз', icon: '🎁',
      description: `${partnerName} ценит внимание через подарки. Маленький сюрприз скажет больше тысячи слов.`,
      steps: [
        'Купите что-то маленькое, но значимое (любимый десерт, цветок, мелочь из хобби)',
        'Приложите записку: «Подумал(а) о тебе»',
        'Оставьте там, где партнёр найдёт — на подушке, в сумке, на столе',
        'Не ждите мгновенной реакции — дайте время',
        'Когда партнёр подойдёт — просто обнимите'
      ],
      timing: 'Через несколько часов после ссоры', difficulty: 'easy',
      basedOn: 'Язык любви: Подарки'
    },
    acts_of_service: {
      id: 'service', title: 'Молчаливая забота', icon: '🛠️',
      description: `${partnerName} ценит помощь делом. Сделайте то, что обычно делает партнёр — без просьб и ожидания благодарности.`,
      steps: [
        'Определите домашнее дело, которое обычно на партнёре',
        'Сделайте его молча и качественно (стирка, уборка, готовка, починка)',
        'Не говорите «Вот, я сделал!» — пусть заметит сам(а)',
        'Если спросит — скажите просто: «Хотел(а) помочь»',
        'Это ваш способ сказать «Я забочусь о тебе»'
      ],
      timing: 'В тот же день, пока эмоции ещё свежие', difficulty: 'easy',
      basedOn: 'Язык любви: Помощь делом'
    },
    physical_touch: {
      id: 'touch', title: 'Объятие без слов', icon: '🤗',
      description: `${partnerName} ценит тактильный контакт. Иногда одно объятие решает больше, чем часовой разговор.`,
      steps: [
        'Подойдите молча и обнимите — крепко, не отпуская минимум 20 секунд',
        'Не говорите ничего в первый момент — просто держите',
        'Если партнёр напряжён — не отпускайте, гладьте по спине',
        'Шепните: «Я рядом. Мне важны наши отношения»',
        'Предложите посидеть вместе, держась за руки — и потом поговорить'
      ],
      timing: 'Когда оба немного остыли (30-60 минут после ссоры)', difficulty: 'easy',
      basedOn: 'Язык любви: Прикосновения'
    },
  };
  return scenarios[lang] || scenarios.physical_touch;
}

function getElementRitual(element: string, name: string): ReconciliationScenario {
  const rituals: Record<string, ReconciliationScenario> = {
    'Огонь': {
      id: 'fire-cool', title: 'Охлаждение пламени', icon: '🔥',
      description: `${name} — огненный знак. После ссоры ему/ей нужно выпустить пар, а потом переключиться.`,
      steps: [
        'Дайте 30-40 минут на остывание — не преследуйте',
        'Предложите физическую активность вместе: прогулка, спорт, танцы',
        'Огненные знаки быстро вспыхивают и быстро прощают',
        'Не поднимайте тему ссоры первым — подождите, пока энергия сменится',
        'Юмор и лёгкость помогут разрядить обстановку'
      ],
      timing: 'Через 30-40 минут', difficulty: 'medium',
      basedOn: `Стихия: Огонь (${name})`
    },
    'Земля': {
      id: 'earth-stable', title: 'Возврат к стабильности', icon: '🌍',
      description: `${name} — земной знак. Ценит стабильность и конкретику. Абстрактные извинения не подойдут.`,
      steps: [
        'Признайте конкретный поступок: «Я был неправ, когда...»',
        'Предложите конкретное решение, чтобы это не повторилось',
        'Не давите эмоционально — земные знаки ценят спокойствие',
        'Покажите делом, а не словами — приготовьте ужин, помогите с задачей',
        'Дайте время на обработку — земля медленно остывает'
      ],
      timing: 'На следующий день утром', difficulty: 'medium',
      basedOn: `Стихия: Земля (${name})`
    },
    'Воздух': {
      id: 'air-talk', title: 'Открытый диалог', icon: '💨',
      description: `${name} — воздушный знак. Нуждается в разговоре и логическом разборе ситуации.`,
      steps: [
        'Предложите спокойно обсудить: «Давай поговорим, когда будешь готов(а)»',
        'Изложите свою позицию логично, без эмоциональных обвинений',
        'Выслушайте — воздушные знаки хотят быть услышанными',
        'Найдите компромисс, который устроит обоих',
        'После разговора — лёгкий совместный досуг для переключения'
      ],
      timing: 'Через 1-2 часа', difficulty: 'easy',
      basedOn: `Стихия: Воздух (${name})`
    },
    'Вода': {
      id: 'water-feel', title: 'Эмоциональное принятие', icon: '💧',
      description: `${name} — водный знак. Глубоко чувствует и долго переживает. Нужна эмпатия, а не логика.`,
      steps: [
        'Подойдите мягко: «Я вижу, что тебе плохо. Мне тоже»',
        'Не пытайтесь логически объяснить — просто примите чувства',
        'Скажите: «Я понимаю, почему ты расстроен(а)» — даже если не согласны',
        'Побудьте рядом молча — водным знакам нужно присутствие',
        'Предложите тёплый чай, плед, тихий вечер — создайте ощущение безопасности'
      ],
      timing: 'Когда увидите, что слёзы высохли', difficulty: 'hard',
      basedOn: `Стихия: Вода (${name})`
    },
  };
  return rituals[element] || rituals['Вода'];
}

export function generateReconciliationScenarios(
  member1: FamilyMember,
  member2: FamilyMember
): ReconciliationScenario[] {
  const scenarios: ReconciliationScenario[] = [];
  const bd1 = member1.birth_date || member1.birthDate;
  const bd2 = member2.birth_date || member2.birthDate;

  const ll2 = member2.profile?.loveLanguages || [];
  if (ll2.length > 0) {
    scenarios.push(getRitualsForLoveLanguage(ll2[0], member2.name));
  }

  const ll1 = member1.profile?.loveLanguages || [];
  if (ll1.length > 0 && ll1[0] !== ll2[0]) {
    scenarios.push(getRitualsForLoveLanguage(ll1[0], member1.name));
  }

  if (bd2) {
    const astro2 = calculateAstrologyProfile(bd2);
    if (astro2) {
      scenarios.push(getElementRitual(getElementLabel(astro2.zodiacElement), member2.name));
    }
  }

  if (bd1) {
    const num1 = calculateNumerologyProfile(member1.name, bd1);
    if (num1.lifePath.value === 1 || num1.lifePath.value === 8) {
      scenarios.push({
        id: 'leader-humble', title: 'Шаг навстречу лидера', icon: '👑',
        description: `${member1.name} (число ${num1.lifePath.value}) — по натуре лидер. Для примирения важно показать уязвимость.`,
        steps: [
          'Скажите: «Мне трудно это говорить, но я был(а) неправ(а)»',
          'Для лидеров признание ошибки — акт силы, а не слабости',
          'Предложите конкретный план действий на будущее',
          'Покажите, что цените мнение партнёра'
        ],
        timing: 'Когда будете готовы к честности', difficulty: 'hard',
        basedOn: `Нумерология: число ${num1.lifePath.value} (${num1.lifePath.title})`
      });
    }
  }

  if (scenarios.length === 0) {
    scenarios.push({
      id: 'universal', title: 'Универсальное примирение', icon: '💜',
      description: 'Базовый сценарий примирения, который работает для всех.',
      steps: [
        'Дайте обоим остыть — минимум 20-30 минут в разных комнатах',
        'Подойдите первым: «Мне не нравится, когда мы ссоримся»',
        'Признайте свою часть: «Я понимаю, что мог(ла) быть неправ(а) в...»',
        'Выслушайте партнёра без перебивания',
        'Обнимитесь и договоритесь о конкретных действиях'
      ],
      timing: 'Через 20-30 минут после ссоры', difficulty: 'medium',
      basedOn: 'Универсальный сценарий'
    });
  }

  return scenarios;
}
