import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  familyName: string;
  content: string;
  image?: string;
  category: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface Review {
  id: string;
  author: string;
  category: string;
  title: string;
  rating: number;
  content: string;
  date: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Елена Петрова',
    authorAvatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9cf25007-fa40-4280-965c-7df0e43eabee.jpg',
    familyName: 'Семья Петровых',
    content: 'Сегодня мы с детьми испекли торт по бабушкиному рецепту! Максим помогал взбивать крем, а София украшала. Это так важно - передавать семейные традиции 🎂',
    category: 'Традиции',
    likes: 24,
    comments: 8,
    timestamp: '2 часа назад',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg'
  },
  {
    id: '2',
    author: 'Александр Иванов',
    authorAvatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b14ddbaa-0011-4ded-b9e9-c9018aed82ce.jpg',
    familyName: 'Семья Ивановых',
    content: 'Поделюсь нашим опытом организации семейного бюджета. Завели таблицу расходов, где каждый может видеть на что тратим деньги. Дети стали более ответственными!',
    category: 'Советы',
    likes: 45,
    comments: 12,
    timestamp: '5 часов назад'
  },
  {
    id: '3',
    author: 'Мария Смирнова',
    authorAvatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/15cc7156-7228-4da0-9d75-d971bbd11a6e.jpg',
    familyName: 'Семья Смирновых',
    content: 'Вчера съездили в парк "Зарядье" всей семьей. Детям очень понравилось! Кто еще не был - рекомендую 🌳',
    category: 'Путешествия',
    likes: 38,
    comments: 15,
    timestamp: 'вчера'
  },
  {
    id: '4',
    author: 'Николай Васильев',
    authorAvatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b645bc57-5245-4c0a-87e6-234d82e81815.jpg',
    familyName: 'Семья Васильевых',
    content: 'Внуки приехали на выходные! Рассказал им истории о нашей семье, показал старые фотографии. Они были в восторге! Очень важно передавать историю семьи следующим поколениям 📖',
    category: 'Традиции',
    likes: 67,
    comments: 19,
    timestamp: '1 день назад'
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Анна Волкова',
    category: 'Детские центры',
    title: 'Научный центр "Кварки"',
    rating: 5,
    content: 'Отличное место для детей! Интерактивные экспонаты, интересные мастер-классы. Сын в восторге!',
    date: '3 дня назад'
  },
  {
    id: '2',
    author: 'Дмитрий Соколов',
    category: 'Спорт',
    title: 'Секция плавания "Дельфин"',
    rating: 4,
    content: 'Хороший тренер, удобное расписание. Дочь занимается уже полгода, прогресс заметен.',
    date: 'неделю назад'
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Сообщество семей
            </h1>
            <p className="text-muted-foreground">
              Делитесь опытом, традициями и советами с другими семьями
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="Home" className="mr-2" size={16} />
            На главную
          </Button>
        </header>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="feed" className="text-[11px] sm:text-sm px-1 sm:px-3">
              <Icon name="Newspaper" className="hidden sm:inline mr-2" size={16} />
              Лента
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-[11px] sm:text-sm px-1 sm:px-3">
              <Icon name="Star" className="hidden sm:inline mr-2" size={16} />
              Рекомендации
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-[11px] sm:text-sm px-1 sm:px-3">
              <Icon name="MessageCircle" className="hidden sm:inline mr-2" size={16} />
              Обсуждения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Создать пост
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Новый пост</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Категория</label>
                        <select className="w-full border rounded-md p-2">
                          <option>Традиции</option>
                          <option>Советы</option>
                          <option>Путешествия</option>
                          <option>Достижения</option>
                          <option>Рецепты</option>
                          <option>Воспитание</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Расскажите свою историю</label>
                        <textarea 
                          className="w-full border rounded-md p-2 min-h-[120px]"
                          placeholder="Поделитесь опытом, советом или традицией..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Добавить фото</label>
                        <Input type="file" accept="image/*" />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                        Опубликовать
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {post.authorAvatar.startsWith('http') ? (
                          <img 
                            src={post.authorAvatar} 
                            alt={post.author}
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-300"
                          />
                        ) : (
                          <div className="text-4xl">{post.authorAvatar}</div>
                        )}
                        <div>
                          <p className="font-bold">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.familyName}</p>
                          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    {post.image && (
                      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                        <Icon name="Image" size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 pt-3 border-t">
                      <Button variant="ghost" size="sm">
                        <Icon name="Heart" className="mr-2 text-red-500" size={16} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="MessageCircle" className="mr-2 text-blue-500" size={16} />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="Share2" className="mr-2 text-green-500" size={16} />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Добавить рекомендацию
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новая рекомендация</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Категория</label>
                        <select className="w-full border rounded-md p-2">
                          <option>Детские центры</option>
                          <option>Спорт</option>
                          <option>Творчество</option>
                          <option>Образование</option>
                          <option>Рестораны</option>
                          <option>Развлечения</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Название места/услуги</label>
                        <Input placeholder="Название" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Оценка</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon key={star} name="Star" className="text-yellow-500 cursor-pointer" size={24} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ваш отзыв</label>
                        <textarea 
                          className="w-full border rounded-md p-2 min-h-[100px]"
                          placeholder="Расскажите о своем опыте..."
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                        Опубликовать отзыв
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{review.author} · {review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Icon key={i} name="Star" className="text-yellow-500 fill-yellow-500" size={16} />
                        ))}
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit">{review.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold mb-2">Скоро здесь появятся обсуждения</h3>
                <p className="text-muted-foreground">
                  Вы сможете общаться с другими семьями, задавать вопросы и делиться опытом
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}