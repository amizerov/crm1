'use server'

import { query } from '@/db/connect'
import { getCurrentUser } from '@/db/loginUser'

export interface AddTaskData {
  parentId?: number
  taskName: string
  description?: string
  startDate?: string
  dedline?: string
  statusId: number
  priorityId?: number
  executorId?: number
  userId?: number
  companyId?: number
}

export async function addTask(formData: FormData) {
  // Получаем текущего пользователя
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('Пользователь не авторизован')
  }

  const rawStartDate = formData.get('startDate') as string
  const rawDedline = formData.get('dedline') as string
  const rawPriorityId = formData.get('priorityId') as string
  const rawExecutorId = formData.get('executorId') as string
  const rawParentId = formData.get('parentId') as string
  
  const taskData: AddTaskData = {
    parentId: rawParentId ? parseInt(rawParentId) : undefined,
    taskName: formData.get('taskName') as string,
    description: (formData.get('description') as string) || undefined,
    startDate: rawStartDate || undefined,
    dedline: rawDedline || undefined,
    statusId: parseInt(formData.get('statusId') as string),
    priorityId: rawPriorityId ? parseInt(rawPriorityId) : undefined,
    executorId: rawExecutorId ? parseInt(rawExecutorId) : undefined,
    userId: currentUser.id,
    companyId: currentUser.companyId || null
  }

  console.log('Task data being inserted:', taskData)

  try {
    await query(`
      INSERT INTO Task (parentId, taskName, description, startDate, dedline, statusId, priorityId, executorId, userId, companyId)
      VALUES (@parentId, @taskName, @description, @startDate, @dedline, @statusId, @priorityId, @executorId, @userId, @companyId)
    `, {
      parentId: taskData.parentId || null,
      taskName: taskData.taskName,
      description: taskData.description || null,
      startDate: taskData.startDate || null,
      dedline: taskData.dedline || null,
      statusId: taskData.statusId,
      priorityId: taskData.priorityId || null,
      executorId: taskData.executorId || null,
      userId: taskData.userId,
      companyId: taskData.companyId
    })
  } catch (error) {
    console.error('Error adding task:', error)
    console.error('Task data that failed:', taskData)
    throw new Error('Failed to add task')
  }
}
