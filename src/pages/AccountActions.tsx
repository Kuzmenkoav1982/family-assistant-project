/**
 * AccountActions — минимальная страница «действия с аккаунтом», доступная даже
 * до принятия согласия (исключение в ConsentGate). Здесь НЕТ данных профиля,
 * семьи или настроек — только три действия: выйти, скачать данные, удалить
 * аккаунт. Это сужает обход стены согласия до безопасного минимума.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SEOHead from '@/components/SEOHead';
import { clearAuthSession } from '@/lib/authStorage';
import { useSettingsActions } from '@/components/settings/useSettingsActions';

export default function AccountActions() {
  const { isExporting, handleExport, handleDeleteAccount } = useSettingsActions();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/welcome';
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await handleDeleteAccount();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-4">
      <SEOHead title="Действия с аккаунтом" description="Выход, экспорт и удаление аккаунта." path="/account-actions" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Действия с аккаунтом</h1>
        <p className="text-sm text-gray-600">
          Здесь вы можете выйти, скачать свои данные или удалить аккаунт — даже без
          принятия согласия.
        </p>

        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти из аккаунта
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <Icon name="Download" size={16} className="mr-2" />
          {isExporting ? 'Готовим файл…' : 'Скачать мои данные'}
        </Button>

        {!confirmDelete ? (
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => setConfirmDelete(true)}
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Удалить аккаунт
          </Button>
        ) : (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm text-red-800">
              Удаление аккаунта необратимо. Все данные будут стёрты. Продолжить?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Отмена
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onDelete} disabled={deleting}>
                {deleting ? 'Удаляем…' : 'Да, удалить'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
