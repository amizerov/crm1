-- Таблица для хранения приглашений сотрудников и партнёров
-- Создаётся запись при отправке приглашения через email

IF NOT EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[dbo].[Invitation]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Invitation]
    (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [email] NVARCHAR(255) NOT NULL,
        [companyId] INT NOT NULL,
        [invitedByUserId] INT NOT NULL,
        -- Роль:
        -- 'Employee' - только запись в Employee (доступ к задачам)
        -- 'Partner' - запись в Employee + User_Company (полные права)
        [role] NVARCHAR(50) NOT NULL CHECK ([role] IN ('Employee', 'Partner')),
        [token] NVARCHAR(255) NOT NULL UNIQUE,
        [status] NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ([status] IN ('pending', 'accepted', 'expired')),
        [expiresAt] DATETIME NOT NULL,
        [acceptedAt] DATETIME NULL,
        [acceptedByUserId] INT NULL,
        [dtc] DATETIME NOT NULL DEFAULT GETDATE(),
        [dtu] DATETIME NULL,

        CONSTRAINT [FK_Invitation_Company] FOREIGN KEY ([companyId]) 
            REFERENCES [Company]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Invitation_InvitedBy] FOREIGN KEY ([invitedByUserId]) 
            REFERENCES [Users]([id]),
        CONSTRAINT [FK_Invitation_AcceptedBy] FOREIGN KEY ([acceptedByUserId]) 
            REFERENCES [Users]([id])
    );

    CREATE INDEX [IX_Invitation_Token] ON [Invitation]([token]);
    CREATE INDEX [IX_Invitation_Email] ON [Invitation]([email]);
    CREATE INDEX [IX_Invitation_CompanyId] ON [Invitation]([companyId]);
    CREATE INDEX [IX_Invitation_Status] ON [Invitation]([status]);

    PRINT '✅ Таблица Invitation создана успешно';
END
ELSE
BEGIN
    PRINT '⚠️ Таблица Invitation уже существует';
END
GO

-- Комментарии к таблице
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Приглашения для новых сотрудников и партнёров компании', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'Invitation';
GO
