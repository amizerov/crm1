'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { logTaskHistory } from './taskHistory';

interface QuickAddTaskInput {
    taskName: string;
    statusId: number;
    companyId: number;
    projectId?: number;
}

interface QuickAddTaskResult {
  success: boolean;
  taskId?: number;
  error?: string;
}

export async function quickAddTask(payload: QuickAddTaskInput): Promise<QuickAddTaskResult> {
  try {
    const { taskName, statusId, companyId, projectId } = payload;

    if (!taskName?.trim() || !statusId || !companyId) {
      return { success: false, error: 'Недостаточно данных' };
    }

    // Получаем текущего пользователя для фильтрации по компании
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Пользователь не авторизован')
    }

    const userId = currentUser.id;

    if (Number.isNaN(userId)) {
      return { success: false, error: 'Некорректный идентификатор пользователя' };
    }

    // Получаем максимальное значение orderInStatus для данного статуса
    const maxOrderResult = await query(`
      SELECT COALESCE(MAX(orderInStatus), 0) as maxOrder
      FROM Task 
      WHERE statusId = @statusId
    `, { statusId });

    const maxOrder = maxOrderResult[0]?.maxOrder || 0;
    const newOrder = maxOrder + 1;

    const result = await query(`
        INSERT INTO Task (taskName, statusId, companyId, projectId, userId, orderInStatus)
        OUTPUT INSERTED.id
        VALUES (@taskName, @statusId, @companyId, @projectId, @userId, @newOrder)
      `, {
        taskName: taskName.trim(),
        statusId,
        companyId,
        projectId,
        userId,
        newOrder
      });

    const newTaskId = result[0]?.id;

    // Логируем создание задачи
    if (newTaskId) {
      await logTaskHistory(newTaskId, {
        actionType: 'created'
      });
    }

    return { success: true, taskId: newTaskId };
  } catch (error) {
    console.error('quickAddTask error:', error);
    return { success: false, error: 'Ошибка при создании задачи' };
  }
}