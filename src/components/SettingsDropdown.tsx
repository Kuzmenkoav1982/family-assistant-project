import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function SettingsDropdown() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white"
          title="Настройки (НОВОЕ - проверь выпадающее меню)"
        >
          <Icon name="Settings" size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Icon name="Home" size={16} className="mr-2" />
          Настройки аккаунта
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/family-management')}>
          <Icon name="Users" size={16} className="mr-2" />
          Управление семьёй
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/family-code')}>
          <Icon name="Key" size={16} className="mr-2" />
          Семейный код
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/permissions')}>
          <Icon name="Shield" size={16} className="mr-2" />
          Права доступа
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}