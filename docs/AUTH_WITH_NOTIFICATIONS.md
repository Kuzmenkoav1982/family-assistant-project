# 🔐 Регистрация, Авторизация и Восстановление пароля с Email/SMS уведомлениями

Полная инструкция по работе системы аутентификации с интеграцией email и SMS уведомлений.

---

## 📋 Оглавление

1. [Архитектура системы](#архитектура-системы)
2. [Регистрация нового пользователя](#регистрация-нового-пользователя)
3. [Вход в систему](#вход-в-систему)
4. [Восстановление пароля](#восстановление-пароля)
5. [Смена пароля](#смена-пароля)
6. [Настройка уведомлений](#настройка-уведомлений)
7. [Интеграция в проект](#интеграция-в-проект)

---

## 🏗️ Архитектура системы

### Backend функции

| Функция | URL | Назначение |
|---------|-----|------------|
| **auth** | `backend/auth/index.py` | Регистрация, вход, OAuth |
| **password-reset** | `backend/password-reset/index.py` | Сброс и смена пароля |
| **notifications** | `backend/notifications/index.py` | Отправка email и SMS |

### База данных (PostgreSQL)

**Таблица `users`**:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(64) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Таблица `password_reset_codes`**:
```sql
CREATE TABLE password_reset_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Секреты проекта

Необходимые секреты для работы:

| Секрет | Назначение | Где взять |
|--------|------------|-----------|
| `DATABASE_URL` | Подключение к БД | Автоматически создается |
| `YANDEX_SMTP_LOGIN` | Логин Яндекс.Почты | [Пароли приложений](https://id.yandex.ru/security/app-passwords) |
| `YANDEX_SMTP_PASSWORD` | Пароль приложения | [Пароли приложений](https://id.yandex.ru/security/app-passwords) |
| `YANDEX_CLOUD_API_KEY` | API ключ для SMS | [Yandex Cloud Console](https://console.cloud.yandex.ru/) |
| `YANDEX_FOLDER_ID` | ID папки в облаке | [Yandex Cloud Console](https://console.cloud.yandex.ru/) |
| `YANDEX_CLIENT_ID` | OAuth Yandex ID | [OAuth приложения](https://oauth.yandex.ru/) |
| `YANDEX_CLIENT_SECRET` | Секрет OAuth | [OAuth приложения](https://oauth.yandex.ru/) |

---

## 👤 Регистрация нового пользователя

### Сценарий 1: Регистрация с созданием новой семьи

**Frontend код**:
```typescript
async function registerWithFamily(phone: string, password: string, familyName: string) {
  const response = await fetch('BACKEND_AUTH_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register',
      phone: phone,              // +79001234567
      password: password,         // минимум 6 символов
      family_name: familyName    // "Семья Ивановых"
    })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Отправить приветственный email
    await sendWelcomeEmail(data.user.email || data.user.phone);
    
    return { success: true, user: data.user };
  }
  
  return { success: false, error: data.error };
}
```

**Отправка приветственного email**:
```typescript
const NOTIFICATIONS_API = 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774';

async function sendWelcomeEmail(email: string) {
  await fetch(`${NOTIFICATIONS_API}?action=email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: '🎉 Добро пожаловать в Family Organizer!',
      body: 'Спасибо за регистрацию! Теперь вы можете управлять семейными задачами, событиями и многим другим.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">🎉 Добро пожаловать!</h1>
          <p>Спасибо за регистрацию в <strong>Family Organizer</strong>!</p>
          <p>Теперь вы можете:</p>
          <ul>
            <li>Создавать и управлять задачами</li>
            <li>Планировать события и напоминания</li>
            <li>Приглашать членов семьи</li>
            <li>Отслеживать семейные цели</li>
          </ul>
          <a href="https://your-domain.com" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Начать использовать
          </a>
        </div>
      `
    })
  });
}
```

### Сценарий 2: Регистрация по приглашению в семью

**Frontend код**:
```typescript
async function registerWithInvite(
  phone: string, 
  password: string, 
  inviteCode: string,
  memberName: string,
  relationship: string
) {
  const response = await fetch('BACKEND_AUTH_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register',
      phone: phone,
      password: password,
      invite_code: inviteCode,      // Код приглашения
      member_name: memberName,       // "Мария"
      relationship: relationship     // "Мама", "Папа", "Дочь"
    })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    
    // Уведомить создателя семьи о новом члене
    await notifyFamilyCreator(data.family_id, memberName);
    
    return { success: true };
  }
  
  return { success: false, error: data.error };
}
```

**Уведомление создателя семьи**:
```typescript
async function notifyFamilyCreator(familyId: number, newMemberName: string) {
  // 1. Получить email создателя семьи из БД
  const creator = await fetchFamilyCreator(familyId);
  
  // 2. Отправить email
  await fetch(`${NOTIFICATIONS_API}?action=email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: creator.email,
      subject: '👥 Новый член присоединился к семье!',
      body: `${newMemberName} принял(а) приглашение и теперь часть вашей семьи в Family Organizer.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>👥 Новый член семьи!</h2>
          <p><strong>${newMemberName}</strong> принял(а) приглашение.</p>
          <p>Теперь вы можете вместе планировать дела и события!</p>
        </div>
      `
    })
  });
  
  // 3. Опционально: отправить SMS
  if (creator.phone) {
    await fetch(`${NOTIFICATIONS_API}?action=sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: creator.phone,
        message: `${newMemberName} присоединился к семье! 👥`
      })
    });
  }
}
```

---

## 🔓 Вход в систему

### Обычный вход (телефон + пароль)

**Frontend код**:
```typescript
async function login(phone: string, password: string) {
  const response = await fetch('BACKEND_AUTH_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      phone: phone,
      password: password
    })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Опционально: уведомить о входе
    await notifyLogin(data.user);
    
    return { success: true };
  }
  
  return { success: false, error: data.error };
}
```

### OAuth через Yandex ID

**Шаг 1: Перенаправление на Yandex**:
```typescript
function loginWithYandex() {
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
  const clientId = 'YOUR_YANDEX_CLIENT_ID';
  
  const authUrl = `https://oauth.yandex.ru/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}`;
  
  window.location.href = authUrl;
}
```

**Шаг 2: Обработка callback**:
```typescript
async function handleYandexCallback(code: string) {
  const response = await fetch(`BACKEND_AUTH_URL?action=yandex_callback&code=${code}`);
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Если новый пользователь - отправить приветственный email
    if (data.is_new_user) {
      await sendWelcomeEmail(data.user.email);
    }
    
    window.location.href = '/';
  }
}
```

---

## 🔄 Восстановление пароля

### Шаг 1: Запрос кода восстановления

**Frontend код**:
```typescript
const PASSWORD_RESET_API = 'BACKEND_PASSWORD_RESET_URL';

async function requestPasswordReset(phone: string) {
  const response = await fetch(`${PASSWORD_RESET_API}?action=request_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Отправить код по SMS
    await sendResetCodeSMS(phone, data.code);
    
    // Или по email (если указан)
    if (data.user_email) {
      await sendResetCodeEmail(data.user_email, data.code);
    }
    
    return { success: true, message: 'Код отправлен' };
  }
  
  return { success: false, error: data.error };
}
```

**Отправка кода по SMS**:
```typescript
async function sendResetCodeSMS(phone: string, code: string) {
  await fetch(`${NOTIFICATIONS_API}?action=sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone,
      message: `Ваш код для сброса пароля Family Organizer: ${code}. Действует 15 минут.`
    })
  });
}
```

**Отправка кода по Email**:
```typescript
async function sendResetCodeEmail(email: string, code: string) {
  await fetch(`${NOTIFICATIONS_API}?action=email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: '🔐 Восстановление пароля Family Organizer',
      body: `Ваш код для восстановления пароля: ${code}. Код действует 15 минут.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Восстановление пароля</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; margin-top: 20px; text-align: center;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Ваш код для восстановления пароля:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">
                ${code}
              </span>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              ⏰ Код действителен в течение <strong>15 минут</strong>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⚠️ Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>С уважением,<br/>Команда Family Organizer</p>
          </div>
        </div>
      `
    })
  });
}
```

### Шаг 2: Проверка кода и смена пароля

**Frontend код**:
```typescript
async function resetPassword(phone: string, code: string, newPassword: string) {
  const response = await fetch(`${PASSWORD_RESET_API}?action=reset_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone,
      code: code,
      new_password: newPassword
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Уведомить пользователя об успешной смене
    await notifyPasswordChanged(phone, data.user_email);
    
    return { success: true, message: 'Пароль изменен' };
  }
  
  return { success: false, error: data.error };
}
```

**Уведомление об успешной смене пароля**:
```typescript
async function notifyPasswordChanged(phone: string, email?: string) {
  // SMS уведомление
  await fetch(`${NOTIFICATIONS_API}?action=sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone,
      message: '✅ Пароль Family Organizer успешно изменен. Если это были не вы, обратитесь в поддержку.'
    })
  });
  
  // Email уведомление (если указан)
  if (email) {
    await fetch(`${NOTIFICATIONS_API}?action=email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: '✅ Пароль изменен',
        body: 'Ваш пароль в Family Organizer был успешно изменен. Если это были не вы, немедленно свяжитесь с поддержкой.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2>✅ Пароль изменен</h2>
            </div>
            <div style="padding: 20px; background: #f9fafb; margin-top: 20px; border-radius: 8px;">
              <p>Ваш пароль в <strong>Family Organizer</strong> был успешно изменен.</p>
              <p style="color: #dc2626; font-weight: bold;">
                Если это были не вы, немедленно свяжитесь с поддержкой!
              </p>
            </div>
          </div>
        `
      })
    });
  }
}
```

---

## 🔑 Смена пароля (из личного кабинета)

**Frontend код**:
```typescript
async function changePassword(oldPassword: string, newPassword: string) {
  const authToken = localStorage.getItem('authToken');
  
  const response = await fetch(`${PASSWORD_RESET_API}?action=change_password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': authToken
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Уведомить об изменении
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await notifyPasswordChanged(user.phone, user.email);
    
    return { success: true };
  }
  
  return { success: false, error: data.error };
}
```

---

## ⚙️ Настройка уведомлений

### Шаг 1: Получение паролей приложений Яндекс.Почты

1. Перейдите на [id.yandex.ru/security/app-passwords](https://id.yandex.ru/security/app-passwords)
2. Нажмите **"Создать пароль приложения"**
3. Выберите **"Почта"** → введите название: "Family Organizer"
4. Скопируйте сгенерированный пароль (показывается один раз!)

**Добавьте секреты в проект**:
```
YANDEX_SMTP_LOGIN = ваш_логин_яндекса (без @yandex.ru)
YANDEX_SMTP_PASSWORD = скопированный_пароль_приложения
```

### Шаг 2: Настройка Yandex Cloud API для SMS

1. Перейдите в [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Создайте сервисный аккаунт:
   - Имя: `sms-sender`
   - Роль: `editor`
3. Создайте API ключ:
   - Нажмите **"Создать API-ключ"**
   - Область действия: `yandex.cloud.functions.invoke` (или `yandex.postbox.send` для email)
   - Скопируйте ключ
4. Скопируйте **Folder ID** (в верхней части консоли)

**Добавьте секреты**:
```
YANDEX_CLOUD_API_KEY = ваш_api_ключ
YANDEX_FOLDER_ID = ваш_folder_id
```

### Шаг 3: Тестирование

1. Откройте приложение → **Настройки** (иконка ⚙️)
2. Перейдите на вкладку **"Уведомления"**
3. Протестируйте отправку:
   - Email: введите свой email → нажмите **"Отправить тестовый email"**
   - SMS: введите телефон +79001234567 → нажмите **"Отправить тестовое SMS"**

---

## 🔌 Интеграция в проект

### Пример: Уведомление о новой задаче

```typescript
async function createTaskWithNotification(taskData: any, assignedMember: any) {
  // 1. Создать задачу
  const task = await createTask(taskData);
  
  // 2. Отправить уведомление исполнителю
  if (assignedMember.email) {
    await fetch(`${NOTIFICATIONS_API}?action=email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: assignedMember.email,
        subject: `📋 Новая задача: ${task.title}`,
        body: `Вам назначена новая задача "${task.title}". Срок: ${task.deadline}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>📋 Новая задача!</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${task.title}</h3>
              <p>${task.description}</p>
              <p><strong>Срок выполнения:</strong> ${task.deadline}</p>
            </div>
            <a href="${window.location.origin}/tasks/${task.id}" 
               style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
              Открыть задачу
            </a>
          </div>
        `
      })
    });
  }
  
  // 3. Дополнительно: SMS для срочных задач
  if (task.priority === 'high' && assignedMember.phone) {
    await fetch(`${NOTIFICATIONS_API}?action=sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: assignedMember.phone,
        message: `🔴 Срочная задача: ${task.title}. Срок: ${task.deadline}`
      })
    });
  }
  
  return task;
}
```

### Пример: Напоминание о событии

```typescript
async function sendEventReminder(event: any, members: any[]) {
  const reminderTime = new Date(event.date);
  reminderTime.setHours(reminderTime.getHours() - 24); // За 24 часа
  
  // Для каждого участника
  for (const member of members) {
    if (member.email) {
      await fetch(`${NOTIFICATIONS_API}?action=email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member.email,
          subject: `🎉 Напоминание: ${event.title} завтра!`,
          body: `Напоминаем: ${event.title} состоится завтра в ${event.time}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>🎉 Напоминание о событии</h2>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px;">
                <h1 style="margin: 0;">${event.title}</h1>
                <p style="font-size: 18px; margin-top: 10px;">
                  📅 ${event.date} в ${event.time}
                </p>
              </div>
              <p style="margin-top: 20px;">${event.description}</p>
            </div>
          `
        })
      });
    }
  }
}
```

---

## 🧪 Тестирование системы

### Чеклист тестирования

- [ ] **Регистрация с email**: новый пользователь получает приветственное письмо
- [ ] **Регистрация по приглашению**: создатель семьи получает уведомление
- [ ] **Восстановление пароля (SMS)**: код приходит по SMS за < 30 сек
- [ ] **Восстановление пароля (Email)**: красивое письмо с кодом приходит
- [ ] **Смена пароля**: уведомление отправляется на email и SMS
- [ ] **Новая задача**: исполнитель получает email с деталями
- [ ] **Срочная задача**: исполнитель получает SMS + Email
- [ ] **Напоминание о событии**: все участники получают уведомления

### Команды для тестирования

**Отправка тестового email**:
```bash
curl -X POST 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774?action=email' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test"
  }'
```

**Отправка тестового SMS**:
```bash
curl -X POST 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774?action=sms' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "+79001234567",
    "message": "Test SMS"
  }'
```

---

## 🚨 Troubleshooting

### Email не приходит

1. **Проверьте секреты**: `YANDEX_SMTP_LOGIN` и `YANDEX_SMTP_PASSWORD` заполнены?
2. **Проверьте спам**: письма могут попадать в спам при первой отправке
3. **Проверьте логи**: `get_logs('backend/notifications')` покажет ошибки
4. **Тест подключения**: используйте админ-панель "Уведомления" для теста

### SMS не приходит

1. **YANDEX_FOLDER_ID**: должен быть заполнен
2. **API ключ**: проверьте область действия (нужен `yandex.cloud.sms`)
3. **Баланс**: убедитесь, что на балансе Yandex Cloud есть средства
4. **Формат телефона**: должен быть +79001234567 (с +7)

### Код восстановления не работает

1. **Проверьте срок**: код действует 15 минут
2. **Проверьте БД**: убедитесь, что запись создалась в `password_reset_codes`
3. **Регистр**: код должен вводиться в верхнем регистре
4. **Использование**: код можно использовать только один раз

---

## 📊 Мониторинг

### Полезные метрики

- Количество отправленных email/SMS в день
- Процент успешных доставок
- Среднее время доставки
- Количество ошибок аутентификации

### Логирование

Все ошибки логируются в Cloud Functions:
```typescript
// Получить логи уведомлений
const logs = await get_logs('backend/notifications', { limit: 100 });

// Получить логи авторизации
const authLogs = await get_logs('backend/auth', { limit: 100 });

// Получить логи сброса пароля
const resetLogs = await get_logs('backend/password-reset', { limit: 100 });
```

---

## 💰 Стоимость

### Yandex.Mail SMTP (пароли приложений)
- **Бесплатно**: до 500 писем/день
- Для личного использования достаточно

### Yandex Cloud SMS
- **Цена**: ~2-3₽ за SMS (зависит от страны)
- **Рекомендация**: для семейного приложения лучше использовать email как основной канал

### Альтернативы для SMS
- **SMS.RU**: от 1.5₽ за SMS, простой API
- **Twilio**: от $0.05 за SMS, международные отправки
- **Telegram Bot**: бесплатно, но нужна установка приложения

---

## 🎯 Best Practices

1. **Email предпочтительнее SMS**:
   - Дешевле
   - Можно отправлять HTML с дизайном
   - Выше лимиты

2. **SMS для критичных уведомлений**:
   - Коды восстановления пароля
   - Двухфакторная аутентификация
   - Срочные семейные события

3. **Всегда обрабатывайте ошибки**:
   ```typescript
   try {
     await sendEmail(...);
   } catch (error) {
     console.error('Email failed:', error);
     // Fallback: попробовать SMS
     await sendSMS(...);
   }
   ```

4. **Логируйте все отправки**:
   - Кому отправлено
   - Когда отправлено
   - Статус (успех/ошибка)

5. **Используйте шаблоны**:
   - Создайте готовые HTML-шаблоны для разных типов писем
   - Храните их в `/templates` директории

---

## 📚 Дополнительные ресурсы

- [Yandex.Mail API документация](https://yandex.ru/dev/mail/)
- [Yandex Cloud API Reference](https://cloud.yandex.ru/docs/api-design-guide/)
- [OAuth Yandex.ID](https://yandex.ru/dev/id/)
- [Pydantic валидация](https://docs.pydantic.dev/)

---

Готово! 🎉 Теперь у вас полностью рабочая система аутентификации с email и SMS уведомлениями!
