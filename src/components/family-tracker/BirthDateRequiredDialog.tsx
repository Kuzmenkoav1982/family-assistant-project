/**
 * Шаг ввода даты рождения — только когда она действительно нужна.
 *
 * Мы намеренно НЕ запрашиваем дату рождения у всех участников семьи
 * заранее. Это был бы массовый сбор персональных данных ради функции,
 * которой большинство не пользуется. Дата спрашивается ровно в тот
 * момент, когда без неё нельзя решить, кто вправе дать согласие, — и
 * ровно у того участника, которого это касается.
 *
 * Возраст не выводится из роли «Сын», «Дочь», child, из имени или из
 * положения в семейном древе: это догадки, а на них нельзя строить
 * правило о согласии несовершеннолетнего.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  memberName: string;
  /** true — заполняем свою дату, false — дату участника без аккаунта. */
  isSelf: boolean;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (birthDate: string) => void;
}

export default function BirthDateRequiredDialog({
  open, memberName, isSelf, submitting, error, onCancel, onSave,
}: Props) {
  const [value, setValue] = useState('');

  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);
  const valid = Boolean(value) && value <= today;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Icon name="Calendar" size={22} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Нужна дата рождения
          </h2>
        </div>

        <p className="mb-4 text-sm text-gray-700">
          Для определения порядка предоставления согласия необходимо указать
          дату рождения {isSelf ? 'участника' : <strong>{memberName}</strong>}.
        </p>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="mb-2 font-semibold text-gray-900">Зачем это нужно</p>
          <p>
            От возраста зависит, кто вправе принять решение об обработке данных
            о местоположении: до 14 лет — законный представитель, с 14 лет —
            сам участник через собственный аккаунт. Пока возраст неизвестен,
            функция не включается.
          </p>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-900">
          Дата рождения
        </label>
        <Input
          type="date"
          value={value}
          max={today}
          onChange={(e) => setValue(e.target.value)}
          className="mb-2"
        />
        <p className="mb-4 text-xs text-gray-500">
          Дата используется только для определения порядка согласия и
          возрастных ограничений. Она не применяется для рекламы и посторонней
          аналитики. Изменить её позже сможет не любой участник.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={() => onSave(value)} disabled={!valid || submitting}>
            {submitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
