import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface FamilySetupProps {
  user: any;
  onSetupComplete: () => void;
}

const RELATIONSHIPS = [
  'Отец', 'Мать', 'Сын', 'Дочь',
  'Муж', 'Жена', 
  'Дедушка', 'Бабушка', 'Внук', 'Внучка',
  'Брат', 'Сестра',
  'Дядя', 'Тётя', 'Племянник', 'Племянница',
  'Прадедушка', 'Прабабушка', 'Правнук', 'Правнучка',
  'Двоюродный брат', 'Двоюродная сестра',
  'Зять', 'Невестка', 'Тесть', 'Тёща', 'Свёкор', 'Свекровь',
  'Другое'
];

export default function FamilySetup({ user, onSetupComplete }: FamilySetupProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const getDefaultName = () => {
    if (user?.email) return user.email.split('@')[0];
    if (user?.phone && typeof user.phone === 'string' && user.phone.length >= 4) {
      return user.phone.slice(-4);
    }
    return 'Пользователь';
  };
  
  const [profileData, setProfileData] = useState({
    name: getDefaultName(),
    role: 'Владелец',
    relationship: '',
    customRelationship: '',
    avatar: '👤'
  });

  const avatars = ['👤', '👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👦', '👧', '👶', '🧒'];

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const relationship = profileData.relationship === 'Другое' 
        ? profileData.customRelationship 
        : profileData.relationship;

      const response = await fetch('https://functions.poehali.dev/db70be67-64af-4e9d-ab90-8485ed49c99f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_profile',
          name: profileData.name,
          role: profileData.role,
          relationship: relationship,
          avatar: profileData.avatar
        })
      });

      if (response.ok) {
        onSetupComplete();
      } else {
        alert('❌ Ошибка сохранения профиля');
        setIsLoading(false);
      }
    } catch (error) {
      alert('❌ Ошибка сети');
      setIsLoading(false);
    }
  };

  if (!user.family_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-2xl border-2 border-blue-200">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <img 
                src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
                alt="Семейный Органайзер"
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-3xl text-center">Добро пожаловать в Семейный Органайзер!</CardTitle>
            <CardDescription className="text-center text-lg mt-2">
              Давайте настроим ваш семейный профиль
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Icon name="Home" size={24} />
                    Ваша семья
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg">
                      <strong>Название:</strong> {user.family_name || 'Моя семья'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Семья была автоматически создана при регистрации
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Icon name="User" size={24} />
                    Настройте свой профиль
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Ваше имя</Label>
                    <Input
                      id="name"
                      placeholder="Как вас называть?"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Ваша роль в семье</Label>
                    <Input
                      id="role"
                      placeholder="Например: Папа, Мама, Сын"
                      value={profileData.role}
                      onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">Степень родства</Label>
                    <Select 
                      value={profileData.relationship} 
                      onValueChange={(value) => setProfileData({ ...profileData, relationship: value, customRelationship: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите родство" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {profileData.relationship === 'Другое' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="customRelationship">Укажите своё родство</Label>
                      <Input
                        id="customRelationship"
                        placeholder="Например: Опекун, Крёстный"
                        value={profileData.customRelationship}
                        onChange={(e) => setProfileData({ ...profileData, customRelationship: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Выберите аватар</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatars.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setProfileData({ ...profileData, avatar: emoji })}
                          className={`text-4xl p-3 rounded-lg border-2 hover:scale-110 transition-transform ${
                            profileData.avatar === emoji 
                              ? 'border-blue-500 bg-blue-50 scale-110' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full" 
                  size="lg"
                  disabled={!profileData.name.trim() || !profileData.relationship || (profileData.relationship === 'Другое' && !profileData.customRelationship.trim())}
                >
                  <Icon name="ArrowRight" className="mr-2" size={20} />
                  Продолжить
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="text-7xl">{profileData.avatar}</div>
                  <h3 className="text-2xl font-bold">{profileData.name}</h3>
                  <p className="text-lg text-gray-600">{profileData.role}</p>
                  <p className="text-md text-gray-500">
                    {profileData.relationship === 'Другое' ? profileData.customRelationship : profileData.relationship}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle2" className="text-green-600" size={32} />
                    <h3 className="font-bold text-xl">Всё готово!</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={16} />
                      Создана семья "{user.family_name}"
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={16} />
                      Настроен ваш профиль
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={16} />
                      Можно приглашать других членов семьи
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleComplete} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader" className="mr-2 animate-spin" size={20} />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="Rocket" className="mr-2" size={20} />
                        Начать использовать
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => setStep(1)} 
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Icon name="ArrowLeft" className="mr-2" size={16} />
                    Назад
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}