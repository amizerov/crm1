/**
 * MCP инструменты для работы с сотрудниками
 */

import { query } from '../../db/connect.js';

/**
 * Определения инструментов для сотрудников
 */
export const employeeTools = [
  {
    name: 'employee_list',
    description: 'Получить список сотрудников',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'number',
          description: 'ID компании для фильтрации (опционально)',
        },
        limit: {
          type: 'number',
          description: 'Количество сотрудников для возврата (по умолчанию 50, максимум 200)',
          default: 50,
        },
      },
    },
  },
  {
    name: 'employee_get',
    description: 'Получить информацию о конкретном сотруднике по ID',
    inputSchema: {
      type: 'object',
      properties: {
        employeeId: {
          type: 'number',
          description: 'ID сотрудника',
        },
      },
      required: ['employeeId'],
    },
  },
  {
    name: 'employee_search',
    description: 'Поиск сотрудников по имени, email или должности',
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
];

/**
 * Обработчик инструментов сотрудников
 */
export async function handleEmployeeTool(name: string, args: any) {
  switch (name) {
    case 'employee_list':
      return await listEmployees(args);
    case 'employee_get':
      return await getEmployee(args);
    case 'employee_search':
      return await searchEmployees(args);
    default:
      throw new Error(`Неизвестный инструмент: ${name}`);
  }
}

/**
 * Получить список сотрудников
 */
async function listEmployees(args: any) {
  const { companyId, limit = 50 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  let whereClause = '';
  const params: any = { limit: safeLimit };

  if (companyId) {
    whereClause = 'WHERE e.companyId = @companyId';
    params.companyId = companyId;
  }

  const employees = await query(
    `
    SELECT TOP (@limit)
      e.id,
      e.userId,
      u.nicName,
      u.fullName,
      u.email,
      e.position,
      e.companyId,
      comp.companyName,
      e.dtc,
      e.dtu
    FROM Employee e
    LEFT JOIN [Users] u ON e.userId = u.id
    LEFT JOIN Company comp ON e.companyId = comp.id
    ${whereClause}
    ORDER BY e.dtc DESC
  `,
    params
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(employees, null, 2),
      },
    ],
  };
}

/**
 * Получить сотрудника по ID
 */
async function getEmployee(args: any) {
  const { employeeId } = args;

  if (!employeeId) {
    throw new Error('employeeId обязателен');
  }

  const employees = await query(
    `
    SELECT 
      e.id,
      e.userId,
      u.nicName,
      u.fullName,
      u.email,
      u.phone,
      e.position,
      e.companyId,
      comp.companyName,
      e.dtc,
      e.dtu
    FROM Employee e
    LEFT JOIN [Users] u ON e.userId = u.id
    LEFT JOIN Company comp ON e.companyId = comp.id
    WHERE e.id = @employeeId
  `,
    { employeeId }
  );

  if (employees.length === 0) {
    throw new Error(`Сотрудник с ID ${employeeId} не найден`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(employees[0], null, 2),
      },
    ],
  };
}

/**
 * Поиск сотрудников
 */
async function searchEmployees(args: any) {
  const { searchQuery, limit = 20 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('searchQuery не может быть пустым');
  }

  const employees = await query(
    `
    SELECT TOP (@limit)
      e.id,
      e.userId,
      u.nicName,
      u.fullName,
      u.email,
      e.position,
      e.companyId,
      comp.companyName,
      e.dtc
    FROM Employee e
    LEFT JOIN [Users] u ON e.userId = u.id
    LEFT JOIN Company comp ON e.companyId = comp.id
    WHERE u.nicName LIKE @searchPattern 
       OR u.fullName LIKE @searchPattern
       OR u.email LIKE @searchPattern
       OR e.position LIKE @searchPattern
    ORDER BY e.dtc DESC
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
        text: JSON.stringify(employees, null, 2),
      },
    ],
  };
}
