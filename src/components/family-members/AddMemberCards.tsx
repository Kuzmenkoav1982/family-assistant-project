import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export const AddMemberCard = () => {
  const navigate = useNavigate();
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30"
      onClick={() => navigate('/settings')}
    >
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Icon name="UserPlus" size={16} className="text-purple-500" />
          </div>
          <span className="text-xs sm:text-sm text-purple-600 font-medium">Добавить члена семьи</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface AddChildCardProps {
  onClick: () => void;
}

export const AddChildCard = ({ onClick }: AddChildCardProps) => (
  <Card
    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30"
    onClick={onClick}
  >
    <CardContent className="p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon name="Baby" size={16} className="text-blue-500" />
        </div>
        <span className="text-xs sm:text-sm text-blue-600 font-medium">Добавить ребёнка</span>
      </div>
    </CardContent>
  </Card>
);
