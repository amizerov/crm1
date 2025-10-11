-- Создание таблицы TaskTypes для типов задач в рамках проектов
CREATE TABLE [dbo].[TaskTypes]
(
    [id] [int] IDENTITY(1,1) NOT NULL,
    [projectId] [int] NOT NULL,
    [typeName] [nvarchar](50) NOT NULL,
    [typeOrder] [int] NOT NULL,
    [typeColor] [nvarchar](50) NULL,
    CONSTRAINT [PK_TaskTypes] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_TaskTypes_Project] FOREIGN KEY([projectId]) REFERENCES [dbo].[Project] ([id]) ON DELETE CASCADE
);

-- Создание индекса для быстрого поиска по проекту
CREATE NONCLUSTERED INDEX [IX_TaskTypes_ProjectId] ON [dbo].[TaskTypes]
(
	[projectId] ASC
);

-- Создание индекса для порядка типов в рамках проекта
CREATE NONCLUSTERED INDEX [IX_TaskTypes_ProjectId_TypeOrder] ON [dbo].[TaskTypes]
(
	[projectId] ASC,
	[typeOrder] ASC
);