-- Скрипт для обновления путей к файлам в базе данных
-- Обновляем пути в описаниях проектов (если они хранятся как HTML с путями к изображениям)

-- Проверяем текущие пути в описаниях проектов
SELECT
    id,
    projectName,
    description
FROM Project
WHERE description LIKE '%/projectdescription/%'
ORDER BY id;

-- Обновляем пути: /projectdescription/{id}/ -> /media/p{id}/
UPDATE Project
SET description = REPLACE(description, '/projectdescription/' + CAST(id AS NVARCHAR) + '/', '/media/p' + CAST(id AS NVARCHAR) + '/')
WHERE description LIKE '%/projectdescription/%';

-- Проверяем результат
SELECT
    id,
    projectName,
    description
FROM Project
WHERE description LIKE '%/media/p%'
ORDER BY id;

PRINT 'Миграция путей завершена.';
