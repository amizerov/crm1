#!/usr/bin/env node
/**
 * MCP (Model Context Protocol) сервер для CRM системы
 * Предоставляет AI-ассистентам доступ к данным и функциям CRM
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Импорт инструментов
import { taskTools, handleTaskTool } from './tools/tasks.js';
import { clientTools, handleClientTool } from './tools/clients.js';
import { projectTools, handleProjectTool } from './tools/projects.js';
import { employeeTools, handleEmployeeTool } from './tools/employees.js';

// Импорт ресурсов
import { taskResources, handleTaskResource } from './resources/tasks.js';
import { projectResources, handleProjectResource } from './resources/projects.js';
import { clientResources, handleClientResource } from './resources/clients.js';

/**
 * Создание и настройка MCP сервера
 */
const server = new Server(
  {
    name: 'crm1-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Обработчик списка доступных инструментов
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...taskTools,
      ...clientTools,
      ...projectTools,
      ...employeeTools,
    ],
  };
});

/**
 * Обработчик вызова инструментов
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Роутинг к соответствующему обработчику инструмента
    if (name.startsWith('task_')) {
      return await handleTaskTool(name, args);
    } else if (name.startsWith('client_')) {
      return await handleClientTool(name, args);
    } else if (name.startsWith('project_')) {
      return await handleProjectTool(name, args);
    } else if (name.startsWith('employee_')) {
      return await handleEmployeeTool(name, args);
    }

    throw new Error(`Неизвестный инструмент: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return {
      content: [
        {
          type: 'text',
          text: `Ошибка при выполнении инструмента ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Обработчик списка доступных ресурсов
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      ...taskResources,
      ...projectResources,
      ...clientResources,
    ],
  };
});

/**
 * Обработчик чтения ресурсов
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    // Роутинг к соответствующему обработчику ресурса
    if (uri.startsWith('crm://tasks')) {
      return await handleTaskResource(uri);
    } else if (uri.startsWith('crm://projects')) {
      return await handleProjectResource(uri);
    } else if (uri.startsWith('crm://clients')) {
      return await handleClientResource(uri);
    }

    throw new Error(`Неизвестный ресурс: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    throw new Error(`Ошибка при чтении ресурса ${uri}: ${errorMessage}`);
  }
});

/**
 * Запуск сервера
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP сервер CRM1 запущен и готов к работе');
}

main().catch((error) => {
  console.error('Критическая ошибка сервера:', error);
  process.exit(1);
});
