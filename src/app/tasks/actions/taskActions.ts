'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

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
      FROM TaskAtions ta
      LEFT JOIN [User] u ON ta.userId = u.id
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
      INSERT INTO TaskAtions (taskId, description, userId)
      VALUES (@taskId, @description, @userId)
    `, { taskId, description, userId });
    
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
    await query(`
      UPDATE TaskAtions 
      SET description = @description, dtu = GETDATE()
      WHERE id = @actionId
    `, { actionId, description });
  } catch (error) {
    console.error('Ошибка при обновлении действия:', error);
    throw new Error('Не удалось обновить действие');
  }
}

// Удалить действие по задаче
export async function deleteTaskAction(actionId: number): Promise<void> {
  try {
    await query(`
      DELETE FROM TaskAtions 
      WHERE id = @actionId
    `, { actionId });
  } catch (error) {
    console.error('Ошибка при удалении действия:', error);
    throw new Error('Не удалось удалить действие');
  }
}
