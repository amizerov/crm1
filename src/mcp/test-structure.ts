#!/usr/bin/env node
/**
 * Тестовый скрипт для проверки структуры MCP сервера
 * Проверяет, что все модули правильно импортируются и определены
 */

import { taskTools } from './tools/tasks.js';
import { clientTools } from './tools/clients.js';
import { projectTools } from './tools/projects.js';
import { employeeTools } from './tools/employees.js';
import { taskResources } from './resources/tasks.js';
import { projectResources } from './resources/projects.js';
import { clientResources } from './resources/clients.js';

console.log('🧪 Проверка структуры MCP сервера...\n');

// Проверка инструментов
console.log('📋 Инструменты для задач:', taskTools.length);
taskTools.forEach(tool => console.log('  -', tool.name));

console.log('\n📋 Инструменты для клиентов:', clientTools.length);
clientTools.forEach(tool => console.log('  -', tool.name));

console.log('\n📋 Инструменты для проектов:', projectTools.length);
projectTools.forEach(tool => console.log('  -', tool.name));

console.log('\n📋 Инструменты для сотрудников:', employeeTools.length);
employeeTools.forEach(tool => console.log('  -', tool.name));

// Проверка ресурсов
console.log('\n📚 Ресурсы для задач:', taskResources.length);
taskResources.forEach(resource => console.log('  -', resource.uri));

console.log('\n📚 Ресурсы для проектов:', projectResources.length);
projectResources.forEach(resource => console.log('  -', resource.uri));

console.log('\n📚 Ресурсы для клиентов:', clientResources.length);
clientResources.forEach(resource => console.log('  -', resource.uri));

// Подсчёт общего количества
const totalTools = taskTools.length + clientTools.length + projectTools.length + employeeTools.length;
const totalResources = taskResources.length + projectResources.length + clientResources.length;

console.log('\n✅ Всего инструментов:', totalTools);
console.log('✅ Всего ресурсов:', totalResources);
console.log('\n🎉 Структура MCP сервера корректна!\n');
