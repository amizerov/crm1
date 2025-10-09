'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export async function checkProjectsAvailability() {
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

    return { available: true };
  } catch (error) {
    console.error('Ошибка проверки доступности проектов:', error);
    return { 
      available: false, 
      reason: 'ERROR',
      message: 'Ошибка проверки'
    };
  }
}
