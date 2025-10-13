-- Тестовый скрипт для создания приглашения
-- Для тестирования упрощенной регистрации через приглашение

-- Создаем тестовое приглашение
DECLARE @testToken NVARCHAR(255) = 'test-invitation-token-12345';
DECLARE @testEmail NVARCHAR(255) = 'test@example.com';
DECLARE @companyId INT;
DECLARE @inviterUserId INT;

-- Получаем первую доступную компанию
SELECT TOP 1 @companyId = id FROM Company;

-- Получаем первого партнёра (пользователь с записью в User_Company)
SELECT TOP 1 @inviterUserId = uc.userId 
FROM User_Company uc
JOIN [User] u ON uc.userId = u.id;

-- Если нет партнёров, берём первого пользователя
IF @inviterUserId IS NULL
BEGIN
    SELECT TOP 1 @inviterUserId = id FROM [User];
END

-- Удаляем старое тестовое приглашение если есть
DELETE FROM Invitation WHERE token = @testToken;

-- Создаём новое приглашение
IF @companyId IS NOT NULL AND @inviterUserId IS NOT NULL
BEGIN
    INSERT INTO Invitation 
    (email, companyId, invitedByUserId, role, token, status, expiresAt, dtc)
    VALUES 
    (@testEmail, @companyId, @inviterUserId, 'Employee', @testToken, 'pending', DATEADD(day, 7, GETDATE()), GETDATE());

    PRINT '✅ Тестовое приглашение создано:';
    PRINT '   Email: ' + @testEmail;
    PRINT '   Token: ' + @testToken;
    PRINT '   URL: /employees/acceptinvitation?token=' + @testToken;
    PRINT '   Роль: Employee';
    PRINT '   Компания ID: ' + CAST(@companyId as NVARCHAR);
    PRINT '   Пригласивший ID: ' + CAST(@inviterUserId as NVARCHAR);
END
ELSE
BEGIN
    PRINT '❌ Не найдены компании или пользователи для создания приглашения';
    PRINT '   Компания ID: ' + ISNULL(CAST(@companyId as NVARCHAR), 'NULL');
    PRINT '   Пользователь ID: ' + ISNULL(CAST(@inviterUserId as NVARCHAR), 'NULL');
END

-- Также создаём приглашение для роли Partner
DECLARE @testTokenPartner NVARCHAR(255) = 'test-invitation-partner-token-12345';
DECLARE @testEmailPartner NVARCHAR(255) = 'partner@example.com';

-- Удаляем старое партнёрское приглашение если есть
DELETE FROM Invitation WHERE token = @testTokenPartner;

IF @companyId IS NOT NULL AND @inviterUserId IS NOT NULL
BEGIN
    INSERT INTO Invitation 
    (email, companyId, invitedByUserId, role, token, status, expiresAt, dtc)
    VALUES 
    (@testEmailPartner, @companyId, @inviterUserId, 'Partner', @testTokenPartner, 'pending', DATEADD(day, 7, GETDATE()), GETDATE());

    PRINT '';
    PRINT '✅ Тестовое приглашение Partner создано:';
    PRINT '   Email: ' + @testEmailPartner;
    PRINT '   Token: ' + @testTokenPartner;
    PRINT '   URL: /employees/acceptinvitation?token=' + @testTokenPartner;
    PRINT '   Роль: Partner';
END

-- Проверяем созданные приглашения
SELECT 
    i.email,
    i.role,
    i.token,
    i.status,
    i.expiresAt,
    c.companyName,
    u.nicName as inviterName
FROM Invitation i
JOIN Company c ON i.companyId = c.id
JOIN [User] u ON i.invitedByUserId = u.id
WHERE i.token IN (@testToken, @testTokenPartner);