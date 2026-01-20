import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import func2url from '@/../backend/func2url.json';

interface ChannelStats {
  subscribers?: number;
  posts?: number;
  views?: number;
}

interface PostHistory {
  id: string;
  text: string;
  image_url?: string;
  sent_at: string;
  status: 'success' | 'failed';
}

export default function AdminMAX() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [channelStats, setChannelStats] = useState<ChannelStats>({});
  const [postHistory, setPostHistory] = useState<PostHistory[]>([]);

  const maxBotUrl = func2url['max-bot'] || '';

  useEffect(() => {
    loadChannelStats();
    loadPostHistory();
  }, []);

  const loadChannelStats = async () => {
    if (!maxBotUrl) {
      toast({
        title: 'MAX Bot не развернут',
        description: 'Функция max-bot недоступна',
        variant: 'destructive'
      });
      return;
    }

    setStatsLoading(true);
    try {
      const response = await fetch(`${maxBotUrl}?action=stats`);
      const data = await response.json();
      
      if (data.success && data.stats) {
        setChannelStats(data.stats);
      } else if (data.error) {
        console.warn('Stats error:', data.error);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPostHistory = () => {
    const history = localStorage.getItem('max_post_history');
    if (history) {
      setPostHistory(JSON.parse(history));
    }
  };

  const saveToHistory = (post: PostHistory) => {
    const updated = [post, ...postHistory].slice(0, 20);
    setPostHistory(updated);
    localStorage.setItem('max_post_history', JSON.stringify(updated));
  };

  const handleSendPost = async () => {
    if (!postText.trim()) {
      toast({
        title: 'Введите текст',
        description: 'Нельзя отправить пустое сообщение',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${maxBotUrl}?action=send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_authenticated'
        },
        body: JSON.stringify({
          text: postText,
          image_url: imageUrl || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Пост опубликован!',
          description: 'Сообщение отправлено в канал MAX'
        });

        saveToHistory({
          id: Date.now().toString(),
          text: postText,
          image_url: imageUrl || undefined,
          sent_at: new Date().toISOString(),
          status: 'success'
        });

        setPostText('');
        setImageUrl('');
        loadChannelStats();
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive'
      });

      saveToHistory({
        id: Date.now().toString(),
        text: postText,
        image_url: imageUrl || undefined,
        sent_at: new Date().toISOString(),
        status: 'failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!postText.trim() || !scheduledTime) {
      toast({
        title: 'Заполните все поля',
        description: 'Введите текст и выберите время публикации',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${maxBotUrl}?action=schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_authenticated'
        },
        body: JSON.stringify({
          text: postText,
          scheduled_time: scheduledTime,
          image_url: imageUrl || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '📅 Пост запланирован!',
          description: `Будет опубликован ${new Date(scheduledTime).toLocaleString('ru-RU')}`
        });

        setPostText('');
        setImageUrl('');
        setScheduledTime('');
      } else {
        throw new Error(data.error || 'Ошибка планирования');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickPosts = [
    {
      title: '🏠 Новость о сервисе',
      text: '🏠 Наша семья — ваш семейный органайзер!\n\n✨ Организуйте быт, планируйте события и храните важные моменты вместе.\n\n👉 Попробуйте бесплатно: https://nasha-semiya.ru'
    },
    {
      title: '🎉 Акция',
      text: '🎉 Специальное предложение!\n\nПервый месяц подписки — бесплатно для новых пользователей!\n\n⏰ Акция действует до конца месяца.\n👉 https://nasha-semiya.ru/pricing'
    },
    {
      title: '💡 Полезный совет',
      text: '💡 Совет дня от "Наша семья":\n\nИспользуйте календарь событий, чтобы не забыть важные даты — дни рождения, встречи с врачом, школьные мероприятия.\n\n📅 Добавьте первое событие уже сегодня!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              MAX Канал
            </h1>
            <p className="text-gray-600 mt-2">Управление постами в канале "Наша семья"</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadChannelStats} disabled={statsLoading}>
              {statsLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : (
                <Icon name="RefreshCw" size={16} className="mr-2" />
              )}
              Обновить
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>

        {/* Channel Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Users" size={16} className="text-blue-600" />
                Подписчики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{channelStats.subscribers || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-purple-600" />
                Публикации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{channelStats.posts || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Eye" size={16} className="text-green-600" />
                Просмотры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{channelStats.views || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Link" size={16} className="text-orange-600" />
                Канал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a 
                href="https://max.ru/id231805288780_biz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                Открыть
                <Icon name="ExternalLink" size={12} />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Quick Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Zap" size={20} />
              Быстрые шаблоны
            </CardTitle>
            <CardDescription>Используйте готовые шаблоны для быстрой публикации</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickPosts.map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setPostText(post.text)}>
                  <CardHeader>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.text}</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <Icon name="Copy" size={14} className="mr-2" />
                      Использовать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Send" size={20} />
                Создать пост
              </CardTitle>
              <CardDescription>Отправить сообщение в канал прямо сейчас</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Текст сообщения *</Label>
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Напишите сообщение для подписчиков..."
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{postText.length} символов</p>
              </div>

              <div>
                <Label>Ссылка на изображение (необязательно)</Label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>

              {imageUrl && (
                <div className="border rounded-lg p-2">
                  <img src={imageUrl} alt="Превью" className="w-full h-48 object-cover rounded" onError={() => setImageUrl('')} />
                </div>
              )}

              <Button 
                onClick={handleSendPost} 
                disabled={loading || !postText.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Send" size={16} className="mr-2" />
                )}
                Опубликовать сейчас
              </Button>
            </CardContent>
          </Card>

          {/* Schedule Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Отложенный пост
              </CardTitle>
              <CardDescription>Запланировать публикацию на определенное время</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Icon name="Info" size={16} />
                <AlertTitle>Используйте тот же текст</AlertTitle>
                <AlertDescription>
                  Текст и изображение берутся из формы слева. Укажите только время публикации.
                </AlertDescription>
              </Alert>

              <div>
                <Label>Дата и время публикации *</Label>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <Button 
                onClick={handleSchedulePost} 
                disabled={loading || !postText.trim() || !scheduledTime}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Clock" size={16} className="mr-2" />
                )}
                Запланировать пост
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Post History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="History" size={20} />
              История публикаций
            </CardTitle>
            <CardDescription>Последние {postHistory.length} постов</CardDescription>
          </CardHeader>
          <CardContent>
            {postHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Постов пока нет</p>
                <p className="text-sm mt-2">Создайте первый пост выше</p>
              </div>
            ) : (
              <div className="space-y-3">
                {postHistory.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{post.text}</p>
                        {post.image_url && (
                          <div className="mt-2">
                            <img src={post.image_url} alt="" className="w-32 h-32 object-cover rounded" />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(post.sent_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Badge variant={post.status === 'success' ? 'default' : 'destructive'}>
                        {post.status === 'success' ? (
                          <>
                            <Icon name="CheckCircle" size={12} className="mr-1" />
                            Отправлено
                          </>
                        ) : (
                          <>
                            <Icon name="XCircle" size={12} className="mr-1" />
                            Ошибка
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
