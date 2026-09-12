/**
 * Заявление о законном представительстве: состояние и операции.
 *
 * ВАЖНО О ТЕРМИНАХ. Здесь нет и не должно быть слова «проверено».
 * Пользователь ставит галочку — система фиксирует ЗАЯВЛЕНИЕ. Документы
 * не загружаются, внешняя проверка не проводится, поэтому единственный
 * уровень, который возвращает сервер, — 'self_declared'.
 *
 * Право сделать заявление вычисляет backend (representation_eligibility):
 * возраст заявителя, возраст ребёнка, активность членства и семью
 * проверяет сервер. Клиент только показывает результат.
 *
 * Успешное заявление НЕ включает геолокацию: следом идёт отдельный
 * экран согласия, а получатели выбираются ещё отдельно.
 */
import { useCallback, useEffect, useState } from 'react';
import func2url from '../../backend/func2url.json';

const REP_URL = (func2url as Record<string, string>)['legal-representative'];

export type VerificationLevel = 'self_declared' | 'externally_verified';

export interface RepresentationRecord {
  id: string;
  status: string;
  /** Никогда не 'verified': простая галочка проверкой не является. */
  verification_level: VerificationLevel;
  declaration_text_version: string | null;
  declared_at: string | null;
  revoked_at: string | null;
}

export interface RepresentationStatus {
  subject_member_id: string;
  subject_name: string | null;
  subject_age: number | null;
  subject_birth_date: string | null;
  subject_has_account: boolean;
  representative_member_id: string | null;
  representative_name: string | null;
  representative_age: number | null;
  self_consent_age: number;
  adult_age: number;
  declaration_text: {
    version: string;
    summary?: string;
    body_md?: string;
    legal_review_status?: string;
  } | null;
  eligibility: {
    allowed: boolean;
    reason: string;
    verification_level: VerificationLevel;
  } | null;
  declaration: RepresentationRecord | null;
  other_declarations: Array<{
    id: string;
    representative_member_id: string;
    representative_name: string | null;
    status: string;
    verification_level: VerificationLevel;
    declared_at: string | null;
  }>;
}

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
}

export default function useLegalRepresentative(subjectMemberId?: string) {
  const [status, setStatus] = useState<RepresentationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!REP_URL || !subjectMemberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${REP_URL}?subject_member_id=${subjectMemberId}`, {
        method: 'GET',
        headers: { 'X-Auth-Token': getToken() },
      });
      if (res.ok) {
        setStatus(await res.json());
      } else {
        setStatus(null);
        setError('Не удалось загрузить данные о представительстве.');
      }
    } catch {
      setError('Нет соединения с сервером.');
    } finally {
      setLoading(false);
    }
  }, [subjectMemberId]);

  useEffect(() => { reload(); }, [reload]);

  /**
   * Сделать заявление.
   *
   * Возвращает true ТОЛЬКО если сервер записал заявление. Оптимистичного
   * перехода нет: следующий экран открывается по ответу сервера, а не по
   * факту нажатия кнопки.
   */
  const declare = useCallback(async (): Promise<boolean> => {
    if (!REP_URL || !subjectMemberId) return false;
    const version = status?.declaration_text?.version;
    if (!version) {
      setError('Текст заявления не загружен. Обновите страницу.');
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(REP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId,
          // Версия фиксируется явно: если текст обновился, пока экран
          // был открыт, сервер отклонит заявление на устаревшую редакцию.
          declaration_text_version: version,
          declaration_accepted: true,
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error || 'Не удалось сохранить заявление. Попробуйте ещё раз.');
      return false;
    } catch {
      setError('Нет соединения с сервером. Заявление не сохранено.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [status, subjectMemberId, reload]);

  /**
   * Отзыв своего заявления. Вместе с ним прекращается согласие,
   * выданное на его основании, — иначе сбор шёл бы по отпавшему основанию.
   */
  const revoke = useCallback(async (): Promise<boolean> => {
    if (!REP_URL || !subjectMemberId) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(REP_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({
          subject_member_id: subjectMemberId,
          reason: 'user_revoked',
        }),
      });
      if (res.ok) {
        await reload();
        return true;
      }
      setError('Не удалось отозвать заявление. Попробуйте ещё раз.');
      return false;
    } catch {
      setError('Нет соединения с сервером.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [subjectMemberId, reload]);

  const hasDeclared = Boolean(
    status?.declaration
    && !status.declaration.revoked_at
    && ['declared', 'confirmed'].includes(status.declaration.status),
  );

  return { status, loading, submitting, error, hasDeclared, reload, declare, revoke };
}
