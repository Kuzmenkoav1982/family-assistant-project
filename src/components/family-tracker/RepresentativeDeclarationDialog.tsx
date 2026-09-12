/**
 * Экран заявления о законном представительстве.
 *
 * ГЛАВНОЕ ПРАВИЛО ЭТОГО ЭКРАНА — не выдавать галочку за проверку.
 * Платформа не смотрела документы и не сверялась с государственными
 * реестрами, поэтому она вправе сказать только: «вы заявили».
 * Формулировки вида «платформа проверила, что вы законный представитель»
 * здесь запрещены — они вводят в заблуждение и пользователя, и того,
 * кто позже будет разбирать инцидент.
 *
 * Что здесь принципиально:
 *  - галочка не предустановлена, кнопка без неё недоступна;
 *  - видно, О КОМ заявление и КТО его делает;
 *  - текст заявления версионируется и доступен целиком;
 *  - оптимистичного перехода нет: дальше пускает только ответ сервера;
 *  - успех заявления ничего не включает — следом отдельный экран согласия.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { RepresentationStatus } from '@/hooks/useLegalRepresentative';

interface Props {
  open: boolean;
  status: RepresentationStatus | null;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  /** Открыть шаг ввода даты рождения, если возраст неизвестен. */
  onRequestBirthDate?: () => void;
}

// Понятные объяснения вместо кодов отказа: человек должен понимать,
// почему он не может сделать заявление, и что делать дальше.
const REASON_TEXT: Record<string, string> = {
  SUBJECT_AGE_UNKNOWN:
    'Не указана дата рождения участника. Пока возраст неизвестен, мы не можем определить, кто вправе принимать решения о его данных.',
  REPRESENTATIVE_AGE_UNKNOWN:
    'Не указана ваша дата рождения. Заявление о представительстве может сделать только совершеннолетний, поэтому возраст нужно указать.',
  REPRESENTATIVE_NOT_ADULT:
    'Заявление о законном представительстве может сделать только совершеннолетний.',
  SUBJECT_IS_NOT_MINOR:
    'Участнику 14 лет или больше. С этого возраста решение об обработке своих данных о местоположении он принимает сам, через собственный аккаунт. Представительство здесь не применяется.',
  REPRESENTATION_SELF_DENIED:
    'Нельзя заявить представительство над самим собой.',
  MEMBER_INACTIVE:
    'Ваша запись участника сейчас неактивна, поэтому заявление сделать нельзя.',
  SUBJECT_NOT_ACTIVE:
    'Запись этого участника сейчас неактивна.',
  CROSS_FAMILY_ACCESS:
    'Участник не найден в вашей семье.',
};

export default function RepresentativeDeclarationDialog({
  open, status, submitting, error, onCancel, onConfirm, onRequestBirthDate,
}: Props) {
  const [accepted, setAccepted] = useState(false);
  const [textOpen, setTextOpen] = useState(false);

  if (!open) return null;

  const eligibility = status?.eligibility;
  const blocked = eligibility ? !eligibility.allowed : true;
  const reason = eligibility?.reason || '';
  const needsBirthDate = reason === 'SUBJECT_AGE_UNKNOWN'
    || reason === 'REPRESENTATIVE_AGE_UNKNOWN';
  const blockText = blocked
    ? (REASON_TEXT[reason] || 'Заявление сейчас сделать нельзя.')
    : null;

  const subjectName = status?.subject_name || 'участника';
  const alreadyDeclared = Boolean(
    status?.declaration && !status.declaration.revoked_at,
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Icon name="ShieldCheck" size={22} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Подтверждение полномочий представителя
          </h2>
        </div>

        <p className="mb-4 text-sm text-gray-700">
          Чтобы управлять передачей местоположения ребёнка, подтвердите, что
          являетесь его законным представителем.{' '}
          <strong>
            Платформа сохраняет ваше заявление, но не проверяет его по
            государственным реестрам.
          </strong>
        </p>

        {/* Кто и о ком: без этого человек подписывает заявление вслепую. */}
        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Ребёнок</span>
            <span className="font-medium text-gray-900">{subjectName}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Дата рождения</span>
            <span className="font-medium text-gray-900">
              {status?.subject_birth_date
                ? new Date(status.subject_birth_date).toLocaleDateString('ru-RU')
                : status?.subject_age != null
                  ? `${status.subject_age} лет`
                  : 'не указана'}
            </span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Заявитель</span>
            <span className="font-medium text-gray-900">
              {status?.representative_name || 'вы'}
            </span>
          </div>
        </div>

        {blocked ? (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{blockText}</p>
            {needsBirthDate && onRequestBirthDate && (
              <Button
                variant="outline"
                className="mt-3 border-amber-400 bg-white"
                onClick={onRequestBirthDate}
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                Указать дату рождения
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="mb-1 font-semibold">Зачем это нужно</p>
              <p>
                До 14 лет решение об обработке данных ребёнка принимает его
                законный представитель. Роль в семье — «родитель», «владелец»
                или «администратор» — сама по себе этого статуса не
                подтверждает, поэтому требуется отдельное заявление.
              </p>
            </div>

            {alreadyDeclared && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                Вы уже заявили, что являетесь законным представителем этого
                ребёнка. Повторное подтверждение обновит дату и версию текста.
              </div>
            )}

            {/* Полный текст доступен до галочки, а не после. */}
            <button
              type="button"
              onClick={() => setTextOpen(!textOpen)}
              className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">
                Текст заявления
                {status?.declaration_text?.version
                  && ` (редакция ${status.declaration_text.version})`}
              </span>
              <Icon name={textOpen ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-gray-500" />
            </button>
            {textOpen && (
              <div className="mb-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
                {status?.declaration_text?.body_md || 'Текст недоступен.'}
              </div>
            )}

            {/* Галочка не предустановлена — иначе это не заявление,
                а действие по умолчанию, которого человек не совершал. */}
            <label className="mb-4 flex items-start gap-3 rounded-lg border-2 border-gray-200 p-3 text-sm text-gray-800">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(Boolean(v))}
                className="mt-0.5"
              />
              <span>
                Я подтверждаю, что являюсь законным представителем указанного
                ребёнка и имею право принимать решение об обработке его данных
                о местоположении. Я понимаю ответственность за достоверность
                этого заявления.
              </span>
            </label>

            <p className="mb-4 text-xs text-gray-600">
              Это заявление само по себе не включает передачу местоположения и
              не даёт вам доступа к координатам ребёнка. Согласие на обработку
              геоданных и выбор получателей — следующие, отдельные шаги.
            </p>
          </>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Отмена
          </Button>
          {!blocked && (
            <Button
              onClick={onConfirm}
              disabled={!accepted || submitting}
            >
              {submitting ? 'Сохраняем…' : 'Подтвердить представительство'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
