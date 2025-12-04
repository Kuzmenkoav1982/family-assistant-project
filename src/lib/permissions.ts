/**
 * Система проверки прав доступа на основе ролей
 */

export type AccessRole = 'admin' | 'parent' | 'guardian' | 'viewer' | 'child';

export type Module = 'profile' | 'health' | 'dreams' | 'finance' | 'education' | 'diary' | 'family';

export type Action = 
  // Profile
  | 'view' | 'edit' | 'delete' | 'view_own' | 'edit_own'
  // Health
  | 'doctor.add' | 'medicine.add' | 'medicine.mark'
  // Dreams
  | 'add' | 'achieve' | 'add_own' | 'edit_own' | 'achieve_own'
  // Finance
  | 'budget' | 'piggybank' | 'export' | 'piggybank_own'
  // Education
  | 'tests' | 'tests_own' | 'view_own'
  // Diary
  | 'add_own'
  // Family
  | 'invite' | 'remove' | 'roles';

/**
 * Матрица прав доступа по ролям
 */
const ROLE_PERMISSIONS: Record<AccessRole, Record<Module, Action[]>> = {
  admin: {
    profile: ['view', 'edit', 'delete'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'tests', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: ['invite', 'remove', 'roles', 'delete']
  },
  parent: {
    profile: ['view', 'edit'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
    dreams: ['view', 'add', 'edit', 'achieve', 'delete'],
    finance: ['view', 'budget', 'piggybank', 'export'],
    education: ['view', 'add', 'export'],
    diary: ['view', 'add', 'edit', 'delete'],
    family: []
  },
  guardian: {
    profile: ['view'],
    health: ['view', 'doctor.add', 'medicine.add', 'medicine.mark'],
    dreams: ['view'],
    finance: ['view'],
    education: ['view'],
    diary: ['view', 'add'],
    family: []
  },
  viewer: {
    profile: ['view'],
    health: ['view'],
    dreams: ['view'],
    finance: ['view'],
    education: ['view'],
    diary: ['view'],
    family: []
  },
  child: {
    profile: ['view_own', 'edit_own'],
    health: ['view_own', 'medicine.mark'],
    dreams: ['view_own', 'add_own', 'edit_own', 'achieve_own'],
    finance: ['view_own', 'piggybank_own'],
    education: ['view_own', 'tests_own'],
    diary: ['view_own', 'add_own', 'edit_own'],
    family: []
  }
};

/**
 * Проверяет наличие права у роли
 */
export function hasPermission(
  role: AccessRole | null | undefined,
  module: Module,
  action: Action,
  granularPermissions?: Record<Module, Action[]> | null
): boolean {
  if (!role) return false;

  // Проверка гранулярных прав (переопределение)
  if (granularPermissions && module in granularPermissions) {
    return granularPermissions[module].includes(action);
  }

  // Проверка стандартных прав роли
  if (role in ROLE_PERMISSIONS) {
    const modulePermissions = ROLE_PERMISSIONS[role][module] || [];
    return modulePermissions.includes(action);
  }

  return false;
}

/**
 * Получает все права для роли
 */
export function getRolePermissions(role: AccessRole): Record<Module, Action[]> {
  return ROLE_PERMISSIONS[role] || {};
}

/**
 * Проверяет, является ли пользователь администратором
 */
export function isAdmin(role: AccessRole | null | undefined): boolean {
  return role === 'admin';
}

/**
 * Проверяет, может ли пользователь редактировать
 */
export function canEdit(role: AccessRole | null | undefined, module: Module): boolean {
  return hasPermission(role, module, 'edit');
}

/**
 * Проверяет, может ли пользователь удалять
 */
export function canDelete(role: AccessRole | null | undefined, module: Module): boolean {
  return hasPermission(role, module, 'delete');
}

/**
 * Проверяет, может ли пользователь просматривать
 */
export function canView(role: AccessRole | null | undefined, module: Module): boolean {
  return hasPermission(role, module, 'view') || hasPermission(role, module, 'view_own');
}

/**
 * Получает текстовое описание роли
 */
export function getRoleLabel(role: AccessRole): string {
  const labels: Record<AccessRole, string> = {
    admin: '👑 Администратор',
    parent: '👨‍👩‍👧 Родитель',
    guardian: '👵 Опекун',
    viewer: '👀 Наблюдатель',
    child: '👶 Ребёнок'
  };
  return labels[role] || role;
}

/**
 * Получает описание прав роли
 */
export function getRoleDescription(role: AccessRole): string {
  const descriptions: Record<AccessRole, string> = {
    admin: 'Полный доступ ко всем функциям, включая управление семьёй',
    parent: 'Доступ ко всем данным, кроме управления семьёй и удаления',
    guardian: 'Просмотр всех данных, управление здоровьем и дневником',
    viewer: 'Только просмотр всех данных',
    child: 'Управление только своими данными'
  };
  return descriptions[role] || '';
}

/**
 * Список всех доступных ролей для выбора
 */
export const AVAILABLE_ROLES: { value: AccessRole; label: string; description: string }[] = [
  {
    value: 'admin',
    label: getRoleLabel('admin'),
    description: getRoleDescription('admin')
  },
  {
    value: 'parent',
    label: getRoleLabel('parent'),
    description: getRoleDescription('parent')
  },
  {
    value: 'guardian',
    label: getRoleLabel('guardian'),
    description: getRoleDescription('guardian')
  },
  {
    value: 'viewer',
    label: getRoleLabel('viewer'),
    description: getRoleDescription('viewer')
  },
  {
    value: 'child',
    label: getRoleLabel('child'),
    description: getRoleDescription('child')
  }
];
