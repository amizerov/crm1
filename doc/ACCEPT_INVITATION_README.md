# Принятие приглашений - Инструкция

## URL изменён

**Старый URL:**
```
http://localhost:3001/invitation/accept?token=...
```

**Новый URL:**
```
http://localhost:3001/employees/acceptinvitation?token=...
```

## Структура файлов

```
src/app/employees/acceptinvitation/
├── page.tsx                      # Страница принятия приглашения
└── AcceptInvitationForm.tsx      # Клиентская форма с кнопками
```

## Логика работы

### 1. Проверки на странице (`page.tsx`)

#### Нет токена
→ Показывает ошибку "Неверная ссылка"

#### Приглашение не найдено / истекло / использовано
→ Показывает соответствующую ошибку

#### Пользователь не авторизован
→ Редирект на `/register?invitation={token}`

#### Email не совпадает
→ Показывает ошибку с предложением войти другим пользователем

#### Всё OK
→ Показывает красивую форму с информацией о приглашении

### 2. Форма принятия (`AcceptInvitationForm.tsx`)

Показывает:
- Название компании
- Роль (👔 Партнёр или 👤 Сотрудник)
- Описание прав
- Две кнопки: "Отклонить" и "Принять приглашение"

### 3. Принятие приглашения (`acceptInvitation` action)

**Проверки:**
1. Пользователь авторизован
2. Приглашение валидно
3. Email совпадает
4. Пользователь ещё не сотрудник этой компании

**Создание записей:**

```typescript
// Всегда создаётся Employee
INSERT INTO Employee (userId, Name, companyId)
VALUES (@userId, @userName, @companyId)

// Если role = 'Partner' - добавляется User_Company
if (role === 'Partner') {
  INSERT INTO User_Company (userId, companyId)
  VALUES (@userId, @companyId)
}

// Обновляется статус приглашения
UPDATE Invitation 
SET status = 'accepted', 
    acceptedAt = GETDATE(), 
    acceptedByUserId = @userId
WHERE id = @invitationId
```

**После принятия:**
→ Редирект на `/employees?invitation=accepted`

## Тестирование

### Шаг 1: Отправить приглашение
1. Войдите как партнёр компании
2. Перейдите на `/employees/add`
3. Выберите "✉️ Пригласить нового"
4. Введите email, выберите роль и компанию
5. Нажмите "Отправить приглашение"

### Шаг 2: Проверить email
Откройте письмо и найдите кнопку "Принять приглашение"  
URL должен быть: `http://localhost:3001/employees/acceptinvitation?token=...`

### Шаг 3: Принять приглашение

**Вариант А: Пользователь не зарегистрирован**
1. Перейдите по ссылке
2. Будет редирект на `/register?invitation={token}`
3. Зарегистрируйтесь
4. После регистрации автоматически примется приглашение (TODO)

**Вариант Б: Пользователь уже зарегистрирован**
1. Войдите с тем email, на который пришло приглашение
2. Перейдите по ссылке из письма
3. Увидите красивую страницу с информацией
4. Нажмите "Принять приглашение"
5. Редирект на `/employees`

### Проверка результата

**В базе данных должны появиться:**

Для сотрудника:
```sql
SELECT * FROM Employee WHERE userId = @acceptedUserId AND companyId = @companyId
-- 1 запись
```

Для партнёра:
```sql
SELECT * FROM Employee WHERE userId = @acceptedUserId AND companyId = @companyId
-- 1 запись

SELECT * FROM User_Company WHERE userId = @acceptedUserId AND companyId = @companyId
-- 1 запись
```

**Статус приглашения:**
```sql
SELECT * FROM Invitation WHERE token = @token
-- status = 'accepted'
-- acceptedAt = [текущая дата]
-- acceptedByUserId = @acceptedUserId
```

## TODO

### Шаг 3.5: Интеграция с регистрацией
При регистрации через `/register?invitation={token}`:
1. Предзаполнить email из приглашения
2. После успешной регистрации автоматически принять приглашение
3. Редирект на `/employees`

### Шаг 4: Автосоздание Employee при создании компании
Когда пользователь создаёт компанию:
1. Создать запись в `Company`
2. Создать запись в `Employee` (владелец = сотрудник)
3. Создать запись в `User_Company` (владелец = партнёр)
