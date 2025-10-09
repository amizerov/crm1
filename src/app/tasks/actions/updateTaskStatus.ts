'use server';

import { connectDB, query } from '@/db/connect';
import sql from 'mssql';
import { logTaskHistory } from './taskHistory';

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

    // Получаем старый статус перед обновлением
    const oldStatusData = await query(`
      SELECT t.statusId, st.status as statusName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      WHERE t.id = @taskId
    `, { taskId });

    const oldStatus = oldStatusData[0];

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

    // Получаем новый статус после обновления
    const newStatusData = await query(`
      SELECT status as statusName
      FROM StatusTask
      WHERE id = @statusId
    `, { statusId: newStatusId });

    const newStatus = newStatusData[0];

    // Логируем изменение статуса
    if (oldStatus && newStatus && oldStatus.statusId !== newStatusId) {
      await logTaskHistory(taskId, {
        actionType: 'status_changed',
        fieldName: 'status',
        oldValue: oldStatus.statusName,
        newValue: newStatus.statusName
      });
    }

    return { success: true };
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    return { success: false, error: 'Ошибка при обновлении статуса задачи' };
  }
}
