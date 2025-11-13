import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';

const RELATIONSHIPS = [
  'Отец', 'Мать', 'Сын', 'Дочь',
  'Муж', 'Жена', 
  'Дедушка', 'Бабушка', 'Внук', 'Внучка',
  'Брат', 'Сестра',
  'Дядя', 'Тётя', 'Племянник', 'Племянница',
  'Двоюродный брат', 'Двоюродная сестра',
  'Другое'
];

export default function FamilyInviteManager() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInvite, setNewInvite] = useState({ maxUses: 1, daysValid: 7 });
  const [joinData, setJoinData] = useState({
    inviteCode: '',
    memberName: '',
    relationship: '',
    customRelationship: ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchInvites = async () => {
    try {
      const response = await fetch(INVITE_API, {
        headers: { 'X-Auth-Token': getAuthToken() }
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const createInvite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'create',
          max_uses: newInvite.maxUses,
          days_valid: newInvite.daysValid
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Код приглашения создан: ${data.invite.code}`);
        fetchInvites();
        setShowCreateDialog(false);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка создания приглашения');
    } finally {
      setIsLoading(false);
    }
  };

  const joinFamily = async () => {
    setIsLoading(true);
    try {
      const relationship = joinData.relationship === 'Другое' 
        ? joinData.customRelationship 
        : joinData.relationship;

      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'join',
          invite_code: joinData.inviteCode.toUpperCase(),
          member_name: joinData.memberName,
          relationship: relationship
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Вы присоединились к семье: ${data.family.name}`);
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          family_id: data.family.id,
          family_name: data.family.name,
          member_id: data.family.member_id
        }));
        window.location.reload();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка присоединения к семье');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('✅ Код скопирован в буфер обмена!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={24} />
          Приглашения в семью
        </CardTitle>
        <CardDescription>
          Создавайте коды для приглашения родственников
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Icon name="HelpCircle" size={18} className="text-purple-600" />
            Как пригласить родственников?
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Подробная инструкция с примерами и скриншотами
          </p>
          <Button
            onClick={() => navigate('/instructions?section=invites')}
            variant="outline"
            size="sm"
            className="w-full border-purple-300"
          >
            <Icon name="BookOpen" className="mr-2" size={16} />
            Открыть инструкцию
          </Button>
        </div>

        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Icon name="Plus" className="mr-2" size={16} />
                Создать приглашение
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать код приглашения</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Максимум использований</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newInvite.maxUses}
                    onChange={(e) => setNewInvite({ ...newInvite, maxUses: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Действителен (дней)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newInvite.daysValid}
                    onChange={(e) => setNewInvite({ ...newInvite, daysValid: parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={createInvite} disabled={isLoading} className="w-full">
                  {isLoading ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Icon name="UserPlus" className="mr-2" size={16} />
                Присоединиться
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Присоединиться к семье</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Код приглашения</Label>
                  <Input
                    placeholder="ABC12345"
                    value={joinData.inviteCode}
                    onChange={(e) => setJoinData({ ...joinData, inviteCode: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ваше имя</Label>
                  <Input
                    placeholder="Как вас называть?"
                    value={joinData.memberName}
                    onChange={(e) => setJoinData({ ...joinData, memberName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Степень родства</Label>
                  <Select 
                    value={joinData.relationship} 
                    onValueChange={(value) => setJoinData({ ...joinData, relationship: value })}
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
                {joinData.relationship === 'Другое' && (
                  <div className="space-y-2">
                    <Label>Укажите своё родство</Label>
                    <Input
                      placeholder="Опекун, Крёстный..."
                      value={joinData.customRelationship}
                      onChange={(e) => setJoinData({ ...joinData, customRelationship: e.target.value })}
                    />
                  </div>
                )}
                <Button 
                  onClick={joinFamily} 
                  disabled={isLoading || !joinData.inviteCode || !joinData.memberName || !joinData.relationship}
                  className="w-full"
                >
                  {isLoading ? 'Присоединение...' : 'Присоединиться'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Icon name="Lightbulb" size={18} className="text-blue-600" />
            Быстрый старт
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="font-semibold">Создать код</span>
              </div>
              <p className="text-xs text-gray-600">Нажмите "Создать приглашение" и получите код ABC12345</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-semibold">Отправить код</span>
              </div>
              <p className="text-xs text-gray-600">Отправьте код родственнику в WhatsApp или SMS</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="font-semibold">Родственник регистрируется</span>
              </div>
              <p className="text-xs text-gray-600">Он выбирает "Присоединиться к семье" при регистрации</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                <span className="font-semibold">Готово!</span>
              </div>
              <p className="text-xs text-gray-600">Родственник появится в вашей семье автоматически</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center justify-between">
            <span>Активные приглашения</span>
            {invites.length > 0 && (
              <Badge variant="secondary">{invites.length}</Badge>
            )}
          </h4>
          {invites.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Icon name="Users" size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">Нет активных приглашений</p>
              <p className="text-xs text-gray-400">Создайте первое приглашение выше</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="border-2 border-purple-200 bg-purple-50 rounded-lg p-3 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono font-bold text-xl text-purple-700">{invite.invite_code}</p>
                      {invite.uses_count >= invite.max_uses && (
                        <Badge className="bg-gray-500 text-xs">Использовано</Badge>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-600">
                      <span>
                        <Icon name="Users" size={12} className="inline mr-1" />
                        {invite.uses_count} / {invite.max_uses}
                      </span>
                      <span>
                        <Icon name="Calendar" size={12} className="inline mr-1" />
                        До {new Date(invite.expires_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => copyInviteCode(invite.invite_code)} className="bg-purple-600">
                    <Icon name="Copy" size={14} className="mr-1" />
                    Копировать
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}