import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface FirstLoginWelcomeProps {
  isFirstLogin: boolean;
  onClose: () => void;
}

export function FirstLoginWelcome({ isFirstLogin, onClose }: FirstLoginWelcomeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isFirstLogin) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstLogin]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Sparkles" className="text-purple-600" size={28} />
            Добро пожаловать в семейный органайзер!
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            Вы успешно создали семью. Вот несколько подсказок для начала работы:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Settings" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Настройте название и логотип семьи
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Наведите курсор на логотип или название семьи вверху страницы — появится кнопка настроек.
                </p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-100">
                    <Icon name="ExternalLink" size={14} className="mr-1" />
                    Перейти в настройки
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Icon name="UserPlus" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Добавьте членов семьи
                </h3>
                <p className="text-sm text-green-800">
                  Создайте профили для всех членов семьи, чтобы назначать задачи и отслеживать прогресс.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Calendar" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">
                  Планируйте задачи и события
                </h3>
                <p className="text-sm text-purple-800">
                  Используйте календарь и задачи для организации семейной жизни.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Bot" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  Познакомьтесь с AI-ассистентом "Домовой"
                </h3>
                <p className="text-sm text-orange-800">
                  Ваш умный помощник по дому: повар, психолог, финансист, педагог и другие роли.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={handleClose} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Icon name="Check" size={18} className="mr-2" />
            Понятно, начинаем!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}