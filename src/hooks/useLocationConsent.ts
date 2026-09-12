/**
 * Согласие на обработку геоданных: состояние и операции.
 *
 * Источник истины — сервер. Здесь нет ни одной попытки решить локально,
 * вправе ли пользователь включить отслеживание: возраст, законное
 * представительство и право дать согласие вычисляет backend
 * (auth_guard.consent_eligibility). Клиент только показывает результат.
 *
 * Оптимистичного включения нет принципиально: пока сервер не подтвердил
 * запись согласия, GPS не запускается.
 */
import { useCallback, useEffect, useState } from 'react';
import func2url from '../../backend/func2url.json';

const CONSENT_URL = (func2url as Record<string, string>)['location-consent'];

export interface LocationConsentInfo {
  id: string;
  granted_at: string | null;
  consent_role: string;
  text_version: string;
  retention_days: number;
  update_interval_seconds: number;
  data_scope: Record<string, unknown>;
  recipients: string[];
  /**
   * Сбор и согласие — РАЗНЫЕ состояния.
   * collection_enabled=false означает «передача выключена», но согласие
   * продолжает действовать. Отозванное согласие сюда вообще не попадает.
   */
  collection_enabled: boolean;
  collection_disabled_at: string | null;
  representation_id: string | null;
  next_reminder_at: string | null;
  valid: boolean;
  invalid_reason: string | null;
}

export interface LocationRecipientDetail {
  member_id: string;
  name: string | null;
  basis: string;
  /** 'active' — реально видит координаты; 'pending' — ждёт подтверждения субъекта. */
  status: 'active' | 'pending' | 'revoked';
  awaiting_confirmation: boolean;
  capabilities: string[];
  granted_at: string | null;
  last_access: string | null;
}

export interface RepresentationSummary {
  id: string;
  representative_member_id: string;
  representative_name: string | null;
  status: string;
  /** Всегда 'self_declared' в первой версии: проверки документов нет. */
  verification_level: 'self_declared' | 'externally_verified';
  declared_at: string | null;
}

export interface LocationConsentStatus {
  subject_member_id: string;
  subject_name: string | null;
  subject_age: number | null;
  self_consent_age: number;
  geolocation_enabled: boolean;
  consent_text: { version: string; summary?: string; body_md?: string } | null;
  eligibility: { allowed: boolean; required_role: string | null; reason: string } | null;
  retention_options: number[];
  default_retention_days: number;
  consent: LocationConsentInfo | null;
  recipients_detail?: LocationRecipientDetail[];
  representations?: RepresentationSummary[];
  recent_views?: Array<{
    viewer_member_id: string;
    access_kind: string;
    occurred_at: string;
  }>;
}

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
}

export default function useLocationConsent(subjectMemberId?: string) {
  const [status, setStatus] = useState<LocationConsentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!CONSENT_URL) return;
    setLoading(true);
    setError(null);
    try {
      const qs = subjectMemberId ? `?subject_member_id=${subjectMemberId}` : '';
      const res = await fetch(`${CONSENT_URL}${qs}`, {
        method: 'GET',
        headers: { 'X-Auth-Token': getToken() },
      });
      if (res.ok) {
        setStatus(await res.json());
      } else if (res.status === 503) {
        // Функция приостановлена целиком — это не ошибка пользователя.
        setStatus(null);
      } else {
        setError('Не удалось загрузить статус согласия.');
      }
    } catch {
      setError('Нет соединения с сервером.');
    } finally {
      setLoading(false);
    }
  }, [subjectMemberId]);

  useEffect(() => { reload(); }, [reload]);

  /**
   * Выдать согласие. Возвращает true ТОЛЬКО если сервер записал согласие —
   * вызывающий код обязан запускать GPS лишь по этому ответу.
   */
  const grant = useCallback(async (params: {
    retentionDays: number;
    recipients: string[];
    background: boolean;
  }): Promise<boolean> => {
    if (!CONSENT_URL || !status?.consent_text?.version) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(CONSENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId || status.subject_member_id,
          // Версия фиксируется явно: если текст обновился, пока экран был
          // открыт, сервер отклонит согласие на устаревшую редакцию.
          text_version: status.consent_text.version,
          retention_days: params.retentionDays,
          recipients: params.recipients,
          data_scope: { precise: true, background: params.background },
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error || 'Не удалось сохранить согласие. Попробуйте ещё раз.');
      return false;
    } catch {
      setError('Нет соединения с сервером. Согласие не сохранено.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [status, subjectMemberId, reload]);

  /**
   * Тумблер сбора. ЭТО НЕ ОТЗЫВ СОГЛАСИЯ.
   *
   * Выключение останавливает сбор координат, но юридическая запись
   * согласия остаётся: человек, выключивший передачу, не отзывал
   * разрешение обрабатывать данные. Для полного прекращения есть
   * отдельное действие revoke().
   */
  const setCollection = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!CONSENT_URL) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(CONSENT_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId || status?.subject_member_id,
          collection_enabled: enabled,
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error || (enabled
        ? 'Не удалось включить передачу местоположения.'
        : 'Не удалось выключить передачу местоположения.'));
      return false;
    } catch {
      setError('Нет соединения с сервером.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [status, subjectMemberId, reload]);

  /**
   * Полный отзыв согласия: один шаг, без уговоров.
   *
   * В отличие от setCollection(false), здесь прекращается само основание
   * обработки — получатели теряют доступ, запускается удаление данных,
   * следующее включение потребует нового согласия.
   */
  const revoke = useCallback(async (): Promise<boolean> => {
    if (!CONSENT_URL) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(CONSENT_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId || status?.subject_member_id,
          reason: 'user_revoked',
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      setError('Не удалось отозвать согласие. Попробуйте ещё раз.');
      return false;
    } catch {
      setError('Нет соединения с сервером.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [status, subjectMemberId, reload]);

  /**
   * Общий вызов PUT-действий над получателем. Используется тремя
   * публичными методами ниже — они различаются только именем action
   * и сообщением об ошибке по умолчанию.
   */
  const manageRecipient = useCallback(async (
    action: 'add_recipient' | 'confirm_recipient' | 'revoke_recipient',
    recipientMemberId: string,
    fallbackError: string,
  ): Promise<boolean> => {
    if (!CONSENT_URL) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(CONSENT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId || status?.subject_member_id,
          action,
          recipient_member_id: recipientMemberId,
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error || fallbackError);
      return false;
    } catch {
      setError('Нет соединения с сервером.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [status, subjectMemberId, reload]);

  /**
   * Добавить получателя ПОСЛЕ того, как согласие уже выдано.
   *
   * Если это делает сам субъект — получатель сразу активен. Если это
   * делает представитель (или кто-то ещё, кому это разрешено), получатель
   * попадает в 'pending' и не видит координат, пока субъект не подтвердит
   * его сам через confirmRecipient(). Различие обеспечивает backend —
   * здесь мы просто вызываем действие и полагаемся на его ответ.
   */
  const addRecipient = useCallback((recipientMemberId: string): Promise<boolean> =>
    manageRecipient('add_recipient', recipientMemberId,
      'Не удалось добавить получателя.'), [manageRecipient]);

  /**
   * Подтвердить ожидающего получателя. Может вызвать ТОЛЬКО сам субъект —
   * иначе представитель мог бы одним действием и включить сбор, и
   * назначить смотрящего, обойдя смысл отдельного подтверждения.
   */
  const confirmRecipient = useCallback((recipientMemberId: string): Promise<boolean> =>
    manageRecipient('confirm_recipient', recipientMemberId,
      'Не удалось подтвердить получателя.'), [manageRecipient]);

  /** Немедленный отзыв доступа получателя — без подтверждений. */
  const revokeRecipient = useCallback((recipientMemberId: string): Promise<boolean> =>
    manageRecipient('revoke_recipient', recipientMemberId,
      'Не удалось отозвать доступ получателя.'), [manageRecipient]);

  const hasActiveConsent = Boolean(status?.consent?.valid);
  // Сбор идёт, только когда есть действующее согласие И включён тумблер.
  const isCollecting = hasActiveConsent && status?.consent?.collection_enabled !== false;

  return {
    status, loading, submitting, error,
    hasActiveConsent, isCollecting,
    reload, grant, setCollection, revoke,
    addRecipient, confirmRecipient, revokeRecipient,
  };
}