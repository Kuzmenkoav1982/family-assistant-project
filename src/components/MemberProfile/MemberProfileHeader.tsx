import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function MemberProfileHeader() {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button onClick={() => navigate('/')} variant="outline">
        <Icon name="ArrowLeft" className="mr-2" size={16} />
        Назад
      </Button>
      {memberId && (
        <Button
          onClick={() => navigate(`/portfolio/${memberId}`)}
          className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-white border-0"
        >
          <Icon name="Sparkles" className="mr-2" size={16} />
          Открыть портфолио
        </Button>
      )}
    </div>
  );
}
