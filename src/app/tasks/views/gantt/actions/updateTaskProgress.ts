'use server';

import { revalidatePath } from 'next/cache';
import { getConnection, sql } from '@/db/connect';

interface UpdateTaskProgressResult {
  success: boolean;
  newStatusId?: number;
  error?: string;
}

/**
 * Обновляет прогресс задачи на основе процента выполнения
 * Автоматически меняет статус задачи в зависимости от прогресса
 * 
 * @param taskId - ID задачи
 * @param progress - Прогресс от 0 до 100
 * @param statuses - Массив всех статусов для определения нового статуса
 */
export async function updateTaskProgress(
  taskId: number,
  progress: number,
  statuses: Array<{ id: number; stepOrder: number; status: string }>
): Promise<UpdateTaskProgressResult> {
  try {
    console.log('📊 updateTaskProgress:', { taskId, progress });

    // Валидация прогресса
    if (progress < 0 || progress > 100) {
      return {
        success: false,
        error: 'Прогресс должен быть от 0 до 100',
      };
    }

    // Определяем новый статус на основе прогресса
    const sortedStatuses = [...statuses].sort((a, b) => a.stepOrder - b.stepOrder);
    const maxStep = Math.max(...statuses.map(s => s.stepOrder));
    
    // Рассчитываем целевой stepOrder на основе прогресса
    const targetStep = Math.round((progress / 100) * maxStep);
    
    // Находим ближайший статус
    let newStatus = sortedStatuses[0];
    for (const status of sortedStatuses) {
      if (status.stepOrder <= targetStep) {
        newStatus = status;
      } else {
        break;
      }
    }

    // Если прогресс = 100%, переводим в завершённый статус (последний по stepOrder)
    if (progress === 100) {
      const completedStatus = sortedStatuses[sortedStatuses.length - 1];
      if (completedStatus) {
        newStatus = completedStatus;
      }
    }

    console.log('🎯 New status:', { 
      progress, 
      targetStep, 
      newStatusId: newStatus.id, 
      stepOrder: newStatus.stepOrder 
    });

    const poolConnection = await getConnection();
    
    const result = await poolConnection.request()
      .input('taskId', sql.Int, taskId)
      .input('statusId', sql.Int, newStatus.id)
      .query(`
        UPDATE Task 
        SET 
          statusId = @statusId,
          dtu = GETDATE()
        WHERE id = @taskId
      `);

    console.log('✅ Task progress updated:', result.rowsAffected);

    // Инвалидируем кеш страницы задач
    revalidatePath('/tasks/views');
    
    return { 
      success: true,
      newStatusId: newStatus.id,
    };
    
  } catch (error) {
    console.error('❌ Error updating task progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
