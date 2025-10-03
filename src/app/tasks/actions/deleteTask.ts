'use server'

import { query } from '@/db/connect'
import { redirect } from 'next/navigation'

export async function deleteTask(id: number) {
  try {
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
