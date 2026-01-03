/**
 * MCP ресурсы для проектов
 */

import { query } from '../../db/connect.js';

/**
 * Определения ресурсов для проектов
 */
export const projectResources = [
  {
    uri: 'crm://projects/list',
    name: 'Список проектов',
    description: 'Получить список всех проектов в CRM системе',
    mimeType: 'application/json',
  },
  {
    uri: 'crm://projects/{id}',
    name: 'Детали проекта',
    description: 'Получить детальную информацию о проекте по ID',
    mimeType: 'application/json',
  },
];

/**
 * Обработчик ресурсов проектов
 */
export async function handleProjectResource(uri: string) {
  const match = uri.match(/^crm:\/\/projects\/(.+)$/);
  
  if (!match) {
    if (uri === 'crm://projects/list') {
      return await getProjectsResource();
    }
    throw new Error(`Неверный формат URI: ${uri}`);
  }

  const projectId = match[1];
  
  if (projectId === 'list') {
    return await getProjectsResource();
  }

  return await getProjectResource(parseInt(projectId));
}

/**
 * Получить ресурс списка проектов
 */
async function getProjectsResource() {
  const projects = await query(
    `
    SELECT TOP 100
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
    ORDER BY p.dtc DESC
  `
  );

  return {
    contents: [
      {
        uri: 'crm://projects/list',
        mimeType: 'application/json',
        text: JSON.stringify(projects, null, 2),
      },
    ],
  };
}

/**
 * Получить ресурс конкретного проекта
 */
async function getProjectResource(projectId: number) {
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
    contents: [
      {
        uri: `crm://projects/${projectId}`,
        mimeType: 'application/json',
        text: JSON.stringify(projects[0], null, 2),
      },
    ],
  };
}
