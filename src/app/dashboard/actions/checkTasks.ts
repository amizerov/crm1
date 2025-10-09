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
    // Проверяем наличие компаний своих или с доступом в качестве сотрудника
    const companies = await query(`
        SELECT COUNT(*) as count FROM Company 
        where ownerId = @userId OR id IN (SELECT companyId FROM Employee WHERE userId = @userId)
    `, { userId: currentUser.id });

    if (companies[0].count === 0) {
      return {
        available: false,
        reason: 'NO_COMPANIES',
        message: 'Создайте компанию',
        highlightCard: 'companies'
      };
    }

    // Проверяем наличие проектов в своих или доступных компаниях
    const projects = await query(`
        SELECT COUNT(*) as count FROM Project 
        WHERE companyId IN 
            (SELECT id FROM Company WHERE ownerId = @userId OR id IN 
                (SELECT companyId FROM Employee WHERE userId = @userId))
    `, { userId: currentUser.id });

    if (projects[0].count === 0) {
      return {
        available: false,
        reason: 'NO_PROJECTS',
        message: 'Создайте проект',
        highlightCard: 'projects'
      };
    }

    // Проверяем наличие сотрудников в компаниях доступных пользователю
    const employees = await query(`
        SELECT COUNT(*) as count FROM Employee 
        WHERE companyId IN 
            (SELECT id FROM Company WHERE ownerId = @userId OR id IN 
                (SELECT companyId FROM Employee WHERE userId = @userId))
    `, { userId: currentUser.id });

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
