'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/db/loginUser';
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

    const result = await query(`
        INSERT INTO Task (taskName, statusId, companyId, projectId, userId)
        OUTPUT INSERTED.id
        VALUES (@taskName, @statusId, @companyId, @projectId, @userId)
      `, {
        taskName: taskName.trim(),
        statusId,
        companyId,
        projectId,
        userId
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