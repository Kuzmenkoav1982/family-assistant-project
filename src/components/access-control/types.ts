export interface FamilyMemberPermissions {
  id: string;
  name: string;
  relationship: string;
  avatarUrl?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: {
    canEditTasks: boolean;
    canDeleteTasks: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canEditMembers: boolean;
    canDeleteMembers: boolean;
    canManageInvites: boolean;
    canEditFamily: boolean;
    canViewStats: boolean;
  };
}

export const ROLES = {
  admin: {
    label: 'Администратор',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'ShieldCheck',
    description: 'Полный доступ ко всем функциям'
  },
  editor: {
    label: 'Редактор',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'Edit',
    description: 'Может создавать и редактировать контент'
  },
  viewer: {
    label: 'Наблюдатель',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: 'Eye',
    description: 'Только просмотр информации'
  }
};

export const DEFAULT_PERMISSIONS = {
  admin: {
    canEditTasks: true,
    canDeleteTasks: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canEditMembers: true,
    canDeleteMembers: true,
    canManageInvites: true,
    canEditFamily: true,
    canViewStats: true
  },
  editor: {
    canEditTasks: true,
    canDeleteTasks: false,
    canEditEvents: true,
    canDeleteEvents: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canManageInvites: false,
    canEditFamily: false,
    canViewStats: true
  },
  viewer: {
    canEditTasks: false,
    canDeleteTasks: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canManageInvites: false,
    canEditFamily: false,
    canViewStats: true
  }
};
