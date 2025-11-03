'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { revalidatePath } from 'next/cache';
import { logTaskHistory } from './taskHistory';

export async function updateTaskDescription(taskId: number, description: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    // Получаем текущее описание для логирования
    const currentTaskResult = await query(`
      SELECT description FROM Task WHERE id = @taskId
    `, { taskId });

    const currentDescription = currentTaskResult[0]?.description || '';

    // Обновляем описание задачи
    await query(`
      UPDATE Task 
      SET description = @description, dtu = GETDATE()
      WHERE id = @taskId
    `, {
      taskId,
      description
    });

    // Логируем изменение в историю задачи
    await logTaskHistory(taskId, {
      actionType: 'description_changed',
      fieldName: 'description',
      oldValue: currentDescription,
      newValue: description
    });

    revalidatePath('/tasks');
    revalidatePath(`/tasks/edit/${taskId}`);
    
    return { success: true, message: 'Описание задачи обновлено' };

  } catch (error: any) {
    console.error('Ошибка обновления описания задачи:', error);
    return { success: false, message: error.message || 'Ошибка обновления описания задачи' };
  }
}