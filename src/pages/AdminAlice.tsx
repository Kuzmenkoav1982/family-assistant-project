import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { AdminAliceHeader } from '@/components/admin/alice/AdminAliceHeader';
import { AdminAliceMetrics } from '@/components/admin/alice/AdminAliceMetrics';
import { AdminAliceTabs } from '@/components/admin/alice/AdminAliceTabs';

interface AliceStats {
  totalUsers: number;
  activeUsers: number;
  totalCommands: number;
  todayCommands: number;
  popularCommands: Array<{ command: string; count: number }>;
  dailyUsage: Array<{ date: string; commands: number; users: number }>;
  commandsByCategory: Array<{ category: string; count: number; color: string }>;
  errorRate: number;
  avgResponseTime: number;
}

interface AliceUser {
  name: string;
  family: string;
  commands: number;
  lastActive: string;
}

interface LogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  user: string;
  time: string;
  command: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  tasks: '#8b5cf6',
  calendar: '#3b82f6',
  shopping: '#10b981',
  stats: '#f59e0b',
  help: '#6366f1',
  other: '#9ca3af',
};

const CATEGORY_NAMES: Record<string, string> = {
  tasks: 'Задачи',
  calendar: 'Календарь',
  shopping: 'Покупки',
  stats: 'Статистика',
  help: 'Помощь',
  other: 'Другое',
};

export default function AdminAlice() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AliceStats | null>(null);
  const [users, setUsers] = useState<AliceUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeployed, setIsDeployed] = useState(true);
  const [webhookUrl] = useState('https://functions.poehali.dev/3654f595-6c6d-4ebf-9213-f12b4d75efaf');

  useEffect(() => {
    loadStats();
    loadUsers();
    loadLogs();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=stats', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to load stats:', response.status);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Преобразуем данные для графиков
      const commandsByCategory = data.popular_commands?.map((cmd: any) => ({
        category: CATEGORY_NAMES[cmd.command_category] || cmd.command_category,
        count: cmd.count,
        color: CATEGORY_COLORS[cmd.command_category] || CATEGORY_COLORS.other,
      })) || [];
      
      setStats({
        totalUsers: data.total_users || 0,
        activeUsers: data.active_today || 0,
        totalCommands: data.total_commands || 0,
        todayCommands: data.today_commands || 0,
        popularCommands: [], // Будем загружать отдельно
        dailyUsage: [], // Будем загружать отдельно
        commandsByCategory,
        errorRate: data.error_rate || 0,
        avgResponseTime: data.avg_response_time || 0,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e?action=alice-users', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e?action=alice-logs', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <AdminAliceHeader
          isDeployed={isDeployed}
          webhookUrl={webhookUrl}
          onCopyWebhook={copyWebhookUrl}
          onNavigateBack={() => navigate('/admin/dashboard')}
        />

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Загрузка статистики...</p>
            </CardContent>
          </Card>
        ) : !stats ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto mb-4 text-red-600" />
              <p className="text-gray-600">Не удалось загрузить статистику</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <AdminAliceMetrics stats={stats} />
            
            <AdminAliceTabs
              commandsByCategory={stats.commandsByCategory}
              avgResponseTime={stats.avgResponseTime}
              errorRate={stats.errorRate}
              users={users}
              logs={logs}
              webhookUrl={webhookUrl}
              onCopyWebhook={copyWebhookUrl}
            />
          </>
        )}
      </div>
    </div>
  );
}
