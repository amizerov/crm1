/**
 * MCP инструменты для работы с проектами
 */

import { query } from '../../db/connect.js';

/**
 * Определения инструментов для проектов
 */
export const projectTools = [
  {
    name: 'project_list',
    description: 'Получить список проектов',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'number',
          description: 'ID компании для фильтрации (опционально)',
        },
        limit: {
          type: 'number',
          description: 'Количество проектов для возврата (по умолчанию 50, максимум 200)',
          default: 50,
        },
      },
    },
  },
  {
    name: 'project_get',
    description: 'Получить информацию о конкретном проекте по ID',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'ID проекта',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'project_search',
    description: 'Поиск проектов по названию или описанию',
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
    name: 'project_get_tasks',
    description: 'Получить задачи проекта',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'ID проекта',
        },
        statusId: {
          type: 'number',
          description: 'ID статуса для фильтрации (опционально)',
        },
      },
      required: ['projectId'],
    },
  },
];

/**
 * Обработчик инструментов проектов
 */
export async function handleProjectTool(name: string, args: any) {
  switch (name) {
    case 'project_list':
      return await listProjects(args);
    case 'project_get':
      return await getProject(args);
    case 'project_search':
      return await searchProjects(args);
    case 'project_get_tasks':
      return await getProjectTasks(args);
    default:
      throw new Error(`Неизвестный инструмент: ${name}`);
  }
}

/**
 * Получить список проектов
 */
async function listProjects(args: any) {
  const { companyId, limit = 50 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  let whereClause = '';
  const params: any = { limit: safeLimit };

  if (companyId) {
    whereClause = 'WHERE p.companyId = @companyId';
    params.companyId = companyId;
  }

  const projects = await query(
    `
    SELECT TOP (@limit)
      p.id,
      p.projectName,
      p.description,
      p.companyId,
      comp.companyName,
      p.userId,
      u.nicName as creatorName,
      u.fullName as creatorFullName,
      p.dtc,
      p.dtu
    FROM Project p
    LEFT JOIN Company comp ON p.companyId = comp.id
    LEFT JOIN [Users] u ON p.userId = u.id
    ${whereClause}
    ORDER BY p.dtc DESC
  `,
    params
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(projects, null, 2),
      },
    ],
  };
}

/**
 * Получить проект по ID
 */
async function getProject(args: any) {
  const { projectId } = args;

  if (!projectId) {
    throw new Error('projectId обязателен');
  }

  const projects = await query(
    `
    SELECT 
      p.id,
      p.projectName,
      p.description,
      p.companyId,
      comp.companyName,
      p.userId,
      u.nicName as creatorName,
      u.fullName as creatorFullName,
      p.dtc,
      p.dtu
    FROM Project p
    LEFT JOIN Company comp ON p.companyId = comp.id
    LEFT JOIN [Users] u ON p.userId = u.id
    WHERE p.id = @projectId
  `,
    { projectId }
  );

  if (projects.length === 0) {
    throw new Error(`Проект с ID ${projectId} не найден`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(projects[0], null, 2),
      },
    ],
  };
}

/**
 * Поиск проектов
 */
async function searchProjects(args: any) {
  const { searchQuery, limit = 20 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('searchQuery не может быть пустым');
  }

  const projects = await query(
    `
    SELECT TOP (@limit)
      p.id,
      p.projectName,
      p.description,
      p.companyId,
      comp.companyName,
      p.userId,
      u.nicName as creatorName,
      p.dtc
    FROM Project p
    LEFT JOIN Company comp ON p.companyId = comp.id
    LEFT JOIN [Users] u ON p.userId = u.id
    WHERE p.projectName LIKE @searchPattern 
       OR p.description LIKE @searchPattern
    ORDER BY p.dtc DESC
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
        text: JSON.stringify(projects, null, 2),
      },
    ],
  };
}

/**
 * Получить задачи проекта
 */
async function getProjectTasks(args: any) {
  const { projectId, statusId } = args;

  if (!projectId) {
    throw new Error('projectId обязателен');
  }

  let whereClause = 'WHERE t.projectId = @projectId';
  const params: any = { projectId };

  if (statusId) {
    whereClause += ' AND t.statusId = @statusId';
    params.statusId = statusId;
  }

  const tasks = await query(
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
      t.startDate,
      t.dedline,
      t.dtc,
      t.dtu
    FROM Task t
    LEFT JOIN Status s ON t.statusId = s.id
    LEFT JOIN Priority p ON t.priorityId = p.id
    LEFT JOIN [Users] executor ON t.executorId = executor.id
    ${whereClause}
    ORDER BY t.orderInStatus ASC
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
