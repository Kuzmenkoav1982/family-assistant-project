import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { blogApi, BlogPostFull, ReactionEmoji, ReactionsData } from '@/lib/blogApi';

const REACTIONS: { key: ReactionEmoji; emoji: string; label: string }[] = [
  { key: 'like', emoji: '👍', label: 'Полезно' },
  { key: 'love', emoji: '❤️', label: 'Нравится' },
  { key: 'fire', emoji: '🔥', label: 'Огонь' },
  { key: 'idea', emoji: '💡', label: 'Идея' },
  { key: 'sad', emoji: '😢', label: 'Грустно' },
];

interface Props {
  post: BlogPostFull;
}

export default function BlogPostEngagement({ post }: Props) {
  const [reactions, setReactions] = useState<ReactionsData>(
    post.reactions || { counts: {}, user: [] },
  );
  const [pending, setPending] = useState<ReactionEmoji | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!post.reactions) {
      blogApi
        .getReactions(post.id)
        .then(setReactions)
        .catch(() => {});
    }
  }, [post.id, post.reactions]);

  const handleReact = async (emoji: ReactionEmoji) => {
    if (pending) return;
    setPending(emoji);
    const wasActive = reactions.user.includes(emoji);
    const optimisticCounts = { ...reactions.counts };
    optimisticCounts[emoji] = Math.max(0, (optimisticCounts[emoji] || 0) + (wasActive ? -1 : 1));
    const optimisticUser = wasActive
      ? reactions.user.filter(e => e !== emoji)
      : [...reactions.user, emoji];
    setReactions({ counts: optimisticCounts, user: optimisticUser });
    try {
      const res = await blogApi.toggleReaction(post.id, emoji);
      setReactions({ counts: res.counts, user: res.user });
    } catch {
      setReactions(prev => prev);
      toast.error('Не удалось сохранить реакцию');
    } finally {
      setPending(null);
    }
  };

  const handleShare = async () => {
    const url = `https://nasha-semiya.ru/blog/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      toast.success('Ссылка скопирована');
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const maxLink = post.max_message_id && post.max_chat_id
    ? `https://max.ru/id231805288780_biz`
    : null;

  const totalReactions = Object.values(reactions.counts).reduce(
    (sum, n) => sum + (n || 0),
    0,
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
              <span className="text-xl">💬</span>
              Понравилось? Оставьте реакцию
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Анонимно. Помогает нам понимать, что вам интересно.
            </p>
          </div>
          {totalReactions > 0 && (
            <span className="text-xs text-gray-400">
              Всего реакций: <strong className="text-gray-700">{totalReactions}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {REACTIONS.map(r => {
            const active = reactions.user.includes(r.key);
            const count = reactions.counts[r.key] || 0;
            return (
              <button
                key={r.key}
                onClick={() => handleReact(r.key)}
                disabled={pending !== null}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all duration-200 ${
                  active
                    ? 'bg-orange-50 border-orange-400 scale-105 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                } ${pending === r.key ? 'opacity-60' : ''}`}
                title={r.label}
              >
                <span className={`text-xl transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {r.emoji}
                </span>
                <span className={`text-sm font-medium ${active ? 'text-orange-700' : 'text-gray-700'}`}>
                  {count > 0 ? count : r.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleShare}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl flex-1 sm:flex-none"
        >
          <Icon name={shared ? 'Check' : 'Share2'} size={18} className="mr-2" />
          {shared ? 'Скопировано' : 'Поделиться'}
        </Button>

        {maxLink && (
          <a
            href={maxLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl w-full"
            >
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Обсудить в МАХ
            </Button>
          </a>
        )}
      </div>

      {maxLink && (
        <p className="text-xs text-gray-500 text-center">
          💡 Эта статья была опубликована в нашем МАХ-канале — там можно оставить комментарий и обсудить с другими родителями
        </p>
      )}
    </div>
  );
}
