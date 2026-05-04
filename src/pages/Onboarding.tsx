import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const INTEREST_OPTIONS = [
  { id: 'tasks', icon: 'CheckSquare', label: 'Задачи и списки дел' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Списки покупок' },
  { id: 'calendar', icon: 'Calendar', label: 'Семейный календарь' },
  { id: 'health', icon: 'Heart', label: 'Здоровье и лекарства' },
  { id: 'meals', icon: 'UtensilsCrossed', label: 'Питание и рецепты' },
  { id: 'children', icon: 'Baby', label: 'Развитие детей' },
  { id: 'finance', icon: 'Wallet', label: 'Семейный бюджет' },
  { id: 'trips', icon: 'Plane', label: 'Путешествия' },
];

const FAMILY_SIZE_OPTIONS = [
  { id: '2', label: 'Мы вдвоём', icon: 'Heart' },
  { id: '3-4', label: '3-4 человека', icon: 'Users' },
  { id: '5+', label: '5 и больше', icon: 'UsersRound' },
  { id: 'solo', label: 'Пока один(а)', icon: 'User' },
];

const ROLE_OPTIONS = [
  { id: 'Супруг(а)', label: 'Супруг(а)', icon: 'Heart' },
  { id: 'Ребёнок', label: 'Ребёнок', icon: 'Baby' },
  { id: 'Родитель', label: 'Родитель', icon: 'User' },
  { id: 'Другое', label: 'Другое', icon: 'Users' },
];

function getAuthToken(): string {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.token || '';
    }
  } catch {
    // ignore
  }
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  return token;
}

interface InviteResult {
  code: string;
  family_name: string;
  expires_at: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [familySize, setFamilySize] = useState<string>('');
  const [familyName, setFamilyName] = useState('');

  // Шаг приглашения
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFamilyName(user.family_name || user.name || '');
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const createInvite = async () => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const token = getAuthToken();
      const res = await fetch('https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({ action: 'create', max_uses: 1, days_valid: 7 }),
      });
      const data = await res.json();
      if (data.success && data.invite) {
        setInviteResult(data.invite);
      } else {
        setInviteError('Не удалось создать ссылку. Попробуйте позже.');
      }
    } catch {
      setInviteError('Ошибка соединения. Попробуйте позже.');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteResult) return;
    const link = `${window.location.origin}/join?code=${inviteResult.code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareInvite = () => {
    if (!inviteResult) return;
    const link = `${window.location.origin}/join?code=${inviteResult.code}`;
    const name = inviteName ? ` для ${inviteName}` : '';
    const text = `Приглашаю тебя${name} в семейное приложение «${inviteResult.family_name}»! Переходи по ссылке: ${link}`;
    if (navigator.share) {
      navigator.share({ title: 'Приглашение в семью', text, url: link });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const finish = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests));
    localStorage.setItem('onboarding_family_size', familySize);
    navigate('/');
  };

  const TOTAL_STEPS = 3;

  const stepConfig = [
    {
      title: `${familyName ? familyName + ', добро' : 'Добро'} пожаловать!`,
      subtitle: 'Какой размер вашей семьи?',
      canNext: !!familySize,
    },
    {
      title: 'Пригласите близкого человека',
      subtitle: 'Приложение работает для всей семьи вместе — отправьте первое приглашение прямо сейчас',
      canNext: true,
    },
    {
      title: 'Что для вас важно?',
      subtitle: 'Выберите то, чем будете пользоваться. Можно изменить потом.',
      canNext: selectedInterests.length > 0,
    },
  ];

  const current = stepConfig[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardContent className="p-4 sm:p-8">

          {/* Прогресс */}
          <div className="flex gap-2 mb-6 sm:mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h2>
            <p className="text-gray-500 text-sm">{current.subtitle}</p>
          </div>

          {/* ШАГ 1 — Размер семьи */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {FAMILY_SIZE_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFamilySize(option.id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                    familySize === option.id
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    familySize === option.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon name={option.icon} size={22} />
                  </div>
                  <span className={`text-sm font-medium ${
                    familySize === option.id ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ШАГ 2 — Приглашение */}
          {step === 1 && (
            <div className="space-y-4">
              {!inviteResult ? (
                <>
                  {/* Имя и роль */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Как зовут? <span className="text-gray-400 font-normal">(необязательно)</span>
                      </label>
                      <Input
                        placeholder="Например: Аня, Папа, Мама..."
                        value={inviteName}
                        onChange={e => setInviteName(e.target.value)}
                        className="border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Кто это?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLE_OPTIONS.map(r => (
                          <button
                            key={r.id}
                            onClick={() => setInviteRole(r.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                              inviteRole === r.id
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            <Icon name={r.icon} size={16} />
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {inviteError && (
                    <p className="text-sm text-red-500 text-center">{inviteError}</p>
                  )}

                  <Button
                    onClick={createInvite}
                    disabled={inviteLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white h-12"
                  >
                    {inviteLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Создаём ссылку...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Icon name="Link" size={18} />
                        Создать ссылку-приглашение
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                /* Ссылка создана */
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="Check" size={24} className="text-white" />
                    </div>
                    <p className="font-bold text-green-800 mb-1">Ссылка готова!</p>
                    <p className="text-sm text-green-600">
                      Действует 7 дней
                      {inviteName && ` · для ${inviteName}`}
                    </p>
                  </div>

                  {/* Код */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Код приглашения</p>
                      <p className="font-mono font-bold text-lg text-gray-900 tracking-widest">
                        {inviteResult.code}
                      </p>
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Копировать ссылку"
                    >
                      <Icon name={copied ? 'Check' : 'Copy'} size={18} className={copied ? 'text-green-600' : 'text-gray-500'} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={copyInviteLink}
                      className="flex-1"
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      {copied ? 'Скопировано!' : 'Копировать'}
                    </Button>
                    <Button
                      onClick={shareInvite}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                    >
                      <Icon name="Share2" size={16} className="mr-2" />
                      Поделиться
                    </Button>
                  </div>

                  <button
                    onClick={() => { setInviteResult(null); setInviteName(''); setInviteRole(''); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
                  >
                    Пригласить другого человека
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ШАГ 3 — Интересы */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedInterests.includes(option.id)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedInterests.includes(option.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon name={option.icon} size={20} />
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedInterests.includes(option.id) ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Навигация */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Назад
              </Button>
            )}
            {!isLastStep ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!current.canNext}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Далее
              </Button>
            ) : (
              <Button
                onClick={finish}
                disabled={!current.canNext}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Войти в приложение
              </Button>
            )}
          </div>

          <button
            onClick={finish}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Пропустить всё
          </button>

        </CardContent>
      </Card>
    </div>
  );
}
