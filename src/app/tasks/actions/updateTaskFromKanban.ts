'use server';

import { connectDB } from '@/db/connect';
import sql from 'mssql';

interface UpdateTaskFromKanbanInput {
  id: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  executorId?: number;
  dedline?: string;
}

interface UpdateTaskFromKanbanResult {
  success: boolean;
  error?: string;
}

export async function updateTaskFromKanban(data: UpdateTaskFromKanbanInput): Promise<UpdateTaskFromKanbanResult> {
  try {
    const pool = await connectDB();
    
    // Преобразуем дату дедлайна
    let dedlineDate = null;
    if (data.dedline) {
      try {
        dedlineDate = new Date(data.dedline);
        // Проверяем корректность даты
        if (isNaN(dedlineDate.getTime())) {
          dedlineDate = null;
        }
      } catch (e) {
        console.error('Invalid dedline date:', e);
        dedlineDate = null;
      }
    }
    
    await pool
      .request()
      .input('id', sql.Int, data.id)
      .input('taskName', sql.NVarChar, data.taskName)
      .input('description', sql.NVarChar, data.description || null)
      .input('statusId', sql.Int, data.statusId)
      .input('priorityId', sql.Int, data.priorityId || null)
      .input('executorId', sql.Int, data.executorId || null)
      .input('dedline', sql.DateTime, dedlineDate)
      .query(`
        UPDATE Task 
        SET 
          taskName = @taskName,
          description = @description,
          statusId = @statusId,
          priorityId = @priorityId,
          executorId = @executorId,
          dedline = @dedline,
          dtu = GETDATE()
        WHERE id = @id
      `);

    return { success: true };
  } catch (error) {
    console.error('updateTaskFromKanban error:', error);
    return { success: false, error: 'Ошибка при обновлении задачи' };
  }
}
