-- Скрипт для обновления путей к файлам задач в базе данных
-- Обновляем пути: /uploads/tasks/ -> /media/p{projectId}/t{taskId}/

-- Проверяем текущие пути в TaskDocuments
SELECT
    td.id,
    td.taskId,
    t.projectId,
    t.taskName,
    td.filePath as old_path,
    REPLACE(td.filePath, '/uploads/tasks/', '/media/p' + CAST(t.projectId AS NVARCHAR) + '/t' + CAST(td.taskId AS NVARCHAR) + '/') as new_path
FROM TaskDocuments td
    INNER JOIN Task t ON td.taskId = t.id
WHERE td.filePath LIKE '%/uploads/tasks/%'
ORDER BY t.projectId, td.taskId;

-- Обновляем пути
UPDATE td
SET filePath = REPLACE(td.filePath, '/uploads/tasks/', '/media/p' + CAST(t.projectId AS NVARCHAR) + '/t' + CAST(td.taskId AS NVARCHAR) + '/')
FROM TaskDocuments td
    INNER JOIN Task t ON td.taskId = t.id
WHERE td.filePath LIKE '%/uploads/tasks/%';

-- Проверяем результат
SELECT
    td.id,
    td.taskId,
    t.projectId,
    t.taskName,
    td.filePath
FROM TaskDocuments td
    INNER JOIN Task t ON td.taskId = t.id
WHERE td.filePath LIKE '%/media/p%'
ORDER BY t.projectId, td.taskId;

PRINT 'Миграция путей задач завершена.';
