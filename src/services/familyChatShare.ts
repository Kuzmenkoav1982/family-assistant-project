import func2url from '../../backend/func2url.json';

const CHAT_API = (func2url as Record<string, string>)['family-chat'];

export interface ChatListItem {
  id: string;
  kind: 'family' | 'dm';
  title?: string;
  unread?: number;
}

export interface ChatListResponse {
  me: { id: string; family_id: string; name: string };
  chats: ChatListItem[];
}

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

async function getFamilyConversationId(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${CHAT_API}?action=list`, {
    headers: { 'X-Auth-Token': token },
  });
  if (!res.ok) return null;
  const data: ChatListResponse = await res.json();
  const family = data.chats?.find((c) => c.kind === 'family');
  return family?.id || data.chats?.[0]?.id || null;
}

export async function sendChatMessage(conversationId: string, content: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  const res = await fetch(CHAT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      action: 'send',
      conversation_id: conversationId,
      content,
    }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data?.success;
}

export async function shareToFamilyChat(content: string): Promise<{ ok: boolean; reason?: string }> {
  if (!getToken()) return { ok: false, reason: 'Не авторизован' };
  const conversationId = await getFamilyConversationId();
  if (!conversationId) return { ok: false, reason: 'Семейный чат не найден' };
  const sent = await sendChatMessage(conversationId, content);
  return sent ? { ok: true } : { ok: false, reason: 'Не удалось отправить' };
}
