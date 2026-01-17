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
      console.log('[usePermissions] userData from localStorage:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        let userRole = user.access_role;
        console.log('[usePermissions] Initial role from userData:', userRole);

        if (!userRole && user.member_id) {
          console.log('[usePermissions] No role found, fetching from API for member:', user.member_id);
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://functions.poehali.dev/9c2279f4-7f87-4d3f-8f06-60f151f18962', {
              method: 'GET',
              headers: {
                'X-Auth-Token': token || ''
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('[usePermissions] API response:', data);
              if (data.success && data.members) {
                const currentMember = data.members.find((m: any) => m.id === user.member_id);
                console.log('[usePermissions] Found member:', currentMember);
                if (currentMember?.access_role) {
                  userRole = currentMember.access_role;
                  user.access_role = userRole;
                  localStorage.setItem('userData', JSON.stringify(user));
                  console.log('[usePermissions] Updated role in localStorage:', userRole);
                }
              }
            }
          } catch (fetchError) {
            console.error('[usePermissions] Error fetching member role:', fetchError);
          }
        }

        userRole = userRole || 'viewer';
        console.log('[usePermissions] Final role:', userRole);
        setRole(userRole);
        
        const allPermissions: Record<string, boolean> = {};
        const modules = ['profile', 'health', 'dreams', 'finance', 'education', 'diary', 'family', 'tasks', 'events'];
        
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
    tasks: ['view', 'add', 'edit', 'delete', 'assign', 'complete'],
    events: ['view', 'add', 'edit', 'delete'],
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

export function useCanManageTasks(): boolean {
  const { canDo } = usePermissions();
  return canDo('tasks', 'add') && canDo('tasks', 'edit');
}

export function useCanDeleteTasks(): boolean {
  const { canDo } = usePermissions();
  return canDo('tasks', 'delete');
}

export function useCanManageEvents(): boolean {
  const { canDo } = usePermissions();
  return canDo('events', 'add') && canDo('events', 'edit');
}

export function useCanDeleteEvents(): boolean {
  const { canDo } = usePermissions();
  return canDo('events', 'delete');
}