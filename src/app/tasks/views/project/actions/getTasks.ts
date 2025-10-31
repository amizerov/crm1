'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectTaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

export interface ProjectTask {
  id: number;
  taskName: string;
  description?: string;
  statusId: number;
  statusName: string;
  priorityId?: number;
  priorityName?: string;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  executorName?: string;
  userId?: number;
  companyId?: number;
  projectId?: number;
  dtc: string;
  dtu?: string;
  orderInStatus?: number;
}

// Получение статистики задач проекта
export async function getProjectTaskStats(projectId: number): Promise<ProjectTaskStats> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 };
    }

    const result = await query(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN ps.status IN ('Completed', 'Done', 'Готово', 'Выполнено') THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN ps.status IN ('In Progress', 'В работе', 'Выполняется') THEN 1 ELSE 0 END) as inProgressTasks,
        SUM(CASE WHEN ps.status IN ('To Do', 'Новая', 'К выполнению', 'Backlog') THEN 1 ELSE 0 END) as todoTasks
      FROM task t
      LEFT JOIN StatusTask ps ON t.statusId = ps.id
      WHERE t.projectId = @projectId
    `, {
      projectId
    });

    const stats = (result as any).recordset || result;
    return stats[0] || { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 };
  } catch (error) {
    console.error('Ошибка при получении статистики задач проекта:', error);
    return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 };
  }
}

// Получение всех задач проекта
export async function getProjectTasks(projectId: number): Promise<ProjectTask[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        t.id,
        t.taskName,
        t.description,
        t.statusId,
        ps.statusName,
        t.priorityId,
        pp.priorityName,
        t.startDate,
        t.dedline,
        t.executorId,
        executor.nicName as executorName,
        t.userId,
        t.companyId,
        t.projectId,
        t.dtc,
        t.dtu,
        t.orderInStatus
      FROM tasks t
      LEFT JOIN ProjectStatus ps ON t.statusId = ps.id
      LEFT JOIN ProjectPriority pp ON t.priorityId = pp.id
      LEFT JOIN [Users] executor ON t.executorId = executor.id
      WHERE t.projectId = @projectId
      ORDER BY t.orderInStatus ASC, t.dtc DESC
    `, {
      projectId
    });

    const tasks = (result as any).recordset || result;
    return tasks;
  } catch (error) {
    console.error('Ошибка при получении задач проекта:', error);
    return [];
  }
}