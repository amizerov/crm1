import { getTaskById } from '@/app/tasks/actions/updateTask'
import { getTaskStatuses } from '@/app/tasks/actions/getTaskStatuses'
import { getPriorities } from '../../actions/getPriorities'
import { getEmployees, type Employee } from '@/app/employees/actions'
import { getTasksForParentSelection, getSubtasks } from '@/app/tasks/actions/getTasks'
import { getTaskActions } from '@/app/tasks/actions/taskActions'
import { getTaskDocuments } from '@/app/tasks/actions/taskDocuments'
import { getUserCompanies } from '@/app/tasks/actions/getUserCompanies'
import { updateTaskAction } from './actions'
import TaskProperty from './TaskProperty'
import TaskActions from './TaskActions'
import SubtasksList from './SubtasksList'
import TaskDocuments from './TaskDocuments'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/db/loginUser'
import { notFound } from 'next/navigation'

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const taskId = parseInt(id)

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  const [task, statuses, priorities, employees, parentTasks, taskActions, subtasks, documents, userCompanies] = await Promise.all([
    getTaskById(taskId),
    getTaskStatuses(),
    getPriorities(),
    getEmployees(),
    getTasksForParentSelection(taskId),
    getTaskActions(taskId),
    getSubtasks(taskId),
    getTaskDocuments(taskId),
    getUserCompanies()
  ])

  if (!task) {
    notFound()
  }

  async function handleUpdateTask(formData: FormData) {
    'use server'
    
    try {
      await updateTaskAction(formData)
      revalidatePath('/tasks')
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error)
      throw error
    }
    
    // redirect вызываем ВНЕ try-catch блока
    redirect('/tasks')
  }

  async function handleAddTaskAction(formData: FormData) {
    'use server'
    
    const taskId = parseInt(formData.get('taskId') as string)
    const description = formData.get('description') as string
    const userId = parseInt(formData.get('userId') as string)
    
    try {
      const { addTaskAction } = await import('@/app/tasks/actions/taskActions')
      await addTaskAction(taskId, description, userId)
      revalidatePath(`/tasks/edit/${taskId}`)
    } catch (error) {
      console.error('Ошибка при добавлении действия:', error)
      throw error
    }
  }

  async function handleDeleteTask(taskId: number, taskName: string) {
    'use server'
    
    try {
      const { deleteTask } = await import('@/app/tasks/actions/deleteTask')
      await deleteTask(taskId)
      revalidatePath('/tasks')
      redirect('/tasks')
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error)
      throw error
    }
  }

  // Проверяем является ли текущий пользователь исполнителем
  const currentExecutor = employees.find((emp: Employee) => emp.id === task.executorId);
  const isCurrentUserExecutor = currentExecutor?.userId === currentUser.id;

  return (
    <main style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href="/tasks" style={{ textDecoration: 'none', color: '#007bff', fontSize: 14 }}>
          ← Назад к задачам
        </Link>
        
        {/* Индикация роли пользователя в задаче */}
        {isCurrentUserExecutor && (
          <div style={{
            padding: '6px 12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500
          }}>
            👤 Вы исполнитель этой задачи
          </div>
        )}
      </div>

      {/* Адаптивная сетка оконных компонентов */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 20,
        marginBottom: 20
      }}>
        {/* 1. Действия по задаче - первый компонент */}
        <TaskActions 
          taskId={task.id} 
          actions={taskActions}
          currentUserId={currentUser.id}
          addActionFunction={handleAddTaskAction}
        />

        {/* 2. Документы задачи - второй компонент */}
        <TaskDocuments 
          taskId={task.id} 
          documents={documents}
        />

        {/* 3. Подзадачи - третий компонент */}
        <SubtasksList 
          parentTaskId={task.id} 
          subtasks={subtasks}
        />

        {/* 4. Свойства задачи - четвертый компонент */}
        <TaskProperty
          task={task}
          statuses={statuses}
          priorities={priorities}
          employees={employees}
          parentTasks={parentTasks}
          userCompanies={userCompanies}
          currentUserId={currentUser.id}
          onSubmit={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </main>
  )
}
