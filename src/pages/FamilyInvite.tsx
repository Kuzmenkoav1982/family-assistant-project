import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from '@/components/FamilyInviteManager';

export default function FamilyInvite() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <Icon name="Key" size={36} className="text-green-600" />
              Инвайт-коды семьи
            </h1>
            <p className="text-gray-600 mt-2">Создавайте коды для приглашения родственников в семью</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        <FamilyInviteManager />
      </div>
    </div>
  );
}
