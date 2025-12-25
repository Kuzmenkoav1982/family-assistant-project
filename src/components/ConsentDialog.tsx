import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentDialog({ open, onAccept, onDecline }: ConsentDialogProps) {
  const [personalDataConsent, setPersonalDataConsent] = useState(false);
  const [childrenDataConsent, setChildrenDataConsent] = useState(false);

  const handleAccept = () => {
    if (!personalDataConsent) {
      alert('Для использования сервиса необходимо дать согласие на обработку персональных данных');
      return;
    }
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Согласие на обработку персональных данных</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">В соответствии с 152-ФЗ "О персональных данных"</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Оператор персональных данных:</strong><br />
              ИП Кузьменко Анастасия Вячеславовна<br />
              ОГРНИП: 325774600908955, ИНН: 231805728780<br />
              Email: IP.KUZMENKO@YANDEX.RU
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Какие данные мы собираем:</h3>
            <ul className="text-sm text-gray-700 space-y-1 pl-4">
              <li>• Ваше имя, email, фотография (из Яндекс ID)</li>
              <li>• Данные профилей членов семьи (имена, даты рождения, роли)</li>
              <li>• Контент: задачи, события, заметки, сообщения</li>
              <li>• Данные о развитии детей (только с вашего согласия)</li>
              <li>• Технические данные: IP-адрес, браузер, действия в сервисе</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Для чего используются данные:</h3>
            <ul className="text-sm text-gray-700 space-y-1 pl-4">
              <li>• Предоставление функционала сервиса «Наша семья»</li>
              <li>• Персонализация: AI-рекомендации по развитию детей</li>
              <li>• Улучшение работы сервиса и техническая поддержка</li>
              <li>• Отправка уведомлений (о задачах, событиях)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Ваши права:</h3>
            <ul className="text-sm text-gray-700 space-y-1 pl-4">
              <li>• Получить доступ к своим данным в любое время</li>
              <li>• Исправить неточные данные</li>
              <li>• Удалить все данные ("право на забвение")</li>
              <li>• Отозвать согласие на обработку данных</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="personal-consent"
                checked={personalDataConsent}
                onCheckedChange={(checked) => setPersonalDataConsent(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="personal-consent"
                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
              >
                <strong className="text-gray-900">Я даю согласие</strong> на обработку моих персональных данных 
                (ФИО, email, фото, данные профилей членов семьи) в соответствии с{' '}
                <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                  Политикой конфиденциальности
                </Link>
                {' '}и{' '}
                <Link to="/terms-of-service" target="_blank" className="text-blue-600 hover:underline">
                  Пользовательским соглашением
                </Link>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="children-consent"
                checked={childrenDataConsent}
                onCheckedChange={(checked) => setChildrenDataConsent(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="children-consent"
                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
              >
                <strong className="text-gray-900">Я даю согласие</strong> на обработку персональных данных 
                моих детей до 18 лет (ФИО, дата рождения, фото, данные о развитии) для целей персонализации 
                рекомендаций и анализа прогресса развития
                <span className="block mt-1 text-xs text-gray-600">
                  (Опционально. Без этого согласия функции развития детей будут недоступны)
                </span>
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs text-gray-700">
            <p>
              <strong>⚠️ Важно:</strong> Вы можете в любой момент отозвать согласие или удалить все данные, 
              обратившись на email IP.KUZMENKO@YANDEX.RU или через настройки профиля.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1"
          >
            <Icon name="X" size={16} className="mr-2" />
            Отказаться
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!personalDataConsent}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Icon name="Check" size={16} className="mr-2" />
            Принять и продолжить
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-gray-500 mt-2">
          Принимая согласие, вы подтверждаете, что ознакомлены с условиями обработки ПДн
        </p>
      </DialogContent>
    </Dialog>
  );
}
