import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from '@/components/FamilyInviteManager';

export default function FamilyManagement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Icon name="Users" size={36} className="text-blue-600" />
              Управление семьёй
            </h1>
            <p className="text-gray-600 mt-2">Управление участниками, ролями и правами доступа</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
        </div>

        <FamilyInviteManager />
      </div>
    </div>
  );
}
