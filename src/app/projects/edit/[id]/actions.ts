'use server';

import { redirect } from 'next/navigation';
import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export async function deleteProject(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    // Проверяем, есть ли задачи в этом проекте
    const tasksResult = await query(`
      SELECT COUNT(*) as taskCount
      FROM Task
      WHERE projectId = @projectId
    `, {
      projectId: id
    });

    const taskCount = (tasksResult as any)[0]?.taskCount || 0;

    if (taskCount > 0) {
      return { 
        success: false, 
        error: `Невозможно удалить проект. В проекте есть задачи (${taskCount} шт.). Сначала удалите все задачи проекта.` 
      };
    }

    // Удаляем проект только если пользователь его создал
    await query(`
      delete StatusTask where projectId = @id;
      
      DELETE FROM Project
      WHERE id = @id
        AND userId = @userId
    `, {
      id,
      userId: currentUser.id
    });

    return { success: true };

  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    return { success: false, error: 'Ошибка при удалении проекта' };
  }
}
