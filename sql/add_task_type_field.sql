-- Добавление поля typeId в таблицу Task для связи с типами задач
ALTER TABLE [dbo].[Task]
ADD [typeId] [int] NULL;

-- Создание foreign key связи с таблицей TaskTypes
ALTER TABLE [dbo].[Task]
ADD CONSTRAINT [FK_Task_TaskTypes] 
FOREIGN KEY([typeId]) REFERENCES [dbo].[TaskTypes] ([id]);

-- Создание индекса для быстрого поиска по типу задач
CREATE NONCLUSTERED INDEX [IX_Task_TypeId] ON [dbo].[Task]
(
	[typeId] ASC
);