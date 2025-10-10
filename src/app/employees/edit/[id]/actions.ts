'use server';

import { updateEmployee } from '../../actions';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';

export async function updateEmployeeAction(formData: FormData) {
  const params = {
    id: Number(formData.get('id')),
    Name: formData.get('Name') as string || undefined,
    userId: formData.get('userId') ? Number(formData.get('userId')) : undefined,
    companyId: formData.get('companyId') ? Number(formData.get('companyId')) : undefined,
  };

  // Обрабатываем пустые строки как undefined для userId и companyId
  if (formData.get('userId') === '') {
    params.userId = undefined; // Это будет означать сброс связи (NULL в БД)
  }
  
  if (formData.get('companyId') === '') {
    params.companyId = undefined; // Это будет означать сброс связи (NULL в БД)
  }

  await updateEmployee(params);
}

// Удаление сотрудника
export async function deleteEmployee(id: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    // Проверим, что сотрудник принадлежит к компании пользователя
    const employeeCheck = await query(`
      SELECT e.id 
      FROM Employee e
      WHERE e.id = @id AND e.companyId IN (
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      )
    `, { id, userId: currentUser.id });

    if (employeeCheck.length === 0) {
      throw new Error('У вас нет доступа к этому сотруднику');
    }

    await query('DELETE FROM Employee WHERE id = @id', { id });
  } catch (error) {
    console.error('Ошибка в deleteEmployee:', error);
    throw new Error('Не удалось удалить сотрудника');
  }
  
  // redirect вызываем ВНЕ try-catch блока
  redirect('/employees');
}
