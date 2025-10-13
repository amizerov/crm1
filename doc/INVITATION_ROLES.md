# Система приглашений: роли и права доступа

## Структура ролей

### Employee (Сотрудник)
- Запись только в таблице `Employee`
- Может работать с задачами компании
- Не может приглашать других пользователей
- Не может управлять компанией

### Partner (Партнёр)
- Запись в `Employee` + `User_Company`
- Все права сотрудника +
- Может приглашать новых сотрудников и партнёров
- Может управлять компанией (проекты, клиенты, настройки)
- Является совладельцем компании

## Таблицы

### User_Company
```sql
TABLE [dbo].[User_Company](
    [userId] [int] NOT NULL,
    [companyId] [int] NOT NULL
)
```
**Важно**: Наличие записи = пользователь является партнёром. Нет колонки `role`.

### Invitation
```sql
TABLE [dbo].[Invitation](
    [id] [int] IDENTITY(1,1) PRIMARY KEY,
    [email] [nvarchar](255) NOT NULL,
    [companyId] [int] NOT NULL,
    [invitedByUserId] [int] NOT NULL,
    [role] [nvarchar](50) NOT NULL,  -- 'Employee' или 'Partner'
    [token] [nvarchar](255) NOT NULL UNIQUE,
    [status] [nvarchar](50) NOT NULL DEFAULT 'pending',
    [expiresAt] [datetime] NOT NULL,
    [acceptedAt] [datetime] NULL,
    [acceptedByUserId] [int] NULL,
    [dtc] [datetime] NOT NULL DEFAULT GETDATE(),
    [dtu] [datetime] NULL
)
```

## Логика приглашений

### Создание приглашения
1. Проверка: текущий пользователь должен быть партнёром (`userId` в `User_Company`)
2. Создаётся запись в `Invitation` с указанием `role`
3. Генерируется уникальный токен (срок действия 7 дней)
4. Отправляется email с ссылкой для принятия

### Принятие приглашения
При переходе по ссылке `/employees/acceptinvitation?token=...`:

**Если пользователь не зарегистрирован:**
- Форма регистрации с предзаполненным email
- После регистрации → автоматическое принятие приглашения

**Если пользователь уже зарегистрирован:**
- Проверка email (должен совпадать с приглашением)
- Одна кнопка "Принять приглашение"

**При принятии:**
```typescript
if (invitation.role === 'Employee') {
    // Создаём только запись Employee
    INSERT INTO Employee (userId, Name, companyId)
    VALUES (@userId, @userName, @companyId)
}

if (invitation.role === 'Partner') {
    // Создаём Employee + User_Company
    INSERT INTO Employee (userId, Name, companyId)
    VALUES (@userId, @userName, @companyId)
    
    INSERT INTO User_Company (userId, companyId)
    VALUES (@userId, @companyId)
}

// Обновляем приглашение
UPDATE Invitation 
SET status = 'accepted', 
    acceptedAt = GETDATE(), 
    acceptedByUserId = @userId
WHERE id = @invitationId
```

## Проверки прав доступа

### Кто может приглашать?
```sql
-- Проверка: пользователь является партнёром компании
SELECT 1 FROM User_Company 
WHERE userId = @currentUserId AND companyId = @companyId
```

### Кто имеет доступ к компании?
```sql
-- Владелец компании
SELECT 1 FROM Company WHERE id = @companyId AND ownerId = @userId

UNION

-- Партнёр компании
SELECT 1 FROM User_Company WHERE companyId = @companyId AND userId = @userId
```

## Автосоздание при создании компании (TODO - Шаг 4)

При создании новой компании владелец должен автоматически стать:
1. **Сотрудником**: запись в `Employee`
2. **Партнёром**: запись в `User_Company`

```sql
-- После INSERT INTO Company
DECLARE @newCompanyId INT = SCOPE_IDENTITY();

-- Владелец становится сотрудником
INSERT INTO Employee (userId, Name, companyId, dtc)
VALUES (@ownerId, @ownerName, @newCompanyId, GETDATE());

-- Владелец становится партнёром
INSERT INTO User_Company (userId, companyId)
VALUES (@ownerId, @newCompanyId);
```
