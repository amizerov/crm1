/**
 * MCP ресурсы для клиентов
 */

import { query } from '../../db/connect.js';

/**
 * Определения ресурсов для клиентов
 */
export const clientResources = [
  {
    uri: 'crm://clients/list',
    name: 'Список клиентов',
    description: 'Получить список всех клиентов в CRM системе',
    mimeType: 'application/json',
  },
  {
    uri: 'crm://clients/{id}',
    name: 'Детали клиента',
    description: 'Получить детальную информацию о клиенте по ID',
    mimeType: 'application/json',
  },
];

/**
 * Обработчик ресурсов клиентов
 */
export async function handleClientResource(uri: string) {
  const match = uri.match(/^crm:\/\/clients\/(.+)$/);
  
  if (!match) {
    if (uri === 'crm://clients/list') {
      return await getClientsResource();
    }
    throw new Error(`Неверный формат URI: ${uri}`);
  }

  const clientId = match[1];
  
  if (clientId === 'list') {
    return await getClientsResource();
  }

  return await getClientResource(parseInt(clientId));
}

/**
 * Получить ресурс списка клиентов
 */
async function getClientsResource() {
  const clients = await query(
    `
    SELECT TOP 100
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
    ORDER BY c.dtc DESC
  `
  );

  return {
    contents: [
      {
        uri: 'crm://clients/list',
        mimeType: 'application/json',
        text: JSON.stringify(clients, null, 2),
      },
    ],
  };
}

/**
 * Получить ресурс конкретного клиента
 */
async function getClientResource(clientId: number) {
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
    contents: [
      {
        uri: `crm://clients/${clientId}`,
        mimeType: 'application/json',
        text: JSON.stringify(clients[0], null, 2),
      },
    ],
  };
}
