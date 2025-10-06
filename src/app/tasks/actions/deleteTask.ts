'use server'

import { query } from '@/db/connect'
import { redirect } from 'next/navigation'
import { logTaskHistory } from './taskHistory'

export async function deleteTask(id: number) {
  try {
    // Получаем информацию о задаче перед удалением
    const taskInfo = await query(`
      SELECT taskName FROM Task WHERE id = @id
    `, { id });

    const taskName = taskInfo[0]?.taskName;

    // Логируем удаление
    if (taskName) {
      await logTaskHistory(id, {
        actionType: 'deleted',
        oldValue: taskName
      });
    }

    await query(`
      DELETE FROM Task
      WHERE id = @id
    `, {
      id: id
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }

  redirect('/tasks')
}

export async function deleteTaskById(id: number) {
  try {
    // Получаем информацию о задаче перед удалением
    const taskInfo = await query(`
      SELECT taskName FROM Task WHERE id = @id
    `, { id });

    const taskName = taskInfo[0]?.taskName;

    // Логируем удаление
    if (taskName) {
      await logTaskHistory(id, {
        actionType: 'deleted',
        oldValue: taskName
      });
    }

    await query(`
      DELETE FROM Task
      WHERE id = @id
    `, {
      id: id
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}
