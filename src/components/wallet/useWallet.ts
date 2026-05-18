import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { WALLET_API, PAYMENTS_API, type Transaction, type WalletStats } from './walletConstants';

export function useWallet() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const authToken = localStorage.getItem('authToken') || '';

  const fetchData = useCallback(async () => {
    try {
      const [balRes, histRes, statsRes] = await Promise.all([
        fetch(`${WALLET_API}?action=balance`, { headers: { 'X-Auth-Token': authToken } }),
        fetch(`${WALLET_API}?action=history&limit=30`, { headers: { 'X-Auth-Token': authToken } }),
        fetch(`${WALLET_API}?action=stats`, { headers: { 'X-Auth-Token': authToken } }),
      ]);

      const balData = await balRes.json();
      const histData = await histRes.json();
      const statsData = await statsRes.json();

      setBalance(balData.balance || 0);
      setTransactions(histData.transactions || []);
      setStats(statsData);
    } catch (e) {
      console.error('[Wallet] fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!authToken) return;
    const status = searchParams.get('status');
    if (status === 'success') return;
    const verifyPending = async () => {
      try {
        const res = await fetch(PAYMENTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
          body: JSON.stringify({ action: 'verify_pending_wallet' }),
        });
        const json = await res.json();
        if (json.credited && json.credited.length > 0) {
          const total = json.credited.reduce((s: number, c: { amount: number }) => s + c.amount, 0);
          toast({ title: `Зачислено ${total.toFixed(0)} руб на баланс` });
          fetchData();
        }
      } catch { /* silent */ }
    };
    verifyPending();
  }, [authToken, fetchData, toast, searchParams]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setShowSuccess(true);
      window.history.replaceState({}, '', '/wallet');
      const lastPaymentId = localStorage.getItem('lastWalletPaymentId');
      if (lastPaymentId) {
        localStorage.removeItem('lastWalletPaymentId');
        let attempts = 0;
        const verify = async () => {
          attempts++;
          try {
            const res = await fetch(PAYMENTS_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
              body: JSON.stringify({ action: 'verify_wallet_payment', payment_id: lastPaymentId }),
            });
            const json = await res.json();
            if (json.credited || json.already_credited) {
              fetchData();
              return;
            }
          } catch { /* retry */ }
          if (attempts < 6) setTimeout(verify, 3000);
          else fetchData();
        };
        verify();
      } else {
        setTimeout(fetchData, 2000);
      }
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, fetchData, authToken]);

  const topup = async (amount: number, paymentMethod: 'card' | 'sbp') => {
    if (!amount || amount < 50) {
      toast({ title: 'Минимальная сумма: 50 руб', variant: 'destructive' });
      return { ok: false };
    }
    try {
      const res = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'wallet_topup',
          amount,
          return_url: `${window.location.origin}/wallet?status=success`,
          payment_method: paymentMethod === 'sbp' ? 'sbp' : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.payment_url) {
        if (json.payment_id) localStorage.setItem('lastWalletPaymentId', json.payment_id);
        window.location.href = json.payment_url;
        return { ok: true };
      }
      toast({ title: json.error || 'Ошибка создания платежа', variant: 'destructive' });
      return { ok: false };
    } catch {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
      return { ok: false };
    }
  };

  return {
    loading, balance, transactions, stats, showSuccess,
    fetchData, topup,
  };
}
