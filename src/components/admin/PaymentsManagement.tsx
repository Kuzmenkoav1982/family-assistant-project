import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const TBANK_API = 'https://functions.poehali.dev/e25d60ac-d0c8-428d-92bf-18126183f140';
const SBER_API = 'https://functions.poehali.dev/eb5ffd1e-ee56-4d89-b112-ba5bace6f64a';

interface PendingPayment {
  id: string;
  family_id: string;
  plan_type: string;
  plan_name: string;
  amount: number;
  payment_provider: 'tbank' | 'sber';
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  payment_instructions?: any;
}

export default function PaymentsManagement() {
  const { toast } = useToast();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchPendingPayments();
    const interval = setInterval(fetchPendingPayments, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPayments = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken !== 'admin_authenticated') return;

    try {
      setLoading(true);
      
      // Получаем pending подписки из T-Bank
      const tbankResponse = await fetch(`${TBANK_API}?action=admin_pending`, {
        headers: {
          'X-Admin-Token': 'admin_secret_key_2024'
        }
      });
      
      const tbankData = await tbankResponse.json();
      const tbankPayments = tbankData.pending_subscriptions || [];

      // Получаем pending донаты из Sber
      const sberResponse = await fetch(`${SBER_API}?action=admin_pending`, {
        headers: {
          'X-Admin-Token': 'admin_secret_key_2024'
        }
      });
      
      const sberData = await sberResponse.json();
      const sberPayments = sberData.pending_donations || [];

      setPendingPayments([...tbankPayments, ...sberPayments]);
    } catch (error) {
      console.error('Ошибка загрузки платежей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      const apiUrl = selectedPayment.payment_provider === 'tbank' ? TBANK_API : SBER_API;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_key_2024'
        },
        body: JSON.stringify({
          action: 'admin_approve',
          payment_id: selectedPayment.id,
          admin_email: localStorage.getItem('adminEmail') || 'admin@nasha-semiya.ru'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Платёж подтверждён!',
          description: `Подписка "${selectedPayment.plan_name}" активирована`
        });
        
        setShowConfirmDialog(false);
        fetchPendingPayments();
      } else {
        throw new Error(data.error || 'Ошибка подтверждения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось подтвердить платёж',
        variant: 'destructive'
      });
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    try {
      const apiUrl = selectedPayment.payment_provider === 'tbank' ? TBANK_API : SBER_API;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_key_2024'
        },
        body: JSON.stringify({
          action: 'admin_reject',
          payment_id: selectedPayment.id,
          admin_email: localStorage.getItem('adminEmail') || 'admin@nasha-semiya.ru'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Платёж отклонён',
          description: 'Подписка не активирована'
        });
        
        setShowConfirmDialog(false);
        fetchPendingPayments();
      } else {
        throw new Error(data.error || 'Ошибка отклонения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отклонить платёж',
        variant: 'destructive'
      });
    }
  };

  const openConfirmDialog = (payment: PendingPayment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Icon name="Loader2" className="animate-spin" size={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Clock" size={20} />
                Ожидающие подтверждения ({pendingPayments.length})
              </CardTitle>
              <CardDescription>
                Подтвердите платежи после получения денег на счёт
              </CardDescription>
            </div>
            <Button onClick={fetchPendingPayments} variant="outline" size="sm">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="CheckCircle" size={60} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">Нет ожидающих платежей</h3>
              <p className="text-gray-600">Все платежи обработаны</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <Card key={payment.id} className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={payment.payment_provider === 'tbank' ? 'bg-yellow-500' : 'bg-green-500'}>
                            {payment.payment_provider === 'tbank' ? '💳 Т-Банк' : '🏦 Сбер'}
                          </Badge>
                          <Badge variant="outline" className="border-yellow-600 text-yellow-700">
                            ⏳ Ожидает оплаты
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-1">{payment.plan_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Семья: <span className="font-medium">{payment.family_id}</span>
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-xl text-purple-600">{payment.amount}₽</span>
                          <span className="text-gray-500">
                            Создано: {new Date(payment.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openConfirmDialog(payment, 'approve')}
                        >
                          <Icon name="Check" size={16} className="mr-1" />
                          Подтвердить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => openConfirmDialog(payment, 'reject')}
                        >
                          <Icon name="X" size={16} className="mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог подтверждения */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? '✅ Подтвердить платёж?' : '❌ Отклонить платёж?'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Подтвердите, что деньги поступили на счёт. Подписка будет активирована.'
                : 'Платёж будет отклонён. Подписка НЕ будет активирована.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">План:</span>
                <span className="font-semibold">{selectedPayment.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-bold text-lg text-purple-600">{selectedPayment.amount}₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Семья:</span>
                <span className="font-mono text-sm">{selectedPayment.family_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Банк:</span>
                <span>{selectedPayment.payment_provider === 'tbank' ? 'Т-Банк' : 'Сбербанк'}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? handleApprovePayment : handleRejectPayment}
            >
              {actionType === 'approve' ? 'Подтвердить платёж' : 'Отклонить платёж'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}