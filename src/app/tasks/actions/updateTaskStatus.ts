'use server';

import { connectDB } from '@/db/connect';
import sql from 'mssql';

interface UpdateTaskStatusResult {
  success: boolean;
  error?: string;
}

export async function updateTaskStatus(
  taskId: number,
  newStatusId: number
): Promise<UpdateTaskStatusResult> {
  try {
    if (!taskId || !newStatusId) {
      return { success: false, error: 'Недостаточно данных' };
    }

    const pool = await connectDB();
    
    await pool
      .request()
      .input('taskId', sql.Int, taskId)
      .input('statusId', sql.Int, newStatusId)
      .query(`
        UPDATE Task 
        SET statusId = @statusId, dtu = GETDATE()
        WHERE id = @taskId
      `);

    return { success: true };
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    return { success: false, error: 'Ошибка при обновлении статуса задачи' };
  }
}
