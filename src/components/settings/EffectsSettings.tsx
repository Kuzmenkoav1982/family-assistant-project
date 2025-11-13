import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface EffectsSettingsProps {
  chamomileEnabled: boolean;
  soundEnabled: boolean;
  onChamomileChange: (enabled: boolean) => void;
  onSoundChange: (enabled: boolean) => void;
}

export default function EffectsSettings({
  chamomileEnabled,
  soundEnabled,
  onChamomileChange,
  onSoundChange
}: EffectsSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Sparkles" size={24} />
          Интерактивные эффекты
        </CardTitle>
        <CardDescription>
          Настройте визуальные эффекты и звуки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🌼</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Ромашки при клике</h3>
              <p className="text-sm text-gray-600 mb-2">
                Красивая анимация ромашек при каждом клике по экрану
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">🌼 8 цветов</Badge>
                <Badge variant="outline" className="text-xs">✨ Искорки</Badge>
                <Badge variant="outline" className="text-xs">🎯 Комбо эффект</Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              const newValue = !chamomileEnabled;
              onChamomileChange(newValue);
              localStorage.setItem('chamomileEnabled', String(newValue));
            }}
            variant={chamomileEnabled ? 'default' : 'outline'}
            className={chamomileEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <Icon name={chamomileEnabled ? 'Check' : 'X'} className="mr-2" size={16} />
            {chamomileEnabled ? 'Вкл' : 'Выкл'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔊</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Звуковые эффекты</h3>
              <p className="text-sm text-gray-600">
                Приятные звуки при взаимодействии с элементами
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              const newValue = !soundEnabled;
              onSoundChange(newValue);
              localStorage.setItem('soundEnabled', String(newValue));
            }}
            variant={soundEnabled ? 'default' : 'outline'}
            className={soundEnabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
          >
            <Icon name={soundEnabled ? 'Volume2' : 'VolumeX'} className="mr-2" size={16} />
            {soundEnabled ? 'Вкл' : 'Выкл'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
