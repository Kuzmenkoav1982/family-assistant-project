import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [familySize, setFamilySize] = useState<string>('');
  const [familyName, setFamilyName] = useState('');

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

  const finish = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests));
    localStorage.setItem('onboarding_family_size', familySize);
    navigate('/');
  };

  const steps = [
    {
      title: `${familyName ? familyName + ', добро' : 'Добро'} пожаловать!`,
      subtitle: 'Какой размер вашей семьи?',
      content: (
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
      ),
      canNext: !!familySize,
    },
    {
      title: 'Что для вас важно?',
      subtitle: 'Выберите то, чем будете пользоваться. Можно изменить потом.',
      content: (
        <div className="grid grid-cols-2 gap-3">
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
      ),
      canNext: selectedInterests.length > 0,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
            <p className="text-gray-500">{currentStep.subtitle}</p>
          </div>

          {currentStep.content}

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
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!currentStep.canNext}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Далее
              </Button>
            ) : (
              <Button
                onClick={finish}
                disabled={!currentStep.canNext}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Готово
              </Button>
            )}
          </div>

          <button
            onClick={finish}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Пропустить
          </button>
        </CardContent>
      </Card>
    </div>
  );
}