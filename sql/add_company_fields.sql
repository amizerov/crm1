-- Добавляем дополнительные поля в таблицу Company
ALTER TABLE Company 
ADD address NVARCHAR(500) NULL,
    phone NVARCHAR(50) NULL,
    email NVARCHAR(255) NULL,
    website NVARCHAR(255) NULL,
    bankName NVARCHAR(255) NULL,
    bankAccount NVARCHAR(50) NULL,
    bankBik NVARCHAR(20) NULL,
    inn NVARCHAR(20) NULL,
    kpp NVARCHAR(20) NULL,
    comment NVARCHAR(2000) NULL;
