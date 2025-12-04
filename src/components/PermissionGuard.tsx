import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS } from '@/utils/permissions';

interface PermissionGuardProps {
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
  showAlert = false,
}: PermissionGuardProps) {
  const { canDo, role } = usePermissions();

  if (!canDo(module, action)) {
    if (showAlert) {
      return (
        <Alert variant="destructive" className="my-4">
          <Icon name="Lock" className="h-4 w-4" />
          <AlertDescription>
            Это действие недоступно для роли {ROLE_LABELS[role]}. 
            Обратитесь к администратору семьи для изменения прав доступа.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function useHasPermission(module: string, action: string): boolean {
  const { canDo } = usePermissions();
  return canDo(module, action);
}
