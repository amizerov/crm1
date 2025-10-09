'use server'

import { query } from '@/db/connect';
import { StatusTask } from '@/app/projects/actions/statusActions';

/**
 * Получить статусы для конкретного проекта или статусы по умолчанию
 * @param projectId - ID проекта (если не указан, возвращаются статусы по умолчанию, где projectId IS NULL)
 */
export async function getTaskStatuses(projectId?: number): Promise<StatusTask[]> {
  try {
    let result;
    
    if (projectId !== undefined) {
      // Получаем статусы для конкретного проекта
      result = await query(`
        SELECT id, projectId, status, statusEng, stepOrder
        FROM StatusTask
        WHERE projectId = @projectId
        ORDER BY stepOrder
      `, { projectId });
    } else {
      // Получаем статусы по умолчанию (где projectId IS NULL)
      result = await query(`
        SELECT id, projectId, status, statusEng, stepOrder
        FROM StatusTask
        WHERE projectId IS NULL
        ORDER BY stepOrder
      `);
    }
    
    return result as StatusTask[];
  } catch (error) {
    console.error('Ошибка при получении статусов задач:', error);
    throw new Error('Не удалось получить статусы задач');
  }
}
