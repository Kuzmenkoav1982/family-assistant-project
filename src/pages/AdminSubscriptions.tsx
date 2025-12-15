import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SubscriptionsDashboard from '@/components/admin/SubscriptionsDashboard';
import SubscriptionsTable from '@/components/admin/SubscriptionsTable';
import PromoCodesManager from '@/components/admin/PromoCodesManager';
import PlansSettings from '@/components/admin/PlansSettings';
import ReportsExport from '@/components/admin/ReportsExport';

const API_URL = 'https://functions.poehali.dev/0785b781-b361-4def-810e-131977a99fbe';

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken !== 'admin_authenticated') {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Icon name="CreditCard" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Управление подписками</h1>
                <p className="text-sm text-gray-600">Полный контроль над монетизацией</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Главная админка
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Icon name="Home" size={16} className="mr-2" />
                На сайт
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Icon name="Users" size={16} />
              Подписки
            </TabsTrigger>
            <TabsTrigger value="promos" className="gap-2">
              <Icon name="Tag" size={16} />
              Промокоды
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Icon name="Settings" size={16} />
              Тарифы
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Icon name="FileText" size={16} />
              Отчёты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SubscriptionsDashboard apiUrl={API_URL} />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionsTable apiUrl={API_URL} />
          </TabsContent>

          <TabsContent value="promos" className="space-y-6">
            <PromoCodesManager apiUrl={API_URL} />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PlansSettings />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsExport apiUrl={API_URL} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
