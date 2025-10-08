'use server';

import { revalidatePath } from 'next/cache';
import { getConnection, sql } from '@/db/connect';

interface DeleteTaskResult {
  success: boolean;
  error?: string;
}

/**
 * Удаляет задачу с диаграммы Ганта
 * Вызывается при нажатии Delete на выбранной задаче
 * 
 * @param taskId - ID задачи для удаления
 */
export async function deleteTask(taskId: number): Promise<DeleteTaskResult> {
  try {
    console.log('🗑️ deleteTask:', { taskId });

    const poolConnection = await getConnection();
    
    // Проверяем, есть ли у задачи подзадачи
    const checkSubtasks = await poolConnection.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT COUNT(*) as count 
        FROM Task 
        WHERE parentId = @taskId
      `);

    const hasSubtasks = checkSubtasks.recordset[0].count > 0;

    if (hasSubtasks) {
      return {
        success: false,
        error: 'Нельзя удалить задачу с подзадачами. Сначала удалите или переместите подзадачи.',
      };
    }

    // Удаляем задачу
    const result = await poolConnection.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        DELETE FROM Tasks 
        WHERE id = @taskId
      `);

    if (result.rowsAffected[0] === 0) {
      return {
        success: false,
        error: 'Задача не найдена',
      };
    }

    console.log('✅ Task deleted:', result.rowsAffected);

    // Инвалидируем кеш страницы задач
    revalidatePath('/tasks/views');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
