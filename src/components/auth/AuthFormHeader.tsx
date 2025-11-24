import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AuthFormHeader() {
  return (
    <CardHeader>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Icon name="Users" className="text-white" size={32} />
        </div>
      </div>
      <CardTitle className="text-3xl text-center">Наша семья</CardTitle>
      <CardDescription className="text-center">
        Войдите по номеру телефона
      </CardDescription>
    </CardHeader>
  );
}