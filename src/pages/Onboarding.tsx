import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'choice' | 'invite'>('choice');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFamilyName(user.family_name || 'Моя семья');
      } catch (e) {
        setFamilyName('Моя семья');
      }
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const handleInviteFamily = async () => {
    setIsLoading(true);
    setStep('invite');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'create',
          max_uses: 10,
          days_valid: 30
        })
      });

      const data = await response.json();

      if (data.success && data.invite) {
        const code = data.invite.code;
        const link = `${window.location.origin}/join?code=${code}`;
        
        setInviteCode(code);
        setInviteLink(link);

        const qrUrl = await QRCode.toDataURL(link, {
          width: 300,
          margin: 2,
          color: {
            dark: '#4F46E5',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);

        toast({
          title: 'Приглашение создано! 🎉',
          description: 'Поделитесь ссылкой с родственниками'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать приглашение',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте интернет-соединение',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Скопировано! ✅',
      description: 'Ссылка скопирована в буфер обмена'
    });
  };

  const shareViaMax = () => {
    const message = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${inviteLink}`;
    const maxUrl = `https://tamtam.chat/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
    window.open(maxUrl, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${inviteLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareNative = () => {
    const message = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${inviteLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Приглашение в ${familyName}`,
        text: message
      }).catch(() => {
        copyLink();
      });
    } else {
      copyLink();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
                alt="Наша семья"
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Добро пожаловать в {familyName}! 👋
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Вы успешно создали семейное пространство
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <div className="text-center mb-6">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                Что делать дальше?
              </Badge>
            </div>

            <div className="grid gap-4">
              <Card 
                className="border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer group"
                onClick={handleInviteFamily}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon name="Users" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        👥 Пригласить родственников
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Создайте ссылку-приглашение и отправьте её родным через MAX, Telegram или любой другой мессенджер
                      </p>
                      <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                        <Icon name="ArrowRight" size={16} />
                        <span>Создать приглашение</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer group"
                onClick={handleSkip}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon name="Eye" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        🔍 Изучить приложение
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Сначала посмотрю, что здесь есть, а пригласить семью смогу позже в настройках
                      </p>
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Icon name="ArrowRight" size={16} />
                        <span>Перейти в приложение</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
              alt="Наша семья"
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Добро пожаловать в {familyName}! 👋
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Вы успешно создали семейное пространство
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Создаю приглашение...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                  Что делать дальше?
                </Badge>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
                  👥 Пригласить родственников
                </h3>

                {qrCodeUrl && (
                  <div className="bg-white rounded-lg p-6 flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                )}

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Ссылка-приглашение:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    />
                    <Button
                      onClick={copyLink}
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 text-center mb-3">
                    Отправить приглашение:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={shareViaMax}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Icon name="MessageCircle" size={24} className="text-blue-600" />
                      <span className="text-xs">MAX</span>
                    </Button>
                    
                    <Button
                      onClick={shareViaTelegram}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Icon name="Send" size={24} className="text-blue-500" />
                      <span className="text-xs">Telegram</span>
                    </Button>
                    
                    <Button
                      onClick={shareNative}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Icon name="Share2" size={24} className="text-green-600" />
                      <span className="text-xs">Другое</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={finishOnboarding}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Понятно, начинаем!
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
