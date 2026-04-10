export type Role = 'admin' | 'parent' | 'guardian' | 'viewer' | 'child';

export type Permission = {
  module: 'profile' | 'health' | 'dreams' | 'finance' | 'education' | 'diary' | 'family' | 'tasks' | 'events' | 'familymatrix';
  action: string;
};

export const ROLE_PERMISSIONS: Record<Role, Record<string, string[]>> = {
  admin: {
    profile: ['view', 'edit', 'delete'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'tests', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: ['invite', 'remove', 'roles', 'delete'],
    tasks: ['view', 'add', 'edit', 'delete', 'assign', 'complete'],
    events: ['view', 'add', 'edit', 'delete'],
    familymatrix: ['view', 'view_couple', 'view_family', 'edit']
  },
  parent: {
    profile: ['view', 'edit'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'tests', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: [],
    tasks: ['view', 'add', 'edit', 'assign', 'complete'],
    events: ['view', 'add', 'edit'],
    familymatrix: ['view', 'view_couple', 'view_family', 'edit']
  },
  guardian: {
    profile: ['view'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark'],
    dreams: ['view'],
    finance: ['view'],
    education: ['view'],
    diary: ['view', 'add'],
    family: [],
    tasks: ['view', 'add', 'complete'],
    events: ['view', 'add'],
    familymatrix: ['view', 'view_family']
  },
  viewer: {
    profile: ['view'],
    health: ['view'],
    dreams: ['view'],
    finance: ['view'],
    education: ['view'],
    diary: ['view'],
    family: [],
    tasks: ['view'],
    events: ['view'],
    familymatrix: ['view']
  },
  child: {
    profile: ['view_own', 'edit_own'],
    health: ['view_own', 'medicine.mark'],
    dreams: ['view_own', 'add_own', 'edit_own', 'achieve_own'],
    finance: ['view_own', 'piggybank_own'],
    education: ['view_own', 'tests_own'],
    diary: ['view_own', 'add_own', 'edit_own'],
    family: [],
    tasks: ['view_own', 'complete_own'],
    events: ['view'],
    familymatrix: ['view_own']
  }
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: '👑 Админ',
  parent: '👨‍👩‍👧 Родитель',
  guardian: '👵 Опекун',
  viewer: '👀 Наблюдатель',
  child: '👶 Ребёнок'
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Полный доступ ко всем функциям семьи',
  parent: 'Управление всеми разделами, кроме удаления членов семьи',
  guardian: 'Управление здоровьем и дневником, просмотр остального',
  viewer: 'Только просмотр всех данных',
  child: 'Управление своим профилем, мечтами и копилкой'
};

export function hasPermission(
  role: Role,
  module: string,
  action: string,
  granularPermissions?: Record<string, string[]>
): boolean {
  if (granularPermissions && granularPermissions[module]) {
    return granularPermissions[module].includes(action);
  }
  
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms || !rolePerms[module]) {
    return false;
  }
  
  return rolePerms[module].includes(action);
}

export async function checkPermission(
  memberId: string,
  familyId: string,
  module: string,
  action: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/family-roles/check?familyId=${familyId}&memberId=${memberId}&module=${module}&action=${action}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.allowed === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export function getRolePermissions(role: Role): Record<string, string[]> {
  return ROLE_PERMISSIONS[role] || {};
}

export function getAllModulePermissions(): Record<string, string[]> {
  return {
    profile: ['view', 'edit', 'delete'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'tests', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: ['invite', 'remove', 'roles', 'delete'],
    tasks: ['view', 'add', 'edit', 'delete', 'assign', 'complete'],
    events: ['view', 'add', 'edit', 'delete']
  };
}

export interface PermissionMatrix {
  [module: string]: {
    [action: string]: {
      admin: boolean;
      parent: boolean;
      guardian: boolean;
      viewer: boolean;
      child: boolean;
    };
  };
}

export function getPermissionMatrix(): PermissionMatrix {
  const modules = getAllModulePermissions();
  const matrix: PermissionMatrix = {};
  
  for (const [module, actions] of Object.entries(modules)) {
    matrix[module] = {};
    for (const action of actions) {
      matrix[module][action] = {
        admin: hasPermission('admin', module, action),
        parent: hasPermission('parent', module, action),
        guardian: hasPermission('guardian', module, action),
        viewer: hasPermission('viewer', module, action),
        child: hasPermission('child', module, action)
      };
    }
  }
  
  return matrix;
}