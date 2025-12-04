# Интеграция системы прав доступа

## 📚 Обзор

Система ролей и прав доступа позволяет контролировать, кто и что может делать в семье.

### Роли:
- 👑 **Админ** - полный доступ
- 👨‍👩‍👧 **Родитель** - управление всем, кроме ролей
- 👵 **Опекун** - здоровье и дневник
- 👀 **Наблюдатель** - только просмотр
- 👶 **Ребёнок** - управление своими данными

---

## 🚀 Как использовать

### 1. Хук для проверки прав

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { canDo, role } = usePermissions();
  
  // Проверка конкретного права
  const canAddDoctor = canDo('health', 'doctor.add');
  const canDeleteDreams = canDo('dreams', 'delete');
  
  return (
    <div>
      {canAddDoctor && <Button>Добавить визит к врачу</Button>}
      {canDeleteDreams && <Button>Удалить мечту</Button>}
    </div>
  );
}
```

### 2. Компонент PermissionGuard

Скрывает контент, если нет прав:

```typescript
import { PermissionGuard } from '@/components/PermissionGuard';

function MyComponent() {
  return (
    <PermissionGuard module="health" action="doctor.add">
      <Button>Добавить визит к врачу</Button>
    </PermissionGuard>
  );
}
```

С сообщением об ошибке:

```typescript
<PermissionGuard 
  module="dreams" 
  action="delete" 
  showAlert={true}
>
  <Button>Удалить мечту</Button>
</PermissionGuard>
```

С запасным вариантом:

```typescript
<PermissionGuard 
  module="finance" 
  action="budget"
  fallback={<p>Нет доступа к бюджету</p>}
>
  <BudgetEditor />
</PermissionGuard>
```

### 3. Быстрые хуки

```typescript
import { useIsAdmin, useCanManageHealth } from '@/hooks/usePermissions';

function MyComponent() {
  const isAdmin = useIsAdmin();
  const canManageHealth = useCanManageHealth();
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canManageHealth && <HealthManagement />}
    </div>
  );
}
```

---

## 📋 Модули и действия

### Профиль (`profile`)
- `view` - Просмотр профиля
- `edit` - Редактирование
- `delete` - Удаление

### Здоровье (`health`)
- `view` - Просмотр
- `doctor.add` - Добавить визит к врачу
- `medicine.add` - Добавить лекарство
- `medicine.mark` - Отметить приём
- `delete` - Удаление записей

### Мечты (`dreams`)
- `view` - Просмотр
- `add` - Добавление
- `edit` - Редактирование
- `achieve` - Отметить достигнутой
- `delete` - Удаление

### Финансы (`finance`)
- `view` - Просмотр
- `budget` - Управление бюджетом
- `piggybank` - Управление копилкой
- `export` - Экспорт данных

### Образование (`education`)
- `view` - Просмотр оценок
- `add` - Добавить оценку
- `tests` - Прохождение тестов
- `export` - Экспорт

### Дневник (`diary`)
- `view` - Просмотр
- `add` - Добавление записи
- `edit` - Редактирование
- `delete` - Удаление

### Семья (`family`)
- `invite` - Приглашение членов
- `remove` - Удаление участников
- `roles` - Управление ролями
- `delete` - Удаление семьи

---

## 🔧 Backend проверка прав

```python
# В backend функциях
from permissions import check_permission

def handler(event, context):
    user_id = get_user_id_from_token(event)
    family_id = get_family_id(event)
    
    # Проверка права
    has_permission = check_permission(
        user_id, 
        family_id, 
        'health', 
        'doctor.add'
    )
    
    if not has_permission:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Недостаточно прав'})
        }
    
    # Продолжить выполнение...
```

---

## 📝 Примеры интеграции

### Пример 1: Кнопки с проверкой прав

```typescript
function HealthSection() {
  const { canDo } = usePermissions();
  
  return (
    <div>
      <h2>Здоровье</h2>
      
      {canDo('health', 'doctor.add') && (
        <Button onClick={handleAddDoctor}>
          Добавить визит к врачу
        </Button>
      )}
      
      {canDo('health', 'medicine.add') && (
        <Button onClick={handleAddMedicine}>
          Добавить лекарство
        </Button>
      )}
      
      {canDo('health', 'delete') && (
        <Button variant="destructive" onClick={handleDelete}>
          Удалить
        </Button>
      )}
    </div>
  );
}
```

### Пример 2: Условный рендеринг разделов

```typescript
function Dashboard() {
  const { canDo, role } = usePermissions();
  
  return (
    <div className="grid gap-4">
      <PermissionGuard module="health" action="view">
        <HealthCard />
      </PermissionGuard>
      
      <PermissionGuard module="finance" action="view">
        <FinanceCard />
      </PermissionGuard>
      
      {canDo('family', 'invite') && (
        <InviteMemberCard />
      )}
    </div>
  );
}
```

### Пример 3: Роль "Ребёнок" - только свои данные

```typescript
function DreamsList({ childId }: { childId: string }) {
  const { role, canDo } = usePermissions();
  const currentUserId = getCurrentUserId();
  
  // Ребёнок может редактировать только свои мечты
  const canEdit = role === 'child' 
    ? childId === currentUserId && canDo('dreams', 'add_own')
    : canDo('dreams', 'edit');
  
  return (
    <div>
      {dreams.map(dream => (
        <DreamCard 
          key={dream.id} 
          dream={dream}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
```

---

## ✅ Чек-лист интеграции

При добавлении нового функционала:

- [ ] Определить модуль и действие (например, `health.doctor.add`)
- [ ] Добавить проверку `canDo()` перед кнопками/формами
- [ ] Добавить проверку на backend (если есть API)
- [ ] Обернуть в `<PermissionGuard>` при необходимости
- [ ] Протестировать для всех 5 ролей
- [ ] Обновить матрицу прав в `ROLE_PERMISSIONS`

---

## 🎯 FAQ

**Q: Как узнать текущую роль пользователя?**
```typescript
const { role } = usePermissions();
// role: 'admin' | 'parent' | 'guardian' | 'viewer' | 'child'
```

**Q: Как проверить несколько прав сразу?**
```typescript
const { canDo } = usePermissions();
const canManage = canDo('health', 'doctor.add') && canDo('health', 'medicine.add');
```

**Q: Как изменить роль пользователя?**
Через страницу `/family-management` (только админ)

**Q: Где хранятся настройки прав?**
- Frontend: `src/utils/permissions.ts`
- Backend: `backend/family-roles/index.py`
- База данных: таблица `family_members` (поле `access_role`)

---

## 📞 Поддержка

Проблемы с правами? Проверьте:
1. Роль в localStorage: `localStorage.getItem('userData')`
2. Матрица прав: `/family-management` → вкладка "Права доступа"
3. Backend логи: проверка прав проходит успешно?

---

**Документация обновлена:** 2025-01-04
