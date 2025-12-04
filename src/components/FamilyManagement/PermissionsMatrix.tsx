import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS, getAllModulePermissions, hasPermission, type Role } from '@/utils/permissions';

const MODULE_LABELS: Record<string, string> = {
  profile: 'Профиль',
  health: 'Здоровье',
  dreams: 'Мечты',
  finance: 'Финансы',
  education: 'Образование',
  diary: 'Дневник',
  family: 'Семья',
};

const ACTION_LABELS: Record<string, string> = {
  view: 'Просмотр',
  view_own: 'Просмотр (своё)',
  edit: 'Редактирование',
  edit_own: 'Редактирование (своё)',
  delete: 'Удаление',
  'doctor.add': 'Визиты к врачу',
  'medicine.add': 'Добавить лекарство',
  'medicine.mark': 'Отметить приём',
  add: 'Добавление',
  add_own: 'Добавление (своё)',
  achieve: 'Отметить достигнутой',
  achieve_own: 'Отметить (своё)',
  budget: 'Управление бюджетом',
  piggybank: 'Управление копилкой',
  piggybank_own: 'Копилка (своя)',
  export: 'Экспорт данных',
  tests: 'Прохождение тестов',
  tests_own: 'Тесты (свои)',
  invite: 'Приглашения',
  remove: 'Удаление участников',
  roles: 'Управление ролями',
};

export default function PermissionsMatrix() {
  const modules = getAllModulePermissions();
  const roles: Role[] = ['admin', 'parent', 'guardian', 'viewer', 'child'];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Раздел / Действие</TableHead>
            {roles.map((role) => (
              <TableHead key={role} className="text-center">
                {ROLE_LABELS[role]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(modules).map(([module, actions]) => (
            <>
              <TableRow key={module} className="bg-muted/50">
                <TableCell colSpan={6} className="font-semibold">
                  {MODULE_LABELS[module] || module}
                </TableCell>
              </TableRow>
              {actions.map((action) => (
                <TableRow key={`${module}-${action}`}>
                  <TableCell className="pl-8 text-sm text-muted-foreground">
                    {ACTION_LABELS[action] || action}
                  </TableCell>
                  {roles.map((role) => {
                    const allowed = hasPermission(role, module, action);
                    return (
                      <TableCell key={role} className="text-center">
                        {allowed ? (
                          <div className="flex justify-center">
                            <Icon name="Check" className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Icon name="X" className="h-5 w-5 text-red-400 opacity-50" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold text-sm mb-3">Легенда:</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600" />
            <span>Разрешено</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="X" className="h-4 w-4 text-red-400" />
            <span>Запрещено</span>
          </div>
          <div className="flex items-start gap-2 mt-2">
            <Icon name="Info" className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Примечание:</p>
              <p className="text-muted-foreground">
                Права с пометкой &quot;(своё)&quot; применяются только к собственным данным
                участника. Например, ребёнок может редактировать свой профиль, но не
                может редактировать профили других участников.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
