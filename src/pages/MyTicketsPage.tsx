import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

interface Ticket {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  new:          { label: 'Новое',         color: 'bg-blue-100 text-blue-700',   icon: 'Clock' },
  in_progress:  { label: 'В работе',      color: 'bg-amber-100 text-amber-700', icon: 'Loader2' },
  waiting_user: { label: 'Ждём вас',      color: 'bg-purple-100 text-purple-700', icon: 'MessageSquare' },
  resolved:     { label: 'Решено',        color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  closed:       { label: 'Закрыто',       color: 'bg-gray-100 text-gray-500',   icon: 'X' },
};

const TYPE_LABEL: Record<string, string> = {
  support:    'Поддержка',
  review:     'Отзыв',
  suggestion: 'Предложение',
};

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  useEffect(() => {
    if (!currentUser?.id) { setLoading(false); return; }
    fetch(`${feedbackUrl}?my_tickets=true&user_id=${currentUser.id}`)
      .then(r => r.json())
      .then(d => setTickets(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500', icon: 'Circle' };
    return (
      <Badge className={`${cfg.color} border-0 gap-1 text-xs font-medium`}>
        <Icon name={cfg.icon} size={11} />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <SectionPageFrame
      title="Мои обращения"
      subtitle="История ваших запросов в поддержку"
      backPath="/"
      variant="light"
      width="narrow"
    >
      <div className="space-y-3">
        <Button
          onClick={() => navigate('/support')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
        >
          <Icon name="Plus" size={18} />
          Новое обращение
        </Button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={28} className="animate-spin text-gray-400" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Inbox" size={28} className="text-gray-400" />
            </div>
            <p className="font-medium text-gray-700 mb-1">Обращений пока нет</p>
            <p className="text-sm text-gray-500">Если у вас возникнет вопрос — мы поможем</p>
          </Card>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                    <span className="text-xs text-gray-400">
                      {TYPE_LABEL[ticket.type] || ticket.type}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm leading-snug">{ticket.title}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                {ticket.status === 'resolved' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Icon name="CheckCircle" size={11} />
                    Решено
                  </span>
                )}
                {ticket.status === 'waiting_user' && (
                  <span className="flex items-center gap-1 text-purple-600 font-medium">
                    <Icon name="MessageSquare" size={11} />
                    Ждём ваш ответ
                  </span>
                )}
              </div>
            </Card>
          ))
        )}

        {tickets.length > 0 && (
          <p className="text-xs text-center text-gray-400 pt-2">
            Ответ придёт на ваш email. Обычно в течение 24 часов.
          </p>
        )}
      </div>
    </SectionPageFrame>
  );
}
