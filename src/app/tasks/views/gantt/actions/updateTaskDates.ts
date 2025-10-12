'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/db/connect';

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

    await query(`
      UPDATE Task 
      SET startDate = @startDate, 
          dedline = @dedline,
          dtu = GETDATE()
      WHERE id = @taskId
    `, { taskId, startDate, dedline });

    console.log('✅ Task dates updated:', taskId, startDate, dedline);

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
