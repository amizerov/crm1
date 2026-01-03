/**
 * MCP ресурсы для задач
 * Ресурсы предоставляют доступ к данным в режиме чтения
 */

import { query } from '../../db/connect.js';

/**
 * Определения ресурсов для задач
 */
export const taskResources = [
  {
    uri: 'crm://tasks/list',
    name: 'Список задач',
    description: 'Получить список всех задач в CRM системе',
    mimeType: 'application/json',
  },
  {
    uri: 'crm://tasks/{id}',
    name: 'Детали задачи',
    description: 'Получить детальную информацию о задаче по ID',
    mimeType: 'application/json',
  },
];

/**
 * Обработчик ресурсов задач
 */
export async function handleTaskResource(uri: string) {
  // Парсинг URI
  const match = uri.match(/^crm:\/\/tasks\/(.+)$/);
  
  if (!match) {
    if (uri === 'crm://tasks/list') {
      return await getTasksResource();
    }
    throw new Error(`Неверный формат URI: ${uri}`);
  }

  const taskId = match[1];
  
  if (taskId === 'list') {
    return await getTasksResource();
  }

  // Получение конкретной задачи
  return await getTaskResource(parseInt(taskId));
}

/**
 * Получить ресурс списка задач
 */
async function getTasksResource() {
  const tasks = await query(
    `
    SELECT TOP 100
      t.id,
      t.taskName,
      t.description,
      t.startDate,
      t.dedline,
      t.statusId,
      s.status as statusName,
      t.priorityId,
      p.priority as priorityName,
      t.executorId,
      executor.nicName as executorName,
      t.userId,
      creator.nicName as creatorName,
      t.projectId,
      proj.projectName,
      t.companyId,
      comp.companyName,
      t.dtc,
      t.dtu
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    LEFT JOIN [Users] creator ON t.userId = creator.id
    LEFT JOIN Project proj ON t.projectId = proj.id
    LEFT JOIN Company comp ON t.companyId = comp.id
    ORDER BY t.dtc DESC
  `
  );

  return {
    contents: [
      {
        uri: 'crm://tasks/list',
        mimeType: 'application/json',
        text: JSON.stringify(tasks, null, 2),
      },
    ],
  };
}

/**
 * Получить ресурс конкретной задачи
 */
async function getTaskResource(taskId: number) {
  const tasks = await query(
    `
    SELECT 
      t.id,
      t.taskName,
      t.description,
      t.startDate,
      t.dedline,
      t.statusId,
      s.status as statusName,
      t.priorityId,
      p.priority as priorityName,
      t.executorId,
      executor.nicName as executorName,
      executor.fullName as executorFullName,
      t.userId,
      creator.nicName as creatorName,
      creator.fullName as creatorFullName,
      t.projectId,
      proj.projectName,
      t.companyId,
      comp.companyName,
      t.parentId,
      t.orderInStatus,
      t.dtc,
      t.dtu
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    LEFT JOIN [Users] creator ON t.userId = creator.id
    LEFT JOIN Project proj ON t.projectId = proj.id
    LEFT JOIN Company comp ON t.companyId = comp.id
    WHERE t.id = @taskId
  `,
    { taskId }
  );

  if (tasks.length === 0) {
    throw new Error(`Задача с ID ${taskId} не найдена`);
  }

  return {
    contents: [
      {
        uri: `crm://tasks/${taskId}`,
        mimeType: 'application/json',
        text: JSON.stringify(tasks[0], null, 2),
      },
    ],
  };
}
