/**
 * Экран согласия на обработку данных о местоположении (152-ФЗ).
 *
 * Тумблер сам по себе согласием НЕ является: по ч.1.1 ст.9 152-ФЗ
 * согласие не может быть частью другого документа и должно быть
 * конкретным и информированным. Поэтому тумблер лишь открывает этот
 * экран, а сбор начинается только после того, как сервер подтвердил
 * запись согласия.
 *
 * Что здесь принципиально:
 *  - нет заранее проставленной галочки;
 *  - кнопка называет действие прямо, а не «ОК»;
 *  - видно, ЧЬЁ местоположение собирается и КТО его увидит;
 *  - срок хранения выбирает человек, по умолчанию минимальный (7 дней);
 *  - оптимистичного включения нет: при ошибке сети GPS не запускается.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

export interface ConsentEligibility {
  allowed: boolean;
  required_role: string | null;
  reason: string;
}

export interface ConsentTextInfo {
  version: string;
  summary?: string;
  body_md?: string;
  legal_review_status?: string;
}

export interface ConsentRecipientOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  subjectName: string;
  isSelf: boolean;
  eligibility: ConsentEligibility | null;
  consentText: ConsentTextInfo | null;
  recipientOptions: ConsentRecipientOption[];
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onAccept: (params: {
    retentionDays: number;
    recipients: string[];
    background: boolean;
  }) => void;
}

const RETENTION_OPTIONS = [
  { value: 0, label: 'Не хранить историю', hint: 'только текущее положение' },
  { value: 7, label: '7 дней', hint: 'по умолчанию' },
  { value: 30, label: '30 дней', hint: '' },
  { value: 90, label: '90 дней', hint: '' },
];

// Понятные объяснения вместо кодов отказа: человек должен понимать,
// почему он не может включить отслеживание, и что с этим делать.
const REASON_TEXT: Record<string, string> = {
  LOCATION_AGE_UNKNOWN:
    'Не указан возраст участника. Пока возраст неизвестен, мы не можем определить, кто вправе дать согласие, и не включаем геолокацию.',
  SELF_CONSENT_ONLY:
    'С 14 лет решение принимает сам участник. Вы можете отправить запрос, но подтвердить его должен он.',
  LEGAL_REPRESENTATIVE_NOT_CONFIRMED:
    'Для участника младше 14 лет согласие даёт подтверждённый законный представитель. Роль «родитель» в семье сама по себе этого статуса не подтверждает.',
  REPRESENTATIVE_CONSENT_REQUIRED:
    'Для участника младше 14 лет согласие должен дать законный представитель.',
};

export default function LocationConsentDialog({
  open, subjectName, isSelf, eligibility, consentText, recipientOptions,
  submitting, error, onCancel, onAccept,
}: Props) {
  const [retentionDays, setRetentionDays] = useState(7);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [background, setBackground] = useState(true);

  if (!open) return null;

  const blocked = eligibility ? !eligibility.allowed : false;
  const blockReason = eligibility && !eligibility.allowed
    ? (REASON_TEXT[eligibility.reason] || 'Согласие сейчас не может быть дано.')
    : null;

  const toggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Icon name="MapPin" size={22} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Включить передачу местоположения
          </h2>
        </div>

        <p className="mb-4 text-sm text-gray-700">
          Приложение будет получать местоположение
          {isSelf ? ' (ваше)' : <strong> участника {subjectName}</strong>},
          чтобы выбранные участники семьи могли видеть, где этот человек находится.
        </p>

        {blocked ? (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{blockReason}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <p className="mb-2 font-semibold text-gray-900">Будут обрабатываться:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>точные координаты устройства и время их определения;</li>
                <li>
                  {retentionDays > 0
                    ? `история перемещений — ${retentionDays} дней`
                    : 'история перемещений не сохраняется'};
                </li>
                <li>
                  {background
                    ? 'обновление в фоне примерно раз в 10 минут'
                    : 'обновление только при открытом приложении'};
                </li>
                <li>события входа и выхода из геозон — если вы их создадите.</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Кто увидит местоположение
              </p>
              {recipientOptions.length === 0 ? (
                <p className="text-sm text-gray-600">
                  В семье пока некого выбрать. Без получателей местоположение
                  не будет видно никому, кроме самого участника.
                </p>
              ) : (
                <div className="space-y-2">
                  {recipientOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 text-sm text-gray-800">
                      <Checkbox
                        checked={recipients.includes(option.id)}
                        onCheckedChange={() => toggleRecipient(option.id)}
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              )}
              {recipients.length === 0 && recipientOptions.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Никто не выбран — местоположение не увидит никто.
                  Получателей можно изменить позже.
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Сколько хранить историю
              </p>
              <div className="grid grid-cols-2 gap-2">
                {RETENTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRetentionDays(option.value)}
                    className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${
                      retentionDays === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.hint && (
                      <span className="block text-xs text-gray-500">{option.hint}</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                По истечении срока координаты удаляются.
              </p>
            </div>

            <label className="mb-4 flex items-start gap-2 text-sm text-gray-800">
              <Checkbox
                checked={background}
                onCheckedChange={(v) => setBackground(Boolean(v))}
              />
              <span>
                Обновлять местоположение в фоне
                <span className="block text-xs text-gray-500">
                  Без этого положение обновляется только при открытом приложении.
                </span>
              </span>
            </label>

            <p className="mb-4 text-xs text-gray-600">
              Согласие действует до отзыва. Отозвать можно в любой момент в этом
              же разделе — сбор прекратится сразу. Правовое основание — согласие
              субъекта персональных данных (152-ФЗ).
              {consentText?.version && (
                <span className="block mt-1 text-gray-400">
                  Версия документа: {consentText.version}
                </span>
              )}
            </p>
          </>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          {!blocked && (
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={() => onAccept({ retentionDays, recipients, background })}
            >
              {submitting ? 'Сохраняем согласие…' : 'Даю согласие и включаю'}
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={submitting}>
            {blocked ? 'Закрыть' : 'Отмена'}
          </Button>
        </div>
      </div>
    </div>
  );
}
