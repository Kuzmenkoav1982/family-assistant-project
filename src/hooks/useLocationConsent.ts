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
  valid: boolean;
  invalid_reason: string | null;
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

  /** Отзыв: один шаг, без уговоров и дополнительных подтверждений. */
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

  const hasActiveConsent = Boolean(status?.consent?.valid);

  return { status, loading, submitting, error, hasActiveConsent, reload, grant, revoke };
}
