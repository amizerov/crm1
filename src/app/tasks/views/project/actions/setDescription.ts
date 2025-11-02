'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

/**
 * Обновление описания проекта
 */
export async function updateProjectDescription(projectId: number, description: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Пользователь не авторизован'
      };
    }

    console.log('userId:', currentUser.id, 'projectId:', projectId);
    // Проверяем, что пользователь имеет доступ к проекту
    const projectCheck = await query(`
      SELECT p.id, p.companyId
      FROM Project p
      --left outer JOIN Employee e ON e.companyId = p.companyId
      left outer join User_Company uc on uc.companyId = p.companyId
      WHERE p.id = @projectId AND uc.userId = @userId
    `, {
      projectId,
      userId: currentUser.id
    });

    const projects = (projectCheck as any).recordset || projectCheck;
    
    if (projects.length === 0) {
      return {
        success: false,
        error: 'Проект не найден или нет доступа'
      };
    }

    // Обновляем описание проекта
    await query(`
      UPDATE Project
      SET description = @description,
          dtu = GETDATE()
      WHERE id = @projectId
    `, {
      projectId,
      description
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Ошибка при обновлении описания проекта:', error);
    return {
      success: false,
      error: 'Ошибка при сохранении описания'
    };
  }
}
