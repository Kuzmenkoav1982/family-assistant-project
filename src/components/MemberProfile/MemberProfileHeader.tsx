import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function MemberProfileHeader() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/')} variant="outline">
      <Icon name="ArrowLeft" className="mr-2" size={16} />
      Назад
    </Button>
  );
}
