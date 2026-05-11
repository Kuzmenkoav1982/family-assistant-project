import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ADMIN_API = 'https://functions.poehali.dev/d881b99a-9341-4b0b-9e54-0cfb6f7de905';
const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b'];

export default function AdminDomovoy() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
    loadDonations();
    loadPaymentSettings();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=dashboard`, {
        headers: { 'X-Admin-Token': 'admin_authenticated' }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=donations&limit=50`, {
        headers: { 'X-Admin-Token': 'admin_authenticated' }
      });
      const data = await response.json();
      if (data.success) {
        setDonations(data.donations);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
    }
  };

  const loadPaymentSettings = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=payment-settings`, {
        headers: { 'X-Admin-Token': 'admin_authenticated' }
      });
      const data = await response.json();
      if (data.success) {
        setPaymentSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const updatePaymentSetting = async (method: string, updates: any) => {
    try {
      const response = await fetch(`${ADMIN_API}?action=update-payment-settings`, {
        method: 'POST',
        headers: {
          'X-Admin-Token': 'admin_authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_method: method, ...updates })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({ title: '✅ Настройки обновлены' });
        loadPaymentSettings();
        setSelectedMethod(null);
      }
    } catch (error) {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=export`, {
        headers: { 'X-Admin-Token': 'admin_authenticated' }
      });
      const csv = await response.text();
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `domovoy-donations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      toast({ title: '✅ Экспорт завершён' });
    } catch (error) {
      toast({ title: 'Ошибка экспорта', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  const dashboardStats = stats?.stats || {};
  const paymentMethods = stats?.payment_methods || [];
  const dailyStats = stats?.daily_stats || [];
  const topUsers = stats?.top_users || [];
  const levelDist = stats?.level_distribution || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              🏠 Админка Домового
            </h1>
            <p className="text-gray-600 mt-2">Управление донатами и статистикой</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/domovoy/studio')} className="bg-violet-600 hover:bg-violet-700">
              <Icon name="Sparkles" className="mr-2" size={18} />
              Открыть Studio
            </Button>
            <Button onClick={() => navigate('/admin/dev-agent')} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Icon name="Bot" className="mr-2" size={18} />
              Dev Agent
            </Button>
            <Button onClick={exportData} variant="outline">
              <Icon name="Download" className="mr-2" size={18} />
              Экспорт
            </Button>
            <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
              <Icon name="LayoutDashboard" className="mr-2" size={18} />
              Главная админка
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="donations">💰 Донаты</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Настройки</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Всего донатов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">
                    {dashboardStats.total_donations || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Уникальных доноров</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardStats.unique_users || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Всего выручка</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₽{dashboardStats.total_revenue || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Средний донат</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    ₽{Math.round(dashboardStats.avg_donation || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Динамика донатов (30 дней)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="daily_revenue" stroke="#f59e0b" name="Выручка (₽)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>💳 Способы оплаты</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        dataKey="revenue"
                        nameKey="payment_method"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {paymentMethods.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle>👑 Топ доноров</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Донатов</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Уровень</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.map((user: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                        <TableCell>{user.donations_count}</TableCell>
                        <TableCell className="font-semibold">₽{user.total_donated}</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">Уровень {user.current_level}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Распределение по уровням</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                    const count = levelDist.find((ld: any) => ld.current_level === level)?.users_count || 0;
                    return (
                      <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">Ур.{level}</div>
                        <div className="text-lg font-bold text-amber-600">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>💰 История донатов</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Способ</TableHead>
                      <TableHead>Уровень</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation: any) => (
                      <TableRow key={donation.id}>
                        <TableCell>{donation.id}</TableCell>
                        <TableCell className="font-mono text-xs">{donation.user_id.substring(0, 12)}...</TableCell>
                        <TableCell className="font-semibold">₽{donation.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{donation.payment_method}</Badge>
                        </TableCell>
                        <TableCell>
                          {donation.level_before} → {donation.level_after}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            donation.payment_status === 'completed' ? 'bg-green-500' :
                            donation.payment_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }>
                            {donation.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(donation.created_at).toLocaleString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Платёжные реквизиты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentSettings.map((setting: any) => (
                  <Card key={setting.payment_method} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon 
                          name={
                            setting.payment_method === 'sbp' ? 'QrCode' :
                            setting.payment_method === 'card' ? 'CreditCard' : 'Wallet'
                          } 
                          size={24} 
                        />
                        <div>
                          <h4 className="font-semibold">{setting.payment_method.toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={setting.is_active}
                        onCheckedChange={(checked) =>
                          updatePaymentSetting(setting.payment_method, { is_active: checked })
                        }
                      />
                    </div>
                    {selectedMethod === setting.payment_method ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Номер счёта / реквизиты</Label>
                          <Input
                            defaultValue={setting.account_number}
                            placeholder="Введите реквизиты"
                          />
                        </div>
                        <div>
                          <Label>URL QR-кода</Label>
                          <Input
                            defaultValue={setting.qr_code_url}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updatePaymentSetting(setting.payment_method, {})}>
                            Сохранить
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedMethod(null)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setSelectedMethod(setting.payment_method)}>
                        <Icon name="Edit" className="mr-2" size={14} />
                        Редактировать
                      </Button>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}