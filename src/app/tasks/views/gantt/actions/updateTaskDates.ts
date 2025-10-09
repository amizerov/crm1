'use server';

import { revalidatePath } from 'next/cache';
import { getConnection, sql } from '@/db/connect';

interface UpdateTaskDatesResult {
  success: boolean;
  error?: string;
}

/**
 * Обновляет даты начала и окончания задачи
 * Вызывается при drag & drop на диаграмме Ганта
 * 
 * @param taskId - ID задачи
 * @param startDate - Дата начала в формате ISO (YYYY-MM-DD)
 * @param dedline - Дата окончания в формате ISO (YYYY-MM-DD)
 */
export async function updateTaskDates(
  taskId: number,
  startDate: string,
  dedline: string
): Promise<UpdateTaskDatesResult> {
  try {
    console.log('📅 updateTaskDates:', { taskId, startDate, dedline });

    // Валидация дат
    const start = new Date(startDate);
    const end = new Date(dedline);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        error: 'Некорректный формат даты',
      };
    }

    if (end < start) {
      return {
        success: false,
        error: 'Дата окончания не может быть раньше даты начала',
      };
    }

    const poolConnection = await getConnection();
    
    const result = await poolConnection.request()
      .input('taskId', sql.Int, taskId)
      .input('startDate', sql.Date, startDate)
      .input('dedline', sql.Date, dedline)
      .query(`
        UPDATE Task 
        SET 
          startDate = @startDate, 
          dedline = @dedline,
          dtu = GETDATE()
        WHERE id = @taskId
      `);

    console.log('✅ Task dates updated:', result.rowsAffected);

    // Инвалидируем кеш страницы задач
    revalidatePath('/tasks/views');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error updating task dates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
