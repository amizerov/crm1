-- Скрипт для проверки подозрительных файлов в базе данных
-- Запустить после внедрения валидации файлов

-- 1. Найти файлы с подозрительными расширениями
SELECT
    id,
    project_id,
    originalName,
    filePath,
    mimeType,
    fileSize,
    uploaded_by,
    uploaded_at
FROM ProjectDocuments
WHERE 
    -- Исполняемые файлы
    originalName LIKE '%.exe' OR
    originalName LIKE '%.dll' OR
    originalName LIKE '%.bat' OR
    originalName LIKE '%.cmd' OR
    originalName LIKE '%.sh' OR
    originalName LIKE '%.ps1' OR
    originalName LIKE '%.jar' OR
    originalName LIKE '%.class' OR
    originalName LIKE '%.vbs' OR
    originalName LIKE '%.js' OR
    originalName LIKE '%.jse' OR
    originalName LIKE '%.php' OR
    originalName LIKE '%.asp' OR
    originalName LIKE '%.aspx' OR
    -- Исходный код
    originalName LIKE '%.py' OR
    originalName LIKE '%.rb' OR
    originalName LIKE '%.pl' OR
    originalName LIKE '%.pas' OR
    originalName LIKE '%.dpr' OR
    originalName LIKE '%.c' OR
    originalName LIKE '%.cpp' OR
    originalName LIKE '%.h' OR
    -- Другие опасные
    originalName LIKE '%.lnk' OR
    originalName LIKE '%.scr' OR
    originalName LIKE '%.msi'
ORDER BY uploaded_at DESC;

-- 2. Найти файлы с двойными расширениями (file.pdf.exe)
SELECT
    id,
    originalName,
    filePath,
    uploaded_by,
    uploaded_at
FROM ProjectDocuments
WHERE 
    originalName LIKE '%.%.%'
    AND (
        originalName LIKE '%.exe' OR
    originalName LIKE '%.bat' OR
    originalName LIKE '%.cmd' OR
    originalName LIKE '%.sh' OR
    originalName LIKE '%.js'
    )
ORDER BY uploaded_at DESC;

-- 3. Найти аномально большие файлы
SELECT
    id,
    originalName,
    fileSize / 1024 / 1024 AS size_mb,
    uploaded_by,
    uploaded_at
FROM ProjectDocuments
WHERE fileSize > 100 * 1024 * 1024
-- больше 100 МБ
ORDER BY fileSize DESC;

-- 4. Найти файлы, загруженные недавно (последние 30 дней)
SELECT
    id,
    originalName,
    filePath,
    fileSize / 1024 AS size_kb,
    uploaded_by,
    u.nicName as uploaded_by_name,
    uploaded_at
FROM ProjectDocuments pd
    LEFT JOIN [Users] u ON pd.uploaded_by = u.id
WHERE uploaded_at > DATEADD(day, -30, GETDATE())
ORDER BY uploaded_at DESC;

-- 5. УДАЛЕНИЕ подозрительных файлов (ОСТОРОЖНО!)
-- Раскомментируйте только после проверки результатов SELECT запросов выше
/*
BEGIN TRANSACTION;

-- Сначала сохраните список для логирования
SELECT * 
INTO #SuspiciousFiles
FROM ProjectDocuments
WHERE 
    originalName LIKE '%.exe' OR
    originalName LIKE '%.dll' OR
    originalName LIKE '%.bat' OR
    originalName LIKE '%.sh' OR
    originalName LIKE '%.pas';

-- Удалите из БД
DELETE FROM ProjectDocuments
WHERE id IN (SELECT id FROM #SuspiciousFiles);

-- Проверьте результат
SELECT COUNT(*) as deleted_count FROM #SuspiciousFiles;

-- Если всё правильно:
COMMIT;

-- Если ошибка:
-- ROLLBACK;
*/

-- 6. Статистика загрузок по типам файлов
SELECT
    LOWER(RIGHT(originalName, CHARINDEX('.', REVERSE(originalName)) - 1)) as extension,
    COUNT(*) as file_count,
    SUM(fileSize) / 1024 / 1024 as total_size_mb
FROM ProjectDocuments
GROUP BY LOWER(RIGHT(originalName, CHARINDEX('.', REVERSE(originalName)) - 1))
ORDER BY file_count DESC;
