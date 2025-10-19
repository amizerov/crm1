'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { logTaskHistory } from './taskHistory';

export interface TaskAction {
  id: number;
  taskId: number;
  description: string;
  userId: number;
  dtc: string;
  dtu?: string;
  userName?: string;
}

// Получить все действия по задаче
export async function getTaskActions(taskId: number): Promise<TaskAction[]> {
  try {
    const actions = await query(`
      SELECT 
        ta.id,
        ta.taskId,
        ta.description,
        ta.userId,
        ta.dtc,
        ta.dtu,
        u.nicName as userName
      FROM TaskActions ta
      LEFT JOIN [Users] u ON ta.userId = u.id
      WHERE ta.taskId = @taskId
      ORDER BY ta.dtc DESC
    `, { taskId });

    return actions;
  } catch (error) {
    console.error('Ошибка при получении действий по задаче:', error);
    throw new Error('Не удалось получить действия по задаче');
  }
}

// Добавить действие по задаче
export async function addTaskAction(taskId: number, description: string, userId: number): Promise<void> {
  try {
    await query(`
      INSERT INTO TaskActions (taskId, description, userId)
      VALUES (@taskId, @description, @userId)
    `, { taskId, description, userId });
    
    // Логируем добавление комментария в историю задач
    await logTaskHistory(taskId, {
      actionType: 'comment_added',
      newValue: description.substring(0, 500), // Ограничиваем длину
      description: `Добавлен комментарий: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`
    });
    
    // Перезагружаем страницу редактирования задачи
    revalidatePath(`/tasks/edit/${taskId}`);
  } catch (error) {
    console.error('Ошибка при добавлении действия:', error);
    throw new Error('Не удалось добавить действие');
  }
}

// Обновить действие по задаче
export async function updateTaskAction(actionId: number, description: string): Promise<void> {
  try {
    // Получаем информацию о действии и задаче для логирования
    const actionInfo = await query(`
      SELECT taskId, description as oldDescription FROM TaskActions WHERE id = @actionId
    `, { actionId });

    await query(`
      UPDATE TaskActions 
      SET description = @description, dtu = GETDATE()
      WHERE id = @actionId
    `, { actionId, description });

    // Логируем редактирование комментария в историю задач
    if (actionInfo.length > 0) {
      const { taskId, oldDescription } = actionInfo[0];
      await logTaskHistory(taskId, {
        actionType: 'comment_edited',
        oldValue: oldDescription?.substring(0, 500),
        newValue: description.substring(0, 500),
        description: `Отредактирован комментарий`
      });
    }
  } catch (error) {
    console.error('Ошибка при обновлении действия:', error);
    throw new Error('Не удалось обновить действие');
  }
}

// Удалить действие по задаче
export async function deleteTaskAction(actionId: number): Promise<void> {
  try {
    // Получаем информацию о действии и задаче для логирования
    const actionInfo = await query(`
      SELECT taskId, description FROM TaskActions WHERE id = @actionId
    `, { actionId });

    await query(`
      DELETE FROM TaskActions 
      WHERE id = @actionId
    `, { actionId });

    // Логируем удаление комментария в историю задач
    if (actionInfo.length > 0) {
      const { taskId, description } = actionInfo[0];
      await logTaskHistory(taskId, {
        actionType: 'comment_deleted',
        oldValue: description?.substring(0, 500),
        description: `Удален комментарий: ${description?.substring(0, 100)}${(description?.length || 0) > 100 ? '...' : ''}`
      });
    }
  } catch (error) {
    console.error('Ошибка при удалении действия:', error);
    throw new Error('Не удалось удалить действие');
  }
}
