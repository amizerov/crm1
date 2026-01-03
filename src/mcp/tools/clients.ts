/**
 * MCP инструменты для работы с клиентами
 */

import { query } from '../../db/connect.js';

/**
 * Определения инструментов для клиентов
 */
export const clientTools = [
  {
    name: 'client_list',
    description: 'Получить список клиентов',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'number',
          description: 'ID компании для фильтрации (опционально)',
        },
        limit: {
          type: 'number',
          description: 'Количество клиентов для возврата (по умолчанию 50, максимум 200)',
          default: 50,
        },
      },
    },
  },
  {
    name: 'client_get',
    description: 'Получить информацию о конкретном клиенте по ID',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'number',
          description: 'ID клиента',
        },
      },
      required: ['clientId'],
    },
  },
  {
    name: 'client_search',
    description: 'Поиск клиентов по имени, email или телефону',
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
 * Обработчик инструментов клиентов
 */
export async function handleClientTool(name: string, args: any) {
  switch (name) {
    case 'client_list':
      return await listClients(args);
    case 'client_get':
      return await getClient(args);
    case 'client_search':
      return await searchClients(args);
    default:
      throw new Error(`Неизвестный инструмент: ${name}`);
  }
}

/**
 * Получить список клиентов
 */
async function listClients(args: any) {
  const { companyId, limit = 50 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  let whereClause = '';
  const params: any = { limit: safeLimit };

  if (companyId) {
    whereClause = 'WHERE c.companyId = @companyId';
    params.companyId = companyId;
  }

  const clients = await query(
    `
    SELECT TOP (@limit)
      c.id,
      c.clientName,
      c.email,
      c.phone,
      c.address,
      c.companyId,
      comp.companyName,
      c.dtc,
      c.dtu
    FROM Client c
    LEFT JOIN Company comp ON c.companyId = comp.id
    ${whereClause}
    ORDER BY c.dtc DESC
  `,
    params
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(clients, null, 2),
      },
    ],
  };
}

/**
 * Получить клиента по ID
 */
async function getClient(args: any) {
  const { clientId } = args;

  if (!clientId) {
    throw new Error('clientId обязателен');
  }

  const clients = await query(
    `
    SELECT 
      c.id,
      c.clientName,
      c.email,
      c.phone,
      c.address,
      c.companyId,
      comp.companyName,
      c.dtc,
      c.dtu
    FROM Client c
    LEFT JOIN Company comp ON c.companyId = comp.id
    WHERE c.id = @clientId
  `,
    { clientId }
  );

  if (clients.length === 0) {
    throw new Error(`Клиент с ID ${clientId} не найден`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(clients[0], null, 2),
      },
    ],
  };
}

/**
 * Поиск клиентов
 */
async function searchClients(args: any) {
  const { searchQuery, limit = 20 } = args;
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('searchQuery не может быть пустым');
  }

  const clients = await query(
    `
    SELECT TOP (@limit)
      c.id,
      c.clientName,
      c.email,
      c.phone,
      c.address,
      c.companyId,
      comp.companyName,
      c.dtc
    FROM Client c
    LEFT JOIN Company comp ON c.companyId = comp.id
    WHERE c.clientName LIKE @searchPattern 
       OR c.email LIKE @searchPattern
       OR c.phone LIKE @searchPattern
    ORDER BY c.dtc DESC
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
        text: JSON.stringify(clients, null, 2),
      },
    ],
  };
}
