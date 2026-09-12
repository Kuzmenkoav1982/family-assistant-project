/**
 * «Кто видит местоположение» + управление сбором и согласием.
 *
 * ДВА РАЗНЫХ ДЕЙСТВИЯ, КОТОРЫЕ НЕЛЬЗЯ ОБЪЕДИНЯТЬ:
 *
 *   Выключить передачу местоположения
 *       — сбор прекращается немедленно, согласие остаётся действующим,
 *         включить обратно можно без нового согласия.
 *
 *   Отозвать согласие и прекратить обработку
 *       — сбор прекращается, получатели теряют доступ, запускается
 *         удаление данных, следующее включение требует нового согласия.
 *
 * Раньше это был один тумблер. Так человек не принимал осознанно ни одно
 * из двух решений: выключая передачу на ночь, он терял согласие, а найти
 * отдельный отзыв было негде.
 *
 * Отзыв здесь — одно нажатие с информационным подтверждением. Затруднять
 * или задерживать его нельзя.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { LocationConsentStatus } from '@/hooks/useLocationConsent';

interface Props {
  status: LocationConsentStatus | null;
  submitting: boolean;
  onSetCollection: (enabled: boolean) => void;
  onRevoke: () => void;
  onRevokeRecipient?: (memberId: string) => void;
}

function fmt(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function LocationAccessPanel({
  status, submitting, onSetCollection, onRevoke, onRevokeRecipient,
}: Props) {
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const consent = status?.consent;
  if (!consent) return null;

  const recipients = status?.recipients_detail || [];
  const collecting = consent.collection_enabled !== false;

  // Ежегодное напоминание — не автопродление: оно лишь показывает
  // текущие условия и оба способа их прекратить.
  const reminderDue = consent.next_reminder_at
    ? new Date(consent.next_reminder_at) <= new Date()
    : false;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Eye" size={20} />
          Кто видит местоположение
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminderDue && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="mb-1 font-semibold">Ежегодная проверка настроек</p>
            <p>
              Прошёл год с момента согласия. Проверьте условия ниже. Это
              напоминание, а не продление: если условия изменятся, потребуется
              новое согласие.
            </p>
          </div>
        )}

        {/* Текущие условия: человек должен видеть, на что согласился. */}
        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-gray-600">Передача местоположения</span>
            {collecting ? (
              <Badge className="border border-green-300 bg-green-100 text-green-800">
                Включена
              </Badge>
            ) : (
              <Badge className="border border-gray-300 bg-gray-100 text-gray-700">
                Выключена, согласие действует
              </Badge>
            )}
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Точность</span>
            <span className="text-gray-900">
              {(consent.data_scope as Record<string, unknown>)?.precise
                ? 'точные координаты' : 'приблизительная'}
            </span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Частота обновления</span>
            <span className="text-gray-900">
              примерно раз в {Math.round((consent.update_interval_seconds || 600) / 60)} мин
            </span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Срок хранения</span>
            <span className="text-gray-900">
              {consent.retention_days > 0
                ? `${consent.retention_days} дней`
                : 'история не хранится'}
            </span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Согласие дано</span>
            <span className="text-gray-900">{fmt(consent.granted_at)}</span>
          </div>
          {!collecting && consent.collection_disabled_at && (
            <div className="flex justify-between gap-4 py-1">
              <span className="text-gray-600">Передача выключена</span>
              <span className="text-gray-900">{fmt(consent.collection_disabled_at)}</span>
            </div>
          )}
        </div>

        {/* Поимённый список. «Администраторы видят вас» — не ответ на
            вопрос «кто меня видит». */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900">
            Получатели ({recipients.length})
          </p>
          {recipients.length === 0 ? (
            <p className="rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
              Местоположение не видит никто. Роли «владелец», «администратор»,
              «родитель» и общий доступ к семье сами по себе координат не дают.
            </p>
          ) : (
            <div className="space-y-2">
              {recipients.map((r) => (
                <div
                  key={r.member_id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{r.name || 'Участник'}</p>
                    <p className="text-xs text-gray-600">
                      Основание: назван получателем в этом согласии
                    </p>
                    <p className="text-xs text-gray-600">
                      Может: видеть текущее местоположение
                    </p>
                    <p className="text-xs text-gray-500">
                      Доступ выдан: {fmt(r.granted_at)}
                      {r.last_access ? ` · последний просмотр: ${fmt(r.last_access)}` : ' · ещё не смотрел'}
                    </p>
                  </div>
                  {onRevokeRecipient && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onRevokeRecipient(r.member_id)}
                      disabled={submitting}
                    >
                      Отозвать
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Два действия, названные своими именами и визуально разные. */}
        <div className="space-y-3 border-t pt-4">
          <div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={submitting}
              onClick={() => onSetCollection(!collecting)}
            >
              <Icon name={collecting ? 'Pause' : 'Play'} size={18} className="mr-2" />
              {collecting
                ? 'Выключить передачу местоположения'
                : 'Включить передачу местоположения'}
            </Button>
            <p className="mt-1 text-xs text-gray-600">
              {collecting
                ? 'Сбор координат прекратится сразу. Согласие останется действующим — включить обратно можно без нового согласия.'
                : 'Сбор возобновится на прежних условиях: согласие не отзывалось.'}
            </p>
          </div>

          <div>
            {confirmRevoke ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="mb-3 text-sm text-red-900">
                  Сбор прекратится, получатели потеряют доступ, накопленные
                  координаты будут удалены по выбранной политике хранения.
                  Чтобы включить функцию снова, потребуется новое согласие.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    disabled={submitting}
                    onClick={() => { setConfirmRevoke(false); onRevoke(); }}
                  >
                    Отозвать согласие
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmRevoke(false)}>
                    Не отзывать
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  disabled={submitting}
                  onClick={() => setConfirmRevoke(true)}
                >
                  <Icon name="ShieldOff" size={18} className="mr-2" />
                  Отозвать согласие и прекратить обработку
                </Button>
                <p className="mt-1 text-xs text-gray-600">
                  Полное прекращение обработки. Это отдельное действие, а не
                  выключение передачи.
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
