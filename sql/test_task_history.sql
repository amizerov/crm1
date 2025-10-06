-- Скрипт для добавления тестовых записей в историю задачи
-- Используйте ID существующей задачи и пользователя

DECLARE @taskId INT = 456;
-- ID задачи "История задачи"
DECLARE @userId INT = 1;
-- ID пользователя Andrey

-- Создание задачи
INSERT INTO TaskHistory
    (taskId, userId, actionType, description, dtc)
VALUES
    (@taskId, @userId, 'created', 'создал(а) задачу', DATEADD(HOUR, -5, GETDATE()));

-- Изменение статуса
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, oldValue, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'status_changed', 'status', 'To Do', 'In Progress', 'изменил(а) статус с "To Do" на "In Progress"', DATEADD(HOUR, -4, GETDATE()));

-- Назначение исполнителя
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'assigned', 'executor', 'Андрей', 'назначил(а) исполнителя: Андрей', DATEADD(HOUR, -3, GETDATE()));

-- Изменение приоритета
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, oldValue, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'priority_changed', 'priority', 'Средний', 'Высокий', 'изменил(а) приоритет с "Средний" на "Высокий"', DATEADD(HOUR, -2, GETDATE()));

-- Добавление документа
INSERT INTO TaskHistory
    (taskId, userId, actionType, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'document_added', 'technical_spec.pdf', 'добавил(а) документ: technical_spec.pdf', DATEADD(HOUR, -1, GETDATE()));

-- Изменение дедлайна
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, oldValue, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'deadline_changed', 'deadline', '10.10.2025', '15.10.2025', 'изменил(а) дедлайн с 10.10.2025 на 15.10.2025', DATEADD(MINUTE, -30, GETDATE()));

-- Изменение названия
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, oldValue, newValue, description, dtc)
VALUES
    (@taskId, @userId, 'name_changed', 'taskName', 'Старое название', 'История задачи', 'изменил(а) название с "Старое название" на "История задачи"', DATEADD(MINUTE, -15, GETDATE()));

-- Изменение описания
INSERT INTO TaskHistory
    (taskId, userId, actionType, fieldName, description, dtc)
VALUES
    (@taskId, @userId, 'description_changed', 'description', 'изменил(а) описание задачи', DATEADD(MINUTE, -5, GETDATE()));

-- Проверяем результат
SELECT
    th.id,
    th.actionType,
    th.fieldName,
    th.oldValue,
    th.newValue,
    th.description,
    th.dtc,
    u.nicName as userName
FROM TaskHistory th
    LEFT JOIN [User] u ON th.userId = u.id
WHERE th.taskId = @taskId
ORDER BY th.dtc DESC;
