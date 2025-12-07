import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  relationship?: string;
  avatar?: string;
  photo_url?: string;
  age?: number;
  points?: number;
  level?: number;
}

export default function FamilyManagement() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (authToken) {
      loadMembers();
    } else {
      setError('Требуется авторизация');
      setLoading(false);
    }
  }, [authToken]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${func2url['family-members']}?action=list`,
        {
          headers: { 'X-Auth-Token': authToken || '' },
        }
      );
      const data = await response.json();
      setMembers(data.members || []);
    } catch {
      setError('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      'Владелец': 'bg-orange-500',
      'Жена': 'bg-pink-500',
      'Муж': 'bg-blue-500',
      'Сын': 'bg-green-500',
      'Дочь': 'bg-purple-500',
    };
    return `${map[role] || 'bg-gray-500'} text-white`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Icon name="Users" size={36} className="text-blue-600" />
              Управление семьёй
            </h1>
            <p className="text-gray-600 mt-2">Управление участниками, ролями и правами доступа</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Участники семьи</CardTitle>
                <CardDescription>Всего участников: {members.length}</CardDescription>
              </div>
              <Button onClick={() => navigate('/family-invite')} className="gap-2">
                <Icon name="UserPlus" size={18} />
                Пригласить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Users" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Нет участников</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <Card key={m.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/member/${m.id}`)}>
                    <CardContent className="p-6 text-center space-y-3">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-purple-200" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center text-3xl mx-auto">{m.avatar || '👤'}</div>
                      )}
                      <h3 className="font-bold text-lg">{m.name}</h3>
                      <Badge className={getRoleColor(m.role)}>{m.role}</Badge>
                      {m.age && <p className="text-sm text-gray-500">{m.age} лет</p>}
                      {(m.level !== undefined || m.points !== undefined) && (
                        <div className="flex justify-center gap-3 text-sm">
                          {m.level && <span>🏆 Ур. {m.level}</span>}
                          {m.points !== undefined && <span>⭐ {m.points}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => navigate('/family-invite')}>
              <Icon name="Key" size={20} className="text-green-600" />
              <div className="text-left text-sm">
                <div className="font-semibold">Инвайт-коды</div>
                <div className="text-xs text-gray-500">Создать приглашение</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => navigate('/permissions')}>
              <Icon name="Shield" size={20} className="text-blue-600" />
              <div className="text-left text-sm">
                <div className="font-semibold">Права доступа</div>
                <div className="text-xs text-gray-500">Настроить разрешения</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}