/**
 * ConsentGate — блокирующий экран согласия на обработку ПДн (152-ФЗ).
 *
 * Показывается авторизованному пользователю, который ещё НЕ принял текущую
 * версию политики. Без принятия — доступ в авторизованную часть закрыт.
 *
 * Принцип: фиксируем согласие ТОЛЬКО вперёд, с момента нажатия «Принимаю».
 * Факт (user_id, версия политики, дата, IP, user-agent) пишется на бэкенде
 * (функция `consent`). Прошлое задним числом не проставляется.
 *
 * Demo-режим намеренно пропускается — там нет реального пользователя/токена.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { storage } from '@/lib/storage';
import { clearAuthSession } from '@/lib/authStorage';
import func2url from '../../backend/func2url.json';

const CONSENT_URL = (func2url as Record<string, string>)['consent'];

// Страницы, которые НЕ блокируются стеной согласия: с них пользователь может
// выйти, удалить аккаунт или скачать данные, не давая согласия (без тупика).
const ALLOWED_WITHOUT_CONSENT = ['/settings'];

type GateState = 'checking' | 'need_consent' | 'ok';

export default function ConsentGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [state, setState] = useState<GateState>('checking');
  const [submitting, setSubmitting] = useState(false);

  const isAllowedPath = ALLOWED_WITHOUT_CONSENT.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  const isDemo = (() => {
    try {
      return localStorage.getItem('isDemoMode') === 'true';
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (isDemo) {
      setState('ok');
      return;
    }
    const token = storage.getItem('authToken');
    if (!token || !CONSENT_URL) {
      // Нет токена — пусть ProtectedRoute разбирается; гейт не мешает.
      setState('ok');
      return;
    }
    let cancelled = false;
    fetch(CONSENT_URL, { method: 'GET', headers: { 'X-Auth-Token': token } })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setState(data?.accepted ? 'ok' : 'need_consent');
      })
      .catch(() => {
        // При сетевой ошибке не блокируем доступ — не ломаем рабочий продукт.
        if (!cancelled) setState('ok');
      });
    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  const handleAccept = async () => {
    const token = storage.getItem('authToken');
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(CONSENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setState('ok');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/welcome';
  };

  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary mx-auto mb-3" />
          <p className="text-sm text-gray-600">Загрузка…</p>
        </div>
      </div>
    );
  }

  if (state === 'need_consent' && isAllowedPath) {
    // На разрешённых страницах (например /settings) не блокируем — пользователь
    // должен иметь возможность выйти/удалить аккаунт/скачать данные.
    return <>{children}</>;
  }

  if (state === 'need_consent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="ShieldCheck" size={22} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Согласие на обработку данных</h1>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            Чтобы продолжить пользоваться «Нашей Семьёй», подтвердите согласие на обработку
            персональных данных в соответствии с законодательством РФ (152-ФЗ).
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Нажимая «Принимаю», вы соглашаетесь с условиями обработки данных. Мы зафиксируем
            факт согласия (дату и версию документа) с этого момента.
          </p>

          <div className="flex flex-wrap gap-3 text-sm mb-6">
            <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-primary underline">
              Политика конфиденциальности
            </a>
            <a href="/terms-of-service" target="_blank" rel="noreferrer" className="text-primary underline">
              Пользовательское соглашение
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAccept} disabled={submitting} className="flex-1">
              {submitting ? 'Сохраняем…' : 'Принимаю'}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex-1">
              Выйти
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <a href="/settings?section=account" className="underline">Скачать мои данные</a>
            <a href="/settings?section=account" className="underline">Удалить аккаунт</a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}