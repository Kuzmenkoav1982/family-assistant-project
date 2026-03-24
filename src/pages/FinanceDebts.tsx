import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function FinanceDebts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-xl font-bold">Кредиты и долги</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Receipt" size={48} className="mx-auto mb-3 text-rose-300" />
          <p>Загрузка раздела...</p>
        </div>
      </div>
    </div>
  );
}
