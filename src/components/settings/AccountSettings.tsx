import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface AccountSettingsProps {
  onDeleteAccount: () => Promise<void>;
  onLogout?: () => void;
}

export default function AccountSettings({ onDeleteAccount, onLogout }: AccountSettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {user && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} />
              OAuth Авторизация
            </CardTitle>
            <CardDescription>
              Вы вошли через Яндекс ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border-2 border-yellow-200">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-yellow-400"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl">
                  {user.name?.[0] || '?'}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{user.name || 'Пользователь'}</h3>
                <p className="text-sm text-gray-600">{user.email || user.phone}</p>
                {user.family_name && (
                  <p className="text-xs text-gray-500 mt-1">Семья: {user.family_name}</p>
                )}
              </div>
              <Icon name="Check" className="text-green-600" size={24} />
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                if (onLogout) onLogout();
                window.location.href = '/login';
              }}
              variant="outline"
              className="w-full mt-4"
            >
              <Icon name="LogOut" className="mr-2" size={16} />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Icon name="AlertTriangle" size={24} />
            Опасная зона
          </CardTitle>
          <CardDescription>
            Необратимые действия с вашим аккаунтом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Trash2" className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">Удалить аккаунт</h3>
                <p className="text-sm text-red-700 mb-4">
                  Это действие удалит ваш аккаунт и все связанные данные без возможности восстановления.
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <Icon name="X" size={16} className="text-red-600" />
                    <span>Все члены семьи будут удалены</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <Icon name="X" size={16} className="text-red-600" />
                    <span>Все задачи и достижения будут потеряны</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <Icon name="X" size={16} className="text-red-600" />
                    <span>История и статистика будут стёрты</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <Icon name="X" size={16} className="text-red-600" />
                    <span>Восстановление будет невозможно</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Icon name="Trash2" className="mr-2" size={16} />
                  Удалить аккаунт навсегда
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Icon name="AlertTriangle" size={24} />
              Подтвердите удаление
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-sm font-semibold text-red-900 mb-2">
                ⚠️ Это действие нельзя отменить!
              </p>
              <p className="text-sm text-red-700">
                Вы действительно хотите удалить свой аккаунт и все данные безвозвратно?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                <Icon name="X" className="mr-2" size={16} />
                Отмена
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Да, удалить
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}