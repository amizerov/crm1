'use server'

import { query } from '@/db/connect'
import { redirect } from 'next/navigation'

export interface UpdateTaskData {
  id: number
  parentId?: number
  taskName: string
  description?: string
  startDate?: string
  dedline?: string
  statusId: number
  priorityId?: number
  executorId?: number
  companyId?: number
}

export async function updateTask(taskData: UpdateTaskData) {
  try {
    // Сначала проверяем, является ли задача корневой и изменилась ли компания
    const currentTask = await query(`
      SELECT parentId, companyId FROM Task WHERE id = @id
    `, { id: taskData.id });

    if (currentTask.length === 0) {
      throw new Error('Задача не найдена');
    }

    const isRootTask = !currentTask[0].parentId;
    const companyChanged = taskData.companyId !== undefined && 
                          taskData.companyId !== currentTask[0].companyId;

    // Обновляем основную задачу
    await query(`
      UPDATE Task 
      SET parentId = @parentId,
          taskName = @taskName,
          description = @description,
          startDate = @startDate,
          dedline = @dedline,
          statusId = @statusId,
          priorityId = @priorityId,
          executorId = @executorId,
          companyId = @companyId
      WHERE id = @id
    `, {
      id: taskData.id,
      parentId: taskData.parentId || null,
      taskName: taskData.taskName,
      description: taskData.description || null,
      startDate: taskData.startDate || null,
      dedline: taskData.dedline || null,
      statusId: taskData.statusId,
      priorityId: taskData.priorityId || null,
      executorId: taskData.executorId || null,
      companyId: taskData.companyId || null
    })

    // Если это корневая задача и компания изменилась, обновляем все подзадачи
    if (isRootTask && companyChanged) {
      await updateSubtasksCompany(taskData.id, taskData.companyId || null);
    }

  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }

  redirect('/tasks')
}

// Рекурсивная функция для обновления компании всех подзадач
async function updateSubtasksCompany(parentId: number, companyId: number | null) {
  try {
    // Получаем все подзадачи
    const subtasks = await query(`
      SELECT id FROM Task WHERE parentId = @parentId
    `, { parentId });

    // Обновляем компанию для всех подзадач
    if (subtasks.length > 0) {
      await query(`
        UPDATE Task SET companyId = @companyId WHERE parentId = @parentId
      `, { parentId, companyId });

      // Рекурсивно обновляем подзадачи подзадач
      for (const subtask of subtasks) {
        await updateSubtasksCompany(subtask.id, companyId);
      }
    }
  } catch (error) {
    console.error('Error updating subtasks company:', error);
    throw error;
  }
}

export async function getTaskById(id: number) {
  try {
    const results = await query(`
      SELECT 
        t.id,
        t.parentId,
        t.taskName,
        t.description,
        t.startDate,
        t.dedline,
        t.statusId,
        t.priorityId,
        t.executorId,
        t.userId,
        t.companyId,
        st.status as statusName,
        p.priority as priorityName,
        u.nicName as userName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN [User] u ON t.executorId = u.id
      WHERE t.id = @id
    `, {
      id: id
    })

    return results[0] || null
  } catch (error) {
    console.error('Error getting task by id:', error)
    throw new Error('Failed to get task')
  }
}
