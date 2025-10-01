-- Добавляем поле companyId в таблицу Client
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Client') AND name = 'companyId')
BEGIN
    ALTER TABLE Client
    ADD companyId INT NULL;
    
    -- Добавляем внешний ключ
    ALTER TABLE Client
    ADD CONSTRAINT FK_Client_Company
    FOREIGN KEY (companyId) REFERENCES Company(id);
    
    PRINT 'Поле companyId добавлено в таблицу Client';
END
ELSE
BEGIN
    PRINT 'Поле companyId уже существует в таблице Client';
END
