'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export async function checkTasksAvailability() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return { 
      available: false, 
      reason: 'NOT_AUTHORIZED',
      message: 'Требуется авторизация'
    };
  }

  try {
    // Проверяем наличие компаний
    const companies = await query('SELECT COUNT(*) as count FROM Company');

    if (companies[0].count === 0) {
      return {
        available: false,
        reason: 'NO_COMPANIES',
        message: 'Создайте компанию',
        highlightCard: 'companies'
      };
    }

    // Проверяем наличие проектов
    const projects = await query('SELECT COUNT(*) as count FROM Project');

    if (projects[0].count === 0) {
      return {
        available: false,
        reason: 'NO_PROJECTS',
        message: 'Создайте проект',
        highlightCard: 'projects'
      };
    }

    // Проверяем наличие сотрудников
    const employees = await query('SELECT COUNT(*) as count FROM Employee');

    if (employees[0].count === 0) {
      return {
        available: false,
        reason: 'NO_EMPLOYEES',
        message: 'Добавьте сотрудника',
        highlightCard: 'employees'
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Ошибка проверки доступности задач:', error);
    return { 
      available: false, 
      reason: 'ERROR',
      message: 'Ошибка проверки'
    };
  }
}
