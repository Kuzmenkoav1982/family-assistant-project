import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import ForgotPassword from './ForgotPassword';

interface AuthFormProps {
  onAuthSuccess: (token: string, user: any) => void;
}

const RELATIONSHIPS = [
  'Отец', 'Мать', 'Сын', 'Дочь',
  'Муж', 'Жена', 
  'Дедушка', 'Бабушка', 'Внук', 'Внучка',
  'Брат', 'Сестра',
  'Дядя', 'Тётя', 'Племянник', 'Племянница',
  'Двоюродный брат', 'Двоюродная сестра',
  'Другое'
];

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<'choice' | 'create' | 'join'>('choice');
  
  const [registerData, setRegisterData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    familyName: '',
    memberName: '',
    inviteCode: '',
    relationship: '',
    customRelationship: ''
  });
  
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerData.phone) {
      setError('Укажите номер телефона');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (!registerData.memberName) {
      setError('Укажите ваше имя');
      return;
    }

    if (registerStep === 'join') {
      if (!registerData.inviteCode) {
        setError('Укажите код приглашения');
        return;
      }
      if (!registerData.relationship) {
        setError('Укажите степень родства');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const requestBody = {
        phone: registerData.phone,
        password: registerData.password,
        family_name: registerData.familyName || undefined
      };
      
      const response = await fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        
        if (data.error) {
          setError(data.error);
        } else {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          if (registerStep === 'join') {
            const relationship = registerData.relationship === 'Другое' 
              ? registerData.customRelationship 
              : registerData.relationship;

            const joinResponse = await fetch('https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': data.token
              },
              body: JSON.stringify({
                action: 'join',
                invite_code: registerData.inviteCode.toUpperCase(),
                member_name: registerData.memberName,
                relationship: relationship
              })
            });
            
            const joinData = await joinResponse.json();
            
            if (joinData.success) {
              const updatedUser = {
                ...data.user,
                family_id: joinData.family.id,
                family_name: joinData.family.name,
                member_id: joinData.family.member_id
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              localStorage.setItem('needsProfileSetup', 'true');
              onAuthSuccess(data.token, updatedUser);
            } else {
              setError('Ошибка присоединения к семье: ' + joinData.error);
              setIsLoading(false);
              return;
            }
          } else {
            const updateResponse = await fetch('https://functions.poehali.dev/8a66ac8a-2cc8-40f0-9fda-ec4d14b08dcf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': data.token
              },
              body: JSON.stringify({
                action: 'update',
                member_id: data.user.member_id,
                name: registerData.memberName,
                role: 'Владелец'
              })
            });
            
            await updateResponse.json();
            localStorage.setItem('needsProfileSetup', 'true');
            onAuthSuccess(data.token, data.user);
          }
        }
      } catch (parseErr) {
        setError(`Ошибка сервера (${response.status}): Сервер вернул не JSON. Возможно проблема с базой данных.`);
        console.error('Server response:', responseText.substring(0, 500));
      }
    } catch (err) {
      setError('Ошибка при регистрации: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.phone) {
      setError('Укажите номер телефона');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: loginData.phone, password: loginData.password })
      });
      
      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        
        if (data.error) {
          setError(data.error);
        } else {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onAuthSuccess(data.token, data.user);
        }
      } catch (parseErr) {
        setError(`Ошибка сервера (${response.status}): Сервер вернул не JSON. Возможно проблема с базой данных.`);
        console.error('Server response:', responseText.substring(0, 500));
      }
    } catch (err) {
      setError('Ошибка при входе: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-2 border-blue-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Icon name="Users" className="text-white" size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl text-center">Семейный Органайзер</CardTitle>
          <CardDescription className="text-center">
            Войдите по номеру телефона
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={() => {
            setError('');
            setRegisterStep('choice');
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+79991234567"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                      Вход...
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" className="mr-2" size={16} />
                      Войти
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-purple-600 hover:text-purple-700"
                  onClick={() => setShowForgotPassword(true)}
                >
                  <Icon name="KeyRound" className="mr-2" size={16} />
                  Забыли пароль?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              {registerStep === 'choice' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">Выберите вариант</h3>
                    <p className="text-sm text-gray-600">Вы создаёте новую семью или присоединяетесь к существующей?</p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setRegisterStep('create')}
                    className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <div className="flex items-center gap-2 text-left w-full">
                      <Icon name="PlusCircle" size={24} />
                      <span className="text-lg font-bold">Создать новую семью</span>
                    </div>
                    <p className="text-xs text-left opacity-90">
                      Я первый пользователь, хочу создать свою семью
                    </p>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setRegisterStep('join')}
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-start gap-2 border-2 border-purple-300"
                  >
                    <div className="flex items-center gap-2 text-left w-full">
                      <Icon name="UserPlus" size={24} />
                      <span className="text-lg font-bold">Присоединиться к семье</span>
                    </div>
                    <p className="text-xs text-left text-gray-600">
                      У меня есть код приглашения от родственника
                    </p>
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
                    <Icon name="Info" size={14} className="inline mr-1" />
                    После регистрации вы сможете пригласить родственников в семью
                  </div>
                </div>
              )}

              {registerStep === 'create' && (
                <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRegisterStep('choice')}
                    className="mb-2"
                  >
                    <Icon name="ArrowLeft" className="mr-2" size={16} />
                    Назад
                  </Button>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                      <Icon name="Sparkles" size={20} />
                      Создание новой семьи
                    </h3>
                    <p className="text-sm text-gray-600">
                      Вы станете владельцем семьи и сможете приглашать родственников
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Ваше имя *</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Александр"
                      value={registerData.memberName}
                      onChange={(e) => setRegisterData({ ...registerData, memberName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-family">Название семьи</Label>
                    <Input
                      id="reg-family"
                      type="text"
                      placeholder="Семья Ивановых (необязательно)"
                      value={registerData.familyName}
                      onChange={(e) => setRegisterData({ ...registerData, familyName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Телефон *</Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+79991234567"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль *</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Подтвердите пароль *</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Повторите пароль"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                        Создание семьи...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" className="mr-2" size={16} />
                        Создать семью
                      </>
                    )}
                  </Button>
                </form>
              )}

              {registerStep === 'join' && (
                <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRegisterStep('choice')}
                    className="mb-2"
                  >
                    <Icon name="ArrowLeft" className="mr-2" size={16} />
                    Назад
                  </Button>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                      <Icon name="UserPlus" size={20} />
                      Присоединение к семье
                    </h3>
                    <p className="text-sm text-gray-600">
                      Попросите владельца семьи создать код приглашения
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-code">Код приглашения *</Label>
                    <Input
                      id="join-code"
                      type="text"
                      placeholder="ABC12345"
                      value={registerData.inviteCode}
                      onChange={(e) => setRegisterData({ ...registerData, inviteCode: e.target.value.toUpperCase() })}
                      maxLength={8}
                      required
                    />
                    <p className="text-xs text-gray-500">8 символов (буквы и цифры)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-name">Ваше имя *</Label>
                    <Input
                      id="join-name"
                      type="text"
                      placeholder="Максим"
                      value={registerData.memberName}
                      onChange={(e) => setRegisterData({ ...registerData, memberName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-relationship">Степень родства *</Label>
                    <Select 
                      value={registerData.relationship} 
                      onValueChange={(value) => setRegisterData({ ...registerData, relationship: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {registerData.relationship === 'Другое' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-rel">Укажите своё родство *</Label>
                      <Input
                        id="custom-rel"
                        type="text"
                        placeholder="Опекун, Крёстный..."
                        value={registerData.customRelationship}
                        onChange={(e) => setRegisterData({ ...registerData, customRelationship: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="join-phone">Телефон *</Label>
                    <Input
                      id="join-phone"
                      type="tel"
                      placeholder="+79991234567"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="join-password">Пароль *</Label>
                    <Input
                      id="join-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="join-confirm">Подтвердите пароль *</Label>
                    <Input
                      id="join-confirm"
                      type="password"
                      placeholder="Повторите пароль"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                        Присоединение...
                      </>
                    ) : (
                      <>
                        <Icon name="UserPlus" className="mr-2" size={16} />
                        Присоединиться к семье
                      </>
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Регистрируясь, вы соглашаетесь с условиями использования</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
