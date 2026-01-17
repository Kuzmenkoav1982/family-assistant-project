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

        // Generate QR code
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Совет:</p>
                  <p>Пригласить родных можно в любой момент через раздел "Настройки → Семья"</p>
                </div>
              </div>
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon name="Users" size={40} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Пригласите семью
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Поделитесь ссылкой или QR-кодом с родственниками
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Создаю приглашение...</p>
            </div>
          ) : inviteCode ? (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-200">
                  <img src={qrCodeUrl} alt="QR код приглашения" className="w-64 h-64" />
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Отсканируйте камерой телефона
                  </p>
                </div>
              </div>

              {/* Invite Code */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                <Label className="text-sm text-gray-700 mb-2 block">Код приглашения:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-4 py-3 rounded-lg text-2xl font-mono font-bold text-purple-600 text-center border-2 border-purple-200">
                    {inviteCode}
                  </code>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Родственники могут ввести этот код вручную
                </p>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-700">Поделиться ссылкой:</Label>
                
                <Button
                  onClick={shareViaMax}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-14 text-base group"
                  title="Отправить приглашение через мессенджер MAX"
                >
                  <Icon name="MessageCircle" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Отправить через MAX
                </Button>

                <Button
                  onClick={shareViaTelegram}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 h-14 text-base group"
                  title="Отправить приглашение через Telegram"
                >
                  <Icon name="Send" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Отправить через Telegram
                </Button>

                <Button
                  onClick={shareNative}
                  variant="outline"
                  className="w-full border-2 border-purple-300 hover:bg-purple-50 h-14 text-base group"
                  title="Поделиться через любое установленное приложение"
                >
                  <Icon name="Share2" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Поделиться
                </Button>

                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:bg-gray-50 h-14 text-base group"
                  title="Скопировать ссылку в буфер обмена"
                >
                  <Icon name="Copy" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Скопировать ссылку
                </Button>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">✅ Приглашение активно</p>
                    <p>Ссылка действует 30 дней. По ней могут присоединиться до 10 человек.</p>
                  </div>
                </div>
              </div>

              {/* Finish Button */}
              <Button
                onClick={finishOnboarding}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-base"
              >
                <Icon name="CheckCircle" size={20} className="mr-2" />
                Готово, перейти в приложение
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
