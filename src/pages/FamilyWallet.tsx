import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import WalletInstructions from '@/components/wallet/WalletInstructions';

const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';
const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

interface Transaction {
  id: number;
  type: 'topup' | 'spend';
  amount: number;
  reason: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

interface SpendByReason {
  reason: string;
  total: number;
}

const reasonLabels: Record<string, string> = {
  topup: 'Пополнение',
  manual: 'Вручную',
  ai_diet_plan: 'ИИ-диета',
  ai_photo: 'Фото ИИ',
  ai_recipe: 'Рецепт ИИ',
  ai_greeting: 'Открытка ИИ',
  ai_motivation: 'Мотивация ИИ',
};

const reasonIcons: Record<string, string> = {
  topup: 'ArrowUpCircle',
  manual: 'HandCoins',
  ai_diet_plan: 'Brain',
  ai_photo: 'Image',
  ai_recipe: 'ChefHat',
  ai_greeting: 'Gift',
  ai_motivation: 'Sparkles',
};

export default function FamilyWallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<{
    total_topup: number;
    total_spent: number;
    total_transactions: number;
    spend_by_reason: SpendByReason[];
  } | null>(null);

  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [showSuccess, setShowSuccess] = useState(false);

  const [tab, setTab] = useState<'overview' | 'history'>('overview');

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

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 50) {
      toast({ title: 'Минимальная сумма: 50 руб', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
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
      } else {
        toast({ title: json.error || 'Ошибка создания платежа', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Семейный кошелёк</h1>
            <p className="text-xs text-muted-foreground">Баланс для ИИ-сервисов</p>
          </div>
        </div>

        <WalletInstructions />

        {showSuccess && (
          <Card className="border-green-300 bg-green-50 animate-fade-in">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="Check" size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800">Оплата прошла успешно!</p>
                <p className="text-sm text-green-700">Средства скоро поступят на баланс</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <CardContent className="p-6 relative z-10">
            <div className="text-sm opacity-80 mb-1">Текущий баланс</div>
            <div className="text-4xl font-bold mb-4">
              {balance.toFixed(2)} <span className="text-xl opacity-80">руб</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white text-emerald-700 hover:bg-white/90"
                onClick={() => setShowTopup(true)}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Пополнить
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={() => setTab(tab === 'history' ? 'overview' : 'history')}
              >
                <Icon name="History" size={14} className="mr-1" />
                История
              </Button>
            </div>
          </CardContent>
        </Card>

        {showTopup && (
          <Card className="border-emerald-300 bg-emerald-50/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Icon name="ArrowUpCircle" size={18} className="text-emerald-600" />
                Пополнить баланс
              </h3>
              <div>
                <Label>Сумма (руб), минимум 50</Label>
                <Input
                  type="number"
                  step="1"
                  min="50"
                  placeholder="500"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[100, 300, 500, 1000, 3000].map(v => (
                  <Button
                    key={v}
                    size="sm"
                    variant={topupAmount === String(v) ? 'default' : 'outline'}
                    className={topupAmount === String(v) ? 'bg-emerald-600' : ''}
                    onClick={() => setTopupAmount(String(v))}
                  >
                    {v} руб
                  </Button>
                ))}
              </div>

              <div>
                <Label className="text-sm mb-2 block">Способ оплаты</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className={paymentMethod === 'card' ? 'bg-emerald-600' : ''}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <Icon name="CreditCard" size={14} className="mr-1" />
                    Картой
                  </Button>
                  <Button
                    size="sm"
                    variant={paymentMethod === 'sbp' ? 'default' : 'outline'}
                    className={paymentMethod === 'sbp' ? 'bg-emerald-600' : ''}
                    onClick={() => setPaymentMethod('sbp')}
                  >
                    <Icon name="Smartphone" size={14} className="mr-1" />
                    СБП
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTopup}
                  disabled={!topupAmount || parseFloat(topupAmount) < 50 || submitting}
                  className="bg-emerald-600 flex-1"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Переход к оплате...
                    </div>
                  ) : (
                    <>
                      <Icon name="Lock" size={14} className="mr-1" />
                      Оплатить {topupAmount ? `${topupAmount} руб` : ''}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowTopup(false)}>
                  Отмена
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                Безопасная оплата через ЮKassa. После оплаты средства поступят автоматически.
              </p>
            </CardContent>
          </Card>
        )}

        {tab === 'overview' && (
          <>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Icon name="Zap" size={18} className="text-amber-500" />
                  На что тратится баланс?
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: 'Brain', label: 'Генерация ИИ-диеты', cost: '~5 руб' },
                    { icon: 'Image', label: 'Фото блюда от ИИ', cost: '~3 руб' },
                    { icon: 'ChefHat', label: 'Рецепт из продуктов', cost: '~3 руб' },
                    { icon: 'Gift', label: 'ИИ-открытка', cost: '~5 руб' },
                    { icon: 'Sparkles', label: 'Мотивация от ИИ', cost: '~1 руб' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Icon name={item.icon} size={16} className="text-amber-600" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      <Badge variant="outline" className="text-xs">{item.cost}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {stats && stats.total_transactions > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Icon name="BarChart3" size={18} className="text-blue-500" />
                    Статистика
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-green-50">
                      <div className="text-lg font-bold text-green-700">+{stats.total_topup.toFixed(0)}</div>
                      <div className="text-[10px] text-green-600">пополнено</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-50">
                      <div className="text-lg font-bold text-red-700">-{stats.total_spent.toFixed(0)}</div>
                      <div className="text-[10px] text-red-600">потрачено</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-50">
                      <div className="text-lg font-bold text-blue-700">{stats.total_transactions}</div>
                      <div className="text-[10px] text-blue-600">операций</div>
                    </div>
                  </div>

                  {stats.spend_by_reason.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Расходы по категориям</h4>
                      <div className="space-y-1.5">
                        {stats.spend_by_reason.map(sr => {
                          const pct = stats.total_spent > 0 ? (sr.total / stats.total_spent) * 100 : 0;
                          return (
                            <div key={sr.reason} className="flex items-center gap-2">
                              <span className="text-xs flex-1">{reasonLabels[sr.reason] || sr.reason}</span>
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-16 text-right">{sr.total.toFixed(0)} руб</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {transactions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">Последние операции</h3>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setTab('history')}>
                    Все
                    <Icon name="ChevronRight" size={14} className="ml-1" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {transactions.slice(0, 5).map(tx => (
                    <Card key={tx.id} className="border-0 shadow-sm">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          tx.type === 'topup' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Icon
                            name={reasonIcons[tx.reason] || (tx.type === 'topup' ? 'ArrowUpCircle' : 'ArrowDownCircle')}
                            size={18}
                            className={tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reasonLabels[tx.reason] || tx.reason || (tx.type === 'topup' ? 'Пополнение' : 'Списание')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(tx.created_at)}
                            {tx.user_name && ` · ${tx.user_name}`}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'topup' ? '+' : '-'}{tx.amount.toFixed(0)} руб
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && (
              <Card className="border-2 border-dashed border-emerald-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Icon name="Wallet" size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-bold mb-2">Кошелёк пуст</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Пополните баланс, чтобы пользоваться ИИ-генерацией диет, рецептов и фотографий.
                  </p>
                  <Button className="bg-emerald-600" onClick={() => setShowTopup(true)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Пополнить баланс
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {tab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">История операций</h3>
              <Button size="sm" variant="ghost" onClick={() => setTab('overview')}>
                <Icon name="ArrowLeft" size={14} className="mr-1" />
                Обзор
              </Button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Нет операций</p>
            ) : (
              <div className="space-y-1.5">
                {transactions.map(tx => (
                  <Card key={tx.id} className="border-0 shadow-sm">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.type === 'topup' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Icon
                          name={reasonIcons[tx.reason] || (tx.type === 'topup' ? 'ArrowUpCircle' : 'ArrowDownCircle')}
                          size={18}
                          className={tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {reasonLabels[tx.reason] || tx.reason || (tx.type === 'topup' ? 'Пополнение' : 'Списание')}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(tx.created_at)}
                          {tx.user_name && ` · ${tx.user_name}`}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'topup' ? '+' : '-'}{tx.amount.toFixed(0)} руб
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}