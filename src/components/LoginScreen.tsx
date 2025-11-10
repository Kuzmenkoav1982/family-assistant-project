import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface LoginScreenProps {
  familyMembers: FamilyMember[];
  onLogin: (memberId: string) => void;
}

export function LoginScreen({ familyMembers, onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      
      <Card className="relative z-10 max-w-4xl w-full border-4 border-orange-300 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-pink-50 border-b-2 border-orange-200">
          <div className="text-7xl mb-4 animate-bounce-slow">👨‍👩‍👧‍👦</div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Семейный Органайзер
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-2">
            Выберите свой профиль для входа
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => onLogin(member.id)}
                className="group relative p-6 rounded-xl border-3 border-gray-200 bg-white hover:border-orange-400 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-orange-500 text-white rounded-full p-2 shadow-lg">
                    <Icon name="LogIn" size={20} />
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-3">
                  {member.avatarType === 'photo' && member.photoUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 group-hover:border-orange-400 transition-colors">
                      <img 
                        src={member.photoUrl} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-7xl group-hover:scale-110 transition-transform">
                      {member.avatar}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                      <Icon name="Award" size={14} className="text-yellow-600" />
                      <span className="font-semibold text-yellow-700">Ур. {member.level}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full">
                      <Icon name="Star" size={14} className="text-orange-600" />
                      <span className="font-semibold text-orange-700">{member.points}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 group-hover:border-orange-200 transition-colors">
                  <div className="flex justify-center">
                    <Button 
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      Войти
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <Icon name="Info" size={18} className="text-blue-600" />
              <p className="text-sm text-blue-800">
                Выберите свой профиль, чтобы увидеть персональные задачи и достижения
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
