-- Таблица для чеклиста задач
CREATE TABLE TaskChecklist
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    taskId INT NOT NULL,
    description NVARCHAR(500) NOT NULL,
    isCompleted BIT NOT NULL DEFAULT 0,
    orderInList INT NOT NULL DEFAULT 0,
    userId INT NULL,
    -- кто создал пункт
    dtc DATETIME2(3) NOT NULL DEFAULT GETDATE(),
    dtu DATETIME2(3) NULL,

    CONSTRAINT FK_TaskChecklist_Task FOREIGN KEY (taskId) 
        REFERENCES Task(id) ON DELETE CASCADE,
    CONSTRAINT FK_TaskChecklist_User FOREIGN KEY (userId) 
        REFERENCES Users(id) ON DELETE SET NULL
);

-- Индекс для быстрой выборки по задаче
CREATE INDEX IX_TaskChecklist_TaskId 
    ON TaskChecklist(taskId, orderInList);

-- Индекс для сортировки
CREATE INDEX IX_TaskChecklist_Order 
    ON TaskChecklist(taskId, orderInList, id);
GO
