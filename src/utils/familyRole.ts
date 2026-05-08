interface MemberLike {
  id: string;
  age?: number | null;
  role?: string | null;
}

/**
 * Текущий пользователь — взрослый, если по его member-записи возраст не указан
 * либо >= 18, либо роль явно «взрослая» (родитель/мама/папа/бабушка/дедушка/опекун).
 *
 * Используется для гейтинга чувствительных функций портфолио (compare, AI, PDF).
 */
export function isAdultMember(member: MemberLike | null | undefined): boolean {
  if (!member) return false;
  if (typeof member.age === 'number') {
    return member.age >= 18;
  }
  const role = (member.role || '').toLowerCase();
  const adultMarkers = ['родитель', 'мама', 'папа', 'бабушка', 'дедушка', 'опекун', 'отчим', 'мачеха', 'тётя', 'дядя'];
  if (adultMarkers.some((m) => role.includes(m))) return true;
  // если возраст не задан и роль не явно детская — считаем взрослым (родитель чаще всего не указывает свой возраст)
  const childMarkers = ['ребёнок', 'ребенок', 'сын', 'дочь', 'дочка', 'внук', 'внучка'];
  if (childMarkers.some((m) => role.includes(m))) return false;
  return true;
}
