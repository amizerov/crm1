import { getTaskById } from '@/app/tasks/actions/updateTask'
import { getTaskStatuses } from '@/app/tasks/actions/getTaskStatuses'
import { getPriorities } from '../../actions/getPriorities'
import { getEmployees, getEmployeesByCompany, type Employee } from '@/app/employees/actions/actions'
import { getTasksForParentSelection, getSubtasks } from '@/app/tasks/actions/getTasks'
import { getTaskActions } from '@/app/tasks/actions/taskActions'
import { getTaskDocuments } from '@/app/tasks/actions/taskDocuments'
import { getUserCompanies } from '@/app/tasks/actions/getUserCompanies'
import { getProjectsByCompanyForFilter } from '@/app/tasks/actions/getProjects'
import { updateTaskAction } from './actions'
import TaskProperty from './TaskProperty'
import TaskActions from './TaskActions'
import SubtasksList from './SubtasksList'
import TaskDocuments from './TaskDocuments'
import BackButton from '@/components/ButtonBack'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/(auth)/actions/login'
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

  const [task, statuses, priorities, parentTasks, taskActions, subtasks, documents, userCompanies] = await Promise.all([
    getTaskById(taskId),
    getTaskStatuses(),
    getPriorities(),
    getTasksForParentSelection(taskId),
    getTaskActions(taskId),
    getSubtasks(taskId),
    getTaskDocuments(taskId),
    getUserCompanies()
  ])

  if (!task) {
    notFound()
  }

  // Получаем сотрудников компании задачи
  const employees = task.companyId 
    ? await getEmployeesByCompany(task.companyId)
    : await getEmployees() // Fallback для задач без компании

  // Получаем проекты для компании задачи (если задача корневая и привязана к компании)
  const projects = !task.parentId && task.companyId
    ? await getProjectsByCompanyForFilter(task.companyId)
    : []

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
        <BackButton />
        
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
        {/* 1. Свойства задачи - первый компонент */}
        <TaskProperty
          task={task}
          statuses={statuses}
          priorities={priorities}
          employees={employees}
          parentTasks={parentTasks}
          userCompanies={userCompanies}
          projects={projects}
          currentUserId={currentUser.id}
          onSubmit={handleUpdateTask}
          onDelete={handleDeleteTask}
        />

        {/* 2. Действия по задаче - второй компонент */}
        <TaskActions 
          taskId={task.id} 
          actions={taskActions}
          currentUserId={currentUser.id}
          addActionFunction={handleAddTaskAction}
        />

        {/* 3. Документы задачи - третий компонент */}
        <TaskDocuments 
          taskId={task.id} 
          documents={documents}
        />

        {/* 4. Подзадачи - четвертый компонент */}
        <SubtasksList 
          parentTaskId={task.id} 
          subtasks={subtasks}
        />
      </div>
    </main>
  )
}
