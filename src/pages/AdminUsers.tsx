import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import func2url from '@/../backend/func2url.json';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  created_at: string;
  last_login_at: string | null;
  oauth_provider: string | null;
  is_verified: boolean;
  families_count: number;
  families_names: string | null;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const usersApiUrl = func2url['admin-users'] || '';

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadUsers = async () => {
    if (!usersApiUrl) {
      toast({
        title: 'API недоступен',
        description: 'Функция admin-users не развернута',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(usersApiUrl, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        setTotalCount(data.total);
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContactDisplay = (user: User) => {
    if (user.email) return user.email;
    if (user.phone) return user.phone;
    return '—';
  };

  const getAuthMethod = (user: User) => {
    if (user.oauth_provider) {
      return <Badge variant="outline" className="capitalize">{user.oauth_provider}</Badge>;
    }
    if (user.email) {
      return <Badge variant="outline">Email</Badge>;
    }
    if (user.phone) {
      return <Badge variant="outline">Телефон</Badge>;
    }
    return <Badge variant="secondary">—</Badge>;
  };

  const stats = {
    total: totalCount,
    verified: users.filter(u => u.is_verified).length,
    oauth: users.filter(u => u.oauth_provider).length,
    today: users.filter(u => {
      if (!u.created_at) return false;
      const today = new Date();
      const createdDate = new Date(u.created_at);
      return createdDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 bg-clip-text text-transparent">
              Зарегистрированные пользователи
            </h1>
            <p className="text-slate-600 mt-2">Управление базой пользователей</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              {loading ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : (
                <Icon name="RefreshCw" size={16} className="mr-2" />
              )}
              Обновить
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Users" size={16} className="text-blue-600" />
                Всего
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Подтверждённые
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.verified}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Globe" size={16} className="text-purple-600" />
                OAuth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.oauth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="TrendingUp" size={16} className="text-orange-600" />
                Сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.today}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Search" size={20} />
              Поиск пользователей
            </CardTitle>
            <CardDescription>Поиск по email, телефону, имени или ID</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Введите запрос..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Найдено: {filteredUsers.length} из {users.length}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={20} />
              Список пользователей ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin text-gray-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Пользователи не найдены</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Контакт</TableHead>
                      <TableHead>Метод входа</TableHead>
                      <TableHead>Семьи</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Последний вход</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || <span className="text-gray-400">Не указано</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.email && <Icon name="Mail" size={14} className="text-gray-400" />}
                            {user.phone && <Icon name="Phone" size={14} className="text-gray-400" />}
                            <span className="text-sm">{getContactDisplay(user)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getAuthMethod(user)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {user.families_count || 0} {user.families_count === 1 ? 'семья' : user.families_count > 1 && user.families_count < 5 ? 'семьи' : 'семей'}
                              </Badge>
                            </div>
                            {user.families_names && (
                              <span className="text-xs text-gray-500 max-w-xs truncate" title={user.families_names}>
                                {user.families_names}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(user.last_login_at)}
                        </TableCell>
                        <TableCell>
                          {user.is_verified ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Icon name="CheckCircle" size={12} className="mr-1" />
                              Подтверждён
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Icon name="Clock" size={12} className="mr-1" />
                              Ожидание
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}