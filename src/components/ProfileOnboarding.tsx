import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ProfileOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  memberId: string;
  memberName: string;
}

const AVATAR_OPTIONS = [
  '👨', '👩', '👦', '👧', '👴', '👵', '👶',
  '🧑', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '🧔',
  '🤵', '👰', '🧑‍🎓', '👨‍⚕️', '👩‍⚕️',
  '👨‍🏫', '👩‍🏫', '👨‍💼', '👩‍💼', '🧑‍🌾'
];

export default function ProfileOnboarding({ isOpen, onComplete, memberId, memberName }: ProfileOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    avatar: '👤',
    age: '',
    favorites: '',
    dislikes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setProfileData({
        avatar: '👤',
        age: '',
        favorites: '',
        dislikes: ''
      });
    }
  }, [isOpen]);

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch('https://functions.poehali.dev/8a66ac8a-2cc8-40f0-9fda-ec4d14b08dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'update',
          member_id: memberId,
          avatar: profileData.avatar,
          age: profileData.age ? parseInt(profileData.age) : undefined,
          food_preferences: {
            favorites: profileData.favorites.split(',').map(s => s.trim()).filter(Boolean),
            dislikes: profileData.dislikes.split(',').map(s => s.trim()).filter(Boolean)
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('needsProfileSetup');
        onComplete();
      } else {
        console.error('Profile update error:', data.error);
        localStorage.removeItem('needsProfileSetup');
        onComplete();
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      localStorage.removeItem('needsProfileSetup');
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('needsProfileSetup');
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Sparkles" size={28} className="text-purple-600" />
            Добро пожаловать, {memberName}!
          </DialogTitle>
          <DialogDescription>
            Давайте настроим ваш профиль в несколько шагов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-2 flex-1 rounded-full transition-all ${
                  step >= num ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{profileData.avatar}</div>
                <h3 className="text-lg font-semibold">Выберите аватар</h3>
                <p className="text-sm text-gray-600">Это поможет другим узнавать вас</p>
              </div>

              <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setProfileData({ ...profileData, avatar: emoji })}
                    className={`text-4xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                      profileData.avatar === emoji
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Пропустить
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-purple-600"
                >
                  Далее
                  <Icon name="ArrowRight" className="ml-2" size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Icon name="User" size={48} className="mx-auto mb-3 text-purple-600" />
                <h3 className="text-lg font-semibold">Основная информация</h3>
                <p className="text-sm text-gray-600">Это поможет лучше организовать семью</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Возраст (необязательно)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  min="1"
                  max="150"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <Icon name="ArrowLeft" className="mr-2" size={16} />
                  Назад
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-purple-600"
                >
                  Далее
                  <Icon name="ArrowRight" className="ml-2" size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Icon name="UtensilsCrossed" size={48} className="mx-auto mb-3 text-purple-600" />
                <h3 className="text-lg font-semibold">Пищевые предпочтения</h3>
                <p className="text-sm text-gray-600">Для планирования меню всей семьи</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favorites">Любимые блюда (необязательно)</Label>
                <Input
                  id="favorites"
                  type="text"
                  placeholder="Пицца, Паста, Салат Цезарь"
                  value={profileData.favorites}
                  onChange={(e) => setProfileData({ ...profileData, favorites: e.target.value })}
                />
                <p className="text-xs text-gray-500">Перечислите через запятую</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dislikes">Не люблю (необязательно)</Label>
                <Input
                  id="dislikes"
                  type="text"
                  placeholder="Брокколи, Грибы"
                  value={profileData.dislikes}
                  onChange={(e) => setProfileData({ ...profileData, dislikes: e.target.value })}
                />
                <p className="text-xs text-gray-500">Перечислите через запятую</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <Icon name="Info" size={14} className="inline mr-1" />
                Вы сможете изменить эти данные позже в разделе "Мой профиль"
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Icon name="ArrowLeft" className="mr-2" size={16} />
                  Назад
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Check" className="mr-2" size={16} />
                      Завершить
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
