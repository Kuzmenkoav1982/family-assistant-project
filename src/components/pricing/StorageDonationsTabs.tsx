import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface StorageOption {
  id: string;
  name: string;
  price: number;
  storage: string;
  popular?: boolean;
}

interface DonationPreset {
  id: string;
  name: string;
  amount: number;
  emoji: string;
}

interface StorageDonationsTabsProps {
  storageOptions: StorageOption[];
  donationPresets: DonationPreset[];
  loading: string | null;
  customDonation: string;
  setCustomDonation: (v: string) => void;
  handleSubscribe: (planId: string, action?: 'create' | 'extend' | 'upgrade') => void;
  handleDonation: (presetId: string, amount: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: (opts: any) => void;
}

export default function StorageDonationsTabs({
  storageOptions,
  donationPresets,
  loading,
  customDonation,
  setCustomDonation,
  handleSubscribe,
  handleDonation,
  toast,
}: StorageDonationsTabsProps) {
  return (
    <>
      {/* Хранилище */}
      <TabsContent value="storage">
        <div className="grid md:grid-cols-4 gap-6">
          {storageOptions.map((option) => (
            <Card key={option.id} className={option.popular ? 'border-blue-500 border-2' : ''}>
              {option.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  👍 Выбор пользователей
                </Badge>
              )}
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl mb-2">
                  💾
                </div>
                <CardTitle>{option.storage}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{option.price}₽</span>
                  <span className="text-gray-500">/мес</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>📷 Фото и видео</li>
                  <li>📄 Документы</li>
                  <li>🔒 Резервное копирование</li>
                  <li>📱 Синхронизация устройств</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe(option.id)}
                  disabled={loading === option.id}
                >
                  {loading === option.id ? (
                    <Icon name="Loader2" className="animate-spin" size={16} />
                  ) : (
                    'Подключить'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Поддержка платформы */}
      <TabsContent value="donations">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">💚 Поддержи развитие платформы</CardTitle>
            <CardDescription className="text-lg mt-2">
              Все средства идут на добавление новых функций, улучшение скорости и оплату серверов.
              <br />
              <span className="text-purple-600 font-semibold">Твои идеи делают нашу платформу лучше!</span>
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {donationPresets.map((preset) => (
            <Card key={preset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{preset.emoji}</div>
                <CardTitle>{preset.name}</CardTitle>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {preset.amount}₽
                </div>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => handleDonation(preset.id, preset.amount)}
                  disabled={loading === preset.id}
                >
                  {loading === preset.id ? (
                    <Icon name="Loader2" className="animate-spin" size={16} />
                  ) : (
                    'Угостить Домового'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💰 Своя сумма</CardTitle>
            <CardDescription>Укажите любую сумму от 50₽</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                min="50"
                placeholder="Сумма (мин. 50₽)"
                value={customDonation}
                onChange={(e) => setCustomDonation(e.target.value)}
              />
              <Button
                onClick={() => {
                  const amount = parseInt(customDonation);
                  if (amount >= 50) {
                    handleDonation('custom', amount);
                  } else {
                    toast({
                      title: 'Минимальная сумма — 50₽',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={!customDonation || parseInt(customDonation) < 50}
              >
                Отправить
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
