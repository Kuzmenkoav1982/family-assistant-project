import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';
import { adminFetch } from '@/lib/adminFetch';
import { hasValidLocalAdminSession, adminLogout } from '@/lib/adminAuth';

interface FeedbackItem {
  id: string;
  type: string;
  user_name: string;
  user_email: string | null;
  title: string;
  description: string;
  rating: number | null;
  status: string;
  created_at: string;
}

export default function AdminSupport() {
  const navigate = useNavigate();
  const [supportItems, setSupportItems] = useState<FeedbackItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [suggestionItems, setSuggestionItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyModal, setReplyModal] = useState<{ item: FeedbackItem } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  useEffect(() => {
    if (!hasValidLocalAdminSession()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [supportRes, feedbackRes, suggestionRes] = await Promise.all([
        adminFetch(`${feedbackUrl}?type=support&all_statuses=true`),
        adminFetch(`${feedbackUrl}?type=review&all_statuses=true`),
        adminFetch(`${feedbackUrl}?type=suggestion&all_statuses=true`)
      ]);
      const supportData = await supportRes.json();
      const feedbackData = await feedbackRes.json();
      const suggestionData = await suggestionRes.json();
      setSupportItems(supportData.items || []);
      setFeedbackItems(feedbackData.items || []);
      setSuggestionItems(suggestionData.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminFetch(feedbackUrl, {
        method: 'PUT',
        body: JSON.stringify({ id, status })
      });
      loadAllData();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      await adminFetch(`${feedbackUrl}?id=${id}`, { method: 'DELETE' });
      loadAllData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const openReply = (item: FeedbackItem) => {
    setReplyModal({ item });
    setReplyText('');
    setReplyResult(null);
  };

  const closeReply = () => {
    setReplyModal(null);
    setReplyText('');
    setReplyResult(null);
  };

  const sendReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setReplySending(true);
    setReplyResult(null);
    try {
      const res = await adminFetch(feedbackUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'reply', id: replyModal.item.id, reply_text: replyText })
      });
      const data = await res.json();
      if (data.success) {
        setReplyResult({ ok: true, msg: `Ответ отправлен на ${data.sent_to}` });
        loadAllData();
        setTimeout(closeReply, 2000);
      } else {
        setReplyResult({ ok: false, msg: data.error || 'Ошибка отправки' });
      }
    } catch (e) {
      setReplyResult({ ok: false, msg: 'Ошибка соединения' });
    } finally {
      setReplySending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    const labels: Record<string, string> = {
      new: 'Новое',
      in_progress: 'В работе',
      resolved: 'Решено'
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const renderCard = (item: FeedbackItem) => (
    <Card key={item.id} className={`p-6 hover:shadow-lg transition-shadow ${item.status === 'resolved' ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {getStatusBadge(item.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <span className="flex items-center gap-1">
              <Icon name="User" size={14} />
              {item.user_name}
            </span>
            {item.user_email && (
              <a href={`mailto:${item.user_email}`} className="flex items-center gap-1 hover:text-blue-600">
                <Icon name="Mail" size={14} />
                {item.user_email}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              {new Date(item.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        {item.rating && (
          <div className="flex gap-1 ml-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon key={star} name="Star" size={16}
                className={star <= item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
            ))}
          </div>
        )}
      </div>

      <p className="text-gray-700 whitespace-pre-wrap mb-4">{item.description}</p>

      <div className="flex gap-2 pt-3 border-t flex-wrap">
        <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => openReply(item)}>
          <Icon name="Reply" size={14} />
          Ответить
        </Button>
        {item.status !== 'new' && (
          <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:bg-green-50" onClick={() => updateStatus(item.id, 'new')}>
            <Icon name="Eye" size={14} />
            Открыть
          </Button>
        )}
        {item.status === 'new' && (
          <Button size="sm" variant="outline" className="gap-1 text-yellow-600 hover:bg-yellow-50" onClick={() => updateStatus(item.id, 'resolved')}>
            <Icon name="CheckCircle" size={14} />
            Закрыть
          </Button>
        )}
        <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:bg-red-50" onClick={() => deleteFeedback(item.id)}>
          <Icon name="Trash2" size={14} />
          Удалить
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-gray-400" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <Icon name="ArrowLeft" size={20} />
            На главную
          </Button>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" className="gap-2">
              <Icon name="RefreshCw" size={16} />
              Обновить
            </Button>
            <Button onClick={() => { adminLogout(); navigate('/admin/login'); }}
              variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Icon name="LogOut" size={16} />
              Выйти
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-800 rounded-full mb-4">
            <Icon name="Shield" size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-600 to-gray-800 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <p className="text-gray-600">Управление обращениями и отзывами</p>
        </div>

        <Tabs defaultValue="support" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="support" className="gap-2">
              <Icon name="Headphones" size={16} />
              Техподдержка
              {supportItems.filter(i => i.status === 'new').length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                  {supportItems.filter(i => i.status === 'new').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <Icon name="MessageSquare" size={16} />
              Отзывы
              {feedbackItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">{feedbackItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Icon name="Lightbulb" size={16} />
              Предложения
              {suggestionItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">{suggestionItems.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="support">
            <div className="space-y-4">
              {supportItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">Нет обращений в техподдержку</p>
                </Card>
              ) : (
                supportItems.map(renderCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-4">
              {feedbackItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">Нет отзывов</p>
                </Card>
              ) : (
                feedbackItems.map(renderCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="space-y-4">
              {suggestionItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">Нет предложений</p>
                </Card>
              ) : (
                suggestionItems.map(renderCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {replyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Ответить пользователю</h2>
                  <p className="text-sm text-gray-500 mt-1">{replyModal.item.user_name}</p>
                </div>
                <button onClick={closeReply} className="text-gray-400 hover:text-gray-600 mt-1">
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">{replyModal.item.title}</p>
                <p className="line-clamp-2">{replyModal.item.description}</p>
              </div>

              {replyModal.item.user_email ? (
                <p className="text-sm text-indigo-600 mt-2 flex items-center gap-1">
                  <Icon name="Mail" size={14} />
                  Письмо уйдёт на: {replyModal.item.user_email}
                </p>
              ) : (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={14} />
                  Email не указан — попробуем взять из профиля пользователя
                </p>
              )}
            </div>

            <div className="p-6">
              <textarea
                className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={6}
                placeholder="Напишите ответ пользователю..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />

              {replyResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${replyResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <Icon name={replyResult.ok ? 'CheckCircle' : 'AlertCircle'} size={16} />
                  {replyResult.msg}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={closeReply} disabled={replySending}>
                  Отмена
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  onClick={sendReply}
                  disabled={replySending || !replyText.trim()}
                >
                  {replySending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                  {replySending ? 'Отправка...' : 'Отправить письмо'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
