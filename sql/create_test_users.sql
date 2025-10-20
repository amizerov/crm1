-- Создание тестового пользователя для входа в систему
USE [MizerCRM]
GO

-- Проверяем, есть ли уже пользователь с логином admin
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE login = 'admin')
BEGIN
    INSERT INTO [Users] (login, nicName, password)
    VALUES ('admin', 'Администратор', 'admin');
    
    PRINT 'Тестовый пользователь создан: admin/admin';
END
ELSE
BEGIN
    PRINT 'Пользователь admin уже существует';
END

-- Можно добавить еще тестовых пользователей
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE login = 'manager')
BEGIN
    INSERT INTO [Users] (login, nicName, password)
    VALUES ('manager', 'Менеджер', 'manager123');
    
    PRINT 'Тестовый пользователь создан: manager/manager123';
END
ELSE
BEGIN
    PRINT 'Пользователь manager уже существует';
END

-- Показываем всех пользователей
SELECT id, login, nicName FROM [Users];
