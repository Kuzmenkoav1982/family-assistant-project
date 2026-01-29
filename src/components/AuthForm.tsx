import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ForgotPassword from './ForgotPassword';
import AuthFormHeader from './auth/AuthFormHeader';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

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
      const requestBody: any = {
        phone: registerData.phone,
        password: registerData.password,
        family_name: registerData.familyName || undefined,
        name: registerData.memberName
      };
      
      if (registerStep === 'join' && registerData.inviteCode) {
        requestBody.invite_code = registerData.inviteCode.toUpperCase();
        requestBody.relationship = registerData.relationship === 'Другое' 
          ? registerData.customRelationship 
          : registerData.relationship;
      }
      
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
          localStorage.setItem('needsProfileSetup', 'true');
          // Очищаем флаги демо-режима при успешной регистрации
          localStorage.removeItem('isDemoMode');
          localStorage.removeItem('demoStartTime');
          
          onAuthSuccess(data.token, data.user);
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
          // Очищаем флаги демо-режима при успешном логине
          localStorage.removeItem('isDemoMode');
          localStorage.removeItem('demoStartTime');
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
        <AuthFormHeader />
        
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
              <LoginForm
                loginData={loginData}
                setLoginData={setLoginData}
                error={error}
                isLoading={isLoading}
                onSubmit={handleLogin}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm
                registerData={registerData}
                setRegisterData={setRegisterData}
                registerStep={registerStep}
                setRegisterStep={setRegisterStep}
                error={error}
                isLoading={isLoading}
                onSubmit={handleRegister}
                relationships={RELATIONSHIPS}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}