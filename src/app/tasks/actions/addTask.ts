'use server'

import { query } from '@/db/connect'
import { getCurrentUser } from '@/app/(auth)/actions/login'
import { logTaskHistory } from './taskHistory'

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
  companyId?: number | null
  projectId?: number | null
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
  const rawCompanyId = formData.get('companyId') as string
  const rawProjectId = formData.get('projectId') as string
  
  let companyId: number | null = null;
  let projectId: number | null = null;
  
  // Если есть родительская задача - наследуем компанию от неё
  if (rawParentId) {
    const parentTask = await query(`
      SELECT companyId FROM Task WHERE id = @parentId
    `, { parentId: parseInt(rawParentId) });
    
    if (parentTask.length > 0) {
      companyId = parentTask[0].companyId;
    }
  } else if (rawCompanyId) {
    // Если нет родительской задачи, но указана компания - используем её
    companyId = parseInt(rawCompanyId);
  }
  
  // Проект может быть указан только для корневых задач
  if (!rawParentId && rawProjectId) {
    projectId = parseInt(rawProjectId);
  }
  
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
    companyId: companyId,
    projectId: projectId
  }

  console.log('Task data being inserted:', taskData)

  try {
    const result = await query(`
      INSERT INTO Task (parentId, taskName, description, startDate, dedline, statusId, priorityId, executorId, userId, companyId, projectId)
      OUTPUT INSERTED.id
      VALUES (@parentId, @taskName, @description, @startDate, @dedline, @statusId, @priorityId, @executorId, @userId, @companyId, @projectId)
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
      companyId: taskData.companyId,
      projectId: taskData.projectId || null
    })

    // Логируем создание задачи
    const newTaskId = result[0]?.id;
    if (newTaskId) {
      await logTaskHistory(newTaskId, {
        actionType: 'created'
      });
    }
  } catch (error) {
    console.error('Error adding task:', error)
    console.error('Task data that failed:', taskData)
    throw new Error('Failed to add task')
  }
}
