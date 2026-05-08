export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return 'давно';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return 'давно';
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'только что';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} ${plural(hour, 'час', 'часа', 'часов')} назад`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} ${plural(day, 'день', 'дня', 'дней')} назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
