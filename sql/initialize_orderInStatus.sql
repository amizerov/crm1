-- Инициализация orderInStatus для существующих задач
-- Для каждого статуса присваиваем порядковые номера начиная с 0
-- Этот скрипт устраняет пропуски и дубликаты в нумерации

-- Показываем текущее состояние ПЕРЕД обновлением
SELECT 
    'BEFORE UPDATE' as stage,
    statusId, 
    COUNT(*) as taskCount,
    MIN(orderInStatus) as minOrder,
    MAX(orderInStatus) as maxOrder,
    COUNT(DISTINCT orderInStatus) as uniqueOrders
FROM Task
WHERE parentId IS NULL
GROUP BY statusId
ORDER BY statusId;

-- Обновляем orderInStatus для всех корневых задач
WITH NumberedTasks AS (
    SELECT 
        id,
        statusId,
        ROW_NUMBER() OVER (PARTITION BY statusId ORDER BY COALESCE(orderInStatus, 999999), dtc, id) - 1 AS newOrder
    FROM Task
    WHERE parentId IS NULL  -- Только корневые задачи
)
UPDATE t
SET t.orderInStatus = nt.newOrder
FROM Task t
INNER JOIN NumberedTasks nt ON t.id = nt.id
WHERE t.orderInStatus IS NULL 
   OR t.orderInStatus != nt.newOrder;

-- Показываем результат ПОСЛЕ обновления
SELECT 
    'AFTER UPDATE' as stage,
    statusId, 
    COUNT(*) as taskCount,
    MIN(orderInStatus) as minOrder,
    MAX(orderInStatus) as maxOrder,
    COUNT(DISTINCT orderInStatus) as uniqueOrders
FROM Task
WHERE parentId IS NULL
GROUP BY statusId
ORDER BY statusId;

-- Показываем детали по каждому статусу
SELECT 
    statusId,
    id as taskId,
    taskName,
    orderInStatus,
    dtc
FROM Task
WHERE parentId IS NULL
ORDER BY statusId, orderInStatus;

PRINT 'Инициализация orderInStatus завершена успешно!';
