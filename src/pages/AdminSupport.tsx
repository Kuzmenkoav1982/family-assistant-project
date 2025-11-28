import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

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
  const { currentUser } = useAuth();
  const [supportItems, setSupportItems] = useState<FeedbackItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [suggestionItems, setSuggestionItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  useEffect(() => {
    if (currentUser?.role !== 'owner') {
      navigate('/');
      return;
    }
    loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    try {
      const [supportRes, feedbackRes, suggestionRes] = await Promise.all([
        fetch(`${feedbackUrl}?type=support`),
        fetch(`${feedbackUrl}?type=review`),
        fetch(`${feedbackUrl}?type=suggestion`)
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
    <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {getStatusBadge(item.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Icon name="User" size={14} />
              {item.user_name}
            </span>
            {item.user_email && (
              <a 
                href={`mailto:${item.user_email}`}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <Icon name="Mail" size={14} />
                {item.user_email}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              {new Date(item.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        {item.rating && (
          <div className="flex gap-1 ml-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name="Star"
                size={16}
                className={star <= item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
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
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            На главную
          </Button>
          
          <Button
            onClick={loadAllData}
            variant="outline"
            className="gap-2"
          >
            <Icon name="RefreshCw" size={16} />
            Обновить
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-800 rounded-full mb-4">
            <Icon name="Shield" size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-600 to-gray-800 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <p className="text-gray-600">
            Управление обращениями и отзывами
          </p>
        </div>

        <Tabs defaultValue="support" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="support" className="gap-2">
              <Icon name="Headphones" size={16} />
              Техподдержка
              {supportItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {supportItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <Icon name="MessageSquare" size={16} />
              Отзывы
              {feedbackItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {feedbackItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Icon name="Lightbulb" size={16} />
              Предложения
              {suggestionItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {suggestionItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="support">
            <div className="space-y-4">
              {supportItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">
                    Нет обращений в техподдержку
                  </p>
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
                  <p className="text-gray-600 text-lg">
                    Нет отзывов
                  </p>
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
                  <p className="text-gray-600 text-lg">
                    Нет предложений
                  </p>
                </Card>
              ) : (
                suggestionItems.map(renderCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
