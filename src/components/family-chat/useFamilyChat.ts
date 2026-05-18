import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import func2url from '../../../backend/func2url.json';
import { formatDateLabel } from './types';
import type { ChatMsg, ChatItem, MeInfo } from './types';

const API = (func2url as Record<string, string>)['family-chat'];
const POLL_INTERVAL_MS = 3000;

export function useFamilyChat() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastTsRef = useRef<string | null>(null);
  const activeChatRef = useRef<string | null>(null);

  const getToken = () => localStorage.getItem('authToken') || '';

  const apiGet = useCallback(async (qs: string) => {
    const token = getToken();
    if (!token) throw new Error('Требуется вход');
    const res = await fetch(`${API}?${qs}`, { headers: { 'X-Auth-Token': token } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  }, []);

  const apiPost = useCallback(async (body: Record<string, unknown>) => {
    const token = getToken();
    if (!token) throw new Error('Требуется вход');
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  }, []);

  const loadChats = useCallback(async () => {
    try {
      const data = await apiGet('action=list');
      setMe(data.me);
      setChats(data.chats || []);
      if (!activeChatRef.current && data.chats?.length) {
        const familyChat = data.chats.find((c: ChatItem) => c.kind === 'family') || data.chats[0];
        activeChatRef.current = familyChat.id;
        setActiveChatId(familyChat.id);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, [apiGet]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiGet(`action=messages&conversation_id=${encodeURIComponent(conversationId)}`);
      const msgs: ChatMsg[] = data.messages || [];
      setMessages(msgs);
      lastTsRef.current = msgs.length ? msgs[msgs.length - 1].created_at : null;
      apiPost({ action: 'mark_read', conversation_id: conversationId }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сообщения');
    }
  }, [apiGet, apiPost]);

  const pollNew = useCallback(async () => {
    const convId = activeChatRef.current;
    if (!convId) return;
    try {
      const after = lastTsRef.current;
      const qs = after
        ? `action=messages&conversation_id=${encodeURIComponent(convId)}&after=${encodeURIComponent(after)}`
        : `action=messages&conversation_id=${encodeURIComponent(convId)}`;
      const data = await apiGet(qs);
      const newMsgs: ChatMsg[] = data.messages || [];
      if (newMsgs.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of newMsgs) {
            if (!ids.has(m.id)) merged.push(m);
          }
          return merged;
        });
        lastTsRef.current = newMsgs[newMsgs.length - 1].created_at;
        apiPost({ action: 'mark_read', conversation_id: convId }).catch(() => {});
      }
    } catch { /* polling silent fail */ }
  }, [apiGet, apiPost]);

  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    if (!activeChatId) return;
    activeChatRef.current = activeChatId;
    setMessages([]);
    lastTsRef.current = null;
    setReactionFor(null);
    setShowEmoji(false);
    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!activeChatId) return;
    const id = setInterval(pollNew, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeChatId, pollNew]);

  useEffect(() => {
    const id = setInterval(() => {
      apiGet('action=list').then((data) => { setChats(data.chats || []); }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [apiGet]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeChatId]);

  useEffect(() => {
    if (!showEmoji) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (emojiBtnRef.current && emojiBtnRef.current.contains(target)) return;
      const picker = document.getElementById('chat-emoji-picker');
      if (picker && picker.contains(target)) return;
      setShowEmoji(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showEmoji]);

  const grouped = useMemo(() => {
    const result: { dateLabel: string; items: ChatMsg[] }[] = [];
    for (const m of messages) {
      const label = formatDateLabel(m.created_at);
      const last = result[result.length - 1];
      if (!last || last.dateLabel !== label) {
        result.push({ dateLabel: label, items: [m] });
      } else {
        last.items.push(m);
      }
    }
    return result;
  }, [messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeChatId || !me) return;
    setDraft('');
    setShowEmoji(false);
    try {
      const data = await apiPost({ action: 'send', conversation_id: activeChatId, content: text });
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        lastTsRef.current = data.message.created_at;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить');
      setDraft(text);
    }
  };

  const addReaction = async (msgId: string, emoji: string) => {
    if (!activeChatId) return;
    setReactionFor(null);
    try {
      const data = await apiPost({ action: 'react', conversation_id: activeChatId, message_id: msgId, emoji });
      if (data.reactions) {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reactions: data.reactions } : m)));
      }
    } catch { /* noop */ }
  };

  const insertEmoji = (e: string) => setDraft((d) => d + e);

  return {
    me, chats, activeChatId, setActiveChatId,
    messages, grouped,
    draft, setDraft,
    reactionFor, setReactionFor,
    showEmoji, setShowEmoji,
    loading, error,
    scrollRef, emojiBtnRef,
    sendMessage, addReaction, insertEmoji,
  };
}
