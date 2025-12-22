import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface RegisterFormProps {
  registerData: {
    phone: string;
    password: string;
    confirmPassword: string;
    familyName: string;
    memberName: string;
    inviteCode: string;
    relationship: string;
    customRelationship: string;
  };
  setRegisterData: React.Dispatch<React.SetStateAction<{
    phone: string;
    password: string;
    confirmPassword: string;
    familyName: string;
    memberName: string;
    inviteCode: string;
    relationship: string;
    customRelationship: string;
  }>>;
  registerStep: 'choice' | 'create' | 'join';
  setRegisterStep: React.Dispatch<React.SetStateAction<'choice' | 'create' | 'join'>>;
  error: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  relationships: string[];
}

export default function RegisterForm({
  registerData,
  setRegisterData,
  registerStep,
  setRegisterStep,
  error,
  isLoading,
  onSubmit,
  relationships
}: RegisterFormProps) {
  if (registerStep === 'choice') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Выберите действие:</p>
        </div>
        
        <Button 
          onClick={() => setRegisterStep('create')}
          className="w-full h-auto py-4 flex flex-col gap-2"
          variant="outline"
        >
          <Icon name="PlusCircle" size={24} />
          <span className="font-semibold">Создать новую семью</span>
          <span className="text-xs text-gray-500">Начните с чистого листа</span>
        </Button>
        
        <Button 
          onClick={() => setRegisterStep('join')}
          className="w-full h-auto py-4 flex flex-col gap-2"
          variant="outline"
        >
          <Icon name="UserPlus" size={24} />
          <span className="font-semibold">Присоединиться к существующей семье</span>
          <span className="text-xs text-gray-500">У вас есть код приглашения</span>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Button 
        type="button"
        variant="ghost" 
        className="mb-2 -ml-2"
        onClick={() => setRegisterStep('choice')}
      >
        <Icon name="ArrowLeft" className="mr-2" size={16} />
        Назад
      </Button>

      <div className="space-y-2">
        <Label htmlFor="reg-phone">Телефон</Label>
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
        <Label htmlFor="reg-password">Пароль</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Минимум 6 символов"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          required
          minLength={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Подтвердите пароль</Label>
        <Input
          id="reg-confirm"
          type="password"
          placeholder="Повторите пароль"
          value={registerData.confirmPassword}
          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="member-name">Ваше имя</Label>
        <Input
          id="member-name"
          type="text"
          placeholder="Как вас зовут?"
          value={registerData.memberName}
          onChange={(e) => setRegisterData({ ...registerData, memberName: e.target.value })}
          required
        />
      </div>

      {registerStep === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="family-name">Название вашей семьи (необязательно)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Наша семья</span>
            <Input
              id="family-name"
              type="text"
              placeholder='"Ивановы"'
              value={registerData.familyName}
              onChange={(e) => setRegisterData({ ...registerData, familyName: e.target.value })}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500">
            Будет отображаться: <strong>Наша семья{registerData.familyName ? ` "${registerData.familyName}"` : ''}</strong>
          </p>
        </div>
      )}

      {registerStep === 'join' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="invite-code">Код приглашения</Label>
            <Input
              id="invite-code"
              type="text"
              placeholder="ABC123"
              value={registerData.inviteCode}
              onChange={(e) => setRegisterData({ ...registerData, inviteCode: e.target.value.toUpperCase() })}
              required
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Степень родства</Label>
            <Select 
              value={registerData.relationship}
              onValueChange={(value) => setRegisterData({ ...registerData, relationship: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите степень родства" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map(rel => (
                  <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {registerData.relationship === 'Другое' && (
            <div className="space-y-2">
              <Label htmlFor="custom-relationship">Укажите степень родства</Label>
              <Input
                id="custom-relationship"
                type="text"
                placeholder="Например: Друг семьи"
                value={registerData.customRelationship}
                onChange={(e) => setRegisterData({ ...registerData, customRelationship: e.target.value })}
                required
              />
            </div>
          )}
        </>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Icon name="Loader" className="mr-2 animate-spin" size={16} />
            Регистрация...
          </>
        ) : (
          <>
            <Icon name="UserPlus" className="mr-2" size={16} />
            Зарегистрироваться
          </>
        )}
      </Button>
    </form>
  );
}