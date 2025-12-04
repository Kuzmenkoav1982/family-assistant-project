import { useState, useEffect } from 'react';
import { hasPermission, type Role } from '@/utils/permissions';

interface UsePermissionsOptions {
  familyId?: string;
  memberId?: string;
}

interface PermissionsState {
  role: Role;
  permissions: Record<string, boolean>;
  loading: boolean;
  canDo: (module: string, action: string) => boolean;
}

export function usePermissions(options: UsePermissionsOptions = {}): PermissionsState {
  const [role, setRole] = useState<Role>('viewer');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, [options.familyId, options.memberId]);

  const loadPermissions = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userRole = user.access_role || 'viewer';
        setRole(userRole);
        
        const allPermissions: Record<string, boolean> = {};
        const modules = ['profile', 'health', 'dreams', 'finance', 'education', 'diary', 'family'];
        
        modules.forEach(module => {
          const actions = getModuleActions(module);
          actions.forEach(action => {
            const key = `${module}.${action}`;
            allPermissions[key] = hasPermission(userRole, module, action);
          });
        });
        
        setPermissions(allPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const canDo = (module: string, action: string): boolean => {
    const key = `${module}.${action}`;
    return permissions[key] === true;
  };

  return {
    role,
    permissions,
    loading,
    canDo,
  };
}

function getModuleActions(module: string): string[] {
  const actionsMap: Record<string, string[]> = {
    profile: ['view', 'edit', 'delete'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'tests', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: ['invite', 'remove', 'roles', 'delete'],
  };
  return actionsMap[module] || [];
}

export function useIsAdmin(): boolean {
  const { role } = usePermissions();
  return role === 'admin';
}

export function useIsParent(): boolean {
  const { role } = usePermissions();
  return role === 'admin' || role === 'parent';
}

export function useCanManageHealth(): boolean {
  const { canDo } = usePermissions();
  return canDo('health', 'doctor.add') && canDo('health', 'medicine.add');
}

export function useCanManageDreams(): boolean {
  const { canDo } = usePermissions();
  return canDo('dreams', 'add') && canDo('dreams', 'edit');
}

export function useCanManageFinance(): boolean {
  const { canDo } = usePermissions();
  return canDo('finance', 'budget');
}
