export interface ChatMsg {
  id: string;
  conversation_id: string;
  sender_member_id: string;
  sender_name?: string;
  sender_photo?: string | null;
  sender_avatar?: string | null;
  content: string;
  reactions: Record<string, number>;
  created_at: string;
}

export interface ChatItem {
  id: string;
  kind: 'family' | 'dm';
  title: string;
  subtitle: string;
  member_id: string | null;
  photo_url: string | null;
  avatar: string | null;
  unread: number;
}

export interface MeInfo {
  member_id: string;
  name: string;
  photo_url: string | null;
  avatar: string | null;
}

export const QUICK_REACTIONS = ['❤️', '👍', '😂', '🎉', '🙏', '🔥'];

export const EMOJI_LIST = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩',
  '🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣',
  '😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬',
  '❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔',
  '💕','💞','💓','💗','💖','💘','💝','💟','♥️','💋',
  '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉',
  '👆','🖕','👇','☝️','👋','🤚','🖐️','✋','🖖','👏',
  '🙌','🤝','🙏','✍️','💪','🦾','🦵','🦿','🦶','👂',
  '🎉','🎊','🎁','🎂','🎈','🎀','🎄','🎃','🎆','🎇',
  '🌟','⭐','✨','💫','🔥','💥','💯','💢','💦','💨',
  '🍕','🍔','🍟','🌭','🥪','🌮','🌯','🥗','🍿','🍰',
  '🍎','🍊','🍋','🍉','🍇','🍓','🍒','🍑','🥝','🍍',
  '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸',
  '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐',
  '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','❄️',
];

export const FALLBACK_COLORS = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-sky-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-fuchsia-500 to-pink-500',
];

export function colorFor(idx: number): string {
  return FALLBACK_COLORS[Math.abs(idx) % FALLBACK_COLORS.length];
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
}
