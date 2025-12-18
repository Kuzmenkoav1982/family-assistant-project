import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AliceConnectionStatus } from '@/components/alice/AliceConnectionStatus';
import { AliceSetupTab } from '@/components/alice/AliceSetupTab';
import { AliceCommandsTab } from '@/components/alice/AliceCommandsTab';
import { AliceGuideTab } from '@/components/alice/AliceGuideTab';

export default function AliceIntegration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [linkingCode, setLinkingCode] = useState<string>('');
  const [isLinked, setIsLinked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    checkLinkingStatus();
    
    // Автообновление статуса каждые 5 секунд (если есть активный код)
    const interval = setInterval(() => {
      if (linkingCode && !isLinked) {
        checkLinkingStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [linkingCode, isLinked]);

  const checkLinkingStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=status', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      const data = await response.json();
      
      // Если статус изменился на "подключено"
      if (data.linked && !isLinked) {
        toast({
          title: '🎉 Алиса подключена!',
          description: 'Теперь вы можете управлять делами голосом',
          duration: 5000,
        });
        setLinkingCode(''); // Очищаем код после успешной привязки
        setExpiresAt(null);
      }
      
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

        <AliceConnectionStatus isLinked={isLinked} />

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

          <TabsContent value="setup" className="space-y-6">
            <AliceSetupTab
              isLinked={isLinked}
              linkingCode={linkingCode}
              expiresAt={expiresAt}
              isGenerating={isGenerating}
              onGenerateCode={generateCode}
              onCopyCode={copyCode}
              onUnlink={unlinkAlice}
            />
          </TabsContent>

          <TabsContent value="commands">
            <AliceCommandsTab />
          </TabsContent>

          <TabsContent value="guide">
            <AliceGuideTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}