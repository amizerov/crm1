-- Добавление поля companyId в таблицу Employee для связи с компанией

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Employee' 
    AND COLUMN_NAME = 'companyId'
)
BEGIN
    ALTER TABLE Employee 
    ADD companyId INT NULL;
    
    -- Создаем внешний ключ для связи с таблицей Company
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_Employee_Company'
    )
    BEGIN
        ALTER TABLE Employee
        ADD CONSTRAINT FK_Employee_Company 
        FOREIGN KEY (companyId) REFERENCES Company(id);
    END
    
    -- Создаем индекс для быстрого поиска по компании
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_Employee_CompanyId' 
        AND object_id = OBJECT_ID('Employee')
    )
    BEGIN
        CREATE INDEX IX_Employee_CompanyId ON Employee(companyId);
    END
    
    PRINT 'Поле companyId успешно добавлено в таблицу Employee';
END
ELSE
BEGIN
    PRINT 'Поле companyId уже существует в таблице Employee';
END

-- Опционально: установить companyId для существующих сотрудников
-- на основе компании связанного пользователя
UPDATE e 
SET e.companyId = u.companyId
FROM Employee e
INNER JOIN [User] u ON e.userId = u.id
WHERE e.companyId IS NULL AND u.companyId IS NOT NULL;

PRINT 'Обновление завершено';
