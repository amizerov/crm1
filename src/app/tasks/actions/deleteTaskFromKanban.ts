'use server';

import { connectDB, query } from '@/db/connect';
import sql from 'mssql';
import { logTaskHistory } from './taskHistory';

interface DeleteTaskFromKanbanResult {
  success: boolean;
  error?: string;
}

export async function deleteTaskFromKanban(taskId: number): Promise<DeleteTaskFromKanbanResult> {
  try {
    // Получаем информацию о задаче перед удалением для истории
    const taskInfo = await query(`
      SELECT taskName FROM Task WHERE id = @id
    `, { id: taskId });

    const taskName = taskInfo[0]?.taskName;

    // Логируем удаление перед фактическим удалением (CASCADE удалит и историю)
    if (taskName) {
      await logTaskHistory(taskId, {
        actionType: 'deleted',
        oldValue: taskName
      });
    }

    const pool = await connectDB();
    
    // Удаляем задачу (CASCADE удалит историю, но запись об удалении уже создана)
    await pool
      .request()
      .input('id', sql.Int, taskId)
      .query(`DELETE FROM Task WHERE id = @id`);

    return { success: true };
  } catch (error) {
    console.error('deleteTaskFromKanban error:', error);
    return { success: false, error: 'Ошибка при удалении задачи' };
  }
}
