'use server';

import { connectDB } from '@/db/connect';
import sql from 'mssql';

interface DeleteTaskFromKanbanResult {
  success: boolean;
  error?: string;
}

export async function deleteTaskFromKanban(taskId: number): Promise<DeleteTaskFromKanbanResult> {
  try {
    const pool = await connectDB();
    
    // Удаляем задачу
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
