import { addTask } from '../actions/addTask'
import { getTaskStatuses } from '@/app/tasks/actions/getTaskStatuses'
import { getPriorities } from '@/app/tasks/actions/getPriorities'
import { getEmployees, type Employee } from '@/app/employees/actions'
import { getTasksForParentSelection } from '@/app/tasks/actions/getTasks'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface AddTaskPageProps {
  searchParams: Promise<{ parentId?: string }>
}

export default async function AddTaskPage({ searchParams }: AddTaskPageProps) {
  const params = await searchParams
  const preselectedParentId = params.parentId ? parseInt(params.parentId) : undefined
  
  const [statuses, priorities, employees, parentTasks] = await Promise.all([
    getTaskStatuses(),
    getPriorities(),
    getEmployees(),
    getTasksForParentSelection()
  ])

  // Найдем название родительской задачи для отображения в заголовке
  const parentTask = preselectedParentId 
    ? parentTasks.find(task => task.id === preselectedParentId)
    : null

  async function handleAddTask(formData: FormData) {
    'use server'
    
    try {
      await addTask(formData)
      revalidatePath('/tasks')
    } catch (error) {
      console.error('Ошибка при создании задачи:', error)
      throw error
    }
    
    // redirect вызываем ВНЕ try-catch блока
    redirect('/tasks')
  }

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/tasks" style={{ textDecoration: 'none', color: '#007bff' }}>
          ← Назад к списку задач
        </Link>
      </div>
      
      <h1>
        {parentTask 
          ? `Создать подзадачу для: "${parentTask.taskName}"` 
          : 'Добавить новую задачу'
        }
      </h1>
      
      <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
        <form action={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Название задачи *
              </label>
              <input 
                name="taskName" 
                required 
                placeholder="Введите название задачи"
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Исполнитель
              </label>
              <select 
                name="executorId" 
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="">Не назначен</option>
                {employees.map((employee: Employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.displayName || employee.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Родительская задача
            </label>
            <select 
              name="parentId" 
              defaultValue={preselectedParentId || ''}
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Нет (корневая задача)</option>
              {parentTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {'—'.repeat(task.level)} {task.taskName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Описание
            </label>
            <textarea 
              name="description" 
              placeholder="Введите описание задачи"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, minHeight: 80 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Статус *
              </label>
              <select 
                name="statusId" 
                required 
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="">Выберите статус</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Приоритет
              </label>
              <select 
                name="priorityId" 
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="">Не выбран</option>
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Начало работы
              </label>
              <input 
                name="startDate" 
                type="date"
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Дедлайн
              </label>
              <input 
                name="dedline" 
                type="date"
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button 
              type="submit" 
              className="btn-success"
              style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', flex: 1 }}
            >
              Создать задачу
            </button>
            <Link href="/tasks">
              <button 
                type="button" 
                className="btn-secondary"
                style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                Отмена
              </button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
