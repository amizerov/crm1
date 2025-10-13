import { addTask } from '../actions/addTask'
import { getTaskStatuses } from '@/app/tasks/actions/getTaskStatuses'
import { getPriorities } from '@/app/tasks/actions/getPriorities'
import { getEmployees, type Employee } from '@/app/employees/actions/actions'
import { getTasksForParentSelection } from '@/app/tasks/actions/getTasks'
import { getUserCompanies } from '@/app/tasks/actions/getUserCompanies'
import AddTaskForm from '../components/AddTaskForm'

interface AddTaskPageProps {
  searchParams: Promise<{ parentId?: string }>
}

export default async function AddTaskPage({ searchParams }: AddTaskPageProps) {
  const params = await searchParams
  const preselectedParentId = params.parentId ? parseInt(params.parentId) : undefined
  
  const [statuses, priorities, employees, parentTasks, userCompanies] = await Promise.all([
    getTaskStatuses(),
    getPriorities(),
    getEmployees(),
    getTasksForParentSelection(),
    getUserCompanies()
  ])

  // Преобразуем parentTasks в нужный формат
  const formattedParentTasks = parentTasks.map(task => ({
    id: task.id,
    name: task.taskName
  }))

  return (
    <AddTaskForm
      statuses={statuses}
      priorities={priorities}
      initialEmployees={employees}
      parentTasks={formattedParentTasks}
      userCompanies={userCompanies}
      preselectedParentId={preselectedParentId}
    />
  )
}
