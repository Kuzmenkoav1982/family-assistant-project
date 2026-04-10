import type { PythagorasCell, PythagorasLine, PythagorasSquare } from '@/types/family-code.types';

const CELL_META: Record<number, { title: string; category: PythagorasCell['category'] }> = {
  1: { title: 'Характер', category: 'character' },
  2: { title: 'Энергия', category: 'energy' },
  3: { title: 'Интерес к науке', category: 'interest' },
  4: { title: 'Здоровье', category: 'health' },
  5: { title: 'Логика, интуиция', category: 'logic' },
  6: { title: 'Труд, умелые руки', category: 'work' },
  7: { title: 'Удача, талант', category: 'luck' },
  8: { title: 'Чувство долга', category: 'duty' },
  9: { title: 'Память, ум', category: 'memory' }
};

const CELL_MEANINGS: Record<number, Record<PythagorasCell['level'], { meaning: string; advice: string }>> = {
  1: {
    none: { meaning: 'Мягкий, уступчивый характер. Нет стремления к лидерству.', advice: 'Развивайте уверенность в себе, учитесь отстаивать свою точку зрения.' },
    weak: { meaning: 'Спокойный характер, но может быть нерешительным.', advice: 'Прокачивайте силу воли через небольшие вызовы.' },
    normal: { meaning: 'Уравновешенный характер, умеет находить компромиссы.', advice: 'Поддерживайте баланс, не позволяйте себя манипулировать.' },
    strong: { meaning: 'Сильный волевой характер, лидерские качества.', advice: 'Учитесь слышать других, не становитесь деспотом.' },
    excessive: { meaning: 'Диктаторский характер, склонность к авторитарности.', advice: 'Работайте над эмпатией и умением идти на уступки.' }
  },
  2: {
    none: { meaning: 'Низкий уровень жизненной энергии, быстрая утомляемость.', advice: 'Спорт, правильное питание, режим сна критически важны.' },
    weak: { meaning: 'Сниженная энергия, избегание активных действий.', advice: 'Регулярная физическая активность зарядит вас.' },
    normal: { meaning: 'Достаточный запас энергии для обычной жизни.', advice: 'Поддерживайте энергию через здоровый образ жизни.' },
    strong: { meaning: 'Высокий уровень энергии, активность, выносливость.', advice: 'Направляйте энергию в созидательные проекты.' },
    excessive: { meaning: 'Гиперактивность, неусидчивость, склонность к импульсам.', advice: 'Учитесь концентрации через медитацию и спорт.' }
  },
  3: {
    none: { meaning: 'Нет врождённого интереса к наукам и точным дисциплинам.', advice: 'Найдите область знаний, которая вас зажигает.' },
    weak: { meaning: 'Поверхностный интерес к учёбе и саморазвитию.', advice: 'Попробуйте разные направления, чтобы найти своё.' },
    normal: { meaning: 'Здоровый интерес к знаниям, любознательность.', advice: 'Не останавливайтесь в развитии — учитесь всю жизнь.' },
    strong: { meaning: 'Большая тяга к науке, аналитический склад ума.', advice: 'Развивайте ум, делитесь знаниями с другими.' },
    excessive: { meaning: 'Фанатизм в обучении, может уходить в теорию от жизни.', advice: 'Применяйте знания на практике, не уходите в отрыв.' }
  },
  4: {
    none: { meaning: 'Слабое здоровье с рождения, требуется особое внимание.', advice: 'Регулярные обследования, здоровый образ жизни обязательны.' },
    weak: { meaning: 'Здоровье среднее, восприимчивость к болезням.', advice: 'Профилактика и режим помогут избежать проблем.' },
    normal: { meaning: 'Нормальное здоровье при правильном уходе.', advice: 'Поддерживайте форму через спорт и питание.' },
    strong: { meaning: 'Крепкое здоровье, выносливость, хороший иммунитет.', advice: 'Используйте свой ресурс разумно, не злоупотребляйте.' },
    excessive: { meaning: 'Очень крепкое здоровье, спортивные данные.', advice: 'Ваш ресурс огромен — направьте его на великие цели.' }
  },
  5: {
    none: { meaning: 'Слабая интуиция, полагаетесь только на логику.', advice: 'Доверяйте внутреннему голосу, практикуйте медитацию.' },
    weak: { meaning: 'Интуиция есть, но часто игнорируется.', advice: 'Учитесь слушать себя, записывайте предчувствия.' },
    normal: { meaning: 'Баланс логики и интуиции.', advice: 'Используйте оба инструмента в принятии решений.' },
    strong: { meaning: 'Сильная интуиция, проницательность, дар предвидения.', advice: 'Развивайте дар, он поможет вам и другим.' },
    excessive: { meaning: 'Гиперинтуиция, может уводить от реальности.', advice: 'Балансируйте интуицию с практикой и логикой.' }
  },
  6: {
    none: { meaning: 'Нет склонности к физическому труду, «белые ручки».', advice: 'Освойте хотя бы базовые навыки самообслуживания.' },
    weak: { meaning: 'Физический труд возможен, но без удовольствия.', advice: 'Найдите творческое применение рукам — хобби поможет.' },
    normal: { meaning: 'Умеете работать руками, практичны.', advice: 'Развивайте ремесленные навыки — они всегда нужны.' },
    strong: { meaning: 'Золотые руки, талант к ручному труду, мастерство.', advice: 'Ваш дар бесценен — создавайте, стройте, мастерите.' },
    excessive: { meaning: 'Трудоголизм, может игнорировать интеллектуальное развитие.', advice: 'Балансируйте физический и умственный труд.' }
  },
  7: {
    none: { meaning: 'Невезение с рождения, многого приходится добиваться самому.', advice: 'Упорство и труд создадут вашу удачу своими руками.' },
    weak: { meaning: 'Удача приходит редко, успех через усилия.', advice: 'Верьте в себя — ваш труд будет вознаграждён.' },
    normal: { meaning: 'Средний уровень везения, баланс удачи и труда.', advice: 'Используйте возможности, которые подбрасывает жизнь.' },
    strong: { meaning: 'Удачливый человек, «счастливчик», талант.', advice: 'Не расслабляйтесь — талант требует развития.' },
    excessive: { meaning: 'Исключительная удача, которой нужно уметь распорядиться.', advice: 'Благодарите жизнь, делитесь успехом с другими.' }
  },
  8: {
    none: { meaning: 'Слабое чувство долга, склонность избегать обязательств.', advice: 'Учитесь доводить дела до конца, держать слово.' },
    weak: { meaning: 'Долг осознаётся, но часто нарушается.', advice: 'Работайте над дисциплиной, планируйте день.' },
    normal: { meaning: 'Ответственный человек, держит слово.', advice: 'Ваша надёжность — сильная сторона, не теряйте её.' },
    strong: { meaning: 'Очень сильное чувство долга, обязательность.', advice: 'Не берите на себя больше, чем можете выполнить.' },
    excessive: { meaning: 'Чрезмерная жертвенность во имя долга.', advice: 'Заботьтесь о себе — вы тоже нуждаетесь в поддержке.' }
  },
  9: {
    none: { meaning: 'Слабая память, сложности с концентрацией.', advice: 'Тренируйте память через чтение и изучение языков.' },
    weak: { meaning: 'Память средняя, требует тренировки.', advice: 'Регулярные упражнения для мозга помогут.' },
    normal: { meaning: 'Хорошая память и сообразительность.', advice: 'Поддерживайте ум в тонусе, учитесь новому.' },
    strong: { meaning: 'Отличная память, быстрый ум, высокий интеллект.', advice: 'Ваш дар — делиться знаниями с другими.' },
    excessive: { meaning: 'Феноменальная память, может быть бременем.', advice: 'Учитесь отпускать ненужное, отдыхать от мыслей.' }
  }
};

function getLevel(count: number): PythagorasCell['level'] {
  if (count === 0) return 'none';
  if (count === 1) return 'weak';
  if (count === 2) return 'normal';
  if (count === 3) return 'strong';
  return 'excessive';
}

export function calculatePythagorasSquare(birthDate: string): PythagorasSquare {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    throw new Error('Неверная дата рождения');
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const workingNumbers: number[] = [];
  workingNumbers.push(...String(day).split('').map(Number));
  workingNumbers.push(...String(month).split('').map(Number));
  workingNumbers.push(...String(year).split('').map(Number));

  const sumDigits = (num: number): number => {
    return String(num).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  };

  const first = workingNumbers.reduce((s, n) => s + n, 0);
  const second = sumDigits(first);
  const firstDigit = parseInt(String(day)[0], 10);
  const third = first - firstDigit * 2;
  const fourth = sumDigits(third);

  const additionalNumbers = [first, second, third, fourth].filter(n => n > 0);

  const allNumbers = [...workingNumbers, ...String(first).split('').map(Number), ...String(second).split('').map(Number), ...String(third).split('').map(Number), ...String(fourth).split('').map(Number)];

  const cells: PythagorasCell[] = [];
  for (let num = 1; num <= 9; num++) {
    const count = allNumbers.filter(n => n === num).length;
    const level = getLevel(count);
    const meta = CELL_META[num];
    const meaning = CELL_MEANINGS[num][level];

    cells.push({
      number: num,
      count,
      digits: count > 0 ? String(num).repeat(count) : '—',
      title: meta.title,
      category: meta.category,
      level,
      meaning: meaning.meaning,
      advice: meaning.advice
    });
  }

  const getCellCount = (num: number): number => cells.find(c => c.number === num)?.count || 0;

  const rows: PythagorasLine[] = [
    {
      name: 'Целеустремлённость',
      type: 'row',
      strength: getCellCount(1) + getCellCount(4) + getCellCount(7),
      meaning: 'Способность ставить цели и идти к ним, несмотря на препятствия.',
      isActive: getCellCount(1) + getCellCount(4) + getCellCount(7) >= 3
    },
    {
      name: 'Семья',
      type: 'row',
      strength: getCellCount(2) + getCellCount(5) + getCellCount(8),
      meaning: 'Потребность в семье, способность быть хорошим партнёром и родителем.',
      isActive: getCellCount(2) + getCellCount(5) + getCellCount(8) >= 3
    },
    {
      name: 'Стабильность',
      type: 'row',
      strength: getCellCount(3) + getCellCount(6) + getCellCount(9),
      meaning: 'Приверженность привычкам, любовь к порядку и стабильности.',
      isActive: getCellCount(3) + getCellCount(6) + getCellCount(9) >= 3
    }
  ];

  const columns: PythagorasLine[] = [
    {
      name: 'Самооценка',
      type: 'column',
      strength: getCellCount(1) + getCellCount(2) + getCellCount(3),
      meaning: 'Уверенность в себе, адекватное восприятие своих сил.',
      isActive: getCellCount(1) + getCellCount(2) + getCellCount(3) >= 3
    },
    {
      name: 'Семейная жизнь',
      type: 'column',
      strength: getCellCount(4) + getCellCount(5) + getCellCount(6),
      meaning: 'Умение выстраивать быт, создавать уют, зарабатывать для семьи.',
      isActive: getCellCount(4) + getCellCount(5) + getCellCount(6) >= 3
    },
    {
      name: 'Талант',
      type: 'column',
      strength: getCellCount(7) + getCellCount(8) + getCellCount(9),
      meaning: 'Творческие способности, духовность, связь с высшими материями.',
      isActive: getCellCount(7) + getCellCount(8) + getCellCount(9) >= 3
    }
  ];

  const diagonals: PythagorasLine[] = [
    {
      name: 'Духовность',
      type: 'diagonal',
      strength: getCellCount(1) + getCellCount(5) + getCellCount(9),
      meaning: 'Способность к духовному развитию, интуиция, мудрость.',
      isActive: getCellCount(1) + getCellCount(5) + getCellCount(9) >= 3
    },
    {
      name: 'Темперамент',
      type: 'diagonal',
      strength: getCellCount(3) + getCellCount(5) + getCellCount(7),
      meaning: 'Страстность натуры, темперамент в отношениях.',
      isActive: getCellCount(3) + getCellCount(5) + getCellCount(7) >= 3
    }
  ];

  const dominantTraits = cells
    .filter(c => c.count >= 3)
    .map(c => c.title);

  const weakTraits = cells
    .filter(c => c.count === 0 && [1, 2, 4, 5, 6, 9].includes(c.number))
    .map(c => c.title);

  let summary = 'Квадрат Пифагора раскрывает структуру вашей личности через цифры даты рождения. ';
  if (dominantTraits.length > 0) {
    summary += `Ваши сильные стороны: ${dominantTraits.join(', ')}. `;
  }
  if (weakTraits.length > 0) {
    summary += `Зоны роста: ${weakTraits.join(', ')}. `;
  }
  const activeRows = rows.filter(r => r.isActive).length;
  const activeCols = columns.filter(c => c.isActive).length;
  summary += `Активных линий силы: ${activeRows + activeCols + diagonals.filter(d => d.isActive).length} из 8.`;

  return {
    cells,
    rows,
    columns,
    diagonals,
    workingNumbers,
    additionalNumbers,
    summary,
    dominantTraits,
    weakTraits
  };
}
