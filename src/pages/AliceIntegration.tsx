import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AliceIntegration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [linkingCode, setLinkingCode] = useState<string>('');
  const [isLinked, setIsLinked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    // Проверяем статус привязки при загрузке
    checkLinkingStatus();
  }, []);

  const checkLinkingStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=status', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      const data = await response.json();
      setIsLinked(data.linked || false);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=generate-code', {
        method: 'POST',
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      const data = await response.json();
      
      if (data.code) {
        setLinkingCode(data.code);
        setExpiresAt(new Date(data.expires_at));

        toast({
          title: 'Код создан!',
          description: 'Назовите этот код Алисе для привязки аккаунта',
        });
      } else {
        throw new Error('Код не получен');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать код. Попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(linkingCode.replace('-', ''));
    toast({
      title: 'Скопировано!',
      description: 'Код скопирован в буфер обмена',
    });
  };

  const unlinkAlice = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=unlink', {
        method: 'POST',
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLinked(false);
        setLinkingCode('');
        setExpiresAt(null);
        toast({
          title: 'Отвязано',
          description: 'Яндекс.Алиса отключена от аккаунта',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отвязать Алису',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Icon name="Mic" size={36} />
              Яндекс.Алиса
            </h1>
            <p className="text-gray-600 mt-2">Управляйте семейным органайзером голосом</p>
          </div>
          <Button onClick={() => navigate('/settings')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Настройки
          </Button>
        </div>

        {/* Статус подключения */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${isLinked ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon name={isLinked ? 'CheckCircle' : 'AlertCircle'} size={32} className={isLinked ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isLinked ? 'Алиса подключена' : 'Алиса не подключена'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isLinked 
                      ? 'Вы можете управлять делами через голосовые команды'
                      : 'Привяжите аккаунт для голосового управления'
                    }
                  </p>
                </div>
              </div>
              {isLinked && (
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Icon name="Wifi" size={16} className="mr-2" />
                  Активна
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="setup" className="flex-1">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройка
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex-1">
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Команды
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex-1">
              <Icon name="BookOpen" size={16} className="mr-2" />
              Инструкция
            </TabsTrigger>
          </TabsList>

          {/* Вкладка: Настройка */}
          <TabsContent value="setup" className="space-y-6">
            {!isLinked ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Link" size={24} className="text-purple-600" />
                      Шаг 1: Получите код привязки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Создайте уникальный код для связи вашего аккаунта с Алисой. Код действует 15 минут.
                    </p>
                    
                    {!linkingCode ? (
                      <Button 
                        onClick={generateCode} 
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                            Создание кода...
                          </>
                        ) : (
                          <>
                            <Icon name="Key" size={20} className="mr-2" />
                            Создать код привязки
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600 font-medium">Ваш код:</p>
                            <div className="text-5xl font-bold text-purple-600 tracking-wider font-mono">
                              {linkingCode}
                            </div>
                            <p className="text-xs text-gray-500">
                              Действителен до {expiresAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={copyCode} variant="outline" className="flex-1">
                            <Icon name="Copy" size={16} className="mr-2" />
                            Скопировать
                          </Button>
                          <Button onClick={generateCode} variant="outline" className="flex-1">
                            <Icon name="RefreshCw" size={16} className="mr-2" />
                            Новый код
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Mic" size={24} className="text-blue-600" />
                      Шаг 2: Скажите Алисе код
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Icon name="Info" size={16} />
                      <AlertDescription>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Скажите: <strong>"Алиса, открой навык Наша Семья"</strong></li>
                          <li>Скажите: <strong>"Привяжи аккаунт"</strong></li>
                          <li>Назовите код: <strong>"{linkingCode || 'XXXX-XXXX'}"</strong></li>
                          <li>Готово! Можете пользоваться голосовыми командами</li>
                        </ol>
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <Icon name="Lightbulb" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Совет:</strong> Если код не принимается, убедитесь что называете все 8 цифр подряд или с паузой между группами.
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Icon name="CheckCircle" size={24} />
                    Алиса успешно подключена!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Теперь вы можете управлять своими делами голосом. Попробуйте команды на вкладке "Команды".
                  </p>
                  
                  <Alert className="bg-green-50 border-green-200">
                    <Icon name="Sparkles" size={16} />
                    <AlertDescription>
                      Попробуйте сказать: <strong>"Алиса, открой Нашу Семью и скажи задачи на сегодня"</strong>
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={unlinkAlice} 
                    variant="outline" 
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Icon name="Unlink" size={16} className="mr-2" />
                    Отвязать Алису
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Вкладка: Команды */}
          <TabsContent value="commands" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckSquare" size={24} className="text-blue-600" />
                  Задачи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CommandItem 
                  command="Какие задачи на сегодня?"
                  description="Показать задачи на текущий день"
                />
                <CommandItem 
                  command="Задачи на завтра"
                  description="Показать задачи на завтрашний день"
                />
                <CommandItem 
                  command="Мои задачи на неделю"
                  description="Показать ваши задачи на ближайшую неделю"
                />
                <CommandItem 
                  command="Добавь задачу купить молоко"
                  description="Создать новую задачу"
                  badge="Новое"
                />
                <CommandItem 
                  command="Отметь задачу про молоко"
                  description="Отметить задачу выполненной"
                  badge="Новое"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={24} className="text-purple-600" />
                  Календарь
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CommandItem 
                  command="Что в календаре?"
                  description="Показать события на ближайшую неделю"
                />
                <CommandItem 
                  command="События на сегодня"
                  description="Показать события текущего дня"
                />
                <CommandItem 
                  command="Что в календаре на неделю?"
                  description="Показать все события недели"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingCart" size={24} className="text-green-600" />
                  Покупки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CommandItem 
                  command="Список покупок"
                  description="Показать все покупки"
                />
                <CommandItem 
                  command="Что нужно купить?"
                  description="Показать список необходимых покупок"
                />
                <CommandItem 
                  command="Добавь покупку хлеб и молоко"
                  description="Добавить товар в список"
                  badge="Новое"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" size={24} className="text-yellow-600" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CommandItem 
                  command="Статистика семьи"
                  description="Показать топ активных членов семьи"
                />
                <CommandItem 
                  command="Кто лидер по задачам?"
                  description="Показать лидера по выполненным задачам"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Инструкция */}
          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Smartphone" size={24} className="text-blue-600" />
                  Как активировать навык
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <InstructionStep 
                    number={1}
                    title="Откройте приложение Яндекс"
                    description="На телефоне или умной колонке"
                    icon="Smartphone"
                  />
                  <InstructionStep 
                    number={2}
                    title="Скажите активационную фразу"
                    description="Алиса, открой навык Наша Семья"
                    icon="Mic"
                  />
                  <InstructionStep 
                    number={3}
                    title="Привяжите аккаунт"
                    description="Скажите 'Привяжи аккаунт' и назовите код из вкладки Настройка"
                    icon="Link"
                  />
                  <InstructionStep 
                    number={4}
                    title="Начните пользоваться"
                    description="Задавайте вопросы и управляйте делами голосом"
                    icon="Sparkles"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="HelpCircle" size={24} className="text-purple-600" />
                  Частые вопросы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FAQItem 
                  question="Алиса не понимает команды?"
                  answer="Убедитесь что вы привязали аккаунт через код. Говорите чётко и ждите ответа Алисы перед следующей командой."
                />
                <FAQItem 
                  question="Код не принимается?"
                  answer="Проверьте что код не истёк (действителен 15 минут). Создайте новый код и попробуйте снова."
                />
                <FAQItem 
                  question="Как отменить привязку?"
                  answer="Перейдите на вкладку 'Настройка' и нажмите кнопку 'Отвязать Алису'."
                />
                <FAQItem 
                  question="Работает ли на колонках?"
                  answer="Да! Навык работает на Яндекс.Станции, Станции Мини и других устройствах с Алисой."
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Icon name="Info" size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Нужна помощь?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Если у вас возникли проблемы с интеграцией, обратитесь в техподдержку
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/support')}>
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Написать в поддержку
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Вспомогательные компоненты
function CommandItem({ command, description, badge }: { command: string; description: string; badge?: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="MessageSquare" size={14} className="text-gray-400" />
            <code className="text-sm font-medium text-purple-600">{command}</code>
            {badge && (
              <Badge className="bg-green-100 text-green-700 text-xs">{badge}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InstructionStep({ number, title, description, icon }: { number: number; title: string; description: string; icon: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon name={icon as any} size={18} className="text-purple-600" />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-800 flex items-start gap-2">
        <Icon name="HelpCircle" size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
        {question}
      </h4>
      <p className="text-sm text-gray-600 pl-6">{answer}</p>
    </div>
  );
}