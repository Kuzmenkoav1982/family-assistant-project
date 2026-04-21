import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const IDEAS_API = 'https://functions.poehali.dev/5f414b77-7ce9-4a88-b0dd-8b870ec6939b';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Status {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  votes_count: number;
  comments_count: number;
  author: {
    name: string;
    email: string;
  };
  user_voted?: boolean;
  created_at: string;
  updated_at: string;
}

export default function IdeasBoard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('votes');
  
  // Форма создания идеи
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [creating, setCreating] = useState(false);
  
  // Детали идеи
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadCategories();
    loadStatuses();
    loadIdeas();
  }, [selectedCategory, selectedStatus, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${IDEAS_API}?resource=ideas&action=categories`);
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const response = await fetch(`${IDEAS_API}?resource=ideas&action=statuses`);
      const data = await response.json();
      if (data.statuses) {
        setStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов:', error);
    }
  };

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        resource: 'ideas',
        sort_by: sortBy,
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus })
      });
      
      const response = await fetch(`${IDEAS_API}?${params}`);
      const data = await response.json();
      
      if (data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить список идей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт чтобы предложить идею',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    if (!newIdea.title || newIdea.title.length < 10) {
      toast({
        title: 'Заголовок слишком короткий',
        description: 'Минимум 10 символов',
        variant: 'destructive'
      });
      return;
    }

    if (!newIdea.description || newIdea.description.length < 20) {
      toast({
        title: 'Описание слишком короткое',
        description: 'Минимум 20 символов',
        variant: 'destructive'
      });
      return;
    }

    if (!newIdea.category) {
      toast({
        title: 'Выберите категорию',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(IDEAS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          resource: 'ideas',
          action: 'create',
          ...newIdea
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Идея добавлена!',
          description: data.message || 'Спасибо за вашу идею!'
        });
        
        setCreateDialogOpen(false);
        setNewIdea({ title: '', description: '', category: '' });
        loadIdeas();
      } else if (data.error) {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось отправить идею',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (ideaId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт чтобы голосовать',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(IDEAS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          resource: 'ideas',
          action: 'vote',
          idea_id: ideaId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем счётчик локально
        setIdeas(ideas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, votes_count: data.votes_count, user_voted: data.voted }
            : idea
        ));
        
        toast({
          title: data.voted ? '👍 Голос учтён!' : 'Голос снят',
          description: data.voted ? 'Спасибо за поддержку идеи!' : ''
        });
      } else if (data.error) {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось проголосовать',
        variant: 'destructive'
      });
    }
  };

  const openIdeaDetail = async (idea: Idea) => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`${IDEAS_API}?resource=ideas&action=detail&id=${idea.id}`, {
        headers: token ? {
          'X-Auth-Token': token
        } : {}
      });
      
      const data = await response.json();
      
      if (data.idea) {
        setSelectedIdea(data.idea);
        setComments(data.comments || []);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить детали идеи',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        variant: 'destructive'
      });
      return;
    }

    if (!newComment || newComment.length < 5) {
      toast({
        title: 'Комментарий слишком короткий',
        description: 'Минимум 5 символов',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(IDEAS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          resource: 'ideas',
          action: 'comment',
          idea_id: selectedIdea?.id,
          text: newComment
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Комментарий добавлен!'
        });
        setNewComment('');
        // Перезагружаем детали
        if (selectedIdea) {
          openIdeaDetail(selectedIdea);
        }
      } else if (data.error) {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="Home" size={18} />
            На главную
          </Button>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-6 py-2">
            💡 Доска идей
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Предложите свою идею!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Ваши предложения помогают сделать платформу лучше.
            <br />
            Голосуйте за идеи других и обсуждайте в комментариях!
          </p>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                <Icon name="Plus" size={20} />
                Добавить идею
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Предложить новую идею</DialogTitle>
                <DialogDescription>
                  Опишите что нужно добавить или улучшить в платформе
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select value={newIdea.category} onValueChange={(value) => setNewIdea({...newIdea, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title">Заголовок (минимум 10 символов)</Label>
                  <Input 
                    id="title"
                    placeholder="Краткое название идеи"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                    maxLength={255}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newIdea.title.length}/255</p>
                </div>
                
                <div>
                  <Label htmlFor="description">Описание (минимум 20 символов)</Label>
                  <Textarea 
                    id="description"
                    placeholder="Подробно опишите свою идею, зачем это нужно и как должно работать"
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newIdea.description.length} символов</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreateIdea}
                  disabled={creating}
                  className="gap-2"
                >
                  {creating ? (
                    <>
                      <Icon name="Loader2" className="animate-spin" size={16} />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} />
                      Отправить
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Фильтры и сортировка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Категория</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Статус</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.icon} {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Сортировка</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="votes">По голосам</SelectItem>
                    <SelectItem value="created">По дате добавления</SelectItem>
                    <SelectItem value="comments">По комментариям</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ideas List */}
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={40} />
            <p className="text-gray-600">Загрузка идей...</p>
          </div>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Lightbulb" size={60} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Пока нет идей</h3>
              <p className="text-gray-600 mb-4">Станьте первым кто предложит улучшение!</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                Добавить идею
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {ideas.map((idea) => (
              <Card 
                key={idea.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openIdeaDetail(idea)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge style={{backgroundColor: `var(--${idea.category.color}-500)`}}>
                          {idea.category.icon} {idea.category.name}
                        </Badge>
                        <Badge variant="outline" style={{borderColor: `var(--${idea.status.color}-500)`, color: `var(--${idea.status.color}-600)`}}>
                          {idea.status.icon} {idea.status.name}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{idea.title}</CardTitle>
                      <CardDescription className="text-base">
                        {idea.description.substring(0, 200)}
                        {idea.description.length > 200 ? '...' : ''}
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 ml-4">
                      <Button
                        variant={idea.user_voted ? 'default' : 'outline'}
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id);
                        }}
                      >
                        <Icon name="ThumbsUp" size={16} />
                        {idea.votes_count}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                      >
                        <Icon name="MessageSquare" size={16} />
                        {idea.comments_count}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardFooter className="text-sm text-gray-500">
                  Автор: {idea.author.name} • {new Date(idea.created_at).toLocaleDateString('ru-RU')}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Idea Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedIdea && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge style={{backgroundColor: `var(--${selectedIdea.category.color}-500)`}}>
                      {selectedIdea.category.icon} {selectedIdea.category.name}
                    </Badge>
                    <Badge variant="outline" style={{borderColor: `var(--${selectedIdea.status.color}-500)`, color: `var(--${selectedIdea.status.color}-600)`}}>
                      {selectedIdea.status.icon} {selectedIdea.status.name}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl">{selectedIdea.title}</DialogTitle>
                  <DialogDescription>
                    Автор: {selectedIdea.author.name} • {new Date(selectedIdea.created_at).toLocaleDateString('ru-RU')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <p className="text-base whitespace-pre-wrap">{selectedIdea.description}</p>
                  
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                    <Button
                      variant={selectedIdea.user_voted ? 'default' : 'outline'}
                      onClick={() => handleVote(selectedIdea.id)}
                      className="gap-2"
                    >
                      <Icon name="ThumbsUp" size={18} />
                      {selectedIdea.votes_count} голосов
                    </Button>
                    <span className="text-gray-500">
                      <Icon name="MessageSquare" size={18} className="inline mr-1" />
                      {selectedIdea.comments_count} комментариев
                    </span>
                  </div>
                  
                  {/* Comments */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Обсуждение</h3>
                    
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Пока нет комментариев. Будьте первым!</p>
                    ) : (
                      <div className="space-y-4 mb-6">
                        {comments.map((comment) => (
                          <Card key={comment.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-semibold">
                                  {comment.author_name}
                                  {comment.is_admin && (
                                    <Badge className="ml-2 bg-purple-500">Команда</Badge>
                                  )}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.text}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ваш комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} className="self-end">
                        <Icon name="Send" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}