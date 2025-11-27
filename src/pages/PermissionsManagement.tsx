import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { PermissionsManager } from '@/components/PermissionsManager';

export default function PermissionsManagement() {
  const navigate = useNavigate();
  const { members } = useFamilyMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button onClick={() => navigate('/')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Shield" size={28} />
              Управление правами доступа
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Настройте доступ к разделам для каждого члена семьи
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {members.map(member => (
                <Button
                  key={member.id}
                  variant={selectedMemberId === member.id ? 'default' : 'outline'}
                  onClick={() => setSelectedMemberId(member.id)}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  {member.avatarType === 'photo' && member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{member.avatar}</span>
                  )}
                  <div className="text-center">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs opacity-70">{member.role}</div>
                  </div>
                </Button>
              ))}
            </div>

            {selectedMember ? (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
                  {selectedMember.avatarType === 'photo' && selectedMember.photoUrl ? (
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <span className="text-5xl">{selectedMember.avatar}</span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {selectedMember.role}
                    </Badge>
                  </div>
                </div>
                
                <PermissionsManager member={selectedMember} />
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Выберите члена семьи для управления правами
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Совет:</p>
                <p>Отключите доступ к разделам для детей, если хотите ограничить их функционал. Владелец всегда имеет полный доступ ко всем разделам.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
