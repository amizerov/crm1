'use server'

import { updateTask } from '@/app/tasks/actions/updateTask'
import { deleteTaskById } from '../../actions/deleteTask'
import { revalidatePath } from 'next/cache'

export async function updateTaskAction(formData: FormData) {
  const rawStartDate = formData.get('startDate') as string
  const rawDedline = formData.get('dedline') as string
  const rawPriorityId = formData.get('priorityId') as string
  const rawExecutorId = formData.get('executorId') as string
  const rawParentId = formData.get('parentId') as string
  const rawCompanyId = formData.get('companyId') as string
  
  const taskData = {
    id: parseInt(formData.get('id') as string),
    parentId: rawParentId ? parseInt(rawParentId) : undefined,
    taskName: formData.get('taskName') as string,
    description: (formData.get('description') as string) || undefined,
    startDate: rawStartDate || undefined,
    dedline: rawDedline || undefined,
    statusId: parseInt(formData.get('statusId') as string),
    priorityId: rawPriorityId ? parseInt(rawPriorityId) : undefined,
    executorId: rawExecutorId ? parseInt(rawExecutorId) : undefined,
    companyId: rawCompanyId ? parseInt(rawCompanyId) : undefined
  }

  await updateTask(taskData)
}

export async function handleDeleteTask(taskId: number) {
  try {
    await deleteTaskById(taskId)
    revalidatePath('/tasks')
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error)
    throw new Error('Не удалось удалить задачу')
  }
}
