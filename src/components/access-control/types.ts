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

/**
 * Роли, предлагаемые в интерфейсе.
 *
 * «Редактор» отсюда убран сознательно. Он отображался на серверную роль
 * `parent`, а `parent` — это не право редактирования, а семейное отношение,
 * которое раньше открывало доступ к медицинским данным детей. Из-за этой
 * подмены (миграция editor → parent) 12-летний участник с ролью «Сын»
 * получил полномочия родителя.
 *
 * Право редактировать контент теперь описывается ролью «Участник» (admin
 * без управления ролями недоступен, поэтому редактирование даётся через
 * admin), а доступ к данным конкретного ребёнка выдаётся отдельно —
 * адресной записью опекунства, а не выбором роли в этом списке.
 */
export const ROLES = {
  admin: {
    label: 'Администратор',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'ShieldCheck',
    description: 'Управление семьёй и содержимым. Доступ к здоровью — только по отдельному назначению'
  },
  viewer: {
    label: 'Наблюдатель',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: 'Eye',
    description: 'Только просмотр информации'
  }
} as const;

/**
 * Подписи для отображения, включая устаревшую роль `editor`.
 *
 * Выбрать «Редактора» больше нельзя (его нет в ROLES), но участники с этой
 * ролью могли остаться в старых данных, и карточка обязана их показать —
 * молча падать или рисовать пустую роль хуже, чем честно назвать её
 * устаревшей.
 */
export const ROLE_DISPLAY: Record<string, { label: string; color: string; icon: string; description: string }> = {
  ...ROLES,
  editor: {
    label: 'Редактор (устарело)',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'Edit',
    description: 'Устаревшая роль. Выберите «Администратор» или «Наблюдатель»'
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