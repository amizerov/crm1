/**
 * MCP инструменты для работы с задачами
 */

import { query } from '../../db/connect.js';

/**
 * Определения инструментов для задач
 */
export const taskTools = [
  {
    name: 'task_list',
    description: 'Получить список задач. Можно фильтровать по статусу, проекту, исполнителю.',
    inputSchema: {
      type: 'object',
      properties: {
        statusId: {
          type: 'number',
          description: 'ID статуса задачи (опционально)',
        },
        projectId: {
          type: 'number',
          description: 'ID проекта (опционально)',
        },
        executorId: {
          type: 'number',
          description: 'ID исполнителя (опционально)',
        },
        limit: {
          type: 'number',
          description: 'Количество задач для возврата (по умолчанию 50, максимум 200)',
          default: 50,
        },
      },
    },
  },
  {
    name: 'task_get',
    description: 'Получить детальную информацию о конкретной задаче по ID',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'number',
          description: 'ID задачи',
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'task_search',
    description: 'Поиск задач по названию или описанию',
    inputSchema: {
      type: 'object',
      properties: {
        searchQuery: {
          type: 'string',
          description: 'Поисковый запрос',
        },
        limit: {
          type: 'number',
          description: 'Количество результатов (по умолчанию 20, максимум 100)',
          default: 20,
        },
      },
      required: ['searchQuery'],
    },
  },
  {
    name: 'task_get_subtasks',
    description: 'Получить подзадачи для конкретной задачи',
    inputSchema: {
      type: 'object',
      properties: {
        parentId: {
          type: 'number',
          description: 'ID родительской задачи',
        },
      },
      required: ['parentId'],
    },
  },
  {
    name: 'task_get_history',
    description: 'Получить историю изменений задачи',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'number',
          description: 'ID задачи',
        },
      },
      required: ['taskId'],
    },
  },
];

/**
 * Обработчик инструментов задач
 */
export async function handleTaskTool(name: string, args: any) {
  switch (name) {
    case 'task_list':
      return await listTasks(args);
    case 'task_get':
      return await getTask(args);
    case 'task_search':
      return await searchTasks(args);
    case 'task_get_subtasks':
      return await getSubtasks(args);
    case 'task_get_history':
      return await getTaskHistory(args);
    default:
      throw new Error(`Неизвестный инструмент: ${name}`);
  }
}

/**
 * Получить список задач
 */
async function listTasks(args: any) {
  const { statusId, projectId, executorId, limit = 50 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  let whereConditions: string[] = [];
  const params: any = { limit: safeLimit };

  if (statusId) {
    whereConditions.push('t.statusId = @statusId');
    params.statusId = statusId;
  }
  if (projectId) {
    whereConditions.push('t.projectId = @projectId');
    params.projectId = projectId;
  }
  if (executorId) {
    whereConditions.push('t.executorId = @executorId');
    params.executorId = executorId;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const tasks = await query(
    `
    SELECT TOP (@limit)
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
      t.parentId,
      t.dtc,
      t.dtu
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    LEFT JOIN [Users] creator ON t.userId = creator.id
    LEFT JOIN Project proj ON t.projectId = proj.id
    LEFT JOIN Company comp ON t.companyId = comp.id
    ${whereClause}
    ORDER BY t.dtc DESC
  `,
    params
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(tasks, null, 2),
      },
    ],
  };
}

/**
 * Получить задачу по ID
 */
async function getTask(args: any) {
  const { taskId } = args;

  if (!taskId) {
    throw new Error('taskId обязателен');
  }

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
      proj.description as projectDescription,
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
    content: [
      {
        type: 'text',
        text: JSON.stringify(tasks[0], null, 2),
      },
    ],
  };
}

/**
 * Поиск задач
 */
async function searchTasks(args: any) {
  const { searchQuery, limit = 20 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('searchQuery не может быть пустым');
  }

  const tasks = await query(
    `
    SELECT TOP (@limit)
      t.id,
      t.taskName,
      t.description,
      t.statusId,
      s.status as statusName,
      t.priorityId,
      p.priority as priorityName,
      t.executorId,
      executor.nicName as executorName,
      t.projectId,
      proj.projectName,
      t.dtc
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    LEFT JOIN Project proj ON t.projectId = proj.id
    WHERE t.taskName LIKE @searchPattern OR t.description LIKE @searchPattern
    ORDER BY t.dtc DESC
  `,
    { 
      limit: safeLimit,
      searchPattern: `%${searchQuery}%`
    }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(tasks, null, 2),
      },
    ],
  };
}

/**
 * Получить подзадачи
 */
async function getSubtasks(args: any) {
  const { parentId } = args;

  if (!parentId) {
    throw new Error('parentId обязателен');
  }

  const subtasks = await query(
    `
    SELECT 
      t.id,
      t.taskName,
      t.description,
      t.statusId,
      s.status as statusName,
      t.priorityId,
      p.priority as priorityName,
      t.executorId,
      executor.nicName as executorName,
      t.dtc,
      t.dtu
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    WHERE t.parentId = @parentId
    ORDER BY t.dtc DESC
  `,
    { parentId }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(subtasks, null, 2),
      },
    ],
  };
}

/**
 * Получить историю задачи
 */
async function getTaskHistory(args: any) {
  const { taskId } = args;

  if (!taskId) {
    throw new Error('taskId обязателен');
  }

  const history = await query(
    `
    SELECT 
      th.id,
      th.taskId,
      th.action,
      th.field,
      th.oldValue,
      th.newValue,
      th.userId,
      u.nicName as userName,
      th.dtc
    FROM TaskHistory th
    LEFT JOIN [Users] u ON th.userId = u.id
    WHERE th.taskId = @taskId
    ORDER BY th.dtc DESC
  `,
    { taskId }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(history, null, 2),
      },
    ],
  };
}
