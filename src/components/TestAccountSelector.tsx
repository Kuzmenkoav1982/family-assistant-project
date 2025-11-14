import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface TestAccount {
  id: string;
  user_id: string;
  name: string;
  role: string;
  avatar: string;
  family_id: string;
  family_name: string;
  permissions: {
    isAdmin: boolean;
    canManageFamily: boolean;
    canCreateTasks: boolean;
    canEditCalendar: boolean;
  };
}

const testAccounts: TestAccount[] = [
  {
    id: 'member-1',
    user_id: 'user-1',
    name: 'Алексей',
    role: 'Отец (Владелец)',
    avatar: '👨‍💼',
    family_id: 'family-kuzmenko',
    family_name: 'Семья Кузьменко',
    permissions: {
      isAdmin: true,
      canManageFamily: true,
      canCreateTasks: true,
      canEditCalendar: true,
    }
  },
  {
    id: 'member-2',
    user_id: 'user-2',
    name: 'Анастасия',
    role: 'Супруга',
    avatar: '👩',
    family_id: 'family-kuzmenko',
    family_name: 'Семья Кузьменко',
    permissions: {
      isAdmin: false,
      canManageFamily: true,
      canCreateTasks: true,
      canEditCalendar: true,
    }
  },
  {
    id: 'member-3',
    user_id: 'user-3',
    name: 'Матвей',
    role: 'Сын',
    avatar: '👦',
    family_id: 'family-kuzmenko',
    family_name: 'Семья Кузьменко',
    permissions: {
      isAdmin: false,
      canManageFamily: false,
      canCreateTasks: true,
      canEditCalendar: true,
    }
  }
];

interface TestAccountSelectorProps {
  onSelectAccount: (account: TestAccount) => void;
}

export default function TestAccountSelector({ onSelectAccount }: TestAccountSelectorProps) {
  const handleSelect = (account: TestAccount) => {
    const token = `test-token-${account.user_id}`;
    const user = {
      id: account.user_id,
      member_id: account.id,
      family_id: account.family_id,
      name: account.name,
      role: account.role,
      avatar: account.avatar,
      permissions: account.permissions
    };
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    onSelectAccount(account);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="mb-4">
            <div className="text-6xl mb-2">👨‍👩‍👦</div>
            <Badge className="bg-amber-500 text-white">ТЕСТОВЫЙ РЕЖИМ</Badge>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Семейный Органайзер
          </CardTitle>
          <p className="text-lg text-gray-600 mt-2">Выберите тестовый аккаунт для входа</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testAccounts.map((account, index) => (
              <Card 
                key={account.id}
                className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-purple-400 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleSelect(account)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="text-6xl mb-3">{account.avatar}</div>
                  <CardTitle className="text-xl mb-1">{account.name}</CardTitle>
                  <p className="text-sm text-gray-600">{account.role}</p>
                  {account.permissions.isAdmin && (
                    <Badge className="mt-2 bg-purple-600">Администратор</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 pt-3 border-t">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={account.permissions.canManageFamily ? 'CheckCircle' : 'XCircle'} 
                        size={14} 
                        className={account.permissions.canManageFamily ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Управление семьёй</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={account.permissions.canCreateTasks ? 'CheckCircle' : 'XCircle'} 
                        size={14} 
                        className={account.permissions.canCreateTasks ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Создание задач</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={account.permissions.canEditCalendar ? 'CheckCircle' : 'XCircle'} 
                        size={14} 
                        className={account.permissions.canEditCalendar ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Редактирование календаря</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => handleSelect(account)}
                  >
                    <Icon name="LogIn" className="mr-2" size={16} />
                    Войти как {account.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Тестовый режим активен</p>
                <p>Вы можете войти под любым аккаунтом семьи Кузьменко для тестирования всех функций приложения. Все изменения сохраняются в браузере локально.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
