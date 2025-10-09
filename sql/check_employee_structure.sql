-- Проверка и исправление структуры таблицы Employee
-- Убедимся, что все поля существуют

-- Проверим текущую структуру таблицы Employee
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Employee'
ORDER BY ORDINAL_POSITION;

-- Добавим поле companyId если его нет
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Employee' 
    AND COLUMN_NAME = 'companyId'
)
BEGIN
    ALTER TABLE Employee 
    ADD companyId INT NULL;
    PRINT 'Поле companyId добавлено';
END

-- Добавим поле dtu если его нет
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Employee' 
    AND COLUMN_NAME = 'dtu'
)
BEGIN
    ALTER TABLE Employee 
    ADD dtu DATETIME2 NULL;
    PRINT 'Поле dtu добавлено';
END

-- Проверим структуру после изменений
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Employee'
ORDER BY ORDINAL_POSITION;
